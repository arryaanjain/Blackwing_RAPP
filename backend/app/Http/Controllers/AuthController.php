<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\RefreshToken;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'user_type' => 'required|in:company,vendor',
            'device_name' => 'string|max:255|nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_type' => $request->user_type,
            'status' => 'pending', // Will be updated after profile completion
        ];

        // Generate company ID if it's a company user
        if ($request->user_type === 'company') {
            $userData['company_id'] = User::generateCompanyId();
        }

        $user = User::create($userData);

        return $this->generateTokenResponse($user, $request->device_name);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
            'device_name' => 'string|max:255|nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }
        
        // Check if user has a password (regular user)
        if ($user->password && Hash::check($request->password, $user->password)) {
            return $this->generateTokenResponse($user, $request->device_name);
        }
        
        // Check if user was created via OAuth and suggest alternative login
        if ($user->google_sub_id && !$user->password) {
            return response()->json([
                'message' => 'This account was created with Google. Please use "Sign in with Google" or set a password first.',
                'oauth_user' => true,
                'provider' => 'google'
            ], 401);
        }
        
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    public function refreshToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'refresh_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $refreshToken = RefreshToken::where('token', $request->refresh_token)->first();

        if (!$refreshToken || $refreshToken->isExpired()) {
            return response()->json([
                'message' => 'Invalid or expired refresh token'
            ], 401);
        }

        $user = $refreshToken->user;
        
        // Mark the refresh token as used
        $refreshToken->markAsUsed();
        
        // Rotate the refresh token (delete old, create new)
        $newRefreshToken = $refreshToken->rotate();
        
        // Revoke all existing access tokens for this user
        $user->tokens()->delete();
        
        // Create new access token
        $accessToken = $user->createToken(
            'access_token',
            ['*'],
            now()->addMinutes(config('sanctum.access_token_expiration', 15))
        );

        return response()->json([
            'message' => 'Token refreshed successfully',
            'access_token' => $accessToken->plainTextToken,
            'refresh_token' => $newRefreshToken->token,
            'token_type' => 'Bearer',
            'expires_in' => config('sanctum.access_token_expiration', 15) * 60, // in seconds
            'user' => $user->getApiData(),
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        
        // Delete current access token
        $request->user()->currentAccessToken()->delete();
        
        // Option 1: Delete all refresh tokens (complete logout from all devices)
        // $user->revokeAllRefreshTokens();
        
        // Option 2: Delete refresh token for specific device (if device_name is provided)
        $deviceName = $request->input('device_name');
        if ($deviceName) {
            $user->refreshTokens()->where('device_name', $deviceName)->delete();
        } else {
            // If no device specified, delete all refresh tokens
            $user->revokeAllRefreshTokens();
        }

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function logoutAll(Request $request)
    {
        $user = $request->user();
        
        // Delete all access tokens
        $user->tokens()->delete();
        
        // Delete all refresh tokens
        $user->revokeAllRefreshTokens();

        return response()->json([
            'message' => 'Logged out from all devices successfully'
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'user' => $user->getApiData(),
            'authenticated' => true,
            'active_sessions' => $user->refreshTokens()->count(),
        ]);
    }

    public function setPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        
        // Check if user was created via OAuth and doesn't have a password
        if ($user->google_sub_id && !$user->password) {
            $user->update([
                'password' => Hash::make($request->password),
            ]);
            
            return response()->json([
                'message' => 'Password set successfully. You can now login with email/password.',
            ]);
        }
        
        return response()->json([
            'message' => 'Password already exists or invalid operation.',
        ], 400);
    }

    public function completeProfile(Request $request)
    {
        $user = $request->user();
        
        // Validation rules based on user type
        $rules = [
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'contact_phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
        ];

        if ($user->isCompany()) {
            $rules = array_merge($rules, [
                'company_name' => 'required|string|max:255',
                'gst_number' => 'required|string|regex:/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/',
                'business_type' => 'required|in:manufacturing,trading,services,construction,retail,other',
            ]);
        } elseif ($user->isVendor()) {
            $rules = array_merge($rules, [
                'vendor_name' => 'required|string|max:255',
                'associated_company_id' => 'required|string|exists:users,company_id',
                'gst_number' => 'required|string|regex:/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/',
                'specialization' => 'required|string|max:255',
            ]);
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $success = $user->completeProfile($request->all());
        
        if ($success) {
            return response()->json([
                'message' => 'Profile completed successfully',
                'user' => $user->fresh()->getApiData(),
            ]);
        }

        return response()->json([
            'message' => 'Failed to complete profile'
        ], 500);
    }

    public function getActiveSessions(Request $request)
    {
        $user = $request->user();
        
        $sessions = $user->refreshTokens()
            ->select('id', 'device_name', 'last_used_at', 'created_at', 'expires_at')
            ->orderBy('last_used_at', 'desc')
            ->get()
            ->map(function ($token) {
                return [
                    'id' => $token->id,
                    'device_name' => $token->device_name ?? 'Unknown Device',
                    'last_used' => $token->last_used_at?->diffForHumans() ?? 'Never',
                    'created' => $token->created_at->diffForHumans(),
                    'expires' => $token->expires_at->diffForHumans(),
                    'is_current' => false, // We can enhance this later
                ];
            });

        return response()->json([
            'sessions' => $sessions,
            'total_sessions' => $sessions->count(),
        ]);
    }

    public function revokeSession(Request $request, $sessionId)
    {
        $user = $request->user();
        
        $refreshToken = $user->refreshTokens()->find($sessionId);
        
        if (!$refreshToken) {
            return response()->json([
                'message' => 'Session not found'
            ], 404);
        }
        
        $refreshToken->delete();
        
        return response()->json([
            'message' => 'Session revoked successfully'
        ]);
    }

    public function getCompanies(Request $request)
    {
        $companies = User::where('user_type', 'company')
            ->where('status', 'active')
            ->select('company_id', 'company_name', 'business_type', 'location')
            ->get();

        return response()->json([
            'companies' => $companies
        ]);
    }

    private function generateTokenResponse(User $user, string $deviceName = null): JsonResponse
    {
        // Create access token with short expiration
        $accessToken = $user->createToken(
            'access_token',
            ['*'],
            now()->addMinutes(config('sanctum.access_token_expiration', 15))
        );
        
        // Create refresh token
        $refreshToken = $user->createRefreshToken($deviceName ?? 'Web Browser');
        
        return response()->json([
            'message' => 'Authentication successful',
            'user' => $user->getApiData(),
            'access_token' => $accessToken->plainTextToken,
            'refresh_token' => $refreshToken->token,
            'token_type' => 'Bearer',
            'expires_in' => config('sanctum.access_token_expiration', 15) * 60, // in seconds
        ]);
    }

    /**
     * Switch user's current active profile
     */
    public function switchProfile(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'profile_type' => 'required|in:company,vendor',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $profileType = $request->profile_type;

        // Check if user has the requested profile type
        if ($profileType === 'company') {
            $profile = $user->companyProfile;
            if (!$profile) {
                return response()->json([
                    'message' => 'Company profile not found',
                    'error' => 'profile_not_found'
                ], 404);
            }
            $profileId = $profile->id;
        } else {
            $profile = $user->vendorProfile;
            if (!$profile) {
                return response()->json([
                    'message' => 'Vendor profile not found',
                    'error' => 'profile_not_found'
                ], 404);
            }
            $profileId = $profile->id;
        }

        // Update user's current profile
        $user->update([
            'current_profile_type' => $profileType,
            'current_profile_id' => $profileId,
        ]);

        // Refresh user data
        $user->refresh();

        return response()->json([
            'message' => 'Profile switched successfully',
            'user' => $user->getApiData(),
            'current_profile' => [
                'type' => $user->current_profile_type,
                'id' => $user->current_profile_id,
                'data' => $profile
            ]
        ]);
    }
}
