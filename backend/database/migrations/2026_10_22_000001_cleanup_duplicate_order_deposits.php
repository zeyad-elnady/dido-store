<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Clean up duplicate deposit records for any order that has more than 1 deposit,
     * ensuring customer deposits reflect only the single intended 50% deposit.
     */
    public function up(): void
    {
        if (!Schema::hasTable('deposits')) {
            return;
        }

        // Find all orders that have more than 1 deposit
        $duplicateOrderIds = DB::table('deposits')
            ->select('order_id', DB::raw('count(*) as deposit_count'))
            ->groupBy('order_id')
            ->having('deposit_count', '>', 1)
            ->pluck('order_id');

        foreach ($duplicateOrderIds as $orderId) {
            // Get all deposits for this order, prioritized by: verified first, then by earliest id
            $deposits = DB::table('deposits')
                ->where('order_id', $orderId)
                ->orderByRaw("CASE WHEN status = 'verified' THEN 1 ELSE 2 END")
                ->orderBy('id', 'asc')
                ->get();

            if ($deposits->count() > 1) {
                // Keep the primary one (first in prioritized list)
                $keepId = $deposits->first()->id;

                // Delete all other duplicate deposits
                $deleteIds = $deposits->slice(1)->pluck('id');
                DB::table('deposits')->whereIn('id', $deleteIds)->delete();
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
