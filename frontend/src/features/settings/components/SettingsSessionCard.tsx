import { LogOut } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export function SettingsSessionCard() {
  const { logout } = useAuth();

  return (
    <section className="rounded-2xl border border-[#442436] bg-[#10111a] p-5">
      <div className="mb-4 text-lg font-semibold text-white">Session</div>
      <div className="mb-4 text-sm text-[#9ca3af]">Sign out of Verascan on this device.</div>

      <button
        type="button"
        onClick={logout}
        className="inline-flex items-center gap-2 rounded-xl border border-rose-400/40 bg-transparent px-4 py-2.5 text-sm font-semibold text-rose-200 transition hover:bg-[#23131b]"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </section>
  );
}
