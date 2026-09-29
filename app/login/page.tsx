'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const [selectedRole, setSelectedRole] = useState<'RESIDENT' | 'COMMITTEE' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingDemo, setFetchingDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo role button handler: autofills demo credentials without auto-submitting
  const handleSelectRole = async (role: 'RESIDENT' | 'COMMITTEE') => {
    setSelectedRole(role);
    setError(null);
    setFetchingDemo(true);

    try {
      const res = await fetch(`/api/auth/demo-credentials?role=${role}`);
      if (res.ok) {
        const data = await res.json();
        setEmail(data.email || '');
        setPassword(data.password || '');
      } else {
        // Fallback demo values if network hiccup
        if (role === 'RESIDENT') {
          setEmail('resident@greenvalley.demo');
          setPassword('Resident@123');
        } else {
          setEmail('committee@greenvalley.demo');
          setPassword('Committee@123');
        }
      }
    } catch {
      if (role === 'RESIDENT') {
        setEmail('resident@greenvalley.demo');
        setPassword('Resident@123');
      } else {
        setEmail('committee@greenvalley.demo');
        setPassword('Committee@123');
      }
    } finally {
      setFetchingDemo(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both username/email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid credentials. Please verify or use the demo role buttons.');
        setLoading(false);
        return;
      }

      // Successful login -> route to role-specific destination
      const targetDestination = redirectPath || data.destination || (data.user?.role === 'COMMITTEE' ? '/dashboard' : '/');
      window.location.href = targetDestination;
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your connection.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#E0E5EC] text-[#3D4852] font-body flex items-center justify-center p-4 sm:p-6 md:p-8 w-full max-w-full overflow-x-clip">
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl neu-inset-deep flex items-center justify-center p-3 mb-3.5 sm:mb-4">
            <img src="/logo.png" alt="Society Complaint Triage" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#3D4852] tracking-tight">
            Society Complaint Triage
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] font-medium mt-1 max-w-xs">
            AI-powered complaint management for your society
          </p>
        </div>

        {/* Main Neumorphic Card */}
        <div className="w-full neu-card p-5 sm:p-8 rounded-[28px] sm:rounded-[32px] flex flex-col gap-6">
          {/* Demo Role Selector Section */}
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] sm:text-xs font-bold text-[#6C63FF] tracking-wide uppercase">
                Demo credentials — for development/testing only
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#6B7280]">
                In production, each society member should use an individual account.
              </span>
            </div>

            {/* Role Cards: Touch/Click to fill */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                id="role-btn-resident"
                onClick={() => handleSelectRole('RESIDENT')}
                disabled={fetchingDemo || loading}
                className={`p-3.5 sm:p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer min-h-[72px] ${
                  selectedRole === 'RESIDENT'
                    ? 'neu-pressed text-[#6C63FF] font-bold ring-2 ring-[#6C63FF]/40'
                    : 'neu-btn text-[#3D4852] hover:text-[#6C63FF]'
                }`}
                title="Autofill Resident demo credentials"
              >
                <span className="material-symbols-outlined text-[22px]">person</span>
                <span className="text-xs sm:text-sm font-bold tracking-tight">Resident</span>
                <span className="text-[10px] text-[#6B7280] font-normal hidden sm:inline">Portal access</span>
              </button>

              <button
                type="button"
                id="role-btn-committee"
                onClick={() => handleSelectRole('COMMITTEE')}
                disabled={fetchingDemo || loading}
                className={`p-3.5 sm:p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer min-h-[72px] ${
                  selectedRole === 'COMMITTEE'
                    ? 'neu-pressed text-[#6C63FF] font-bold ring-2 ring-[#6C63FF]/40'
                    : 'neu-btn text-[#3D4852] hover:text-[#6C63FF]'
                }`}
                title="Autofill Committee demo credentials"
              >
                <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
                <span className="text-xs sm:text-sm font-bold tracking-tight">Committee</span>
                <span className="text-[10px] text-[#6B7280] font-normal hidden sm:inline">Full triage access</span>
              </button>
            </div>
          </div>

          {/* Tactile Divider */}
          <div className="h-[2px] neu-inset-sm w-full rounded-full"></div>

          {/* Login Form */}
          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            {error && (
              <div className="p-3 rounded-xl neu-inset-sm text-xs font-semibold text-[#E53E3E] bg-[#FFF5F5]/40 flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-xs font-bold text-[#3D4852] flex items-center justify-between">
                <span>Username / Email</span>
                {selectedRole && (
                  <span className="text-[10px] text-[#6C63FF] font-semibold">
                    {selectedRole === 'RESIDENT' ? 'Resident Demo' : 'Committee Demo'}
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="resident@greenvalley.demo"
                  required
                  autoComplete="username"
                  className="w-full px-4 py-3 neu-input text-xs sm:text-sm text-[#3D4852] placeholder:text-[#9FAEC0] focus:ring-2 focus:ring-[#6C63FF]/40"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-xs font-bold text-[#3D4852]">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 neu-input text-xs sm:text-sm text-[#3D4852] placeholder:text-[#9FAEC0] focus:ring-2 focus:ring-[#6C63FF]/40"
                />
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading || fetchingDemo}
              className="mt-2 w-full py-3 sm:py-3.5 px-6 neu-btn-primary font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transition-all min-h-[46px]"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin"></span>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Subtle informational production note */}
        <div className="mt-6 text-center px-4">
          <p className="text-[11px] sm:text-xs text-[#6B7280] leading-relaxed max-w-sm">
            Competition demo uses shared demo credentials.
            <br />
            Production deployments should use individual accounts for each society member.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#E0E5EC] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#6C63FF]/30 border-t-[#6C63FF] rounded-full animate-spin"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
