import { useState } from "react";
import AppShell from "~/components/layout/AppShell";
import { useConfigurables } from "~/modules/configurables";
import { Settings, Building2, Palette, Shield, Bell, Database } from "lucide-react";

export default function SettingsPage() {
  const { config, loading } = useConfigurables();
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: <Building2 size={16} /> },
    { id: "appearance", label: "Appearance", icon: <Palette size={16} /> },
    { id: "security", label: "Security", icon: <Shield size={16} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
    { id: "data", label: "Data & Backup", icon: <Database size={16} /> },
  ];

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Settings size={24} className="text-amber-400" />
          <div>
            <h1 className="text-xl font-bold text-white">Settings</h1>
            <p className="text-slate-400 text-sm">Configure your ERP platform</p>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar nav */}
          <div className="w-48 flex-shrink-0 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  activeTab === tab.id
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Settings panel */}
          <div className="flex-1 rounded-xl border border-slate-700 p-6" style={{ backgroundColor: "#1E293B" }}>
            {activeTab === "general" && (
              <div className="space-y-5">
                <h2 className="text-white font-semibold">General Settings</h2>
                {loading ? (
                  <p className="text-slate-400 text-sm">Loading configuration...</p>
                ) : (
                  <div className="space-y-4">
                    <SettingRow label="App Name" value={config?.appName ?? "—"} />
                    <SettingRow label="Tagline" value={config?.appTagline ?? "—"} />
                    <SettingRow label="Support Email" value={(config as any)?.supportEmail ?? "—"} />
                    <SettingRow label="Support Phone" value={(config as any)?.supportPhone ?? "—"} />
                    <SettingRow label="Currency" value={`${(config as any)?.currency?.code ?? "USD"} (${(config as any)?.currency?.symbol ?? "$"})`} />
                    <SettingRow label="Tax Rate" value={`${(config as any)?.taxRate ?? 10}%`} />
                    <SettingRow label="PIN Length" value={`${(config as any)?.pinLength ?? 4} digits`} />
                  </div>
                )}
                <div
                  className="mt-4 px-4 py-3 rounded-xl border text-sm"
                  style={{ backgroundColor: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.3)", color: "#93C5FD" }}
                >
                  Settings are managed via the App Configuration portal. Changes made there are reflected here automatically.
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-5">
                <h2 className="text-white font-semibold">Appearance</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400 text-sm w-32">Primary Color</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full border border-slate-600" style={{ backgroundColor: config?.brandColor?.primary ?? "#1E3A5F" }} />
                      <span className="text-white text-sm font-mono">{config?.brandColor?.primary ?? "#1E3A5F"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400 text-sm w-32">Accent Color</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full border border-slate-600" style={{ backgroundColor: config?.brandColor?.accent ?? "#F59E0B" }} />
                      <span className="text-white text-sm font-mono">{config?.brandColor?.accent ?? "#F59E0B"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === "security" || activeTab === "notifications" || activeTab === "data") && (
              <div className="space-y-4">
                <h2 className="text-white font-semibold capitalize">{activeTab}</h2>
                <div
                  className="px-4 py-3 rounded-xl border text-sm"
                  style={{ backgroundColor: "rgba(99,102,241,0.1)", borderColor: "rgba(99,102,241,0.3)", color: "#A5B4FC" }}
                >
                  Advanced {activeTab} settings including PIN policies, audit logs, notification channels, and backup configuration are available in the complete enterprise version.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 py-2 border-b border-slate-700/50">
      <span className="text-slate-400 text-sm w-32 flex-shrink-0">{label}</span>
      <span className="text-white text-sm">{value}</span>
    </div>
  );
}
