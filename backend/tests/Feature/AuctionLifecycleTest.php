<?php

namespace Tests\Feature;

use App\Auctions\Models\Auction;
use App\Auctions\Models\AuctionParticipant;
use App\Auctions\Models\Bid;
use App\Models\Listing;
use App\Models\Quote;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class AuctionLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private User $buyer;
    private User $vendor1;
    private User $vendor2;
    private Listing $listing;

    protected function setUp(): void
    {
        parent::setUp();
        Event::fake(); // prevent broadcast overhead

        // Company / buyer
        $this->buyer = User::factory()->create(['current_profile_type' => 'company']);
        Wallet::create(['user_id' => $this->buyer->id, 'balance' => 500]);

        // Vendor 1 & 2
        $this->vendor1 = User::factory()->create(['current_profile_type' => 'vendor']);
        Wallet::create(['user_id' => $this->vendor1->id, 'balance' => 500]);

        $this->vendor2 = User::factory()->create(['current_profile_type' => 'vendor']);
        Wallet::create(['user_id' => $this->vendor2->id, 'balance' => 500]);

        // Listing — bypass company FK with direct insert (SQLite test mode)
        $this->listing = $this->createListing();

        // Pre-qualify both vendors (submitted quote)
        Quote::create([
            'quote_number'     => 'QT-TEST-001',
            'listing_id'       => $this->listing->id,
            'vendor_user_id'   => $this->vendor1->id,
            'quoted_price'     => 999.00,
            'proposal_details' => 'Test proposal',
            'delivery_days'    => 30,
            'status'           => 'submitted',
        ]);
        Quote::create([
            'quote_number'     => 'QT-TEST-002',
            'listing_id'       => $this->listing->id,
            'vendor_user_id'   => $this->vendor2->id,
            'quoted_price'     => 999.00,
            'proposal_details' => 'Test proposal',
            'delivery_days'    => 30,
            'status'           => 'submitted',
        ]);
    }

    private function createListing(): Listing
    {
        // Use DB directly to skip company FK constraint in SQLite
        $id = \Illuminate\Support\Facades\DB::table('listings')->insertGetId([
            'listing_number'   => 'LST-TEST-001',
            'company_id'       => 1,
            'title'            => 'Test Listing',
            'description'      => 'For auction tests',
            'category'         => 'Technology',
            'base_price'       => 5000.00,
            'visibility'       => 'public',
            'status'           => 'active',
            'created_by'       => $this->buyer->id,
            'blockchain_enabled' => 0,
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);
        return Listing::find($id);
    }

    // ── Tests ─────────────────────────────────────────────────────────────────

    /** @test */
    public function company_can_create_an_auction(): void
    {
        $response = $this->actingAs($this->buyer)->postJson('/api/auctions', [
            'listing_id'              => $this->listing->id,
            'start_time'              => now()->addMinute()->toDateTimeString(),
            'end_time'                => now()->addHour()->toDateTimeString(),
            'minimum_decrement_type'  => 'fixed',
            'minimum_decrement_value' => 50,
        ]);

        $response->assertStatus(201)->assertJsonPath('auction.status', 'scheduled');
    }

    /** @test */
    public function vendor_without_quote_cannot_join_auction(): void
    {
        $outsider = User::factory()->create(['current_profile_type' => 'vendor']);
        $auction  = $this->createRunningAuction();

        $this->actingAs($outsider)
             ->postJson("/api/auctions/{$auction->id}/join")
             ->assertStatus(403);
    }

    /** @test */
    public function pre_qualified_vendor_can_join_auction(): void
    {
        $auction = $this->createRunningAuction();

        $this->actingAs($this->vendor1)
             ->postJson("/api/auctions/{$auction->id}/join")
             ->assertStatus(201);

        $this->assertDatabaseHas('auction_participants', [
            'auction_id' => $auction->id,
            'vendor_id'  => $this->vendor1->id,
        ]);
    }

    /** @test */
    public function vendor_can_place_a_bid_and_get_rank(): void
    {
        $auction = $this->createRunningAuction();
        $this->joinAuction($auction, $this->vendor1);

        $this->actingAs($this->vendor1)
             ->postJson("/api/auctions/{$auction->id}/bid", ['bid_amount' => 800.00])
             ->assertStatus(201)->assertJsonPath('message', 'Bid placed successfully.');

        $this->actingAs($this->vendor1)
             ->getJson("/api/auctions/{$auction->id}/my-rank")
             ->assertOk()->assertJsonPath('your_rank', 1);
    }

    /** @test */
    public function lower_bid_takes_rank_1(): void
    {
        $auction = $this->createRunningAuction();
        $this->joinAuction($auction, $this->vendor1);
        $this->joinAuction($auction, $this->vendor2);

        $this->actingAs($this->vendor1)
             ->postJson("/api/auctions/{$auction->id}/bid", ['bid_amount' => 800.00]);

        $this->actingAs($this->vendor2)
             ->postJson("/api/auctions/{$auction->id}/bid", ['bid_amount' => 700.00]); // lower

        $this->actingAs($this->vendor2)
             ->getJson("/api/auctions/{$auction->id}/my-rank")
             ->assertJsonPath('your_rank', 1);

        $this->actingAs($this->vendor1)
             ->getJson("/api/auctions/{$auction->id}/my-rank")
             ->assertJsonPath('your_rank', 2);
    }

    /** @test */
    public function vendor_cannot_see_leaderboard_only_buyer_can(): void
    {
        $auction = $this->createRunningAuction();

        $this->actingAs($this->vendor1)
             ->getJson("/api/auctions/{$auction->id}/leaderboard")
             ->assertStatus(403);

        $this->actingAs($this->buyer)
             ->getJson("/api/auctions/{$auction->id}/leaderboard")
             ->assertOk()->assertJsonStructure(['leaderboard']);
    }

    /** @test */
    public function buyer_can_end_auction_and_status_becomes_completed(): void
    {
        $auction = $this->createRunningAuction();

        $this->actingAs($this->buyer)
             ->postJson("/api/auctions/{$auction->id}/end")
             ->assertOk()->assertJsonPath('auction.status', 'completed');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function createRunningAuction(): Auction
    {
        return Auction::create([
            'listing_id'               => $this->listing->id,
            'buyer_id'                 => $this->buyer->id,
            'start_time'               => now()->subMinute(),
            'end_time'                 => now()->addHour(),
            'minimum_decrement_type'   => 'fixed',
            'minimum_decrement_value'  => 50.00,
            'extension_window_seconds' => 60,
            'extension_duration_seconds' => 120,
            'status'                   => 'running',
        ]);
    }

    private function joinAuction(Auction $auction, User $vendor): void
    {
        $this->actingAs($vendor)->postJson("/api/auctions/{$auction->id}/join");
    }
}

