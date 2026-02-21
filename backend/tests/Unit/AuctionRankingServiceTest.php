<?php

namespace Tests\Unit;

use App\Auctions\Models\Auction;
use App\Auctions\Models\AuctionParticipant;
use App\Auctions\Models\Bid;
use App\Auctions\Services\AuctionRankingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AuctionRankingServiceTest extends TestCase
{
    use RefreshDatabase;

    private AuctionRankingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        // Disable FK enforcement in SQLite — unit tests focus on service logic,
        // not relational integrity. MySQL ignores this statement safely.
        DB::statement('PRAGMA foreign_keys = OFF');
        $this->service = new AuctionRankingService();
    }

    /** Creates a minimal auction row, bypassing FK constraints in SQLite. */
    private function makeAuction(array $attrs = []): Auction
    {
        return Auction::create(array_merge([
            'listing_id'               => 1,
            'buyer_id'                 => 1,
            'start_time'               => now()->subMinute(),
            'end_time'                 => now()->addHour(),
            'minimum_decrement_type'   => 'fixed',
            'minimum_decrement_value'  => 10.00,
            'extension_window_seconds' => 60,
            'extension_duration_seconds' => 120,
            'status'                   => 'running',
        ], $attrs));
    }

    private function makeParticipant(Auction $auction, int $vendorId): AuctionParticipant
    {
        return AuctionParticipant::create([
            'auction_id' => $auction->id,
            'vendor_id'  => $vendorId,
        ]);
    }

    private function makeBid(Auction $auction, int $vendorId, float $amount, string $timestamp = null): Bid
    {
        return Bid::create([
            'auction_id' => $auction->id,
            'vendor_id'  => $vendorId,
            'bid_amount' => $amount,
            'is_auto_bid' => false,
            'timestamp'  => $timestamp ?? now()->toDateTimeString(),
            'valid'      => true,
        ]);
    }

    /** @test */
    public function it_ranks_vendor_with_lowest_bid_first(): void
    {
        $auction = $this->makeAuction();
        $this->makeParticipant($auction, 101);
        $this->makeParticipant($auction, 102);

        $this->makeBid($auction, 101, 500.00);
        $this->makeBid($auction, 102, 400.00); // lower → should be rank 1

        $this->service->calculateRanks($auction);

        $this->assertDatabaseHas('auction_participants', ['vendor_id' => 102, 'current_rank' => 1]);
        $this->assertDatabaseHas('auction_participants', ['vendor_id' => 101, 'current_rank' => 2]);
    }

    /** @test */
    public function it_breaks_ties_by_earlier_timestamp(): void
    {
        $auction = $this->makeAuction();
        $this->makeParticipant($auction, 201);
        $this->makeParticipant($auction, 202);

        // Same amount, vendor 202 bid earlier
        $this->makeBid($auction, 201, 300.00, now()->toDateTimeString());
        $this->makeBid($auction, 202, 300.00, now()->subSeconds(10)->toDateTimeString());

        $this->service->calculateRanks($auction);

        $this->assertDatabaseHas('auction_participants', ['vendor_id' => 202, 'current_rank' => 1]);
        $this->assertDatabaseHas('auction_participants', ['vendor_id' => 201, 'current_rank' => 2]);
    }

    /** @test */
    public function it_ignores_invalid_bids_when_ranking(): void
    {
        $auction = $this->makeAuction();
        $this->makeParticipant($auction, 301);
        $this->makeParticipant($auction, 302);

        Bid::create([
            'auction_id' => $auction->id, 'vendor_id' => 301,
            'bid_amount' => 50.00, 'is_auto_bid' => false,
            'timestamp' => now(), 'valid' => false,    // invalid
        ]);
        $this->makeBid($auction, 302, 200.00); // only valid bid

        $this->service->calculateRanks($auction);

        $this->assertDatabaseHas('auction_participants',  ['vendor_id' => 302, 'current_rank' => 1]);
        $this->assertDatabaseHas('auction_participants',  ['vendor_id' => 301, 'current_rank' => null]);
    }

    /** @test */
    public function get_vendor_rank_returns_correct_rank(): void
    {
        $auction = $this->makeAuction();
        $this->makeParticipant($auction, 401);
        $this->makeBid($auction, 401, 250.00);
        $this->service->calculateRanks($auction);

        $rank = $this->service->getVendorRank($auction, 401);

        $this->assertEquals(1, $rank);
    }

    /** @test */
    public function get_lowest_bid_returns_minimum_valid_bid(): void
    {
        $auction = $this->makeAuction();
        $this->makeBid($auction, 501, 800.00);
        $this->makeBid($auction, 501, 600.00);
        $this->makeBid($auction, 502, 700.00);

        $lowest = $this->service->getLowestBid($auction);

        $this->assertEquals(600.00, $lowest);
    }

    /** @test */
    public function get_lowest_bid_returns_null_when_no_bids(): void
    {
        $auction = $this->makeAuction();

        $this->assertNull($this->service->getLowestBid($auction));
    }
}

