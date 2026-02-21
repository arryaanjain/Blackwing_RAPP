<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Company;
use App\Models\Vendor;
use App\Models\Listing;
use App\Services\BlockchainService;
use Illuminate\Support\Facades\Log;

class BlockchainSync extends Command
{
    protected $signature   = 'blockchain:sync {--listings : Also sync active listings}';
    protected $description = 'Re-register all companies and vendors on the blockchain (run after a chain reset)';

    public function handle(): int
    {
        $this->info('🔗 Starting blockchain sync...');
        $this->newLine();

        $service = new BlockchainService();
        $errors  = 0;

        // ── 1. Companies ────────────────────────────────────────────
        $companies = Company::whereNotNull('share_id')->get();
        $this->info("📦 Registering {$companies->count()} company/companies...");

        foreach ($companies as $company) {
            try {
                $metadataHash = hash('sha256', json_encode([
                    'name'    => $company->company_name,
                    'type'    => 'company',
                    'id'      => $company->id,
                ]));

                $service->registerEntity(
                    $company->share_id,
                    $company->company_name,
                    0,               // EntityType::COMPANY
                    $metadataHash
                );

                $this->line("  ✅ Company [{$company->share_id}] {$company->company_name}");
            } catch (\Throwable $e) {
                // "Already registered" or "Share ID already registered" is fine — idempotent
                if (str_contains($e->getMessage(), 'registered')) {
                    $this->line("  ⏩ [{$company->share_id}] already registered on-chain");
                } else {
                    $this->error("  ❌ Company [{$company->share_id}]: " . $e->getMessage());
                    $errors++;
                }
            }
        }

        $this->newLine();

        // ── 2. Vendors ───────────────────────────────────────────────
        $vendors = Vendor::whereNotNull('share_id')->get();
        $this->info("👤 Registering {$vendors->count()} vendor(s)...");

        foreach ($vendors as $vendor) {
            try {
                $metadataHash = hash('sha256', json_encode([
                    'name'    => $vendor->vendor_name,
                    'type'    => 'vendor',
                    'id'      => $vendor->id,
                ]));

                $service->registerEntity(
                    $vendor->share_id,
                    $vendor->vendor_name,
                    1,               // EntityType::VENDOR
                    $metadataHash
                );

                $this->line("  ✅ Vendor [{$vendor->share_id}] {$vendor->vendor_name}");
            } catch (\Throwable $e) {
                if (str_contains($e->getMessage(), 'registered')) {
                    $this->line("  ⏩ [{$vendor->share_id}] already registered on-chain");
                } else {
                    $this->error("  ❌ Vendor [{$vendor->share_id}]: " . $e->getMessage());
                    $errors++;
                }
            }
        }

        $this->newLine();

        // ── 3. Listings (optional, via --listings flag) ──────────────
        if ($this->option('listings')) {
            $listings = Listing::whereIn('status', ['active', 'draft'])->get();

            $this->info("📋 Re-syncing {$listings->count()} listing(s)...");

            foreach ($listings as $listing) {
                try {
                    $company = Company::find($listing->company_id);
                    if (!$company) {
                        $this->warn("  ⚠️ Listing #{$listing->id}: company not found, skipping");
                        continue;
                    }

                    $contentHash = hash('sha256', json_encode([
                        'title'       => $listing->title,
                        'description' => $listing->description,
                        'category'    => $listing->category,
                    ]));

                    $visibility = $listing->visibility === 'public' ? 0 : 1;
                    $status     = $listing->status === 'active' ? 1 : 0;
                    $closesAt   = $listing->closes_at ? strtotime($listing->closes_at) : 0;

                    // Use the existing listing_number if available, otherwise generate one
                    $listingNumber = $listing->listing_number ?? ('LST-' . strtoupper(substr(md5($listing->id), 0, 10)));

                    $service->createListing(
                        $listingNumber,
                        $company->share_id,
                        $contentHash,
                        intval(($listing->base_price ?? 0) * 100),
                        $visibility,
                        $status,
                        $closesAt,
                        []
                    );

                    $this->line("  ✅ Listing #{$listing->id} [{$listingNumber}]");
                } catch (\Throwable $e) {
                    if (str_contains($e->getMessage(), 'Listing number already exists')) {
                        $this->line("  ⏩ Listing #{$listing->id} already on-chain");
                    } else {
                        $this->error("  ❌ Listing #{$listing->id}: " . $e->getMessage());
                        $errors++;
                    }
                }
            }

            $this->newLine();
        }

        // ── Summary ──────────────────────────────────────────────────
        if ($errors === 0) {
            $this->info('✅ Blockchain sync complete — no errors.');
        } else {
            $this->warn("⚠️  Blockchain sync complete with {$errors} error(s). Check laravel.log for details.");
        }

        return $errors > 0 ? self::FAILURE : self::SUCCESS;
    }
}
