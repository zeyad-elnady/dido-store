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
        DB::table('customs_fee_histories')->truncate();
        DB::table('order_status_histories')->truncate();
        DB::table('deposits')->truncate();
        DB::table('order_items')->truncate();
        DB::table('orders')->truncate();
        DB::table('customers')->truncate();

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
