<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class VendorCompanyConnectionDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * This seeder specifically handles vendor-company connection data.
     */
    public function run(): void
    {
        $this->command->info('Starting Vendor-Company Connection Data Seeding...');
        
        // First seed the connection requests
        $this->call(VendorCompanyConnectionRequestSeeder::class);
        
        // Then seed the actual connections
        $this->call(VendorCompanyConnectionSeeder::class);
        
        $this->command->info('Vendor-Company Connection Data Seeding completed successfully!');
    }
}
