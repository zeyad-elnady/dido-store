<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * List customers with search.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Customer::withCount('orders');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('whatsapp_number', 'like', "%{$search}%")
                  ->orWhere('instagram_username', 'like', "%{$search}%")
                  ->orWhere('tiktok_username', 'like', "%{$search}%");
            });
        }

        if ($request->has('source_platform')) {
            $query->where('source_platform', $request->source_platform);
        }

        $customers = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($customers);
    }

    /**
     * Show a single customer with orders.
     */
    public function show(Customer $customer): JsonResponse
    {
        $customer->load(['orders' => function ($q) {
            $q->orderBy('created_at', 'desc');
        }, 'orders.items', 'deposits']);

        $customer->loadCount('orders');

        return response()->json($customer);
    }

    /**
     * Create a new customer.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'whatsapp_number' => 'nullable|string|max:20',
            'tiktok_username' => 'nullable|string|max:100',
            'instagram_username' => 'nullable|string|max:100',
            'source_platform' => 'required|in:whatsapp,tiktok,instagram',
        ]);

        // Validate source-specific contact channel
        $this->validateSourceContact($validated);

        $customer = Customer::create($validated);

        return response()->json($customer, 201);
    }

    /**
     * Update a customer.
     */
    public function update(Request $request, Customer $customer): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'whatsapp_number' => 'nullable|string|max:20',
            'tiktok_username' => 'nullable|string|max:100',
            'instagram_username' => 'nullable|string|max:100',
            'source_platform' => 'sometimes|in:whatsapp,tiktok,instagram',
        ]);

        if (isset($validated['source_platform'])) {
            $merged = array_merge($customer->toArray(), $validated);
            $this->validateSourceContact($merged);
        }

        $customer->update($validated);

        return response()->json($customer->fresh());
    }

    /**
     * Delete a customer (soft delete).
     */
    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();
        return response()->json(['message' => 'Customer deleted successfully.']);
    }

    /**
     * Validate that the customer has the required contact for their source platform.
     */
    private function validateSourceContact(array $data): void
    {
        $platform = $data['source_platform'];
        $fieldMap = [
            'whatsapp' => 'whatsapp_number',
            'tiktok' => 'tiktok_username',
            'instagram' => 'instagram_username',
        ];

        $requiredField = $fieldMap[$platform] ?? null;

        if ($requiredField && empty($data[$requiredField])) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                $requiredField => "The {$requiredField} is required when the source platform is {$platform}.",
            ]);
        }
    }
}
