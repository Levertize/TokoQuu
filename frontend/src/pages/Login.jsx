import React, { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useToastStore } from '../stores/useToastStore';
import { IconLock, IconUser, IconLoader } from '@tabler/icons-react';

/**
 * Login page component. Provides credentials authentication form with loading indicators.
 * @returns {React.ReactElement}
 */
export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const showToast = useToastStore((state) => state.showToast);

  /**
   * Handles submission of the credentials login form.
   * @param {React.FormEvent} e 
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast('Username dan password harus diisi!', 'warning');
      return;
    }

    const result = await login(username, password);
    if (result.success) {
      showToast('Selamat datang kembali di TokoQuu!', 'success');
    } else {
      showToast(result.error || 'Username atau password salah!', 'error');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 transition-colors duration-300">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 shadow-card hover:shadow-hover transition-all duration-300">
        
        {/* Logo and Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary-light text-primary mb-3">
            <span className="text-2xl font-black">TQ</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text">TokoQuu Kasir</h1>
          <p className="mt-1.5 text-xs font-semibold text-text-secondary">
            Masuk untuk mengelola produk dan kasir toko Anda
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-[0.5px]">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                <IconUser size={18} />
              </span>
              <input
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="w-full rounded border border-border bg-bg py-2.5 pl-10 pr-4 text-xs font-medium text-text placeholder-text-muted outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-[0.5px]">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                <IconLock size={18} />
              </span>
              <input
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full rounded border border-border bg-bg py-2.5 pl-10 pr-4 text-xs font-medium text-text placeholder-text-muted outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded bg-primary py-2.5 text-xs font-bold text-white shadow-card hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-75"
          >
            {loading ? (
              <>
                <IconLoader size={16} className="spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>Masuk Sekarang</span>
            )}
          </button>
        </form>

        {/* Demo Account Tip Alert */}
        <div className="mt-6 rounded border border-border bg-bg/50 p-3 text-center">
          <p className="text-[11px] font-semibold text-text-secondary">
            Kredensial Demo: <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-text font-bold">admin</code> / <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-text font-bold">password123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
