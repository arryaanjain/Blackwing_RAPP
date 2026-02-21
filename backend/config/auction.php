<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Bid Rate Limiting
    |--------------------------------------------------------------------------
    | Number of seconds a vendor must wait between successive bids.
    | Prevents spam bidding. Set to 0 to disable.
    */
    'bid_cooldown_seconds' => (int) env('AUCTION_BID_COOLDOWN_SECONDS', 5),

    /*
    |--------------------------------------------------------------------------
    | Default Anti-Snipe Window
    |--------------------------------------------------------------------------
    | If a bid lands within this many seconds of auction end, the auction
    | is automatically extended by extension_duration_seconds.
    | These are the system-wide defaults; each auction row can override them.
    */
    'default_extension_window_seconds'   => (int) env('AUCTION_EXTENSION_WINDOW', 60),
    'default_extension_duration_seconds' => (int) env('AUCTION_EXTENSION_DURATION', 120),

    /*
    |--------------------------------------------------------------------------
    | Default Minimum Decrement
    |--------------------------------------------------------------------------
    */
    'default_minimum_decrement_type'  => env('AUCTION_DECREMENT_TYPE', 'fixed'),
    'default_minimum_decrement_value' => (float) env('AUCTION_DECREMENT_VALUE', 1.00),
];

