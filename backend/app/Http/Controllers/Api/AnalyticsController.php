<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Deposit;
use App\Models\Product;
use App\Models\Customer;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /**
     * Get dashboard analytics data.
     */
    public function index(Request $request): JsonResponse
    {
        $dateFrom = $request->get('date_from', now()->subDays(30)->toDateString());
        $dateTo = $request->get('date_to', now()->toDateString());

        return response()->json([
            'kpis' => $this->getKpis($dateFrom, $dateTo),
            'orders_by_status' => $this->getOrdersByStatus($dateFrom, $dateTo),
            'orders_over_time' => $this->getOrdersOverTime($dateFrom, $dateTo),
            'revenue_vs_profit' => $this->getRevenueVsProfit($dateFrom, $dateTo),
            'best_selling_products' => $this->getBestSellingProducts($dateFrom, $dateTo),
            'best_categories' => $this->getBestCategories($dateFrom, $dateTo),
        ]);
    }

    private function getKpis(string $from, string $to): array
    {
        $ordersQuery = Order::whereBetween('created_at', [$from, $to . ' 23:59:59']);

        $totalOrders = (clone $ordersQuery)->count();

        $totalRevenue = (clone $ordersQuery)
            ->whereNotIn('status', ['cancelled'])
            ->sum('total');

        $totalCost = (clone $ordersQuery)
            ->whereNotIn('status', ['cancelled'])
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->selectRaw('SUM(products.cost_price * order_items.quantity) as total_cost')
            ->value('total_cost') ?? 0;

        $totalCustomsFees = (clone $ordersQuery)
            ->whereNotIn('status', ['cancelled'])
            ->sum('customs_fee');

        $netProfit = $totalRevenue - $totalCost - $totalCustomsFees;

        $totalDeposits = Deposit::where('status', 'verified')
            ->whereBetween('created_at', [$from, $to . ' 23:59:59'])
            ->sum('amount');

        // Outstanding balances: sum of (total - verified deposits) for non-cancelled orders
        $outstandingBalances = DB::select("
            SELECT COALESCE(SUM(o.total - COALESCE(d.verified_sum, 0)), 0) as outstanding
            FROM orders o
            LEFT JOIN (
                SELECT order_id, SUM(amount) as verified_sum
                FROM deposits
                WHERE status = 'verified'
                GROUP BY order_id
            ) d ON o.id = d.order_id
            WHERE o.status NOT IN ('cancelled', 'delivered')
            AND o.deleted_at IS NULL
            AND o.created_at BETWEEN ? AND ?
        ", [$from, $to . ' 23:59:59']);

        return [
            'total_orders' => $totalOrders,
            'total_revenue' => round((float) $totalRevenue, 2),
            'total_cost' => round((float) $totalCost, 2),
            'net_profit' => round((float) $netProfit, 2),
            'total_customs_fees' => round((float) $totalCustomsFees, 2),
            'total_deposits' => round((float) $totalDeposits, 2),
            'outstanding_balances' => round((float) ($outstandingBalances[0]->outstanding ?? 0), 2),
        ];
    }

    private function getOrdersByStatus(string $from, string $to): array
    {
        return Order::whereBetween('created_at', [$from, $to . ' 23:59:59'])
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();
    }

    private function getOrdersOverTime(string $from, string $to): array
    {
        return Order::whereBetween('created_at', [$from, $to . ' 23:59:59'])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    private function getRevenueVsProfit(string $from, string $to): array
    {
        $data = Order::whereBetween('orders.created_at', [$from, $to . ' 23:59:59'])
            ->whereNotIn('status', ['cancelled'])
            ->select(
                DB::raw('DATE(orders.created_at) as date'),
                DB::raw('SUM(orders.total) as revenue'),
                DB::raw('SUM(orders.total) - COALESCE(SUM(sub.cost), 0) - SUM(orders.customs_fee) as profit')
            )
            ->leftJoinSub(
                OrderItem::select('order_id', DB::raw('SUM(order_items.quantity * products.cost_price) as cost'))
                    ->join('products', 'order_items.product_id', '=', 'products.id')
                    ->groupBy('order_id'),
                'sub',
                'orders.id',
                '=',
                'sub.order_id'
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();

        return $data;
    }

    private function getBestSellingProducts(string $from, string $to): array
    {
        return OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereBetween('orders.created_at', [$from, $to . ' 23:59:59'])
            ->whereNotIn('orders.status', ['cancelled'])
            ->select(
                'order_items.product_id',
                'order_items.product_name',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.line_total) as total_revenue')
            )
            ->groupBy('order_items.product_id', 'order_items.product_name')
            ->orderByDesc('total_sold')
            ->limit(10)
            ->get()
            ->toArray();
    }

    private function getBestCategories(string $from, string $to): array
    {
        return OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->whereBetween('orders.created_at', [$from, $to . ' 23:59:59'])
            ->whereNotIn('orders.status', ['cancelled'])
            ->select(
                'categories.id',
                'categories.name_en',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.line_total) as total_revenue')
            )
            ->groupBy('categories.id', 'categories.name_en')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get()
            ->toArray();
    }
}
