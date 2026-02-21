<?php

/**
 * Quick test script to verify GST validation works
 * Run: php test-gst.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\GstVerificationService;

echo "🧪 Testing GST Verification Service\n";
echo "=====================================\n\n";

$service = new GstVerificationService();

$testGstNumbers = [
    '07AAGFF2194N1Z1' => 'Valid test number',
    '27AAACT2727Q1ZV' => 'Tata Motors',
    '27AAACR5055K1ZX' => 'Reliance Industries',
    '29AAACI1681G1ZV' => 'Infosys',
    'INVALID123' => 'Invalid format',
    '12ABCDE1234F1Z1' => 'Invalid checksum',
];

foreach ($testGstNumbers as $gst => $description) {
    echo "Testing: $gst ($description)\n";
    
    $result = $service->verifyGstin($gst);
    
    if ($result['valid']) {
        echo "  ✅ VALID\n";
        if (isset($result['data'])) {
            echo "  Data: " . json_encode($result['data'], JSON_PRETTY_PRINT) . "\n";
        }
    } else {
        echo "  ❌ INVALID\n";
        echo "  Error: " . ($result['error'] ?? 'Unknown error') . "\n";
    }
    
    echo "\n";
}

echo "=====================================\n";
echo "✅ Test complete!\n";

