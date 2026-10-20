<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepositController extends Controller
{
    /**
     * List deposits with filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Deposit::with(['order', 'customer', 'verifier']);

        if ($request->has('order_id')) {
            $query->where('order_id', $request->order_id);
        }

        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $deposits = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($deposits);
    }

    /**
     * Show a single deposit.
     */
    public function show(Deposit $deposit): JsonResponse
    {
        return response()->json($deposit->load(['order', 'customer', 'verifier']));
    }

    /**
     * Upload a deposit (public or admin).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|in:instapay,vodafone_cash,telda',
            'transfer_date' => 'required|date',
            'screenshot' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        // Store screenshot
        $screenshotPath = $request->file('screenshot')->store('deposits', 'public');

        $deposit = Deposit::create([
            'order_id' => $order->id,
            'customer_id' => $order->customer_id,
            'amount' => $validated['amount'],
            'method' => $validated['method'],
            'transfer_date' => $validated['transfer_date'],
            'screenshot_path' => $screenshotPath,
            'status' => Deposit::STATUS_PENDING,
        ]);

        return response()->json($deposit->load(['order', 'customer']), 201);
    }

    /**
     * Upload a deposit for a specific order by order number (public).
     */
    public function storeByOrderNumber(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        // Allow payment_method alias and default transfer_date
        if (!$request->has('method') && $request->has('payment_method')) {
            $request->merge(['method' => $request->input('payment_method')]);
        }
        if (!$request->has('transfer_date')) {
            $request->merge(['transfer_date' => now()->toDateString()]);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|in:instapay,vodafone_cash,telda',
            'transfer_date' => 'required|date',
            'screenshot' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $screenshotPath = $request->file('screenshot')->store('deposits', 'public');

        $deposit = Deposit::create([
            'order_id' => $order->id,
            'customer_id' => $order->customer_id,
            'amount' => $validated['amount'],
            'method' => $validated['method'],
            'transfer_date' => $validated['transfer_date'],
            'screenshot_path' => $screenshotPath,
            'status' => Deposit::STATUS_PENDING,
        ]);

        return response()->json($deposit, 201);
    }

    /**
     * Verify or reject a deposit (admin only).
     */
    public function verify(Request $request, Deposit $deposit): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:verified,rejected',
            'admin_note' => 'nullable|string',
        ]);

        $deposit->update([
            'status' => $validated['status'],
            'admin_note' => $validated['admin_note'] ?? $deposit->admin_note,
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ]);

        return response()->json($deposit->fresh(['order', 'customer', 'verifier']));
    }
}
