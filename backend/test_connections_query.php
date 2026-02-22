<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('current_profile_type', 'company')->first();
if (!$user) {
    echo "No company user found\n";
    exit;
}
echo "User ID: {$user->id}\n";
$start = microtime(true);
$connections = App\Models\VendorCompanyConnection::byCompany($user->id)
    ->active()
    ->with(['vendor.vendorProfile'])
    ->orderBy('connected_at', 'desc')
    ->get();
$end = microtime(true);

echo "Found " . $connections->count() . " connections\n";
echo "Query took: " . ($end - $start) . " seconds\n";
echo json_encode($connections->toArray());
