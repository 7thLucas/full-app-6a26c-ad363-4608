import { useState, useEffect } from "react";
import AppShell from "~/components/layout/AppShell";
import { loadSession } from "~/store/erp.store";
import { AlertTriangle, Package, Plus, Edit2, TrendingUp, TrendingDown, Search } from "lucide-react";

interface InventoryItem {
  _id: string;
  name: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  unit: string;
  cost_per_unit: number;
  category?: string;
  supplier_name?: string;
  is_active: boolean;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState<InventoryItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustType, setAdjustType] = useState("adjustment");
  const [adjustNotes, setAdjustNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const session = loadSession();

  const [newItem, setNewItem] = useState({
    name: "", unit: "units", current_stock: "", minimum_stock: "", cost_per_unit: "", category: "",
  });

  const fetchItems = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (showLowStock) params.set("low_stock", "true");
      if (search) params.set("search", search);
      const res = await fetch(`/api/erp/inventory?${params}`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      const data = await res.json();
      if (data.success) setItems(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [showLowStock, search]);

  const lowStockCount = items.filter((i) => i.current_stock <= i.minimum_stock).length;

  const handleAdjust = async () => {
    if (!session || !showAdjustModal) return;
    setSaving(true);
    try {
      await fetch(`/api/erp/inventory/${showAdjustModal._id}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({
          quantity: parseFloat(adjustQty),
          movement_type: adjustType,
          notes: adjustNotes,
        }),
      });
      setShowAdjustModal(null);
      setAdjustQty("");
      setAdjustNotes("");
      fetchItems();
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = async () => {
    if (!session) return;
    setSaving(true);
    try {
      await fetch("/api/erp/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({
          name: newItem.name,
          unit: newItem.unit,
          current_stock: parseFloat(newItem.current_stock) || 0,
          minimum_stock: parseFloat(newItem.minimum_stock) || 0,
          cost_per_unit: parseFloat(newItem.cost_per_unit) || 0,
          category: newItem.category,
        }),
      });
      setShowAddModal(false);
      setNewItem({ name: "", unit: "units", current_stock: "", minimum_stock: "", cost_per_unit: "", category: "" });
      fetchItems();
    } finally {
      setSaving(false);
    }
  };

  const stockLevel = (item: InventoryItem) => {
    if (item.current_stock <= 0) return "out";
    if (item.current_stock <= item.minimum_stock) return "low";
    if (item.maximum_stock && item.current_stock >= item.maximum_stock * 0.9) return "high";
    return "normal";
  };

  const stockBadge = (item: InventoryItem) => {
    const level = stockLevel(item);
    const map = {
      out: { bg: "bg-red-500/20", text: "text-red-400", label: "Out of Stock" },
      low: { bg: "bg-amber-500/20", text: "text-amber-400", label: "Low Stock" },
      high: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Overstocked" },
      normal: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "In Stock" },
    };
    return map[level];
  };

  return (
    <AppShell>
      {/* Adjust modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full mx-4 border border-slate-700">
            <h3 className="text-white font-bold mb-4">Adjust Stock — {showAdjustModal.name}</h3>
            <p className="text-slate-400 text-sm mb-4">
              Current stock: <strong className="text-white">{showAdjustModal.current_stock} {showAdjustModal.unit}</strong>
            </p>
            <select
              value={adjustType}
              onChange={(e) => setAdjustType(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm mb-3 focus:outline-none"
            >
              <option value="purchase">Purchase (add stock)</option>
              <option value="adjustment">Manual Adjustment</option>
              <option value="wastage">Wastage (remove)</option>
              <option value="transfer">Transfer</option>
            </select>
            <input
              type="number"
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              placeholder="Quantity (negative to reduce)"
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm mb-3 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              value={adjustNotes}
              onChange={(e) => setAdjustNotes(e.target.value)}
              placeholder="Notes (optional)"
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm mb-4 focus:outline-none focus:border-amber-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowAdjustModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-700 text-slate-300 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjust}
                disabled={saving || !adjustQty}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: "#F59E0B" }}
              >
                {saving ? "Saving..." : "Apply"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add item modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full mx-4 border border-slate-700">
            <h3 className="text-white font-bold mb-4">Add Inventory Item</h3>
            {[
              { field: "name", label: "Name", type: "text", placeholder: "Item name" },
              { field: "category", label: "Category", type: "text", placeholder: "e.g. Produce, Dairy" },
              { field: "current_stock", label: "Current Stock", type: "number", placeholder: "0" },
              { field: "minimum_stock", label: "Minimum Stock", type: "number", placeholder: "0" },
              { field: "cost_per_unit", label: "Cost per Unit ($)", type: "number", placeholder: "0.00" },
            ].map(({ field, label, type, placeholder }) => (
              <div key={field} className="mb-3">
                <label className="text-slate-400 text-xs mb-1 block">{label}</label>
                <input
                  type={type}
                  value={(newItem as any)[field]}
                  onChange={(e) => setNewItem((p) => ({ ...p, [field]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            ))}
            <div className="mb-4">
              <label className="text-slate-400 text-xs mb-1 block">Unit</label>
              <select
                value={newItem.unit}
                onChange={(e) => setNewItem((p) => ({ ...p, unit: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none"
              >
                {["units", "pieces", "portions", "kg", "g", "l", "ml"].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-700 text-slate-300 text-sm">Cancel</button>
              <button
                onClick={handleAddItem}
                disabled={saving || !newItem.name}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: "#F59E0B" }}
              >
                {saving ? "Saving..." : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Inventory</h1>
            <p className="text-slate-400 text-sm">{items.length} items tracked</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: "#F59E0B" }}
          >
            <Plus size={16} /> Add Item
          </button>
        </div>

        {/* Alerts */}
        {lowStockCount > 0 && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer"
            style={{ backgroundColor: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)" }}
            onClick={() => setShowLowStock(!showLowStock)}
          >
            <AlertTriangle size={18} className="text-red-400" />
            <span className="text-red-300 text-sm">
              <strong>{lowStockCount}</strong> items below minimum stock level. Click to {showLowStock ? "show all" : "view only"}
            </span>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            onClick={() => setShowLowStock(!showLowStock)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
              showLowStock
                ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            Low Stock Only
          </button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-slate-700 overflow-hidden" style={{ backgroundColor: "#1E293B" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left">
                {["Item", "Stock", "Unit", "Min. Level", "Cost/Unit", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-slate-400 font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-700/50">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-700 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No inventory items found
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const badge = stockBadge(item);
                  const pct = item.maximum_stock ? (item.current_stock / item.maximum_stock) * 100 : (item.current_stock / Math.max(item.minimum_stock * 2, 1)) * 100;
                  return (
                    <tr key={item._id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{item.name}</p>
                        {item.category && <p className="text-slate-500 text-xs">{item.category}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white font-bold">{item.current_stock}</p>
                          <div className="w-16 h-1.5 bg-slate-600 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, pct)}%`,
                                backgroundColor: item.current_stock <= item.minimum_stock ? "#EF4444" : "#10B981",
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{item.unit}</td>
                      <td className="px-4 py-3 text-slate-400">{item.minimum_stock}</td>
                      <td className="px-4 py-3 text-slate-400">${item.cost_per_unit.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setShowAdjustModal(item)}
                          className="p-1.5 rounded-lg hover:bg-slate-600 text-slate-400 hover:text-white transition-colors"
                          title="Adjust stock"
                        >
                          <Edit2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
