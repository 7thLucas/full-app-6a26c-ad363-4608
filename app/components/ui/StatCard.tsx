import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = "#1E3A5F",
}: StatCardProps) {
  return (
    <div
      className="rounded-xl p-5 shadow-sm border border-slate-800"
      style={{ backgroundColor: "#1E293B" }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        {icon && (
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${color}33` }}
          >
            <span style={{ color }}>{icon}</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <div className="flex items-center gap-2">
        {trend && (
          <span
            className={`flex items-center gap-1 text-xs font-medium ${
              trend === "up"
                ? "text-emerald-400"
                : trend === "down"
                ? "text-red-400"
                : "text-slate-400"
            }`}
          >
            {trend === "up" ? <TrendingUp size={12} /> : trend === "down" ? <TrendingDown size={12} /> : <Minus size={12} />}
            {trendValue}
          </span>
        )}
        {subtitle && <p className="text-slate-500 text-xs">{subtitle}</p>}
      </div>
    </div>
  );
}
