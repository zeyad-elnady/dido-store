<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\FounderProfile;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $bio_en = "Dalia is the owner of Dido Store Egypt. She personally handpicks every authentic SHEIN piece with a refined eye for contemporary fashion, making international chic accessible to women across Egypt with transparent pricing and doorstep delivery.";
        $bio_ar = "داليا هي صاحبة متجر ديدو ستور والرؤية العصرية وراء كل قطعة. تختار بنفسها أرقى تصاميم شي إن الأصلية لتمنحكِ تجربة تسوق مريحة وأنيقة، مع دفع محلي سهل وتوصيل سريع لباب منزلكِ في جميع أنحاء مصر.";

        $founder = FounderProfile::first();
        if ($founder) {
            $founder->update([
                'bio_en' => $bio_en,
                'bio_ar' => $bio_ar,
            ]);
        } else {
            FounderProfile::create([
                'company_name_en' => 'Dido Store Egypt',
                'company_name_ar' => 'متجر ديدو مصر',
                'founder_name_en' => 'Dalia (Dido)',
                'founder_name_ar' => 'داليا (ديدو)',
                'bio_en' => $bio_en,
                'bio_ar' => $bio_ar,
                'photo_path' => '/dalia-founder.jpg',
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
