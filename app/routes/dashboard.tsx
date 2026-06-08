import { useState, useEffect } from "react";
import { Link } from "react-router";
import AppShell from "~/components/layout/AppShell";
import StatCard from "~/components/ui/StatCard";
import { loadSession } from "~/store/erp.store";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Clock,
  TrendingUp,
  ChefHat,
  ArrowRight,
} from "lucide-react";

interface DashboardData {
  today: { revenue: number; orders: number; avg_order_value: number };
  week: { revenue: number; orders: number };
  month: { revenue: number; orders: number };
  active_orders: number;
  low_stock_count: number;
  top_products: Array<{ product_id: string; name: string; count: number; revenue: number }>;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<ReturnType<typeof loadSession>>(null);

  useEffect(() => {
    const s = loadSession();
    setSession(s);
    if (s) fetchDashboard(s.token);
  }, []);

  const fetchDashboard = async (token: string) => {
    try {
      const res = await fetch("/api/erp/reports/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const role = session?.role ?? "";

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Welcome header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {session?.name?.split(" ")[0] ?? ""}
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Quick actions */}
          {(role === "cashier" || role === "manager" || role === "owner" || role === "waiter") && (
            <Link
              to="/pos"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#F59E0B" }}
            >
              <ShoppingCart size={16} />
              New Order
            </Link>
          )}
        </div>

        {/* Alerts */}
        {data && data.low_stock_count > 0 && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{ backgroundColor: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)" }}
          >
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">
              <strong>{data.low_stock_count}</strong> inventory items are below minimum stock level.{" "}
              <Link to="/inventory" className="underline hover:no-underline">
                View inventory
              </Link>
            </p>
          </div>
        )}

        {/* KPI Stats */}
        {(role === "owner" || role === "manager" || role === "accountant" || role === "super_admin") && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Today's Revenue"
              value={loading ? "..." : formatCurrency(data?.today.revenue ?? 0)}
              icon={<DollarSign size={18} />}
              color="#F59E0B"
              trend="up"
              trendValue="vs yesterday"
            />
            <StatCard
              title="Today's Orders"
              value={loading ? "..." : String(data?.today.orders ?? 0)}
              icon={<ShoppingCart size={18} />}
              color="#1E3A5F"
            />
            <StatCard
              title="Active Orders"
              value={loading ? "..." : String(data?.active_orders ?? 0)}
              icon={<Clock size={18} />}
              color="#10B981"
              subtitle="in kitchen / table"
            />
            <StatCard
              title="Weekly Revenue"
              value={loading ? "..." : formatCurrency(data?.week.revenue ?? 0)}
              icon={<TrendingUp size={18} />}
              color="#8B5CF6"
              subtitle={`${data?.week.orders ?? 0} orders`}
            />
          </div>
        )}

        {/* Cashier view */}
        {role === "cashier" && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Today's Orders"
              value={loading ? "..." : String(data?.today.orders ?? 0)}
              icon={<ShoppingCart size={18} />}
              color="#1E3A5F"
            />
            <StatCard
              title="Active Orders"
              value={loading ? "..." : String(data?.active_orders ?? 0)}
              icon={<Clock size={18} />}
              color="#10B981"
            />
            <StatCard
              title="Today's Revenue"
              value={loading ? "..." : formatCurrency(data?.today.revenue ?? 0)}
              icon={<DollarSign size={18} />}
              color="#F59E0B"
            />
          </div>
        )}

        {/* Kitchen view */}
        {role === "kitchen_staff" && (
          <div className="grid grid-cols-1 gap-4">
            <div
              className="rounded-xl p-6 border border-slate-800 text-center"
              style={{ backgroundColor: "#1E293B" }}
            >
              <ChefHat size={40} className="mx-auto mb-3 text-amber-400" />
              <h2 className="text-xl font-bold text-white mb-2">Kitchen Display</h2>
              <p className="text-slate-400 text-sm mb-4">
                {loading ? "Loading..." : `${data?.active_orders ?? 0} active orders in queue`}
              </p>
              <Link
                to="/kitchen"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "#F59E0B" }}
              >
                Open Kitchen Display <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

        {/* Two column layout for owner/manager */}
        {(role === "owner" || role === "manager") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div
              className="rounded-xl p-5 border border-slate-800"
              style={{ backgroundColor: "#1E293B" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Top Products Today</h3>
                <Link to="/reports" className="text-amber-400 text-xs hover:underline">
                  Full report
                </Link>
              </div>
              {loading ? (
                <p className="text-slate-400 text-sm">Loading...</p>
              ) : !data?.top_products.length ? (
                <p className="text-slate-400 text-sm">No sales yet today</p>
              ) : (
                <div className="space-y-3">
                  {data.top_products.map((p, i) => (
                    <div key={p.product_id} className="flex items-center gap-3">
                      <span
                        className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          backgroundColor: i === 0 ? "#F59E0B22" : "#1E3A5F22",
                          color: i === 0 ? "#F59E0B" : "#60A5FA",
                        }}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{p.name}</p>
                        <p className="text-slate-400 text-xs">{p.count} sold</p>
                      </div>
                      <span className="text-emerald-400 text-sm font-medium">
                        {formatCurrency(p.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Access */}
            <div
              className="rounded-xl p-5 border border-slate-800"
              style={{ backgroundColor: "#1E293B" }}
            >
              <h3 className="text-white font-semibold mb-4">Quick Access</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "New Order", href: "/pos", icon: <ShoppingCart size={20} />, color: "#F59E0B" },
                  { label: "Tables", href: "/tables", icon: <Package size={20} />, color: "#1E3A5F" },
                  { label: "Kitchen", href: "/kitchen", icon: <ChefHat size={20} />, color: "#EF4444" },
                  { label: "Reports", href: "/reports", icon: <TrendingUp size={20} />, color: "#10B981" },
                  { label: "Inventory", href: "/inventory", icon: <Package size={20} />, color: "#8B5CF6" },
                  { label: "Staff", href: "/staff", icon: <Users size={20} />, color: "#F97316" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl border border-slate-700 hover:border-slate-600 transition-all hover:bg-slate-700/50 group"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${item.color}22`, color: item.color }}
                    >
                      {item.icon}
                    </div>
                    <span className="text-white text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
