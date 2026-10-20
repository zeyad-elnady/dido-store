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
            ['key' => 'instapay_card_number', 'value' => '5484 4602 2730 8764', 'group' => 'payment'],
            ['key' => 'instapay_name', 'value' => 'dalia ghaleb', 'group' => 'payment'],
            ['key' => 'instapay_address', 'value' => '5484 4602 2730 8764', 'group' => 'payment'],
            ['key' => 'vodafone_cash_number', 'value' => '01023402591', 'group' => 'payment'],
            ['key' => 'vodafone_cash_name', 'value' => 'داليا غ*** ع**', 'group' => 'payment'],
            ['key' => 'telda_handle', 'value' => '@daliaghale616990', 'group' => 'payment'],
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
        //
    }
};
