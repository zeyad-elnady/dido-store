<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Setting;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $settings = [
            ['key' => 'whatsapp_number', 'value' => '201023402591', 'group' => 'contact'],
            ['key' => 'phone_number', 'value' => '01023402591', 'group' => 'contact'],
            ['key' => 'instagram_url', 'value' => 'https://www.instagram.com/bydido.studio?dlrf=ZmMyeW41cHBvd3Y5', 'group' => 'contact'],
            ['key' => 'tiktok_url', 'value' => 'https://www.tiktok.com/@didos.studio?_r=1&_t=ZS-9Aim7g6jSsB', 'group' => 'contact'],
            ['key' => 'vodafone_cash_number', 'value' => '01023402591', 'group' => 'payment'],
        ];

        foreach ($settings as $s) {
            Setting::updateOrCreate(
                ['key' => $s['key']],
                ['value' => $s['value'], 'group' => $s['group']]
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No rollback needed
    }
};
