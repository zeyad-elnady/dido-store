<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FounderProfile extends Model
{
    protected $fillable = [
        'company_name_en',
        'company_name_ar',
        'founder_name_en',
        'founder_name_ar',
        'bio_en',
        'bio_ar',
        'photo_path',
    ];
}
