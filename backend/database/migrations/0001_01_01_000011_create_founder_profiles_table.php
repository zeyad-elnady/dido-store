<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('founder_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('company_name_en')->default('Dido Store');
            $table->string('company_name_ar')->default('ديدو ستور');
            $table->string('founder_name_en')->default('');
            $table->string('founder_name_ar')->default('');
            $table->text('bio_en')->nullable();
            $table->text('bio_ar')->nullable();
            $table->string('photo_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('founder_profiles');
    }
};
