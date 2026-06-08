import { useState, useEffect, useRef } from "react";
import AppShell from "~/components/layout/AppShell";
import { loadSession } from "~/store/erp.store";
import { Clock, ChefHat, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface OrderItem {
  product_name: string;
  quantity: number;
  notes?: string;
  kitchen_status: string;
  modifiers?: Array<{ group_name: string; modifier_name: string }>;
}

interface KitchenOrder {
  _id: string;
  order_number: string;
  table_number?: string;
  order_type: string;
  status: string;
  items: OrderItem[];
  createdAt: string;
}

function getElapsedMinutes(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
}

function OrderCard({ order, onStatusUpdate }: { order: KitchenOrder; onStatusUpdate: () => void }) {
  const [updating, setUpdating] = useState(false);
  const elapsed = getElapsedMinutes(order.createdAt);
  const session = loadSession();

  const statusColor = () => {
    if (elapsed > 20) return "#EF4444"; // red - overdue
    if (order.status === "preparing") return "#F59E0B"; // amber - preparing
    return "#3B82F6"; // blue - pending
  };

  const nextStatus = order.status === "pending" ? "preparing" : "ready";
  const nextLabel = order.status === "pending" ? "Start Preparing" : "Mark Ready";

  const handleUpdate = async () => {
    if (!session || updating) return;
    setUpdating(true);
    try {
      await fetch(`/api/erp/orders/${order._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ status: nextStatus }),
      });
      onStatusUpdate();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className="rounded-xl overflow-hidden border-l-4 shadow-lg"
      style={{
        backgroundColor: "#1E293B",
        borderLeftColor: statusColor(),
        border: "1px solid #334155",
        borderLeft: `4px solid ${statusColor()}`,
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: "#0F172A" }}>
        <div>
          <h3 className="text-white font-bold text-lg">#{order.order_number}</h3>
          <p className="text-slate-400 text-xs">
            {order.table_number ? `Table ${order.table_number}` : "Takeaway"} · {order.order_type.replace("_", " ")}
          </p>
        </div>
        <div className="text-right">
          <div className={`flex items-center gap-1.5 text-sm font-bold ${elapsed > 20 ? "text-red-400" : elapsed > 10 ? "text-amber-400" : "text-emerald-400"}`}>
            <Clock size={14} />
            {elapsed}m
          </div>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: `${statusColor()}22`,
              color: statusColor(),
            }}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="px-4 py-3 space-y-3">
        {order.items.map((item, i) => (
          <div key={i} className="flex gap-3">
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 text-white"
              style={{ backgroundColor: "#334155" }}
            >
              {item.quantity}
            </span>
            <div>
              <p className="text-white font-semibold text-sm">{item.product_name}</p>
              {item.notes && (
                <p className="text-amber-300 text-xs mt-0.5">Note: {item.notes}</p>
              )}
              {item.modifiers?.map((m, mi) => (
                <p key={mi} className="text-slate-400 text-xs">+ {m.modifier_name}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Action */}
      <div className="px-4 pb-4">
        <button
          onClick={handleUpdate}
          disabled={updating || order.status === "ready"}
          className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
          style={{
            backgroundColor:
              order.status === "ready" ? "#10B981" : statusColor(),
          }}
        >
          {updating ? "Updating..." : order.status === "ready" ? "Ready ✓" : nextLabel}
        </button>
      </div>
    </div>
  );
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const session = loadSession();

  const fetchOrders = async () => {
    if (!session) return;
    try {
      const res = await fetch("/api/erp/orders/kitchen", {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchOrders, 10000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh]);

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const preparingOrders = orders.filter((o) => o.status === "preparing");

  return (
    <AppShell>
      {/* KDS Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ChefHat size={24} className="text-amber-400" />
          <div>
            <h1 className="text-xl font-bold text-white">Kitchen Display</h1>
            <p className="text-slate-400 text-sm">
              {pendingOrders.length} pending · {preparingOrders.length} preparing
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              autoRefresh
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
            {autoRefresh ? "Live" : "Paused"}
          </button>
          <button
            onClick={fetchOrders}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <CheckCircle size={48} className="mx-auto mb-3 text-emerald-400 opacity-70" />
          <h2 className="text-xl font-bold text-white mb-2">All caught up!</h2>
          <p className="text-slate-400">No active orders in the kitchen</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} onStatusUpdate={fetchOrders} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
