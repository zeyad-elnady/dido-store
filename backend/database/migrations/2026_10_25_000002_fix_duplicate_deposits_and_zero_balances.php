<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Clean up duplicate deposits for all orders (including DIDO-000020, DIDO-000015, etc.),
     * cap deposits to the single 50% down-payment so remaining due is never zero,
     * and add a unique constraint on order_id to prevent any duplicate deposit submissions.
     */
    public function up(): void
    {
        if (!Schema::hasTable('deposits')) {
            return;
        }

        // 1. Find all orders that have more than 1 deposit
        $ordersWithMultipleDeposits = DB::table('deposits')
            ->select('order_id', DB::raw('count(*) as deposit_count'))
            ->groupBy('order_id')
            ->having('deposit_count', '>', 1)
            ->pluck('order_id');

        foreach ($ordersWithMultipleDeposits as $orderId) {
            $order = DB::table('orders')->where('id', $orderId)->first();
            if (!$order) {
                continue;
            }

            // Get deposits: verified first, then earliest id
            $deposits = DB::table('deposits')
                ->where('order_id', $orderId)
                ->orderByRaw("CASE WHEN status = 'verified' THEN 1 ELSE 2 END")
                ->orderBy('id', 'asc')
                ->get();

            if ($deposits->count() > 1) {
                $keep = $deposits->first();
                $deleteIds = $deposits->slice(1)->pluck('id');

                // Delete duplicate deposits
                DB::table('deposits')->whereIn('id', $deleteIds)->delete();

                // Ensure the single retained deposit amount does not exceed 50% of the total
                $expectedDeposit = round(((float) $order->total) * 0.5, 2);
                if ((float) $keep->amount > $expectedDeposit && $order->status !== 'delivered') {
                    DB::table('deposits')->where('id', $keep->id)->update([
                        'amount' => $expectedDeposit,
                    ]);
                }
            }
        }

        // 2. Also check any single deposit that might be set to 100% of the total for non-delivered orders
        $allOrders = DB::table('orders')
            ->whereNotIn('status', ['delivered', 'cancelled'])
            ->get();

        foreach ($allOrders as $order) {
            $expectedDeposit = round(((float) $order->total) * 0.5, 2);
            $deposit = DB::table('deposits')->where('order_id', $order->id)->first();
            if ($deposit && (float) $deposit->amount >= (float) $order->total && (float) $order->total > 0) {
                DB::table('deposits')->where('id', $deposit->id)->update([
                    'amount' => $expectedDeposit,
                ]);
            }
        }

        // 3. Add unique index on order_id to prevent duplicate deposits at the database engine level
        try {
            Schema::table('deposits', function (Blueprint $table) {
                // Drop existing non-unique index if present, then add unique
                $table->dropIndex(['order_id']);
                $table->unique('order_id', 'deposits_order_id_unique');
            });
        } catch (\Throwable $e) {
            // Index might already exist or driver specific, ignore if already applied
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            Schema::table('deposits', function (Blueprint $table) {
                $table->dropUnique('deposits_order_id_unique');
                $table->index('order_id');
            });
        } catch (\Throwable $e) {
            //
        }
    }
};
