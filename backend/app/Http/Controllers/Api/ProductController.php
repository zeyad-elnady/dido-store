<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * List products with filtering, search, and sort.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'images']);

        // Public: only available products
        if (!$request->user()) {
            $query->where('is_available', true);
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('category_slug')) {
            $query->whereHas('category', fn($q) => $q->where('slug', $request->category_slug));
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name_en', 'like', "%{$search}%")
                  ->orWhere('name_ar', 'like', "%{$search}%")
                  ->orWhere('description_en', 'like', "%{$search}%");
            });
        }

        // Filter featured
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        // Filter discounted (offers)
        if ($request->boolean('offers')) {
            $query->whereNotNull('discount_price')
                  ->whereColumn('discount_price', '<', 'selling_price');
        }

        // Sort
        $sortBy = $request->get('sort', 'created_at');
        $sortDir = $request->get('direction', 'desc');
        $allowedSorts = ['selling_price', 'created_at', 'name_en', 'stock_quantity'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $perPage = min($request->get('per_page', 20), 100);
        $products = $query->paginate($perPage);

        return response()->json($products);
    }

    /**
     * Show a single product by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $product = Product::with(['category', 'images'])
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json($product);
    }

    /**
     * Show a product by ID (admin).
     */
    public function showById(Product $product): JsonResponse
    {
        return response()->json($product->load(['category', 'images']));
    }

    /**
     * Create a product (admin only).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name_en' => 'required|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'description_en' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'selling_price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'cost_price' => 'required|numeric|min:0',
            'sizes' => 'nullable|array',
            'sizes.*' => 'string',
            'colors' => 'nullable|array',
            'colors.*' => 'string',
            'stock_quantity' => 'required|integer|min:0',
            'is_available' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        // Generate slug
        $slug = Str::slug($validated['name_en']);
        $originalSlug = $slug;
        $counter = 1;
        while (Product::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }
        $validated['slug'] = $slug;

        // Auto-mark unavailable if stock is 0
        if ($validated['stock_quantity'] === 0) {
            $validated['is_available'] = false;
        }

        $product = Product::create($validated);

        // Handle image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('products', 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path,
                    'sort_order' => $index,
                    'is_primary' => $index === 0,
                ]);
            }
        }

        return response()->json($product->load(['category', 'images']), 201);
    }

    /**
     * Update a product (admin only).
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name_en' => 'sometimes|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'description_en' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'selling_price' => 'sometimes|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'cost_price' => 'sometimes|numeric|min:0',
            'sizes' => 'nullable|array',
            'sizes.*' => 'string',
            'colors' => 'nullable|array',
            'colors.*' => 'string',
            'stock_quantity' => 'sometimes|integer|min:0',
            'is_available' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        if (isset($validated['name_en'])) {
            $slug = Str::slug($validated['name_en']);
            $originalSlug = $slug;
            $counter = 1;
            while (Product::where('slug', $slug)->where('id', '!=', $product->id)->exists()) {
                $slug = $originalSlug . '-' . $counter++;
            }
            $validated['slug'] = $slug;
        }

        // Auto-mark unavailable if stock is 0
        if (isset($validated['stock_quantity']) && $validated['stock_quantity'] === 0) {
            $validated['is_available'] = false;
        }

        $product->update($validated);

        // Handle new image uploads
        if ($request->hasFile('images')) {
            $maxOrder = $product->images()->max('sort_order') ?? -1;
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('products', 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path,
                    'sort_order' => $maxOrder + $index + 1,
                    'is_primary' => $product->images()->count() === 0 && $index === 0,
                ]);
            }
        }

        return response()->json($product->fresh(['category', 'images']));
    }

    /**
     * Delete a product image (admin only).
     */
    public function deleteImage(ProductImage $productImage): JsonResponse
    {
        Storage::disk('public')->delete($productImage->image_path);
        $productImage->delete();
        return response()->json(['message' => 'Image deleted.']);
    }

    /**
     * Quick update stock quantity (admin inline edit).
     */
    public function updateStock(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'stock_quantity' => 'required|integer|min:0',
        ]);

        $product->stock_quantity = $validated['stock_quantity'];

        if ($product->stock_quantity === 0) {
            $product->is_available = false;
        }

        $product->save();

        return response()->json($product);
    }

    /**
     * Delete a product (soft delete, admin only).
     */
    public function destroy(Product $product): JsonResponse
    {
        $product->delete();
        return response()->json(['message' => 'Product deleted successfully.']);
    }
}
