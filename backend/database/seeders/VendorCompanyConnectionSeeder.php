<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\VendorCompanyConnection;
use App\Models\VendorCompanyConnectionRequest;
use App\Models\User;
use App\Models\Company;
use Carbon\Carbon;

class VendorCompanyConnectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the users from the provided data
        $companyUser = User::where('email', 'jainarryaan@gmail.com')->first();
        $vendorUser = User::where('email', 'vpblackwing@gmail.com')->first();

        if (!$companyUser || !$vendorUser) {
            $this->command->error('Required users not found. Please ensure users exist before running this seeder.');
            return;
        }

        // Use the provided company share_id
        $companyShareId = 'COMP-6182';

        // Get the approved connection request to link to
        $approvedRequest = VendorCompanyConnectionRequest::where([
            'vendor_user_id' => $vendorUser->id,
            'company_share_id' => $companyShareId,
            'status' => 'approved'
        ])->first();

        // Seed active connections
        $connections = [
            [
                'vendor_user_id' => $vendorUser->id,
                'company_user_id' => $companyUser->id,
                'company_share_id' => $companyShareId,
                'connected_at' => Carbon::now()->subDay(),
                'approved_by' => $companyUser->id,
                'original_request_id' => $approvedRequest?->id,
                'is_active' => true,
                'permissions' => json_encode([
                    'view_private_listings' => true,
                    'submit_bids' => true,
                    'access_company_profile' => true,
                ]),
                'last_accessed_at' => Carbon::now()->subHours(2),
                'created_at' => Carbon::now()->subDay(),
                'updated_at' => Carbon::now()->subHours(2),
            ],
            [
                'vendor_user_id' => $vendorUser->id,
                'company_user_id' => $companyUser->id,
                'company_share_id' => $companyShareId,
                'connected_at' => Carbon::now()->subWeeks(2),
                'approved_by' => $companyUser->id,
                'original_request_id' => null, // Older connection without request reference
                'is_active' => false, // Revoked connection for testing
                'permissions' => json_encode([
                    'view_private_listings' => false,
                    'submit_bids' => false,
                    'access_company_profile' => false,
                ]),
                'last_accessed_at' => Carbon::now()->subWeeks(1),
                'revoked_by' => $companyUser->id,
                'revoked_at' => Carbon::now()->subWeek(),
                'revocation_reason' => 'Connection revoked due to policy changes. Vendor can reapply if needed.',
                'created_at' => Carbon::now()->subWeeks(2),
                'updated_at' => Carbon::now()->subWeek(),
            ],
        ];

        foreach ($connections as $connectionData) {
            // Check if connection already exists to avoid duplicates
            $existingConnection = VendorCompanyConnection::where([
                'vendor_user_id' => $connectionData['vendor_user_id'],
                'company_user_id' => $connectionData['company_user_id'],
            ])->first();

            if (!$existingConnection) {
                VendorCompanyConnection::create($connectionData);
                $status = $connectionData['is_active'] ? 'active' : 'revoked';
                $this->command->info("Created connection: {$status} status");
            } else {
                // Update existing connection if needed
                $existingConnection->update($connectionData);
                $status = $connectionData['is_active'] ? 'active' : 'revoked';
                $this->command->info("Updated existing connection: {$status} status");
            }
        }

        $this->command->info('Vendor Company Connection seeding completed!');
    }
}
