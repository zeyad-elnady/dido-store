<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\CustomsFeeHistory;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    /**
     * Create a new order with items.
     */
    public function createOrder(array $data, array $items, ?int $userId = null): Order
    {
        return DB::transaction(function () use ($data, $items, $userId) {
            // Calculate subtotal
            $subtotal = 0;
            $orderItems = [];

            foreach ($items as $item) {
                $product = Product::findOrFail($item['product_id']);

                // Validate stock (stock check only, not decrement — that happens on confirm)
                if (!$product->is_available) {
                    throw ValidationException::withMessages([
                        'items' => "Product \"{$product->name_en}\" is currently unavailable.",
                    ]);
                }

                $effectivePrice = $product->effective_price;
                $lineTotal = $effectivePrice * $item['quantity'];
                $subtotal += $lineTotal;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name_en,
                    'unit_price' => $effectivePrice,
                    'quantity' => $item['quantity'],
                    'size' => $item['size'] ?? null,
                    'color' => $item['color'] ?? null,
                    'line_total' => $lineTotal,
                ];
            }

            // Create order
            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'customer_id' => $data['customer_id'],
                'status' => Order::STATUS_PENDING,
                'subtotal' => $subtotal,
                'shipping_fee' => $data['shipping_fee'] ?? 0,
                'customs_fee' => 0,
                'discount_amount' => $data['discount_amount'] ?? 0,
                'total' => $subtotal + ($data['shipping_fee'] ?? 0) - ($data['discount_amount'] ?? 0),
                'shipping_address' => $data['shipping_address'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            // Create order items
            foreach ($orderItems as $item) {
                $order->items()->create($item);
            }

            // Log initial status
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'old_status' => null,
                'new_status' => Order::STATUS_PENDING,
                'changed_by' => $userId,
                'note' => 'Order created.',
                'created_at' => now(),
            ]);

            return $order->load(['items', 'customer']);
        });
    }

    /**
     * Update order status with stock management.
     */
    public function updateStatus(Order $order, string $newStatus, ?int $userId = null, ?string $note = null): Order
    {
        return DB::transaction(function () use ($order, $newStatus, $userId, $note) {
            $oldStatus = $order->status;

            // Validate status
            $this->validateStatusTransition($oldStatus, $newStatus);

            if ($oldStatus === $newStatus) {
                if (!empty($note)) {
                    OrderStatusHistory::create([
                        'order_id' => $order->id,
                        'old_status' => $oldStatus,
                        'new_status' => $newStatus,
                        'changed_by' => $userId,
                        'note' => $note,
                        'created_at' => now(),
                    ]);
                }
                return $order->fresh(['customer', 'items', 'statusHistory']);
            }

            // Handle stock changes on confirm
            if ($newStatus === Order::STATUS_CONFIRMED && $oldStatus === Order::STATUS_PENDING) {
                $this->decrementStock($order);
            }

            // Handle stock restoration on cancel
            if ($newStatus === Order::STATUS_CANCELLED && in_array($oldStatus, [
                Order::STATUS_CONFIRMED,
                Order::STATUS_ORDERED_FROM_SHEIN,
                Order::STATUS_SHIPPED,
            ])) {
                $this->restoreStock($order);
            }

            $order->update(['status' => $newStatus]);

            // Log status change
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'changed_by' => $userId,
                'note' => $note,
                'created_at' => now(),
            ]);

            return $order->fresh(['customer', 'items', 'statusHistory']);
        });
    }

    /**
     * Update customs fee with history logging.
     */
    public function updateCustomsFee(Order $order, float $newAmount, int $userId, ?string $reason = null): Order
    {
        return DB::transaction(function () use ($order, $newAmount, $userId, $reason) {
            // Customs fee can only be edited after confirmation
            if ($order->status === Order::STATUS_PENDING) {
                throw ValidationException::withMessages([
                    'customs_fee' => 'Customs fee can only be added after the order is confirmed.',
                ]);
            }

            $oldAmount = (float) $order->customs_fee;

            // Log the change
            CustomsFeeHistory::create([
                'order_id' => $order->id,
                'old_amount' => $oldAmount,
                'new_amount' => $newAmount,
                'changed_by' => $userId,
                'reason' => $reason,
                'created_at' => now(),
            ]);

            // Update and recalculate
            $order->customs_fee = $newAmount;
            $order->save();
            $order->recalculateTotal();

            return $order->fresh();
        });
    }

    /**
     * Validate allowed status transitions.
     */
    private function validateStatusTransition(string $from, string $to): void
    {
        if (!in_array($to, Order::STATUSES)) {
            throw ValidationException::withMessages([
                'status' => "Invalid status '{$to}'.",
            ]);
        }
    }

    /**
     * Decrement stock for all items in an order (never blocks confirmation for on-demand SHEIN sourcing).
     */
    private function decrementStock(Order $order): void
    {
        foreach ($order->items as $item) {
            $product = $item->product;
            if (!$product) {
                continue;
            }

            if ($product->stock_quantity > 0) {
                $product->stock_quantity = max(0, $product->stock_quantity - $item->quantity);
                $product->save();
            }
        }
    }

    /**
     * Restore stock for all items in a cancelled order.
     */
    private function restoreStock(Order $order): void
    {
        foreach ($order->items as $item) {
            $product = $item->product;
            if (!$product) {
                continue;
            }

            $product->stock_quantity += $item->quantity;
            $product->is_available = true;
            $product->save();
        }
    }

    /**
     * Get contact link for an order's customer.
     */
    public function getContactLink(Order $order): ?array
    {
        if (!$order->canContactCustomer()) {
            return null;
        }

        $customer = $order->customer;
        $message = "مرحباً {$customer->name}! 🛍️\n\nطلبك رقم {$order->order_number} تم شحنه! ✨\n\nشكراً لتسوقك من Dido Store 💕";

        $link = $customer->source_platform === 'whatsapp'
            ? $customer->getContactLinkWithMessage($message)
            : $customer->contact_link;

        return [
            'platform' => $customer->source_platform,
            'link' => $link,
            'customer_name' => $customer->name,
        ];
    }
}
