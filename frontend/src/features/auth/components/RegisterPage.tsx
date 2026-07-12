import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useI18n } from '../../../context/I18nContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterInputs = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInputs) => {
    console.log('Register submitted:', data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    navigate('/login');
  };

  return (
    <div className="max-w-md w-full p-8 bg-[#12131f] rounded-2xl shadow-2xl border border-white/10">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-white mb-2">
          {t('auth.create_account')}
        </h2>
        <p className="text-gray-500 text-sm">
          Create an account to start evaluating OCR engines
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            {t('common.name')}
          </label>
          <input
            type="text"
            placeholder="Jane Doe"
            {...register('name')}
            className="w-full px-3.5 py-2.5 border border-white/10 rounded-lg bg-[#1a1b2e] text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#7c6cf5] focus:border-transparent transition-all"
          />
          {errors.name && (
            <p className="mt-1.5 text-sm text-red-400">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            {t('common.email')}
          </label>
          <input
            type="email"
            placeholder="you@company.com"
            {...register('email')}
            className="w-full px-3.5 py-2.5 border border-white/10 rounded-lg bg-[#1a1b2e] text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#7c6cf5] focus:border-transparent transition-all"
          />
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            {t('common.password')}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className="w-full px-3.5 py-2.5 pr-10 border border-white/10 rounded-lg bg-[#1a1b2e] text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#7c6cf5] focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-sm text-red-400">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('confirmPassword')}
              className="w-full px-3.5 py-2.5 pr-10 border border-white/10 rounded-lg bg-[#1a1b2e] text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#7c6cf5] focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-sm text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#7c6cf5] to-[#6a5cf0] text-white font-medium rounded-lg hover:brightness-110 shadow-lg shadow-[#7c6cf5]/20 transition-all duration-200 disabled:opacity-50"
        >
          {isSubmitting ? 'Registering...' : t('common.register')}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <a href="/login" className="text-[#9d8ff8] hover:text-[#7c6cf5] font-medium transition-colors">
          Sign in
        </a>
      </p>
    </div>
  );
};