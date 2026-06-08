import { useState, useEffect } from "react";
import AppShell from "~/components/layout/AppShell";
import { loadSession } from "~/store/erp.store";
import { Plus, Edit2, Search, Users, X } from "lucide-react";

interface StaffMember {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  status: string;
  branch_id?: string;
  last_login?: string;
}

const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "manager", label: "Manager" },
  { value: "cashier", label: "Cashier" },
  { value: "waiter", label: "Waiter" },
  { value: "kitchen_staff", label: "Kitchen Staff" },
  { value: "accountant", label: "Accountant" },
  { value: "receptionist", label: "Receptionist" },
  { value: "housekeeping", label: "Housekeeping" },
];

const ROLE_COLORS: Record<string, string> = {
  owner: "#F59E0B",
  manager: "#3B82F6",
  cashier: "#10B981",
  waiter: "#8B5CF6",
  kitchen_staff: "#EF4444",
  accountant: "#14B8A6",
  receptionist: "#6366F1",
  housekeeping: "#EC4899",
  super_admin: "#64748B",
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const session = loadSession();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", role: "cashier", pin: "", status: "active",
  });

  const fetchStaff = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/erp/auth/staff-list/${session.tenant_id ? "demo-restaurant" : "demo-restaurant"}`,
        { headers: { Authorization: `Bearer ${session.token}` } }
      );
      const data = await res.json();
      if (data.success) setStaff(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const filtered = staff.filter(
    (s) => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.role.includes(search.toLowerCase())
  );

  const initials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Staff Management</h1>
            <p className="text-slate-400 text-sm">{staff.length} team members</p>
          </div>
        </div>

        {/* Role breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {ROLES.map((role) => {
            const count = staff.filter((s) => s.role === role.value).length;
            return (
              <div
                key={role.value}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border border-slate-700"
                style={{ backgroundColor: "#1E293B" }}
              >
                <p className="text-white font-bold text-lg">{count}</p>
                <p
                  className="text-xs font-medium text-center leading-tight"
                  style={{ color: ROLE_COLORS[role.value] ?? "#94A3B8" }}
                >
                  {role.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Staff grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((s) => (
              <div
                key={s._id}
                className="rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors"
                style={{ backgroundColor: "#1E293B" }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: `${ROLE_COLORS[s.role] ?? "#64748B"}33`, color: ROLE_COLORS[s.role] ?? "#94A3B8" }}
                  >
                    {initials(s.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{s.name}</p>
                    <p
                      className="text-xs font-medium capitalize"
                      style={{ color: ROLE_COLORS[s.role] ?? "#94A3B8" }}
                    >
                      {s.role.replace("_", " ")}
                    </p>
                    {s.email && <p className="text-slate-500 text-xs mt-0.5 truncate">{s.email}</p>}
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                      s.status === "active" ? "bg-emerald-400" : "bg-slate-500"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Demo note */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl border"
          style={{ backgroundColor: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.3)" }}
        >
          <Users size={16} className="text-blue-400 flex-shrink-0" />
          <p className="text-blue-300 text-sm">
            Demo staff: <strong>Owner PIN 9999</strong>, <strong>Manager/Cashier/Kitchen PIN 1234</strong>, <strong>Waiter PIN 5678</strong>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
