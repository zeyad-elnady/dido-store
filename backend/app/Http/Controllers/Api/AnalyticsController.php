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
        $hasDateFilter = $request->filled('date_from') && $request->filled('date_to');
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');

        return response()->json([
            'kpis' => $this->getKpis($hasDateFilter, $dateFrom, $dateTo),
            'orders_by_status' => $this->getOrdersByStatus($hasDateFilter, $dateFrom, $dateTo),
            'orders_over_time' => $this->getOrdersOverTime($hasDateFilter, $dateFrom, $dateTo),
            'revenue_vs_profit' => $this->getRevenueVsProfit($hasDateFilter, $dateFrom, $dateTo),
            'best_selling_products' => $this->getBestSellingProducts($hasDateFilter, $dateFrom, $dateTo),
            'best_categories' => $this->getBestCategories($hasDateFilter, $dateFrom, $dateTo),
            'acquisition_channels' => $this->getAcquisitionChannels($hasDateFilter, $dateFrom, $dateTo),
        ]);
    }

    private function getKpis(bool $hasDateFilter, ?string $from, ?string $to): array
    {
        $allOrdersQuery = Order::whereNull('orders.deleted_at');
        if ($hasDateFilter) {
            $allOrdersQuery->whereBetween('orders.created_at', [$from, $to . ' 23:59:59']);
        }

        $totalOrders = (clone $allOrdersQuery)->count();

        $validOrdersQuery = (clone $allOrdersQuery)->whereNotIn('orders.status', ['cancelled']);

        $totalRevenue = (float) ((clone $validOrdersQuery)->sum('orders.total') ?? 0);

        // SHEIN procurement cost: order items of non-cancelled orders * product cost_price
        $costQuery = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->whereNotIn('orders.status', ['cancelled'])
            ->whereNull('orders.deleted_at');

        if ($hasDateFilter) {
            $costQuery->whereBetween('orders.created_at', [$from, $to . ' 23:59:59']);
        }

        $totalCost = (float) ($costQuery->sum(DB::raw('COALESCE(products.cost_price, 0) * order_items.quantity')) ?? 0);

        $totalCustomsFees = (float) ((clone $validOrdersQuery)->sum('orders.customs_fee') ?? 0);

        $netProfit = $totalRevenue - $totalCost - $totalCustomsFees;

        $depositsQuery = Deposit::where('deposits.status', 'verified');
        if ($hasDateFilter) {
            $depositsQuery->whereBetween('deposits.created_at', [$from, $to . ' 23:59:59']);
        }
        $totalDeposits = (float) ($depositsQuery->sum('deposits.amount') ?? 0);

        // Outstanding balances: sum of remaining balance for non-cancelled, non-delivered orders
        $ordersForBalance = Order::whereNotIn('orders.status', ['cancelled', 'delivered'])
            ->whereNull('orders.deleted_at')
            ->with(['deposits' => function ($q) {
                $q->where('status', 'verified');
            }]);

        if ($hasDateFilter) {
            $ordersForBalance->whereBetween('orders.created_at', [$from, $to . ' 23:59:59']);
        }

        $outstandingBalances = 0.0;
        foreach ($ordersForBalance->get() as $ord) {
            $verifiedSum = (float) $ord->deposits->sum('amount');
            $outstandingBalances += max(0, (float) $ord->total - $verifiedSum);
        }

        return [
            'total_orders' => $totalOrders,
            'total_revenue' => round($totalRevenue, 2),
            'total_cost' => round($totalCost, 2),
            'net_profit' => round($netProfit, 2),
            'total_customs_fees' => round($totalCustomsFees, 2),
            'total_deposits' => round($totalDeposits, 2),
            'outstanding_balances' => round($outstandingBalances, 2),
        ];
    }

    private function getOrdersByStatus(bool $hasDateFilter, ?string $from, ?string $to): array
    {
        $statusCounts = [
            'pending' => 0,
            'confirmed' => 0,
            'ordered_from_shein' => 0,
            'shipped' => 0,
            'delivered' => 0,
            'cancelled' => 0,
        ];

        $query = Order::whereNull('orders.deleted_at');
        if ($hasDateFilter) {
            $query->whereBetween('orders.created_at', [$from, $to . ' 23:59:59']);
        }

        $dbCounts = $query->select('orders.status', DB::raw('COUNT(*) as count'))
            ->groupBy('orders.status')
            ->pluck('count', 'status')
            ->toArray();

        foreach ($dbCounts as $status => $count) {
            $statusCounts[$status] = (int) $count;
        }

        return $statusCounts;
    }

    private function getOrdersOverTime(bool $hasDateFilter, ?string $from, ?string $to): array
    {
        $query = Order::whereNull('orders.deleted_at');
        if ($hasDateFilter) {
            $query->whereBetween('orders.created_at', [$from, $to . ' 23:59:59']);
        } else {
            $query->where('orders.created_at', '>=', now()->subDays(30)->startOfDay());
        }

        return $query->select(DB::raw('DATE(orders.created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy(DB::raw('DATE(orders.created_at)'))
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    private function getRevenueVsProfit(bool $hasDateFilter, ?string $from, ?string $to): array
    {
        $query = Order::with(['items.product'])
            ->whereNotIn('orders.status', ['cancelled'])
            ->whereNull('orders.deleted_at');

        if ($hasDateFilter) {
            $query->whereBetween('orders.created_at', [$from, $to . ' 23:59:59']);
        } else {
            $query->where('orders.created_at', '>=', now()->subDays(30)->startOfDay());
        }

        $orders = $query->orderBy('orders.created_at')->get();

        $dailyMap = [];
        foreach ($orders as $order) {
            $date = $order->created_at ? $order->created_at->format('Y-m-d') : date('Y-m-d');
            if (!isset($dailyMap[$date])) {
                $dailyMap[$date] = [
                    'revenue' => 0.0,
                    'cost' => 0.0,
                    'customs' => 0.0,
                ];
            }
            $orderCost = 0.0;
            foreach ($order->items as $item) {
                $costPrice = (float) ($item->product?->cost_price ?? 0);
                $orderCost += $costPrice * (int) $item->quantity;
            }
            $dailyMap[$date]['revenue'] += (float) $order->total;
            $dailyMap[$date]['cost'] += $orderCost;
            $dailyMap[$date]['customs'] += (float) $order->customs_fee;
        }

        $result = [];
        foreach ($dailyMap as $date => $vals) {
            $profit = $vals['revenue'] - $vals['cost'] - $vals['customs'];
            $result[] = [
                'date' => $date,
                'revenue' => round($vals['revenue'], 2),
                'profit' => round($profit, 2),
            ];
        }

        return $result;
    }

    private function getBestSellingProducts(bool $hasDateFilter, ?string $from, ?string $to): array
    {
        $query = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereNotIn('orders.status', ['cancelled'])
            ->whereNull('orders.deleted_at');

        if ($hasDateFilter) {
            $query->whereBetween('orders.created_at', [$from, $to . ' 23:59:59']);
        }

        return $query->select(
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

    private function getBestCategories(bool $hasDateFilter, ?string $from, ?string $to): array
    {
        $query = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->whereNotIn('orders.status', ['cancelled'])
            ->whereNull('orders.deleted_at');

        if ($hasDateFilter) {
            $query->whereBetween('orders.created_at', [$from, $to . ' 23:59:59']);
        }

        return $query->select(
                'categories.id',
                'categories.name_en',
                'categories.name_ar',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.line_total) as total_revenue')
            )
            ->groupBy('categories.id', 'categories.name_en', 'categories.name_ar')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get()
            ->toArray();
    }

    private function getAcquisitionChannels(bool $hasDateFilter, ?string $from, ?string $to): array
    {
        $query = Order::join('customers', 'orders.customer_id', '=', 'customers.id')
            ->whereNotIn('orders.status', ['cancelled'])
            ->whereNull('orders.deleted_at');

        if ($hasDateFilter) {
            $query->whereBetween('orders.created_at', [$from, $to . ' 23:59:59']);
        }

        $channels = [
            'instagram' => ['count' => 0, 'revenue' => 0.0],
            'tiktok' => ['count' => 0, 'revenue' => 0.0],
            'whatsapp' => ['count' => 0, 'revenue' => 0.0],
        ];

        $records = $query->select(
                'customers.source_platform',
                DB::raw('COUNT(orders.id) as order_count'),
                DB::raw('SUM(orders.total) as total_revenue')
            )
            ->groupBy('customers.source_platform')
            ->get();

        foreach ($records as $rec) {
            $plat = strtolower(trim((string) $rec->source_platform));
            if (isset($channels[$plat])) {
                $channels[$plat]['count'] = (int) $rec->order_count;
                $channels[$plat]['revenue'] = round((float) $rec->total_revenue, 2);
            }
        }

        return $channels;
    }
}
