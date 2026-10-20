<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    /**
     * List all categories (admin: all; public: active only).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Category::withCount('products');

        if (!$request->user()) {
            $query->where('is_active', true);
        }

        $categories = $query->orderBy('sort_order')->get();

        return response()->json($categories);
    }

    /**
     * Show a single category.
     */
    public function show(Category $category): JsonResponse
    {
        return response()->json($category->load('products'));
    }

    /**
     * Create a new category (admin only).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name_en']);

        // Ensure unique slug
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (Category::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter++;
        }

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('categories', 'public');
        }

        $category = Category::create($validated);

        return response()->json($category, 201);
    }

    /**
     * Update an existing category (admin only).
     */
    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name_en' => 'sometimes|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if (isset($validated['name_en'])) {
            $slug = Str::slug($validated['name_en']);
            $originalSlug = $slug;
            $counter = 1;
            while (Category::where('slug', $slug)->where('id', '!=', $category->id)->exists()) {
                $slug = $originalSlug . '-' . $counter++;
            }
            $validated['slug'] = $slug;
        }

        if ($request->hasFile('image')) {
            // Delete old image
            if ($category->image_path) {
                Storage::disk('public')->delete($category->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('categories', 'public');
        }

        $category->update($validated);

        return response()->json($category->fresh());
    }

    /**
     * Delete a category (soft delete, admin only).
     */
    public function destroy(Category $category): JsonResponse
    {
        $category->delete();
        return response()->json(['message' => 'Category deleted successfully.']);
    }
}
