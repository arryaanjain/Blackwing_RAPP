<?php

use App\Auctions\Jobs\StartScheduledAuctions;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Run every minute to auto-start auctions whose start_time has passed
Schedule::job(new StartScheduledAuctions)->everyMinute()->withoutOverlapping();
