<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\VendorCompanyConnectionRequest;
use App\Models\User;
use App\Models\Company;
use App\Models\Vendor;
use Carbon\Carbon;

class VendorCompanyConnectionRequestSeeder extends Seeder
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

        // Get vendor profile for snapshot data
        $vendor = Vendor::where('user_id', $vendorUser->id)->first();
        if (!$vendor) {
            $this->command->error('Vendor profile not found for user vpblackwing@gmail.com');
            return;
        }

        // Create vendor profile snapshot data
        $vendorProfileData = [
            'vendor_name' => $vendor->vendor_name ?? 'Tech Solutions Vendor',
            'specialization' => $vendor->specialization ?? 'Software Development',
            'location' => $vendor->location ?? 'Mumbai, India',
            'contact_email' => $vendor->contact_email ?? $vendorUser->email,
            'business_description' => $vendor->business_description ?? 'Specialized in web development and mobile app solutions',
            'years_of_experience' => $vendor->years_of_experience ?? 5,
        ];

        // Seed connection requests with different statuses
        $requests = [
            [
                'vendor_user_id' => $vendorUser->id,
                'company_share_id' => $companyShareId,
                'company_user_id' => $companyUser->id,
                'message' => 'Hello! I am interested in connecting with your company. We specialize in software development and would love to explore potential collaboration opportunities.',
                'status' => 'pending',
                'vendor_profile_data' => json_encode($vendorProfileData),
                'expires_at' => Carbon::now()->addDays(30),
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
            ],
            [
                'vendor_user_id' => $vendorUser->id,
                'company_share_id' => $companyShareId,
                'company_user_id' => $companyUser->id,
                'message' => 'We have extensive experience in the industry and would like to be considered for your upcoming projects.',
                'status' => 'approved',
                'reviewed_by' => $companyUser->id,
                'reviewed_at' => Carbon::now()->subDay(),
                'review_notes' => 'Approved after reviewing vendor credentials and portfolio. Good fit for our requirements.',
                'vendor_profile_data' => json_encode($vendorProfileData),
                'expires_at' => null, // No expiration for approved requests
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDay(),
            ],
            [
                'vendor_user_id' => $vendorUser->id,
                'company_share_id' => $companyShareId,
                'company_user_id' => $companyUser->id,
                'message' => 'This is an older request that was denied for testing purposes.',
                'status' => 'denied',
                'reviewed_by' => $companyUser->id,
                'reviewed_at' => Carbon::now()->subDays(3),
                'review_notes' => 'Currently not looking for vendors in this specialization.',
                'vendor_profile_data' => json_encode($vendorProfileData),
                'expires_at' => null,
                'created_at' => Carbon::now()->subWeek(),
                'updated_at' => Carbon::now()->subDays(3),
            ],
        ];

        foreach ($requests as $requestData) {
            // Check if request already exists to avoid duplicates
            $existingRequest = VendorCompanyConnectionRequest::where([
                'vendor_user_id' => $requestData['vendor_user_id'],
                'company_share_id' => $requestData['company_share_id'],
                'status' => $requestData['status']
            ])->first();

            if (!$existingRequest) {
                VendorCompanyConnectionRequest::create($requestData);
                $this->command->info("Created connection request: {$requestData['status']} status");
            } else {
                $this->command->info("Connection request already exists: {$requestData['status']} status");
            }
        }

        $this->command->info('Vendor Company Connection Request seeding completed!');
    }
}
