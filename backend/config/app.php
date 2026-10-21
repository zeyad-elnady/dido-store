<?php

return [

    'name' => env('APP_NAME', 'Dido Store'),

    'env' => env('APP_ENV', 'production'),

    'debug' => (bool) env('APP_DEBUG', false),

    'url' => env('APP_URL', 'http://localhost:8000'),

    'timezone' => env('APP_TIMEZONE', 'Africa/Cairo'),

    'locale' => env('APP_LOCALE', 'en'),

    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),

    'faker_locale' => env('APP_FAKER_LOCALE', 'en_US'),

    'cipher' => 'AES-256-CBC',

    'key' => env('APP_KEY', 'base64:h/RxCGwLXvukSo/FMxv20ezJfvCOVHb24cWLItvauYk='),

    'maintenance' => [
        'driver' => 'file',
    ],

];
