<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('email', 'company@example.com')->first();
if (http://localhost:8000/api/blockchain/network-statususer) {
    echo "No user found\n";
    exit;
}
echo "User found: " . $user->id . "\n";
echo "Fetching connections...\n";
$start = microtime(true);
$connections = App\Models\VendorCompanyConnection::byCompany($user->id)
    ->active()
    ->with(['vendor.vendorProfile'])
    ->orderBy('connected_at', 'desc')
    ->get();
$end = microtime(true);
echo "Count: " . $connections->count() . "\n";
echo "Time: " . ($end - $start) . " seconds\n";
