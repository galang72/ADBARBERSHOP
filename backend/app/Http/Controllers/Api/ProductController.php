<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // Check if user is barber and deny access to modify operations
    private function checkBarberAccess()
    {
        if (auth()->user()?->role === 'barber') {
            return response()->json([
                'message' => 'Akses ditolak. Barber hanya dapat melihat data produk.'
            ], 403);
        }
        return null;
    }

    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->has('low_stock')) {
            $query->whereRaw('stock <= min_stock');
        }

        $products = $query->orderBy('name')
                          ->paginate($request->per_page ?? 10);
        return response()->json($products);
    }

    public function store(Request $request)
    {
        if ($response = $this->checkBarberAccess()) return $response;
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:50|unique:products',
            'description' => 'nullable|string',
            'photo' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'numeric|min:0',
            'stock' => 'integer|min:0',
            'min_stock' => 'integer|min:0',
            'category' => 'string|max:50',
            'unit' => 'string|max:20',
            'status' => 'in:active,inactive',
        ]);

        $product = Product::create($validated);

        return response()->json($product, 201);
    }

    public function show(Product $product)
    {
        return response()->json($product);
    }

    public function update(Request $request, Product $product)
    {
        if ($response = $this->checkBarberAccess()) return $response;
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'sku' => 'nullable|string|max:50|unique:products,sku,' . $product->id,
            'description' => 'nullable|string',
            'photo' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'price' => 'sometimes|numeric|min:0',
            'cost_price' => 'numeric|min:0',
            'stock' => 'integer|min:0',
            'min_stock' => 'integer|min:0',
            'category' => 'string|max:50',
            'unit' => 'string|max:20',
            'status' => 'in:active,inactive',
        ]);

        $product->update($validated);

        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        if ($response = $this->checkBarberAccess()) return $response;
        
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }

    public function getActive()
    {
        $products = Product::where('status', 'active')->orderBy('name')->get();
        return response()->json($products);
    }

    public function updateStock(Request $request, Product $product)
    {
        if ($response = $this->checkBarberAccess()) return $response;
        
        $validated = $request->validate([
            'stock' => 'required|integer|min:0',
        ]);

        $product->update(['stock' => $validated['stock']]);

        return response()->json($product);
    }
}
