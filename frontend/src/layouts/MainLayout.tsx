import { NavLink, Outlet } from "react-router-dom";
import { LayoutGrid, ScanLine, History, Settings, LogOut } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/ocr-workspace", label: "OCR Workspace", icon: ScanLine, end: false },
  { to: "/history", label: "History", icon: History, end: false },
  { to: "/settings", label: "Settings", icon: Settings, end: false },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      <aside className="w-[280px] shrink-0 border-r border-[#1c1c26] flex flex-col justify-between px-4 py-6">
        <div>
          <div className="flex items-center gap-2 px-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
              V
            </div>
            <span className="text-white text-base font-semibold">Verascan</span>
          </div>

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#181822] text-white"
                      : "text-[#9ca3af] hover:text-white hover:bg-[#14141c]"
                  )
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-[#1c1c26] pt-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#232330] flex items-center justify-center text-white text-sm font-semibold">
              {user ? getInitials(user.name) : ""}
            </div>
            <div className="min-w-0">
              <div className="text-white text-sm font-medium truncate">{user?.name}</div>
              <div className="text-[#6b7280] text-xs truncate">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#9ca3af] hover:text-white hover:bg-[#14141c] transition-colors"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-10 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
