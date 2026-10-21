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
        // Products and categories are strictly preserved and untouched!
        if (Schema::hasTable('customs_fee_history')) {
            DB::table('customs_fee_history')->truncate();
        }
        if (Schema::hasTable('customs_fee_histories')) {
            DB::table('customs_fee_histories')->truncate();
        }
        if (Schema::hasTable('order_status_history')) {
            DB::table('order_status_history')->truncate();
        }
        if (Schema::hasTable('order_status_histories')) {
            DB::table('order_status_histories')->truncate();
        }
        if (Schema::hasTable('deposits')) {
            DB::table('deposits')->truncate();
        }
        if (Schema::hasTable('order_items')) {
            DB::table('order_items')->truncate();
        }
        if (Schema::hasTable('orders')) {
            DB::table('orders')->truncate();
        }
        if (Schema::hasTable('customers')) {
            DB::table('customers')->truncate();
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
