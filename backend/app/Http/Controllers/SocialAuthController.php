<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;

class SocialAuthController extends Controller
{
    public function redirectToGoogle(Request $request)
    {
        // OAuth flow no longer requires user_type parameter
        // User will choose profile type after authentication
        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');
        if (empty($clientId) || empty($clientSecret)) {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect($frontendUrl . '/login?error=oauth_not_configured');
        }
        $certPath = storage_path('cacert.pem');
        return Socialite::driver('google')
            ->stateless()
            ->setHttpClient(new \GuzzleHttp\Client(['verify' => $certPath]))
            ->with(['state' => base64_encode(json_encode(['timestamp' => now()->timestamp]))])
            ->redirect();
    }

    public function handleGoogleCallback(Request $request)
    {
        try {
            // Get the Google user data – use local cacert.pem to fix cURL SSL error 60
            $certPath = storage_path('cacert.pem');
            $googleUser = Socialite::driver('google')
                ->stateless()
                ->setHttpClient(new \GuzzleHttp\Client(['verify' => $certPath]))
                ->user();

            // Create or update user using the enhanced method with sub_id extraction
            $user = User::createOrUpdateFromGoogle([
                'id' => $googleUser->id,
                'name' => $googleUser->name,
                'email' => $googleUser->email,
            ]);

            // Generate access token with extended expiration for OAuth users
            $accessToken = $user->createToken(
                'oauth_token',
                ['*'],
                now()->addMinutes(config('sanctum.access_token_expiration', 15))
            );

            // Create refresh token
            $refreshToken = $user->createRefreshToken('oauth_device');

            // Prepare response data
            $responseData = [
                'access_token' => $accessToken->plainTextToken,
                'refresh_token' => $refreshToken->token,
                'token_type' => 'Bearer',
                'expires_in' => config('sanctum.access_token_expiration', 15) * 60, // Convert to seconds
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'has_password' => $user->hasPassword(),
                    'current_profile_type' => $user->current_profile_type,
                    'current_profile_id' => $user->current_profile_id,
                    'available_profiles' => $user->getAvailableProfiles(),
                    'created_at' => $user->created_at,
                ],
                'needs_profile_selection' => !$user->current_profile_type,
            ];

            // Encode the response data and redirect to frontend
            $encodedTokens = base64_encode(json_encode($responseData));
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

            return redirect($frontendUrl . '/auth/callback?tokens=' . $encodedTokens);

        } catch (\Exception $e) {
            \Log::error('OAuth callback error: ' . $e->getMessage());
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect($frontendUrl . '/login?error=oauth_failed');
        }
    }

    /**
     * Handle OAuth login from frontend (for SPA applications)
     */
    public function oauthLogin(Request $request): JsonResponse
    {
        try {
            $validator = \Validator::make($request->all(), [
                'google_token' => 'required|string',
                'user_type' => 'required|in:company,vendor',
                'device_name' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verify Google token (you might want to add proper Google token verification here)
            // For now, we'll assume the token is valid and extract user info
            $googleUserInfo = $this->verifyGoogleToken($request->google_token);

            if (!$googleUserInfo) {
                return response()->json([
                    'message' => 'Invalid Google token'
                ], 401);
            }

            // Create or update user
            $user = User::createOrUpdateFromGoogle($googleUserInfo, $request->user_type);

            // Generate tokens
            $accessToken = $user->createToken(
                'access_token',
                ['*'],
                now()->addMinutes(config('sanctum.access_token_expiration', 15))
            );

            $refreshToken = $user->createRefreshToken($request->device_name ?? 'SPA Application');

            return response()->json([
                'message' => 'Authentication successful',
                'user' => $user->getApiData(),
                'access_token' => $accessToken->plainTextToken,
                'refresh_token' => $refreshToken->token,
                'token_type' => 'Bearer',
                'expires_in' => config('sanctum.access_token_expiration', 15) * 60,
                'needs_profile_completion' => $user->status === 'pending',
            ]);

        } catch (\Exception $e) {
            \Log::error('OAuth login failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'OAuth authentication failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify Google token (simplified version)
     * In production, you should use Google's token verification API
     */
    private function verifyGoogleToken(string $token): ?array
    {
        try {
            // This is a simplified version. In production, use:
            // https://developers.google.com/identity/sign-in/web/backend-auth

            // For now, we'll decode if it's a JWT token
            if (str_contains($token, '.')) {
                $parts = explode('.', $token);
                if (count($parts) === 3) {
                    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);

                    // Basic validation
                    if (isset($payload['sub'], $payload['email'], $payload['name'])) {
                        return [
                            'id' => $payload['sub'],
                            'email' => $payload['email'],
                            'name' => $payload['name'],
                        ];
                    }
                }
            }

            return null;
        } catch (\Exception $e) {
            \Log::error('Google token verification failed', [
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Get OAuth providers info
     */
    public function getProviders(): JsonResponse
    {
        return response()->json([
            'providers' => [
                'google' => [
                    'name' => 'Google',
                    'enabled' => !empty(config('services.google.client_id')),
                    'login_url' => route('oauth.google'),
                ]
            ]
        ]);
    }

    /**
     * Unlink OAuth provider
     */
    public function unlinkProvider(Request $request, string $provider): JsonResponse
    {
        $user = $request->user();

        if ($provider === 'google') {
            // Only allow unlinking if user has a password set
            if (!$user->hasPassword()) {
                return response()->json([
                    'message' => 'Cannot unlink Google account without setting a password first.'
                ], 400);
            }

            $user->update([
                'google_id' => null,
                'google_sub_id' => null,
            ]);

            return response()->json([
                'message' => 'Google account unlinked successfully'
            ]);
        }

        return response()->json([
            'message' => 'Invalid provider'
        ], 400);
    }
}