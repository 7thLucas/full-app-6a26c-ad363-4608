import { useState } from "react";
import AppShell from "~/components/layout/AppShell";
import { Hotel, BedDouble, CheckCircle, Clock, Wrench, Sparkles } from "lucide-react";

const MOCK_ROOMS = [
  { number: "101", type: "Single", floor: 1, status: "available", capacity: 1, price: 89 },
  { number: "102", type: "Double", floor: 1, status: "occupied", capacity: 2, price: 129, guest: "John Smith" },
  { number: "103", type: "Double", floor: 1, status: "cleaning", capacity: 2, price: 129 },
  { number: "104", type: "Single", floor: 1, status: "reserved", capacity: 1, price: 89, guest: "Upcoming" },
  { number: "201", type: "Deluxe", floor: 2, status: "available", capacity: 2, price: 189 },
  { number: "202", type: "Deluxe", floor: 2, status: "occupied", capacity: 2, price: 189, guest: "Maria Garcia" },
  { number: "203", type: "Suite", floor: 2, status: "available", capacity: 4, price: 299 },
  { number: "204", type: "Suite", floor: 2, status: "maintenance", capacity: 4, price: 299 },
  { number: "301", type: "VIP Suite", floor: 3, status: "available", capacity: 6, price: 599 },
  { number: "302", type: "VIP Suite", floor: 3, status: "occupied", capacity: 6, price: 599, guest: "VIP Guest" },
];

const ROOM_STATUS_COLOR: Record<string, string> = {
  available: "#10B981",
  occupied: "#EF4444",
  reserved: "#F59E0B",
  cleaning: "#94A3B8",
  maintenance: "#F97316",
};

const ROOM_STATUS_BG: Record<string, string> = {
  available: "rgba(16,185,129,0.15)",
  occupied: "rgba(239,68,68,0.15)",
  reserved: "rgba(245,158,11,0.15)",
  cleaning: "rgba(148,163,184,0.15)",
  maintenance: "rgba(249,115,22,0.15)",
};

const ROOM_STATUS_ICON: Record<string, React.ReactNode> = {
  available: <CheckCircle size={16} />,
  occupied: <BedDouble size={16} />,
  reserved: <Clock size={16} />,
  cleaning: <Sparkles size={16} />,
  maintenance: <Wrench size={16} />,
};

export default function HotelPage() {
  const [selectedFloor, setSelectedFloor] = useState("all");
  const floors = [...new Set(MOCK_ROOMS.map((r) => r.floor))].sort();

  const stats = {
    available: MOCK_ROOMS.filter((r) => r.status === "available").length,
    occupied: MOCK_ROOMS.filter((r) => r.status === "occupied").length,
    reserved: MOCK_ROOMS.filter((r) => r.status === "reserved").length,
    cleaning: MOCK_ROOMS.filter((r) => r.status === "cleaning").length,
    maintenance: MOCK_ROOMS.filter((r) => r.status === "maintenance").length,
  };

  const occupancyRate = Math.round((stats.occupied / MOCK_ROOMS.length) * 100);

  const filtered = selectedFloor === "all"
    ? MOCK_ROOMS
    : MOCK_ROOMS.filter((r) => r.floor === parseInt(selectedFloor));

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hotel size={24} className="text-amber-400" />
            <div>
              <h1 className="text-xl font-bold text-white">Hotel Module</h1>
              <p className="text-slate-400 text-sm">Room management & bookings</p>
            </div>
          </div>
          <div
            className="px-4 py-2 rounded-xl border text-center"
            style={{ backgroundColor: "rgba(245,158,11,0.15)", borderColor: "rgba(245,158,11,0.3)" }}
          >
            <p className="text-amber-400 font-bold text-xl">{occupancyRate}%</p>
            <p className="text-amber-300 text-xs">Occupancy</p>
          </div>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(Object.entries(stats) as Array<[string, number]>).map(([status, count]) => (
            <div
              key={status}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border"
              style={{ backgroundColor: ROOM_STATUS_BG[status], borderColor: `${ROOM_STATUS_COLOR[status]}44` }}
            >
              <span style={{ color: ROOM_STATUS_COLOR[status] }}>{ROOM_STATUS_ICON[status]}</span>
              <div>
                <p className="text-white font-bold text-lg leading-tight">{count}</p>
                <p className="text-xs capitalize" style={{ color: ROOM_STATUS_COLOR[status] }}>{status}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Floor filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedFloor("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedFloor === "all" ? "bg-slate-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            All Floors
          </button>
          {floors.map((floor) => (
            <button
              key={floor}
              onClick={() => setSelectedFloor(String(floor))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFloor === String(floor) ? "bg-slate-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              Floor {floor}
            </button>
          ))}
        </div>

        {/* Room grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((room) => (
            <div
              key={room.number}
              className="rounded-xl p-4 cursor-pointer transition-all hover:scale-105 border-2"
              style={{
                backgroundColor: ROOM_STATUS_BG[room.status],
                borderColor: ROOM_STATUS_COLOR[room.status],
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-white font-bold text-lg">#{room.number}</p>
                  <p className="text-xs font-medium" style={{ color: ROOM_STATUS_COLOR[room.status] }}>
                    {room.type}
                  </p>
                </div>
                <span style={{ color: ROOM_STATUS_COLOR[room.status] }}>
                  {ROOM_STATUS_ICON[room.status]}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Floor {room.floor}</span>
                  <span className="text-slate-400 text-xs">{room.capacity} guests</span>
                </div>
                <p className="text-amber-400 font-bold text-sm">${room.price}/night</p>
                {room.guest && (
                  <p className="text-slate-300 text-xs truncate">{room.guest}</p>
                )}
              </div>
              <div
                className="mt-3 text-xs capitalize font-medium text-center py-1 rounded-lg"
                style={{ backgroundColor: `${ROOM_STATUS_COLOR[room.status]}22`, color: ROOM_STATUS_COLOR[room.status] }}
              >
                {room.status}
              </div>
            </div>
          ))}
        </div>

        {/* Coming soon note */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl border"
          style={{ backgroundColor: "rgba(99,102,241,0.1)", borderColor: "rgba(99,102,241,0.3)" }}
        >
          <Hotel size={16} className="text-indigo-400 flex-shrink-0" />
          <p className="text-indigo-300 text-sm">
            Full hotel booking management, check-in/check-out workflows, housekeeping scheduling, and room service integration are available in the complete version.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
