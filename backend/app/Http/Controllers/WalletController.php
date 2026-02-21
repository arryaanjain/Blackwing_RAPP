<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Razorpay\Api\Api as RazorpayApi;

class WalletController extends Controller
{
    /** GET /api/wallet — return current balance and recent transactions */
    public function balance(): JsonResponse
    {
        $user   = Auth::user();
        $wallet = $user->wallet;

        return response()->json([
            'balance'      => $wallet?->balance ?? 0,
            'point_costs'  => [
                'listing' => config('points.cost_listing'),
                'quote'   => config('points.cost_quote'),
                'bid'     => config('points.cost_bid'),
            ],
        ]);
    }

    /** GET /api/wallet/transactions — paginated transaction history */
    public function transactions(): JsonResponse
    {
        $user = Auth::user();

        $transactions = WalletTransaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($transactions);
    }

    /**
     * POST /api/wallet/order
     * Creates a Razorpay order for purchasing points.
     * Body: { amount_inr: <number>, points: <number> }
     */
    public function createOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount_inr' => 'required|numeric|min:1',
            'points'     => 'required|integer|min:1',
        ]);

        $keyId     = config('points.razorpay_key_id');
        $keySecret = config('points.razorpay_key_secret');

        if (empty($keyId) || empty($keySecret)) {
            return response()->json(['error' => 'Razorpay is not configured on the server.'], 503);
        }

        $api = new RazorpayApi($keyId, $keySecret);

        $orderData = [
            'receipt'         => 'wallet_' . Auth::id() . '_' . time(),
            'amount'          => (int) ($validated['amount_inr'] * 100), // paise
            'currency'        => 'INR',
            'payment_capture' => 1,
            'notes'           => [
                'user_id' => Auth::id(),
                'points'  => $validated['points'],
            ],
        ];

        $order = $api->order->create($orderData);

        return response()->json([
            'order_id'   => $order->id,
            'amount'     => $order->amount,
            'currency'   => $order->currency,
            'key_id'     => $keyId,
            'points'     => $validated['points'],
            'user_name'  => Auth::user()->name,
            'user_email' => Auth::user()->email,
        ]);
    }

    /**
     * POST /api/wallet/verify
     * Verifies Razorpay payment and credits points.
     * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, points }
     */
    public function verifyPayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'razorpay_order_id'   => 'required|string',
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature'  => 'required|string',
            'points'              => 'required|integer|min:1',
        ]);

        $keySecret = config('points.razorpay_key_secret');

        // Verify signature
        $generatedSignature = hash_hmac(
            'sha256',
            $validated['razorpay_order_id'] . '|' . $validated['razorpay_payment_id'],
            $keySecret
        );

        if ($generatedSignature !== $validated['razorpay_signature']) {
            return response()->json(['error' => 'Payment verification failed.'], 400);
        }

        $user   = Auth::user();
        $wallet = $user->wallet ?? Wallet::create(['user_id' => $user->id, 'balance' => 0]);

        $wallet->credit(
            $validated['points'],
            'Purchased ' . $validated['points'] . ' points via Razorpay',
            'razorpay',
            $validated['razorpay_payment_id']
        );

        return response()->json([
            'message'     => 'Points credited successfully.',
            'points_added' => $validated['points'],
            'new_balance'  => $wallet->fresh()->balance,
        ]);
    }
}

