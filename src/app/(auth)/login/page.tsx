'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInputs) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Invalid credentials');
        setLoading(false);
        return;
      }

      router.push('/overview');
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      {/* Left Pane - Brand Panel (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-3/5 bg-surface relative flex-col justify-between p-16 border-r border-border-custom overflow-hidden">
        {/* Decorative Grid or background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Top Header */}
        <div className="relative flex items-center gap-3">
          <div className="w-4 h-4 bg-accent" />
          <span className="font-display text-xl font-bold tracking-wider text-text-primary">BRANDAVOX</span>
        </div>

        {/* Brand Core Message */}
        <div className="relative max-w-xl my-auto">
          <div className="w-12 h-1 bg-accent mb-8" />
          <h1 className="font-display text-5xl font-bold leading-tight tracking-tight text-text-primary mb-6">
            The Operating System for Modern Agencies.
          </h1>
          <p className="text-lg text-text-muted leading-relaxed font-sans">
            Brandavox unites brand intelligence, AI creative studio execution, client management, and campaign operations. Accumulate campaign memory, generate strategy-backed assets, and run your entire agency from a single, unified brain.
          </p>
        </div>

        {/* Footer info */}
        <div className="relative flex justify-between text-xs text-text-muted font-mono">
          <span>SYSTEM VERSION: 2.0.0</span>
          <span>EST. 2026</span>
        </div>
      </div>

      {/* Right Pane - Form Panel */}
      <div className="w-full lg:w-2/5 flex flex-col justify-center px-6 md:px-16 lg:px-24">
        {/* Mobile Header (Visible only on small screens) */}
        <div className="lg:hidden flex items-center gap-3 mb-12">
          <div className="w-3 h-3 bg-accent" />
          <span className="font-display text-lg font-bold tracking-wider text-text-primary">BRANDAVOX</span>
        </div>

        <div className="w-full max-w-md mx-auto">
          {/* Section title */}
          <div className="mb-10">
            <h2 className="font-display text-3xl font-semibold text-text-primary mb-2">Command Center</h2>
            <p className="text-text-muted font-sans text-sm">Sign in to your agency workspace.</p>
          </div>

          {/* Form container */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-950/30 border border-red-500/20 text-red-400 text-sm rounded-md font-sans">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-muted font-sans uppercase tracking-wider block">
                Workspace Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-border-custom text-text-primary rounded-badge font-sans text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-text-muted/50"
                  placeholder="name@agency.com"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1 font-sans">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-text-muted font-sans uppercase tracking-wider block">
                  Password
                </label>
                <Link
                  href="/login/reset"
                  className="text-xs text-accent hover:text-accent-hover font-sans hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className="w-full pl-10 pr-12 py-3 bg-surface border border-border-custom text-text-primary rounded-badge font-sans text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-text-muted/50"
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1 font-sans">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-white py-3 px-4 rounded-badge font-sans font-medium text-sm flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Entering Command Center...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-custom" />
            </div>
            <div className="relative flex justify-center text-xs font-mono">
              <span className="bg-background px-4 text-text-muted uppercase">or continue with</span>
            </div>
          </div>

          {/* Social OAuth */}
          <button
            type="button"
            disabled={loading}
            className="w-full bg-surface hover:bg-surface/80 border border-border-custom text-text-primary py-3 px-4 rounded-badge font-sans text-sm flex items-center justify-center gap-3 transition-colors duration-150 cursor-pointer disabled:opacity-50"
          >
            {/* Simple SVG Google Icon */}
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Switch to Register */}
          <p className="text-center text-sm text-text-muted mt-10 font-sans">
            New to Brandavox?{' '}
            <Link href="/register" className="text-accent hover:text-accent-hover font-semibold hover:underline">
              Create workspace
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
