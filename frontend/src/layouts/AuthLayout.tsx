import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#0a0b14] transition-colors duration-200">
      {/* Top Header/Nav */}
      <header className="flex justify-between items-center px-8 py-4 bg-[#0d0e1a] border-b border-white/5">
        <Link to="/" className="flex items-center gap-2.5 text-xl font-extrabold text-white tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c6cf5] to-[#6a5cf0] flex items-center justify-center shadow-lg shadow-[#7c6cf5]/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6h16M4 12h10M4 18h16" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          Verascan
        </Link>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-200"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Container */}
      <main className="flex flex-col items-center justify-center py-16 px-4">
        <Outlet />
      </main>
    </div>
  );
};