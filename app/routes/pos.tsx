import { useState, useEffect, useCallback } from "react";
import AppShell from "~/components/layout/AppShell";
import { loadSession } from "~/store/erp.store";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  ShoppingCart,
  ChevronDown,
  X,
  Check,
  Printer,
  RefreshCw,
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  price: number;
  image_url?: string;
  category_id?: { name: string; color?: string };
  description?: string;
  preparation_time?: number;
}

interface Category {
  _id: string;
  name: string;
  color?: string;
}

interface CartItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

type PaymentMethod = "cash" | "card" | "mobile_money";

export default function POSPage() {
  const [session, setSession] = useState<ReturnType<typeof loadSession>>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<{ order_number: string; change: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | undefined>(undefined);
  const [tables, setTables] = useState<Array<{ _id: string; number: string; status: string }>>([]);

  useEffect(() => {
    const s = loadSession();
    setSession(s);
    if (s) {
      fetchProducts(s.token);
      fetchCategories(s.token);
      fetchTables(s.token);
    }
  }, []);

  const fetchProducts = async (token: string, categoryId?: string, q?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (categoryId && categoryId !== "all") params.set("category_id", categoryId);
      if (q) params.set("search", q);
      const res = await fetch(`/api/erp/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (token: string) => {
    const res = await fetch("/api/erp/categories", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setCategories(data.data);
  };

  const fetchTables = async (token: string) => {
    const res = await fetch("/api/erp/tables", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setTables(data.data.filter((t: any) => t.status === "available"));
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    if (session) fetchProducts(session.token, catId, search);
  };

  const handleSearch = (q: string) => {
    setSearch(q);
    if (session) fetchProducts(session.token, selectedCategory, q);
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === product._id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === product._id
            ? { ...i, quantity: i.quantity + 1, total_price: (i.quantity + 1) * i.unit_price }
            : i
        );
      }
      return [
        ...prev,
        {
          product_id: product._id,
          product_name: product.name,
          quantity: 1,
          unit_price: product.price,
          total_price: product.price,
        },
      ];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product_id === productId
            ? { ...i, quantity: i.quantity + delta, total_price: (i.quantity + delta) * i.unit_price }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product_id !== productId));
  };

  const subtotal = cart.reduce((s, i) => s + i.total_price, 0);
  const taxAmount = Math.round(subtotal * 0.1 * 100) / 100;
  const total = subtotal + taxAmount;
  const change = paymentMethod === "cash" ? Math.max(0, parseFloat(cashReceived || "0") - total) : 0;

  const handleCheckout = async () => {
    if (!session || cart.length === 0) return;
    setProcessing(true);
    try {
      // Create order
      const orderRes = await fetch("/api/erp/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({
          table_id: selectedTable,
          order_type: selectedTable ? "dine_in" : "takeaway",
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.error);

      // Add items
      await fetch(`/api/erp/orders/${orderData.data._id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ items: cart }),
      });

      // Process payment
      const payments: Array<{ method: string; amount: number }> = [
        { method: paymentMethod, amount: paymentMethod === "cash" ? parseFloat(cashReceived || "0") : total },
      ];

      const payRes = await fetch(`/api/erp/orders/${orderData.data._id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ payments }),
      });
      const payData = await payRes.json();
      if (!payData.success) throw new Error(payData.error);

      setOrderSuccess({
        order_number: orderData.data.order_number,
        change: payData.data.change_amount,
      });
      setCart([]);
      setShowPayment(false);
      setCashReceived("");
      if (session) fetchTables(session.token);
    } catch (err: any) {
      alert(err.message ?? "Error processing order");
    } finally {
      setProcessing(false);
    }
  };

  const CATEGORY_COLOR = "#F59E0B";

  return (
    <AppShell>
      {/* Order success overlay */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div
            className="bg-slate-800 rounded-2xl p-8 text-center max-w-sm w-full mx-4 shadow-2xl border border-slate-700"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Order Complete!</h2>
            <p className="text-slate-400 text-sm mb-4">Order #{orderSuccess.order_number}</p>
            {orderSuccess.change > 0 && (
              <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl px-4 py-3 mb-4">
                <p className="text-amber-400 font-bold text-2xl">
                  ${orderSuccess.change.toFixed(2)}
                </p>
                <p className="text-amber-300 text-sm">Change due</p>
              </div>
            )}
            <div className="flex gap-2">
              <button
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-600 transition-colors"
              >
                <Printer size={16} /> Print Receipt
              </button>
              <button
                onClick={() => setOrderSuccess(null)}
                className="flex-1 py-3 rounded-xl text-white font-medium text-sm transition-colors"
                style={{ backgroundColor: "#F59E0B" }}
              >
                New Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment modal */}
      {showPayment && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Process Payment</h2>
              <button onClick={() => setShowPayment(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tax (10%)</span>
                <span className="text-white">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-600 pt-2">
                <span className="text-white">Total</span>
                <span className="text-amber-400 text-xl">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment method */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { method: "cash" as PaymentMethod, icon: <Banknote size={20} />, label: "Cash" },
                { method: "card" as PaymentMethod, icon: <CreditCard size={20} />, label: "Card" },
                { method: "mobile_money" as PaymentMethod, icon: <Smartphone size={20} />, label: "Mobile" },
              ].map(({ method, icon, label }) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                    paymentMethod === method
                      ? "border-amber-500 bg-amber-500/20 text-amber-400"
                      : "border-slate-600 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  {icon}
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>

            {/* Cash received */}
            {paymentMethod === "cash" && (
              <div className="mb-4">
                <label className="text-slate-400 text-sm mb-1.5 block">Cash Received</label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder={`Min: $${total.toFixed(2)}`}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-lg font-mono focus:outline-none focus:border-amber-500"
                />
                {cashReceived && parseFloat(cashReceived) >= total && (
                  <p className="text-emerald-400 text-sm mt-1.5 font-medium">
                    Change: ${change.toFixed(2)}
                  </p>
                )}
              </div>
            )}

            {/* Quick cash buttons */}
            {paymentMethod === "cash" && (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[Math.ceil(total / 5) * 5, Math.ceil(total / 10) * 10, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setCashReceived(String(amt))}
                    className="py-2 text-sm rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={processing || (paymentMethod === "cash" && parseFloat(cashReceived || "0") < total)}
              className="w-full py-3.5 rounded-xl text-white font-bold text-base transition-all disabled:opacity-50"
              style={{ backgroundColor: "#F59E0B" }}
            >
              {processing ? "Processing..." : `Confirm Payment — $${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      )}

      <div className="flex h-full gap-4" style={{ height: "calc(100vh - 96px)" }}>
        {/* Left: Product grid */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Search + filter bar */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => handleCategoryChange("all")}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "all"
                  ? "text-white"
                  : "text-slate-400 bg-slate-800 hover:text-white hover:bg-slate-700"
              }`}
              style={selectedCategory === "all" ? { backgroundColor: CATEGORY_COLOR } : {}}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategoryChange(cat._id)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === cat._id
                    ? "text-white"
                    : "text-slate-400 bg-slate-800 hover:text-white hover:bg-slate-700"
                }`}
                style={
                  selectedCategory === cat._id
                    ? { backgroundColor: cat.color ?? CATEGORY_COLOR }
                    : {}
                }
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] rounded-xl bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center text-slate-400 py-12">
                <Package size={40} className="mx-auto mb-3 opacity-50" />
                <p>No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {products.map((product) => {
                  const cartItem = cart.find((i) => i.product_id === product._id);
                  return (
                    <button
                      key={product._id}
                      onClick={() => addToCart(product)}
                      className="relative flex flex-col rounded-xl overflow-hidden border border-slate-700 hover:border-amber-500/50 transition-all group active:scale-95 text-left"
                      style={{ backgroundColor: "#1E293B" }}
                    >
                      {/* Product image or color block */}
                      <div
                        className="w-full aspect-square flex items-center justify-center text-3xl font-bold text-white/30"
                        style={{
                          backgroundColor: product.category_id?.color
                            ? `${product.category_id.color}33`
                            : "#334155",
                        }}
                      >
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          product.name.charAt(0)
                        )}
                      </div>

                      {/* Cart quantity badge */}
                      {cartItem && (
                        <span
                          className="absolute top-2 right-2 w-6 h-6 rounded-full text-xs font-bold text-white flex items-center justify-center"
                          style={{ backgroundColor: "#F59E0B" }}
                        >
                          {cartItem.quantity}
                        </span>
                      )}

                      <div className="p-2.5">
                        <p className="text-white text-xs font-medium leading-tight line-clamp-2 mb-1">
                          {product.name}
                        </p>
                        <p className="text-amber-400 text-sm font-bold">${product.price.toFixed(2)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Cart */}
        <div
          className="w-72 flex-shrink-0 flex flex-col rounded-xl border border-slate-700 overflow-hidden"
          style={{ backgroundColor: "#1E293B" }}
        >
          {/* Cart header */}
          <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-amber-400" />
              <span className="text-white font-semibold text-sm">Cart</span>
              {cart.length > 0 && (
                <span
                  className="w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
                  style={{ backgroundColor: "#F59E0B" }}
                >
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Table selector */}
              <select
                value={selectedTable ?? ""}
                onChange={(e) => setSelectedTable(e.target.value || undefined)}
                className="text-xs bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-slate-300 focus:outline-none"
              >
                <option value="">Takeaway</option>
                {tables.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.number}
                  </option>
                ))}
              </select>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
            {cart.length === 0 ? (
              <div className="text-center text-slate-500 py-8 text-sm">
                <ShoppingCart size={24} className="mx-auto mb-2 opacity-50" />
                Add items to cart
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{item.product_name}</p>
                    <p className="text-slate-400 text-xs">${item.unit_price.toFixed(2)} ea</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item.product_id, -1)}
                      className="w-6 h-6 rounded-md bg-slate-600 hover:bg-slate-500 text-white flex items-center justify-center transition-colors"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="text-white text-xs font-bold w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.product_id, 1)}
                      className="w-6 h-6 rounded-md bg-slate-600 hover:bg-slate-500 text-white flex items-center justify-center transition-colors"
                    >
                      <Plus size={10} />
                    </button>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="w-6 h-6 rounded-md hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center transition-colors ml-1"
                    >
                      <X size={10} />
                    </button>
                  </div>
                  <p className="text-amber-400 text-xs font-bold w-12 text-right">
                    ${item.total_price.toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Cart totals & checkout */}
          {cart.length > 0 && (
            <div className="px-3 py-3 border-t border-slate-700 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Tax (10%)</span><span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-600 pt-2">
                <span className="text-white text-sm">Total</span>
                <span className="text-amber-400 text-lg">${total.toFixed(2)}</span>
              </div>
              <button
                onClick={() => setShowPayment(true)}
                className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#F59E0B" }}
              >
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
