import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useI18n } from '../../../context/I18nContext';
import { tokenService } from '../../../services/tokenService';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginInputs = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInputs) => {
    console.log('Login submitted:', data);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    tokenService.setAccessToken('mock-access-token');
    window.dispatchEvent(new Event('auth:login'));

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-[#0a0b14] transition-colors duration-200">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-sky-50 dark:bg-[#0d0e1a] dark:from-transparent dark:via-transparent dark:to-transparent border-r border-violet-100 dark:border-white/5 transition-colors duration-200">
        {/* light mode: vivid colorful blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-violet-300/40 dark:bg-[#7c6cf5]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-0 w-80 h-80 rounded-full bg-sky-300/30 dark:bg-[#6a5cf0]/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-pink-200/30 dark:bg-transparent blur-3xl" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 dark:from-[#7c6cf5] dark:to-[#6a5cf0] flex items-center justify-center shadow-lg shadow-violet-500/30 dark:shadow-[#7c6cf5]/30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6h16M4 12h10M4 18h16" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Verascan</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
            Evaluate and compare OCR engines with confidence.
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
            Track accuracy, benchmark providers, and review field-level diffs across every document you process.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-sm text-gray-500 dark:text-gray-500">
          <span>© {new Date().getFullYear()} Verascan</span>
          <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600" />
          <span>All rights reserved</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-[#0a0b14] transition-colors duration-200">
        <div className="max-w-md w-full p-8 bg-white dark:bg-[#12131f] rounded-2xl shadow-xl shadow-violet-100 dark:shadow-2xl dark:shadow-none border border-violet-100 dark:border-white/10 transition-colors duration-200">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 dark:from-[#7c6cf5] dark:to-[#6a5cf0] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6h16M4 12h10M4 18h16" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Verascan</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
              {t('auth.welcome_back')}
            </h2>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              Sign in to continue to your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
                {t('common.email')}
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                {...register('email')}
                className="w-full px-3.5 py-2.5 border border-violet-200 dark:border-white/10 rounded-lg bg-violet-50/50 dark:bg-[#1a1b2e] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-[#7c6cf5] focus:border-transparent transition-all"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                  {t('common.password')}
                </label>
                <a href="#" className="text-sm text-violet-600 hover:text-violet-800 dark:text-[#9d8ff8] dark:hover:text-[#7c6cf5] transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full px-3.5 py-2.5 pr-10 border border-violet-200 dark:border-white/10 rounded-lg bg-violet-50/50 dark:bg-[#1a1b2e] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-[#7c6cf5] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 hover:text-violet-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-[#7c6cf5] dark:to-[#6a5cf0] text-white font-medium rounded-lg hover:brightness-110 shadow-lg shadow-violet-500/30 dark:shadow-[#7c6cf5]/20 transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? 'Signing In...' : t('common.login')}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-500">
            Don't have an account?{' '}
            <a href="/register" className="text-violet-600 hover:text-violet-800 dark:text-[#9d8ff8] dark:hover:text-[#7c6cf5] font-medium transition-colors">
              create your account now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};