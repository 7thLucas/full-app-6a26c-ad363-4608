import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { clearSession, loadSession, type StaffSession } from "~/store/erp.store";
import { useConfigurables } from "~/modules/configurables";
import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  TableProperties,
  Package,
  BarChart3,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Sun,
  Moon,
  Hotel,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    icon: <LayoutDashboard size={20} />,
    label: "Dashboard",
    href: "/dashboard",
    roles: ["super_admin", "owner", "manager", "cashier", "kitchen_staff", "accountant", "receptionist", "housekeeping"],
  },
  {
    icon: <ShoppingCart size={20} />,
    label: "POS",
    href: "/pos",
    roles: ["cashier", "waiter", "manager", "owner"],
  },
  {
    icon: <UtensilsCrossed size={20} />,
    label: "Kitchen",
    href: "/kitchen",
    roles: ["kitchen_staff", "manager", "owner"],
  },
  {
    icon: <TableProperties size={20} />,
    label: "Tables",
    href: "/tables",
    roles: ["waiter", "cashier", "manager", "owner", "receptionist"],
  },
  {
    icon: <Package size={20} />,
    label: "Menu",
    href: "/menu",
    roles: ["manager", "owner"],
  },
  {
    icon: <Package size={20} />,
    label: "Inventory",
    href: "/inventory",
    roles: ["manager", "owner", "accountant"],
  },
  {
    icon: <BarChart3 size={20} />,
    label: "Reports",
    href: "/reports",
    roles: ["manager", "owner", "accountant"],
  },
  {
    icon: <Hotel size={20} />,
    label: "Hotel",
    href: "/hotel",
    roles: ["receptionist", "housekeeping", "manager", "owner"],
  },
  {
    icon: <Users size={20} />,
    label: "Staff",
    href: "/staff",
    roles: ["manager", "owner", "super_admin"],
  },
  {
    icon: <Settings size={20} />,
    label: "Settings",
    href: "/settings",
    roles: ["super_admin", "owner", "manager"],
  },
];

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { config } = useConfigurables();
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState<StaffSession | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const s = loadSession();
    if (!s) {
      navigate("/login");
      return;
    }
    setSession(s);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  const appName = config?.appName ?? "HospitalityHub";
  const primaryColor = "#1E3A5F";
  const accentColor = "#F59E0B";

  const filteredNav = session
    ? NAV_ITEMS.filter((item) => item.roles.includes(session.role))
    : [];

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + "/");

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-4 border-b"
        style={{ borderColor: "#2A4A6F" }}
      >
        {config?.logoUrl && config.logoUrl !== "FILL_LOGO_URL_HERE" ? (
          <img src={config.logoUrl} alt={appName} className="h-8 object-contain flex-shrink-0" />
        ) : (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            H
          </div>
        )}
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-white font-bold text-sm leading-tight truncate">{appName}</h1>
            <p className="text-slate-400 text-xs truncate">ERP Platform</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                ${active ? "text-amber-400" : "text-slate-300 hover:text-white hover:bg-slate-700/50"}
              `}
              style={
                active
                  ? {
                      backgroundColor: "rgba(245, 158, 11, 0.15)",
                      borderLeft: `3px solid ${accentColor}`,
                      paddingLeft: "10px",
                    }
                  : {}
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Staff info & logout */}
      <div className="px-2 py-3 border-t" style={{ borderColor: "#2A4A6F" }}>
        {session && (
          <div
            className={`flex items-center gap-3 px-3 py-2 mb-2 rounded-lg ${collapsed ? "justify-center" : ""}`}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              {session.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-white text-xs font-medium truncate">{session.name}</p>
                <p className="text-slate-400 text-xs capitalize">{session.role.replace("_", " ")}</p>
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#0F172A" }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col flex-shrink-0 transition-all duration-300"
        style={{
          width: collapsed ? "64px" : "240px",
          backgroundColor: primaryColor,
        }}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 -right-3 w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs hover:bg-slate-600 transition-colors z-10"
          style={{ left: collapsed ? "52px" : "228px", position: "fixed" }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <aside
            className="relative flex flex-col w-64"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: primaryColor }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header
          className="flex items-center justify-between px-4 h-14 flex-shrink-0 border-b"
          style={{ backgroundColor: "#0F172A", borderColor: "#1E293B" }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <Menu size={20} />
            </button>
            {/* Page title from current route */}
            <div>
              <h2 className="text-white font-semibold text-sm">
                {filteredNav.find((n) => isActive(n.href))?.label ?? "HospitalityHub"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {/* Notifications */}
            <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 relative transition-colors">
              <Bell size={18} />
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6" style={{ backgroundColor: "#0F172A" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
