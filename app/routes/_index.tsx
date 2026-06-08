import { useEffect } from "react";
import { useNavigate } from "react-router";
import { loadSession } from "~/store/erp.store";

export default function IndexPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const session = loadSession();
    if (session) {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0F172A" }}>
      <div className="text-center">
        <div
          className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl"
          style={{ backgroundColor: "#1E3A5F" }}
        >
          H
        </div>
        <p className="text-slate-400 text-sm">Loading HospitalityHub ERP...</p>
      </div>
    </div>
  );
}
