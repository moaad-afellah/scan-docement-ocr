import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import { tokenService } from '../services/tokenService';
import { Sun, Moon, LogOut, LayoutDashboard, ScanText, History as HistoryIcon, Settings as SettingsIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';



export const DashboardLayout: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleLogout = () => {
    tokenService.clearAccessToken();
    window.dispatchEvent(new Event('auth:logout'));
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0b14] text-gray-100 flex flex-col transition-colors duration-200">
      {/* Top Navigation */}
      <header className="flex justify-between items-center px-6 py-4 bg-[#0d0e1a] border-b border-white/5 z-10">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c6cf5] to-[#6a5cf0] flex items-center justify-center shadow-lg shadow-[#7c6cf5]/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6h16M4 12h10M4 18h16" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight">Verascan</span>
          <span className="text-xs py-0.5 px-2 bg-[#7c6cf5]/15 text-[#9d8ff8] rounded-full font-semibold">
            Console
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('common.logout')}</span>
          </button>
        </div>
      </header>

      {/* Main Core Layout: Sidebar + Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#0d0e1a] border-r border-white/5 hidden md:block">
          <nav className="p-4 space-y-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${isActive
                  ? 'bg-[#7c6cf5]/15 text-[#9d8ff8]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>{t('common.dashboard')}</span>
            </NavLink>

            <NavLink
              to="/workspace"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${isActive
                  ? 'bg-[#7c6cf5]/15 text-[#9d8ff8]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <ScanText className="w-5 h-5" />
              <span>OCR Workspace</span>
            </NavLink>

            <NavLink
              to="/history"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${isActive
                  ? 'bg-[#7c6cf5]/15 text-[#9d8ff8]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <HistoryIcon className="w-5 h-5" />
              <span>History</span>
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${isActive
                  ? 'bg-[#7c6cf5]/15 text-[#9d8ff8]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <SettingsIcon className="w-5 h-5" />
              <span>Settings</span>
            </NavLink>
          </nav>
        </aside>
        {/* Content Workspace Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};