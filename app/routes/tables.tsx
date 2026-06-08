import { useState, useEffect } from "react";
import AppShell from "~/components/layout/AppShell";
import { loadSession } from "~/store/erp.store";
import { Plus, RefreshCw } from "lucide-react";
import { Link } from "react-router";

interface Table {
  _id: string;
  number: string;
  name?: string;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "cleaning";
  floor?: string;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
  shape: string;
  current_order_id?: string;
}

const STATUS_COLOR: Record<string, string> = {
  available: "#10B981",
  occupied: "#EF4444",
  reserved: "#F59E0B",
  cleaning: "#94A3B8",
};

const STATUS_BG: Record<string, string> = {
  available: "rgba(16,185,129,0.15)",
  occupied: "rgba(239,68,68,0.15)",
  reserved: "rgba(245,158,11,0.15)",
  cleaning: "rgba(148,163,184,0.15)",
};

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [floors, setFloors] = useState<string[]>([]);
  const [selectedFloor, setSelectedFloor] = useState("all");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"floor" | "grid">("floor");
  const session = loadSession();

  const fetchTables = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch("/api/erp/tables", {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTables(data.data);
        const uniqueFloors: string[] = [...new Set<string>(data.data.map((t: Table) => t.floor ?? "Main Floor"))];
        setFloors(uniqueFloors);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTables(); }, []);

  const handleStatusChange = async (tableId: string, status: string) => {
    if (!session) return;
    await fetch(`/api/erp/tables/${tableId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
      body: JSON.stringify({ status }),
    });
    fetchTables();
  };

  const filteredTables = selectedFloor === "all"
    ? tables
    : tables.filter((t) => (t.floor ?? "Main Floor") === selectedFloor);

  const stats = {
    available: tables.filter((t) => t.status === "available").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    reserved: tables.filter((t) => t.status === "reserved").length,
    cleaning: tables.filter((t) => t.status === "cleaning").length,
  };

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Table Management</h1>
            <p className="text-slate-400 text-sm">{tables.length} total tables</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchTables}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Status legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(Object.entries(stats) as Array<[string, number]>).map(([status, count]) => (
            <div
              key={status}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border"
              style={{ backgroundColor: STATUS_BG[status], borderColor: `${STATUS_COLOR[status]}44` }}
            >
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLOR[status] }} />
              <div>
                <p className="text-white font-bold text-lg leading-tight">{count}</p>
                <p className="text-xs capitalize" style={{ color: STATUS_COLOR[status] }}>{status}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Floor filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedFloor("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedFloor === "all" ? "text-white bg-slate-600" : "text-slate-400 bg-slate-800 hover:bg-slate-700"
            }`}
          >
            All Floors
          </button>
          {floors.map((floor) => (
            <button
              key={floor}
              onClick={() => setSelectedFloor(floor)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFloor === floor ? "text-white bg-slate-600" : "text-slate-400 bg-slate-800 hover:bg-slate-700"
              }`}
            >
              {floor}
            </button>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1 w-fit">
          {(["floor", "grid"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                viewMode === mode ? "bg-slate-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {mode} plan
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : viewMode === "grid" ? (
          /* Grid view */
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredTables.map((table) => (
              <div
                key={table._id}
                className="relative rounded-xl p-3 cursor-pointer transition-all hover:scale-105 border"
                style={{
                  backgroundColor: STATUS_BG[table.status],
                  borderColor: STATUS_COLOR[table.status],
                }}
              >
                <p className="text-white font-bold text-lg">{table.number}</p>
                <p className="text-xs" style={{ color: STATUS_COLOR[table.status] }}>
                  {table.status}
                </p>
                <p className="text-slate-400 text-xs mt-0.5">{table.capacity} seats</p>

                {/* Quick status change */}
                <select
                  value={table.status}
                  onChange={(e) => handleStatusChange(table._id, e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="cleaning">Cleaning</option>
                </select>
              </div>
            ))}
          </div>
        ) : (
          /* Floor plan view */
          <div
            className="relative rounded-xl border border-slate-700 overflow-auto"
            style={{ backgroundColor: "#0F172A", minHeight: "500px" }}
          >
            <div className="relative" style={{ width: "600px", height: "500px", margin: "0 auto" }}>
              {/* Floor plan grid */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: "linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              {filteredTables.map((table) => {
                const isCircle = table.shape === "circle";
                return (
                  <div
                    key={table._id}
                    className="absolute flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 border-2 group"
                    style={{
                      left: table.pos_x,
                      top: table.pos_y,
                      width: table.width,
                      height: table.height,
                      borderRadius: isCircle ? "50%" : "12px",
                      backgroundColor: STATUS_BG[table.status],
                      borderColor: STATUS_COLOR[table.status],
                    }}
                    title={`${table.name ?? table.number} — ${table.status} (${table.capacity} seats)`}
                  >
                    <span className="text-white font-bold text-sm">{table.number}</span>
                    <span className="text-xs" style={{ color: STATUS_COLOR[table.status] }}>
                      {table.capacity}p
                    </span>

                    {/* Hover quick actions */}
                    <div className="absolute hidden group-hover:flex gap-1 -bottom-8 z-10 bg-slate-800 rounded-lg px-2 py-1 shadow-lg">
                      {["available", "occupied", "reserved", "cleaning"].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(table._id, s)}
                          className="w-3 h-3 rounded-full transition-transform hover:scale-125"
                          title={s}
                          style={{ backgroundColor: STATUS_COLOR[s] }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
