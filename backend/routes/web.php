<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SocialAuthController;

Route::get('/', function () {
    return view('welcome');
});

// OAuth routes
Route::prefix('auth')->group(function () {
    Route::get('/google', [SocialAuthController::class, 'redirectToGoogle'])->name('oauth.google');
    Route::get('/google/callback', [SocialAuthController::class, 'handleGoogleCallback'])->name('oauth.google.callback');
});
