import { useState, useEffect } from "react";
import AppShell from "~/components/layout/AppShell";
import { loadSession } from "~/store/erp.store";
import { Plus, Edit2, Trash2, Search, Package, Tags, X } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  price: number;
  cost_price: number;
  description?: string;
  status: string;
  is_available: boolean;
  category_id?: { _id: string; name: string; color?: string };
  preparation_time?: number;
  sku?: string;
}

interface Category {
  _id: string;
  name: string;
  color?: string;
}

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const session = loadSession();

  const [form, setForm] = useState({
    name: "", description: "", price: "", cost_price: "",
    category_id: "", status: "active", preparation_time: "", sku: "",
  });

  const fetchData = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`/api/erp/products?limit=200${selectedCategory !== "all" ? `&category_id=${selectedCategory}` : ""}${search ? `&search=${search}` : ""}`, {
          headers: { Authorization: `Bearer ${session.token}` },
        }),
        fetch("/api/erp/categories", { headers: { Authorization: `Bearer ${session.token}` } }),
      ]);
      const [prodData, catData] = await Promise.all([prodRes.json(), catRes.json()]);
      if (prodData.success) setProducts(prodData.data);
      if (catData.success) setCategories(catData.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedCategory, search]);

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      cost_price: String(p.cost_price),
      category_id: (p.category_id as any)?._id ?? (p.category_id as any) ?? "",
      status: p.status,
      preparation_time: String(p.preparation_time ?? ""),
      sku: p.sku ?? "",
    });
    setShowAddProduct(true);
  };

  const closeModal = () => {
    setShowAddProduct(false);
    setEditProduct(null);
    setForm({ name: "", description: "", price: "", cost_price: "", category_id: "", status: "active", preparation_time: "", sku: "" });
  };

  const handleSave = async () => {
    if (!session || !form.name || !form.price) return;
    setSaving(true);
    try {
      const body = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        cost_price: parseFloat(form.cost_price) || 0,
        category_id: form.category_id || undefined,
        status: form.status,
        is_available: form.status === "active",
        preparation_time: parseInt(form.preparation_time) || 0,
        sku: form.sku || undefined,
      };

      if (editProduct) {
        await fetch(`/api/erp/products/${editProduct._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
          body: JSON.stringify(body),
        });
      } else {
        await fetch("/api/erp/products", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
          body: JSON.stringify(body),
        });
      }
      closeModal();
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!session || !confirm("Delete this product?")) return;
    await fetch(`/api/erp/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.token}` },
    });
    fetchData();
  };

  const handleToggleAvailability = async (p: Product) => {
    if (!session) return;
    await fetch(`/api/erp/products/${p._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
      body: JSON.stringify({ is_available: !p.is_available, status: p.is_available ? "inactive" : "active" }),
    });
    fetchData();
  };

  const margin = (p: Product) => p.price > 0 ? ((p.price - p.cost_price) / p.price * 100).toFixed(0) : "0";

  return (
    <AppShell>
      {/* Add/Edit modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full mx-4 border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">
                {editProduct ? "Edit Product" : "Add Product"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-slate-400 text-xs mb-1.5 block">Product Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Margherita Pizza"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block">Price ($) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block">Cost Price ($)</label>
                  <input
                    type="number"
                    value={form.cost_price}
                    onChange={(e) => setForm((p) => ({ ...p, cost_price: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block">Category</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none"
                  >
                    <option value="">No Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block">Prep Time (min)</label>
                  <input
                    type="number"
                    value={form.preparation_time}
                    onChange={(e) => setForm((p) => ({ ...p, preparation_time: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                    placeholder="15"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block">SKU</label>
                  <input
                    value={form.sku}
                    onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-slate-400 text-xs mb-1.5 block">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 resize-none"
                    rows={2}
                    placeholder="Brief description..."
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={closeModal} className="flex-1 py-3 rounded-xl bg-slate-700 text-slate-300 text-sm font-medium">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name || !form.price}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-bold disabled:opacity-50"
                  style={{ backgroundColor: "#F59E0B" }}
                >
                  {saving ? "Saving..." : editProduct ? "Update" : "Add Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Menu Management</h1>
            <p className="text-slate-400 text-sm">{products.length} products</p>
          </div>
          <button
            onClick={() => { setEditProduct(null); setShowAddProduct(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: "#F59E0B" }}
          >
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              selectedCategory === "all" ? "bg-amber-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => setSelectedCategory(c._id)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors border"
              style={
                selectedCategory === c._id
                  ? { backgroundColor: c.color ?? "#1E3A5F", color: "white", borderColor: c.color ?? "#1E3A5F" }
                  : { backgroundColor: "#1E293B", color: "#94A3B8", borderColor: "#334155" }
              }
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Products table */}
        <div className="rounded-xl border border-slate-700 overflow-hidden" style={{ backgroundColor: "#1E293B" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                {["Product", "Category", "Price", "Cost", "Margin", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-slate-400 font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-700/50">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-700 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <Package size={32} className="mx-auto mb-2 opacity-50" />
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{p.name}</p>
                      {p.description && <p className="text-slate-500 text-xs truncate max-w-xs">{p.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {p.category_id ? (
                        <span
                          className="px-2 py-0.5 rounded-md text-xs font-medium"
                          style={{
                            backgroundColor: `${(p.category_id as any).color ?? "#1E3A5F"}22`,
                            color: (p.category_id as any).color ?? "#60A5FA",
                          }}
                        >
                          {(p.category_id as any).name}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-amber-400 font-bold">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-400">${p.cost_price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className="text-emerald-400 text-xs font-medium">{margin(p)}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleAvailability(p)}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                          p.is_available
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {p.is_available ? "Available" : "Unavailable"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg hover:bg-slate-600 text-slate-400 hover:text-white transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
