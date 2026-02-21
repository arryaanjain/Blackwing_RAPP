<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Wallet / Points Configuration
    |--------------------------------------------------------------------------
    | All values are read from .env so they can be changed without code edits.
    */

    // Points credited to every new user on registration
    'new_user'      => (int) env('POINTS_NEW_USER',    1000),

    // Points deducted per action
    'cost_listing'  => (int) env('POINTS_COST_LISTING', 1),
    'cost_quote'    => (int) env('POINTS_COST_QUOTE',   1),
    'cost_bid'      => (int) env('POINTS_COST_BID',     1),

    // Razorpay credentials
    'razorpay_key_id'     => env('RAZORPAY_KEY_ID',     ''),
    'razorpay_key_secret' => env('RAZORPAY_KEY_SECRET', ''),
];

