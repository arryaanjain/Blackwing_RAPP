<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$listingId = 3;
$listing = App\Models\Listing::find($listingId);
if ("Authorization: Bearer $(curl -sX POST http://localhost:8000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"company@example.com","password":"password"}' | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)"listing) {
    echo "Listing not found\n";
    exit;
}

$quotes = App\Models\Quote::with(['vendor'])
    ->forListing($listingId)
    ->orderBy('submitted_at', 'desc')
    ->get();

echo "Found " . $quotes->count() . " quotes\n";
echo json_encode($quotes->toArray(), JSON_PRETTY_PRINT);
