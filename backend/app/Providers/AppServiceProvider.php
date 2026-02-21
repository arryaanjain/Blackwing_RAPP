<?php

namespace App\Providers;

use App\Auctions\Events\AuctionEnded;
use App\Auctions\Events\AuctionExtended;
use App\Auctions\Events\AuctionStarted;
use App\Auctions\Events\BidPlaced;
use App\Auctions\Events\RankUpdated;
use App\Auctions\Listeners\LogAuctionEvent;
use App\Auctions\Models\Auction;
use App\Auctions\Policies\AuctionPolicy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // ── Event → Listener mappings ────────────────────────────────────────
        Event::listen(AuctionStarted::class,  LogAuctionEvent::class);
        Event::listen(BidPlaced::class,        LogAuctionEvent::class);
        Event::listen(RankUpdated::class,      LogAuctionEvent::class);
        Event::listen(AuctionExtended::class,  LogAuctionEvent::class);
        Event::listen(AuctionEnded::class,     LogAuctionEvent::class);

        // ── Policy registration ───────────────────────────────────────────────
        Gate::policy(Auction::class, AuctionPolicy::class);
    }
}
