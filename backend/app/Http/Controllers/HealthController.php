<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HealthController extends Controller
{
    /**
     * Simple health check endpoint (no auth required)
     */
    public function health(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'message' => 'API is running',
            'timestamp' => now()->toISOString(),
            'environment' => app()->environment(),
        ]);
    }

    /**
     * Protected health check to test authentication
     */
    public function authHealth(): JsonResponse
    {
        $user = Auth::user();
        
        return response()->json([
            'status' => 'ok',
            'message' => 'Authentication working',
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'current_profile_type' => $user->current_profile_type,
                'current_profile_id' => $user->current_profile_id,
            ],
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Debug endpoint to test connection controller logic
     */
    public function debugConnection(): JsonResponse
    {
        $user = Auth::user();
        
        // Test the exact same logic as the connection controller
        $isVendor = $user->current_profile_type === 'vendor';
        $isCompany = $user->current_profile_type === 'company';
        
        return response()->json([
            'status' => 'ok',
            'message' => 'Connection debug info',
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'current_profile_type' => $user->current_profile_type,
                'current_profile_id' => $user->current_profile_id,
            ],
            'checks' => [
                'is_vendor' => $isVendor,
                'is_company' => $isCompany,
                'vendor_check_passes' => $user->current_profile_type === 'vendor',
                'company_check_passes' => $user->current_profile_type === 'company',
            ],
            'timestamp' => now()->toISOString(),
        ]);
    }
}
