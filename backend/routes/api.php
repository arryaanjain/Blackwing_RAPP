<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SocialAuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BlockchainController;
use App\Http\Controllers\VendorCompanyConnectionController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\QuoteController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Health check routes
Route::get('/health', [HealthController::class, 'health']);
Route::middleware('auth:sanctum')->get('/auth-health', [HealthController::class, 'authHealth']);
Route::middleware('auth:sanctum')->get('/debug-connection', [HealthController::class, 'debugConnection']);

// Auth routes with refresh token support
Route::prefix('auth')->group(function () {
    // Public auth routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/refresh', [AuthController::class, 'refreshToken']);
    Route::post('/oauth/google', [SocialAuthController::class, 'oauthLogin']);
    Route::get('/providers', [SocialAuthController::class, 'getProviders']);
    
    // Public company list for vendors during registration
    Route::get('/companies', [AuthController::class, 'getCompanies']);
    
    // Protected auth routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
        Route::post('/set-password', [AuthController::class, 'setPassword']);
        Route::post('/complete-profile', [AuthController::class, 'completeProfile']);
        Route::post('/switch-profile', [AuthController::class, 'switchProfile']);
        
        // Session management
        Route::get('/sessions', [AuthController::class, 'getActiveSessions']);
        Route::delete('/sessions/{id}', [AuthController::class, 'revokeSession']);
        
        // OAuth management
        Route::delete('/oauth/{provider}', [SocialAuthController::class, 'unlinkProvider']);
    });
});

// Profile Management Routes
Route::prefix('profiles')->middleware('auth:sanctum')->group(function () {
    // Profile overview and switching
    Route::get('/', [ProfileController::class, 'getAvailableProfiles']);
    Route::get('/current', [ProfileController::class, 'getCurrentProfile']);
    Route::post('/switch', [ProfileController::class, 'switchProfile']);

    // Profile existence checks
    Route::get('/check/company', [ProfileController::class, 'checkCompanyProfile']);
    Route::get('/check/vendor', [ProfileController::class, 'checkVendorProfile']);

    // GST Verification endpoint
    Route::post('/verify-gst', [ProfileController::class, 'verifyGst']);
    
    // Company profile management
    Route::prefix('company')->group(function () {
        Route::post('/', [ProfileController::class, 'createCompanyProfile']);
        Route::put('/{companyId}', [ProfileController::class, 'updateCompanyProfile']);
        Route::delete('/{companyId}', [ProfileController::class, 'deleteCompanyProfile']);
    });
    
    // Vendor profile management
    Route::prefix('vendor')->group(function () {
        Route::post('/', [ProfileController::class, 'createVendorProfile']);
        Route::put('/{vendorId}', [ProfileController::class, 'updateVendorProfile']);
        Route::delete('/{vendorId}', [ProfileController::class, 'deleteVendorProfile']);
    });
    
    // Blockchain verification routes (protected)
    Route::prefix('blockchain')->group(function () {
        Route::post('/verify', [BlockchainController::class, 'verifyShareId']);
        Route::get('/transaction/{hash}', [BlockchainController::class, 'verifyTransaction']);
        Route::get('/platform-stats', [BlockchainController::class, 'getPlatformStats']);
    });
});

// Public blockchain routes (no authentication required)
Route::prefix('blockchain')->group(function () {
    Route::get('/network-status', [BlockchainController::class, 'getNetworkStatus']);
});

// Vendor-Company Connection Routes
Route::prefix('connections')->middleware('auth:sanctum')->group(function () {
    // Vendor routes
    Route::post('/request', [VendorCompanyConnectionController::class, 'sendConnectionRequest']);
    Route::get('/requests/sent', [VendorCompanyConnectionController::class, 'getVendorRequests']);
    Route::patch('/requests/{request}/cancel', [VendorCompanyConnectionController::class, 'cancelRequest']);
    
    // Company routes
    Route::get('/requests/received', [VendorCompanyConnectionController::class, 'getCompanyRequests']);
    Route::patch('/requests/{request}/approve', [VendorCompanyConnectionController::class, 'approveRequest']);
    Route::patch('/requests/{request}/deny', [VendorCompanyConnectionController::class, 'denyRequest']);
    
    // Shared routes
    Route::get('/', [VendorCompanyConnectionController::class, 'getConnections']);
    Route::patch('/{connection}/revoke', [VendorCompanyConnectionController::class, 'revokeConnection']);
});

// Listings and Quotes Management Routes
Route::prefix('listings')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [ListingController::class, 'index']);
    Route::post('/', [ListingController::class, 'store']);
    Route::get('/{listing}', [ListingController::class, 'show']);
    Route::put('/{listing}', [ListingController::class, 'update']);
    Route::delete('/{listing}', [ListingController::class, 'destroy']);
    
    // Access management for private listings
    Route::post('/{listing}/grant-access', [ListingController::class, 'grantAccess']);
    Route::post('/{listing}/revoke-access', [ListingController::class, 'revokeAccess']);
    
    // Quote-related routes within listings context
    Route::get('/{listing}/quotes', [QuoteController::class, 'getByListing']);
});

Route::prefix('quotes')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [QuoteController::class, 'index']);
    Route::post('/', [QuoteController::class, 'store']);
    Route::get('/{quote}', [QuoteController::class, 'show']);
    Route::put('/{quote}', [QuoteController::class, 'update']);
    Route::patch('/{quote}/withdraw', [QuoteController::class, 'withdraw']);
    Route::patch('/{quote}/review', [QuoteController::class, 'review']);
});

// Legacy routes for backward compatibility (if needed)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});