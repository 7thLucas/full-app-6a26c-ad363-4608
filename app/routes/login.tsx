import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useConfigurables } from "~/modules/configurables";
import { saveSession, saveTenantSlug, loadTenantSlug, loadSession } from "~/store/erp.store";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  owner: "Owner",
  manager: "Manager",
  cashier: "Cashier",
  waiter: "Waiter",
  kitchen_staff: "Kitchen",
  accountant: "Accountant",
  receptionist: "Receptionist",
  housekeeping: "Housekeeping",
};

function roleColor(role: string): string {
  const map: Record<string, string> = {
    owner: "bg-amber-500",
    manager: "bg-blue-600",
    cashier: "bg-emerald-600",
    waiter: "bg-purple-600",
    kitchen_staff: "bg-red-600",
    accountant: "bg-teal-600",
    receptionist: "bg-indigo-600",
    housekeeping: "bg-pink-600",
    super_admin: "bg-gray-700",
  };
  return map[role] ?? "bg-gray-600";
}

function initials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function LoginPage() {
  const { config, loading } = useConfigurables();
  const navigate = useNavigate();
  const [tenantSlug, setTenantSlug] = useState("demo-restaurant");
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [step, setStep] = useState<"select" | "pin">("select");

  useEffect(() => {
    // Redirect if already logged in
    const session = loadSession();
    if (session) {
      navigate("/dashboard");
      return;
    }
    const savedSlug = loadTenantSlug();
    setTenantSlug(savedSlug);
    fetchStaff(savedSlug);
  }, []);

  const fetchStaff = async (slug: string) => {
    setLoadingStaff(true);
    try {
      const res = await fetch(`/api/erp/auth/staff-list/${slug}`);
      const data = await res.json();
      if (data.success) {
        setStaffList(data.data);
      }
    } catch {
      setError("Could not load staff list");
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleStaffSelect = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setPin("");
    setError("");
    setStep("pin");
  };

  const handlePinDigit = useCallback(
    (digit: string) => {
      if (pin.length >= 6) return;
      const newPin = pin + digit;
      setPin(newPin);
      setError("");
      if (newPin.length === 4) {
        submitPin(newPin);
      }
    },
    [pin, selectedStaff, tenantSlug]
  );

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
    setError("");
  };

  const submitPin = async (pinValue: string) => {
    if (!selectedStaff) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/erp/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_slug: tenantSlug, pin: pinValue }),
      });
      const data = await res.json();
      if (data.success) {
        saveSession({
          id: data.staff.id,
          name: data.staff.name,
          role: data.staff.role,
          tenant_id: data.staff.tenant_id ?? "",
          branch_id: data.staff.branch_id,
          token: data.token,
        });
        saveTenantSlug(tenantSlug);
        navigate("/dashboard");
      } else {
        setError(data.error ?? "Invalid PIN");
        setPin("");
      }
    } catch {
      setError("Connection error. Please try again.");
      setPin("");
    } finally {
      setIsLoading(false);
    }
  };

  const appName = loading ? "HospitalityHub" : (config?.appName ?? "HospitalityHub ERP");
  const primaryColor = config?.brandColor?.primary ?? "#1E3A5F";
  const accentColor = config?.brandColor?.accent ?? "#F59E0B";

  const PINDots = () => (
    <div className="flex gap-3 justify-center mb-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="w-4 h-4 rounded-full border-2 transition-all duration-200"
          style={{
            backgroundColor: i < pin.length ? accentColor : "transparent",
            borderColor: i < pin.length ? accentColor : "#475569",
            transform: i < pin.length ? "scale(1.1)" : "scale(1)",
          }}
        />
      ))}
    </div>
  );

  const keypad = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "⌫"],
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#0F172A" }}
    >
      <div className="w-full max-w-md">
        {/* Logo & App Name */}
        <div className="text-center mb-8">
          {config?.logoUrl && config.logoUrl !== "FILL_LOGO_URL_HERE" ? (
            <img src={config.logoUrl} alt={appName} className="h-12 mx-auto mb-3 object-contain" />
          ) : (
            <div
              className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: primaryColor }}
            >
              H
            </div>
          )}
          <h1 className="text-2xl font-bold text-white">{appName}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {config?.appTagline ?? "Enterprise Hospitality Management"}
          </p>
        </div>

        <div
          className="rounded-2xl p-6 shadow-2xl"
          style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
        >
          {step === "select" ? (
            <>
              <h2 className="text-lg font-semibold text-white text-center mb-5">
                Select Your Account
              </h2>
              {loadingStaff ? (
                <div className="text-center text-slate-400 py-8">Loading staff...</div>
              ) : staffList.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  <p>No staff found for tenant:</p>
                  <code className="text-amber-400 text-sm">{tenantSlug}</code>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {staffList.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleStaffSelect(s)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-700 transition-all duration-200 border border-transparent hover:border-slate-600 group"
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${roleColor(s.role)}`}
                      >
                        {initials(s.name)}
                      </div>
                      <div className="text-center">
                        <p className="text-white text-sm font-medium leading-tight">{s.name}</p>
                        <p className="text-slate-400 text-xs">{ROLE_LABELS[s.role] ?? s.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Tenant selector */}
              <div className="mt-5 pt-4 border-t border-slate-700">
                <label className="block text-slate-400 text-xs mb-1">Business</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tenantSlug}
                    onChange={(e) => setTenantSlug(e.target.value)}
                    placeholder="tenant-slug"
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => { saveTenantSlug(tenantSlug); fetchStaff(tenantSlug); }}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Load
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Back button */}
              <button
                onClick={() => { setStep("select"); setSelectedStaff(null); setPin(""); setError(""); }}
                className="text-slate-400 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors"
              >
                ← Back
              </button>

              {/* Selected staff info */}
              {selectedStaff && (
                <div className="flex items-center gap-3 mb-6 p-3 rounded-xl" style={{ backgroundColor: "#0F172A" }}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${roleColor(selectedStaff.role)}`}
                  >
                    {initials(selectedStaff.name)}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{selectedStaff.name}</p>
                    <p className="text-slate-400 text-xs">{ROLE_LABELS[selectedStaff.role] ?? selectedStaff.role}</p>
                  </div>
                </div>
              )}

              <p className="text-center text-slate-300 text-sm mb-4">Enter your PIN</p>

              <PINDots />

              {error && (
                <p className="text-red-400 text-sm text-center mb-3 animate-pulse">{error}</p>
              )}

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-3">
                {keypad.map((row, ri) =>
                  row.map((key, ci) => (
                    <button
                      key={`${ri}-${ci}`}
                      onClick={() => {
                        if (key === "⌫") handleDelete();
                        else if (key !== "" && !isLoading) handlePinDigit(key);
                      }}
                      disabled={isLoading || (key === "" ? true : false)}
                      className={`
                        h-14 rounded-xl text-xl font-semibold transition-all duration-150
                        ${key === "" ? "invisible" : ""}
                        ${key === "⌫"
                          ? "text-slate-400 hover:bg-slate-700 hover:text-white"
                          : "text-white hover:text-white active:scale-95"
                        }
                        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                      style={
                        key !== "" && key !== "⌫"
                          ? {
                              backgroundColor: "#0F172A",
                              border: "1px solid #334155",
                            }
                          : {}
                      }
                    >
                      {isLoading && key === "0" ? "..." : key}
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Demo: Manager PIN 1234 · Owner PIN 9999
        </p>
      </div>
    </div>
  );
}
