<?php

namespace Tests\Unit;

use App\Auctions\Models\Auction;
use App\Auctions\Models\AuctionParticipant;
use App\Auctions\Models\Bid;
use App\Auctions\Services\AuctionRankingService;
use App\Auctions\Services\BidProcessingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class BidProcessingServiceTest extends TestCase
{
    use RefreshDatabase;

    private BidProcessingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        // Disable FK enforcement in SQLite — unit tests focus on service logic,
        // not relational integrity. MySQL ignores this statement safely.
        \Illuminate\Support\Facades\DB::statement('PRAGMA foreign_keys = OFF');
        Event::fake(); // prevent real event dispatching
        $this->service = new BidProcessingService(new AuctionRankingService());
    }

    private function makeAuction(array $attrs = []): Auction
    {
        return Auction::create(array_merge([
            'listing_id'               => 1,
            'buyer_id'                 => 1,
            'start_time'               => now()->subMinute(),
            'end_time'                 => now()->addHour(),
            'minimum_decrement_type'   => 'fixed',
            'minimum_decrement_value'  => 50.00,
            'extension_window_seconds' => 60,
            'extension_duration_seconds' => 120,
            'status'                   => 'running',
        ], $attrs));
    }

    private function makeParticipant(Auction $auction, int $vendorId, array $attrs = []): AuctionParticipant
    {
        return AuctionParticipant::create(array_merge([
            'auction_id' => $auction->id,
            'vendor_id'  => $vendorId,
        ], $attrs));
    }

    /** @test */
    public function valid_bid_is_accepted_and_persisted(): void
    {
        $auction = $this->makeAuction();
        $this->makeParticipant($auction, 10);

        $result = $this->service->processBid($auction, 10, 1000.00);

        $this->assertTrue($result['success']);
        $this->assertDatabaseHas('bids', [
            'auction_id' => $auction->id,
            'vendor_id'  => 10,
            'valid'      => 1,
        ]);
    }

    /** @test */
    public function bid_must_meet_minimum_decrement_below_current_lowest(): void
    {
        $auction = $this->makeAuction(['minimum_decrement_value' => 50.00]);
        $this->makeParticipant($auction, 20);
        $this->makeParticipant($auction, 21);

        // First bid sets floor at 500
        Bid::create([
            'auction_id' => $auction->id, 'vendor_id' => 20,
            'bid_amount' => 500.00, 'is_auto_bid' => false,
            'timestamp' => now(), 'valid' => true,
        ]);

        // 460 < 450 (500 - 50), so this should FAIL (not low enough decrement)
        $result = $this->service->processBid($auction, 21, 460.00);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('450', $result['message']);
    }

    /** @test */
    public function bid_is_rejected_below_vendor_minimum_acceptable_price(): void
    {
        $auction = $this->makeAuction();
        $this->makeParticipant($auction, 30, ['minimum_acceptable_price' => 200.00]);

        $result = $this->service->processBid($auction, 30, 150.00); // below floor

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('minimum acceptable', $result['message']);
    }

    /** @test */
    public function bid_is_rejected_when_auction_not_running(): void
    {
        $auction = $this->makeAuction(['status' => 'completed']);
        $this->makeParticipant($auction, 40);

        $result = $this->service->processBid($auction, 40, 500.00);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('not currently running', $result['message']);
    }

    /** @test */
    public function bid_is_rejected_when_vendor_not_a_participant(): void
    {
        $auction = $this->makeAuction();
        // No participant created for vendor 50

        $result = $this->service->processBid($auction, 50, 500.00);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('not a participant', $result['message']);
    }

    /** @test */
    public function rate_limit_blocks_rapid_successive_bids(): void
    {
        $auction = $this->makeAuction();
        $this->makeParticipant($auction, 60);

        // Set rate-limit flag in cache (simulating a recent bid)
        Cache::put("bid_rate:{$auction->id}:60", 1, now()->addSeconds(5));

        $result = $this->service->processBid($auction, 60, 800.00);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Rate limit', $result['message']);
    }

    /** @test */
    public function anti_snipe_extends_auction_end_time(): void
    {
        // End time 30 seconds from now; extension window is 60s → bid triggers extension
        $auction = $this->makeAuction([
            'end_time'                 => now()->addSeconds(30),
            'extension_window_seconds' => 60,
            'extension_duration_seconds' => 120,
        ]);
        $this->makeParticipant($auction, 70);

        $originalEnd = $auction->end_time->copy();

        $result = $this->service->processBid($auction, 70, 1000.00);

        $this->assertTrue($result['success']);
        $auction->refresh();
        $this->assertTrue($auction->end_time->isAfter($originalEnd));
    }
}

