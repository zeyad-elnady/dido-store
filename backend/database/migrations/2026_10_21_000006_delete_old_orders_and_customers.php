<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        // Delete all old orders, deposits, histories, items, and customers
        // Note: In MySQL InnoDB, TRUNCATE fails if referenced by foreign keys; DELETE must be used.
        // Products and categories are strictly preserved and untouched!
        if (Schema::hasTable('customs_fee_history')) {
            DB::table('customs_fee_history')->delete();
        }
        if (Schema::hasTable('customs_fee_histories')) {
            DB::table('customs_fee_histories')->delete();
        }
        if (Schema::hasTable('order_status_history')) {
            DB::table('order_status_history')->delete();
        }
        if (Schema::hasTable('order_status_histories')) {
            DB::table('order_status_histories')->delete();
        }
        if (Schema::hasTable('deposits')) {
            DB::table('deposits')->delete();
        }
        if (Schema::hasTable('order_items')) {
            DB::table('order_items')->delete();
        }
        if (Schema::hasTable('orders')) {
            DB::table('orders')->delete();
        }
        if (Schema::hasTable('customers')) {
            DB::table('customers')->delete();
        }

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
