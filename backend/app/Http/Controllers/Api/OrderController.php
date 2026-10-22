<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Customer;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        private OrderService $orderService
    ) {}

    /**
     * List orders with filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['customer', 'items.product.images']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search by customer name or order number
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%")
                         ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(20);

        // Append computed attributes
        $orders->getCollection()->transform(function ($order) {
            $order->remaining_balance = $order->remaining_balance;
            $order->verified_deposits_amount = $order->verified_deposits_amount;
            return $order;
        });

        return response()->json($orders);
    }

    /**
     * Show a single order with all details.
     */
    public function show(Order $order): JsonResponse
    {
        $order->load([
            'customer',
            'items.product.images',
            'deposits.verifier',
            'statusHistory.changedByUser',
            'customsFeeHistory.changedByUser',
        ]);

        $order->remaining_balance = $order->remaining_balance;
        $order->verified_deposits_amount = $order->verified_deposits_amount;
        $order->can_contact = $order->canContactCustomer();

        return response()->json($order);
    }

    /**
     * Create a new order (admin or public checkout).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            // Customer (existing or new)
            'customer_id' => 'nullable|exists:customers,id',
            'customer' => 'nullable|array',
            'customer.name' => 'required_without:customer_id|string|max:255',
            'customer.phone' => 'required_without:customer_id|string|max:20',
            'customer.whatsapp_number' => 'nullable|string|max:20',
            'customer.tiktok_username' => 'nullable|string|max:100',
            'customer.instagram_username' => 'nullable|string|max:100',
            'customer.source_platform' => 'required_without:customer_id|in:whatsapp,tiktok,instagram',

            // Items
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.size' => 'nullable|string',
            'items.*.color' => 'nullable|string',

            // Order details
            'shipping_address' => 'nullable|string',
            'shipping_fee' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        // Resolve customer
        $customerId = $validated['customer_id'] ?? null;
        if (!$customerId && isset($validated['customer'])) {
            $customer = Customer::create($validated['customer']);
            $customerId = $customer->id;
        }

        $orderData = array_merge($validated, ['customer_id' => $customerId]);
        $order = $this->orderService->createOrder(
            $orderData,
            $validated['items'],
            $request->user()?->id
        );

        return response()->json($order->load(['customer', 'items']), 201);
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:' . implode(',', Order::STATUSES),
            'note' => 'nullable|string',
        ]);

        $order = $this->orderService->updateStatus(
            $order,
            $validated['status'],
            $request->user()->id,
            $validated['note'] ?? null
        );

        return response()->json($order->load(['customer', 'items', 'statusHistory']));
    }

    /**
     * Update customs fee.
     */
    public function updateCustomsFee(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'customs_fee' => 'required|numeric|min:0',
            'reason' => 'nullable|string',
        ]);

        $order = $this->orderService->updateCustomsFee(
            $order,
            $validated['customs_fee'],
            $request->user()->id,
            $validated['reason'] ?? null
        );

        return response()->json($order->load('customsFeeHistory'));
    }

    /**
     * Get contact link for customer (only after shipped).
     */
    public function contactLink(Order $order): JsonResponse
    {
        $result = $this->orderService->getContactLink($order);

        if (!$result) {
            return response()->json(
                ['message' => 'Contact is only available after the order is shipped.'],
                400
            );
        }

        return response()->json($result);
    }

    /**
     * Track an order by order number (public).
     */
    public function track(string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)
            ->with(['items', 'statusHistory' => function ($q) {
                $q->orderBy('created_at', 'desc');
            }, 'deposits'])
            ->first();

        // Also allow lookup by ID
        if (!$order && is_numeric($orderNumber)) {
            $order = Order::where('id', $orderNumber)
                ->with(['items', 'statusHistory' => function ($q) {
                    $q->orderBy('created_at', 'desc');
                }, 'deposits'])
                ->first();
        }

        // Support legacy/simulated DS- prefix by returning the latest active order
        if (!$order && str_starts_with($orderNumber, 'DS-')) {
            $order = Order::latest()
                ->with(['items', 'statusHistory' => function ($q) {
                    $q->orderBy('created_at', 'desc');
                }, 'deposits'])
                ->first();
        }

        if (!$order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        return response()->json([
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status,
            'subtotal' => $order->subtotal,
            'shipping_fee' => $order->shipping_fee,
            'customs_fee' => $order->customs_fee,
            'discount_amount' => $order->discount_amount,
            'total' => $order->total,
            'remaining_balance' => $order->remaining_balance,
            'verified_deposits_amount' => $order->verified_deposits_amount,
            'items' => $order->items,
            'status_history' => $order->statusHistory,
            'shipping_address' => $order->shipping_address,
            'created_at' => $order->created_at,
            'deposits' => $order->deposits,
            'has_deposit' => $order->deposits->isNotEmpty(),
            'deposit' => $order->deposits->last(),
        ]);
    }

    /**
     * Delete an order (soft delete).
     */
    public function destroy(Order $order): JsonResponse
    {
        $order->delete();
        return response()->json(['message' => 'Order deleted successfully.']);
    }
}
