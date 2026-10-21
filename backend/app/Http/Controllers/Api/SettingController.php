<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\FounderProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    /**
     * Get all public settings (contact, payment, social).
     */
    public function publicSettings(): JsonResponse
    {
        $settings = [
            'contact' => Setting::getGroup('contact'),
            'payment' => Setting::getGroup('payment'),
            'social' => Setting::getGroup('social'),
        ];

        return response()->json($settings);
    }

    /**
     * Get all settings (admin).
     */
    public function index(): JsonResponse
    {
        $settings = Setting::all()->groupBy('group');
        return response()->json($settings);
    }

    /**
     * Update settings (admin).
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable|string',
            'settings.*.group' => 'nullable|string',
        ]);

        foreach ($validated['settings'] as $item) {
            Setting::setValue(
                $item['key'],
                $item['value'],
                $item['group'] ?? 'general'
            );
        }

        return response()->json(['message' => 'Settings updated successfully.']);
    }

    /**
     * Get founder profile.
     */
    public function getFounder(): JsonResponse
    {
        $founder = FounderProfile::first();
        return response()->json($founder);
    }

    /**
     * Update founder profile (admin).
     */
    public function updateFounder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_name_en' => 'sometimes|string|max:255',
            'company_name_ar' => 'sometimes|string|max:255',
            'founder_name_en' => 'sometimes|string|max:255',
            'founder_name_ar' => 'sometimes|string|max:255',
            'bio_en' => 'nullable|string',
            'bio_ar' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp,gif|max:10240',
            'photo_path' => 'nullable|string|max:1000',
        ]);

        $founder = FounderProfile::first();
        if (!$founder) {
            $founder = new FounderProfile();
        }

        if ($request->hasFile('photo')) {
            if ($founder->photo_path) {
                Storage::disk('public')->delete($founder->photo_path);
            }
            $validated['photo_path'] = $request->file('photo')->store('founder', 'public');
        }

        unset($validated['photo']);
        $founder->fill($validated);
        $founder->save();

        return response()->json($founder);
    }

    /**
     * Get homepage banners.
     */
    public function getBanners(): JsonResponse
    {
        $banners = Setting::where('group', 'banners')->get();
        return response()->json($banners);
    }

    /**
     * Update/create homepage banners.
     */
    public function updateBanners(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'banners' => 'nullable|array',
            'banners.*.title_en' => 'nullable|string',
            'banners.*.title_ar' => 'nullable|string',
            'banners.*.subtitle_en' => 'nullable|string',
            'banners.*.subtitle_ar' => 'nullable|string',
            'banners.*.link' => 'nullable|string',
            'banner_images' => 'nullable|array',
            'banner_images.*' => 'image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        // Store banner data as JSON in settings
        $bannersData = $validated['banners'] ?? [];

        if ($request->hasFile('banner_images')) {
            foreach ($request->file('banner_images') as $index => $image) {
                $path = $image->store('banners', 'public');
                if (isset($bannersData[$index])) {
                    $bannersData[$index]['image_path'] = $path;
                }
            }
        }

        Setting::setValue('homepage_banners', json_encode($bannersData), 'banners');

        return response()->json(['message' => 'Banners updated.', 'banners' => $bannersData]);
    }
}
