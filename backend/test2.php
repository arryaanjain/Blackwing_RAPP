<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$user = App\Models\User::where('email', 'company@example.com')->first();
$start = microtime(true);
$connections = App\Models\VendorCompanyConnection::byCompany($user->id)->active()->with(['vendor.vendorProfile'])->orderBy('connected_at', 'desc')->get();
$end = microtime(true);
echo "Time: " . ($end -$start) . "\n";
