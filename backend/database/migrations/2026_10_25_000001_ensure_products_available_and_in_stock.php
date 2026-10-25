<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Ensure all catalog products remain available for on-demand SHEIN ordering
     * and reset any depleted stock to avoid blocking orders.
     */
    public function up(): void
    {
        if (Schema::hasTable('products')) {
            DB::table('products')->update([
                'is_available' => true,
            ]);

            DB::table('products')->where('stock_quantity', '<=', 0)->update([
                'stock_quantity' => 10,
            ]);
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
