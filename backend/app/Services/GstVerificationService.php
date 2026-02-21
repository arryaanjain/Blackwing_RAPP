<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class GstVerificationService
{
    private string $apiUrl;
    private ?string $apiKey;
    private bool $enabled;

    public function __construct()
    {
        $this->apiUrl = config('services.gst.api_url', 'https://sheet.gstincheck.co.in/check');
        $this->apiKey = config('services.gst.api_key');
        $this->enabled = config('services.gst.enabled', false);
    }

    /**
     * Verify GST number with Government API
     * 
     * @param string $gstin The GST number to verify
     * @return array Returns ['valid' => bool, 'data' => array|null, 'error' => string|null]
     */
    public function verifyGstin(string $gstin): array
    {
        // First, validate format
        if (!$this->isValidGstinFormat($gstin)) {
            return [
                'valid' => false,
                'data' => null,
                'error' => 'Invalid GSTIN format'
            ];
        }

        // If GST verification is disabled (for development), only check format
        if (!$this->enabled) {
            Log::info('GST verification disabled - only format validation performed', ['gstin' => $gstin]);
            return [
                'valid' => true,
                'data' => ['gstin' => $gstin, 'verified_via' => 'format_only'],
                'error' => null
            ];
        }

        // Check cache first (cache for 24 hours)
        $cacheKey = 'gst_verification_' . $gstin;
        $cached = Cache::get($cacheKey);

        if ($cached !== null) {
            Log::info('GST verification result from cache', ['gstin' => $gstin, 'valid' => $cached['valid']]);
            return $cached;
        }

        // Call GST verification API
        try {
            $response = $this->callGstApi($gstin);

            if ($response['valid']) {
                // Cache successful verification for 24 hours
                Cache::put($cacheKey, $response, now()->addHours(24));
            }

            return $response;
        } catch (\Exception $e) {
            Log::error('GST API verification failed', [
                'gstin' => $gstin,
                'error' => $e->getMessage()
            ]);

            // Fallback to format validation if API fails
            return [
                'valid' => true, // Allow registration if API is down
                'data' => ['gstin' => $gstin, 'verified_via' => 'format_only_api_failed'],
                'error' => 'GST API unavailable - format validation only'
            ];
        }
    }

    /**
     * Call the GST verification API
     */
    private function callGstApi(string $gstin): array
    {
        $headers = [];
        if ($this->apiKey) {
            $headers['Authorization'] = 'Bearer ' . $this->apiKey;
        }

        $request = Http::timeout(10);

        if (app()->environment('local')) {
            $request = $request->withoutVerifying();
        }

        $response = $request->withHeaders($headers)
            ->get($this->apiUrl, ['gst' => $gstin]);

        if (!$response->successful()) {
            throw new \Exception('GST API returned error: ' . $response->status());
        }

        $data = $response->json();

        // Parse response based on API format
        // Adjust this based on your GST API provider's response format
        if (isset($data['flag']) && $data['flag'] === true) {
            return [
                'valid' => true,
                'data' => [
                    'gstin' => $gstin,
                    'legal_name' => $data['data']['lgnm'] ?? null,
                    'trade_name' => $data['data']['tradeNam'] ?? null,
                    'status' => $data['data']['sts'] ?? null,
                    'registration_date' => $data['data']['rgdt'] ?? null,
                    'state' => $data['data']['stj'] ?? null,
                    'taxpayer_type' => $data['data']['dty'] ?? null,
                    'verified_via' => 'api'
                ],
                'error' => null
            ];
        }

        return [
            'valid' => false,
            'data' => null,
            'error' => $data['message'] ?? 'Invalid or inactive GSTIN'
        ];
    }

    /**
     * Validate GSTIN format (format only, no checksum)
     */
    private function isValidGstinFormat(string $gstin): bool
    {
        $value = strtoupper(trim($gstin));

        // Check format only - 15 characters matching GST pattern
        // Checksum validation disabled for compatibility
        return preg_match('/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/', $value) === 1;
    }
}

