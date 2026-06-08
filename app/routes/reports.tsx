import { useState, useEffect } from "react";
import AppShell from "~/components/layout/AppShell";
import { loadSession } from "~/store/erp.store";
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Calendar, Download } from "lucide-react";
import StatCard from "~/components/ui/StatCard";

interface SalesData {
  orders: Array<{
    _id: string;
    order_number: string;
    total_amount: number;
    payment_method: string;
    completed_at: string;
    items: Array<{ product_name: string; quantity: number; total_price: number }>;
  }>;
  summary: {
    total_orders: number;
    total_revenue: number;
    total_tax: number;
    total_discount: number;
    net_revenue: number;
  };
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const session = loadSession();

  const fetchReport = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/erp/reports/sales?period=${period}`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      const json = await res.json();
      if (json.success) setData(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, [period]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const paymentMethodBreakdown = () => {
    if (!data) return {};
    const map: Record<string, number> = {};
    for (const order of data.orders) {
      map[order.payment_method] = (map[order.payment_method] ?? 0) + order.total_amount;
    }
    return map;
  };

  const topProducts = () => {
    if (!data) return [];
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const order of data.orders) {
      for (const item of order.items) {
        if (!map[item.product_name]) map[item.product_name] = { name: item.product_name, qty: 0, revenue: 0 };
        map[item.product_name].qty += item.quantity;
        map[item.product_name].revenue += item.total_price;
      }
    }
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  };

  const pmBreakdown = paymentMethodBreakdown();
  const topProds = topProducts();
  const accentColor = "#F59E0B";

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Sales Reports</h1>
            <p className="text-slate-400 text-sm">Revenue and order analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-sm transition-colors">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* Period tabs */}
        <div className="flex gap-1 bg-slate-800 rounded-xl p-1 w-fit">
          {(["daily", "weekly", "monthly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                period === p ? "bg-slate-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={loading ? "..." : formatCurrency(data?.summary.total_revenue ?? 0)}
            icon={<DollarSign size={18} />}
            color="#F59E0B"
          />
          <StatCard
            title="Total Orders"
            value={loading ? "..." : String(data?.summary.total_orders ?? 0)}
            icon={<ShoppingBag size={18} />}
            color="#1E3A5F"
          />
          <StatCard
            title="Tax Collected"
            value={loading ? "..." : formatCurrency(data?.summary.total_tax ?? 0)}
            icon={<BarChart3 size={18} />}
            color="#8B5CF6"
          />
          <StatCard
            title="Avg Order Value"
            value={loading ? "..." : formatCurrency(
              data && data.summary.total_orders > 0
                ? data.summary.total_revenue / data.summary.total_orders
                : 0
            )}
            icon={<TrendingUp size={18} />}
            color="#10B981"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="rounded-xl border border-slate-700 overflow-hidden" style={{ backgroundColor: "#1E293B" }}>
            <div className="px-5 py-4 border-b border-slate-700">
              <h3 className="text-white font-semibold">Top Products</h3>
            </div>
            <div className="p-5 space-y-3">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-slate-700 rounded-lg animate-pulse" />
                ))
              ) : topProds.length === 0 ? (
                <p className="text-slate-400 text-sm">No sales in this period</p>
              ) : (
                topProds.map((p, i) => {
                  const maxRevenue = topProds[0]?.revenue ?? 1;
                  return (
                    <div key={p.name} className="flex items-center gap-3">
                      <span className="text-slate-500 text-xs w-5 text-center font-bold">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-white text-sm truncate">{p.name}</span>
                          <span className="text-amber-400 text-sm font-bold ml-2">
                            {formatCurrency(p.revenue)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(p.revenue / maxRevenue) * 100}%`,
                              backgroundColor: i === 0 ? accentColor : "#1E3A5F",
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-slate-500 text-xs w-12 text-right">{p.qty} sold</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="rounded-xl border border-slate-700 overflow-hidden" style={{ backgroundColor: "#1E293B" }}>
            <div className="px-5 py-4 border-b border-slate-700">
              <h3 className="text-white font-semibold">Payment Methods</h3>
            </div>
            <div className="p-5 space-y-4">
              {loading ? (
                [...Array(3)].map((_, i) => <div key={i} className="h-8 bg-slate-700 rounded animate-pulse" />)
              ) : Object.keys(pmBreakdown).length === 0 ? (
                <p className="text-slate-400 text-sm">No payments in this period</p>
              ) : (
                Object.entries(pmBreakdown).map(([method, amount]) => {
                  const total = Object.values(pmBreakdown).reduce((s, a) => s + a, 0);
                  const pct = total > 0 ? (amount / total) * 100 : 0;
                  const colors: Record<string, string> = {
                    cash: "#10B981", card: "#3B82F6", mobile_money: "#F59E0B", mixed: "#8B5CF6",
                  };
                  return (
                    <div key={method}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-white text-sm capitalize">{method.replace("_", " ")}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-xs">{pct.toFixed(0)}%</span>
                          <span className="text-amber-400 text-sm font-bold">{formatCurrency(amount)}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: colors[method] ?? accentColor }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-xl border border-slate-700 overflow-hidden" style={{ backgroundColor: "#1E293B" }}>
          <div className="px-5 py-4 border-b border-slate-700">
            <h3 className="text-white font-semibold">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  {["Order #", "Date & Time", "Items", "Payment", "Total"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-slate-400 font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-slate-700/50">
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-4 bg-slate-700 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : !data?.orders.length ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                      No orders in this period
                    </td>
                  </tr>
                ) : (
                  data.orders.slice(0, 20).map((order) => (
                    <tr key={order._id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="px-5 py-3 text-white font-mono text-xs">{order.order_number}</td>
                      <td className="px-5 py-3 text-slate-400 text-xs">
                        {new Date(order.completed_at).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-xs">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs capitalize text-slate-300">
                          {order.payment_method.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-amber-400 font-bold text-sm">
                        {formatCurrency(order.total_amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
