'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { isRealSupabaseConfigured } from '@/lib/services/supabaseService';
import { ThemeSelector } from '@/components/theme/ThemeSelector';
import { 
  GraduationCap, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Eye, 
  EyeOff 
} from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 6) {
      setErrorMessage('Yeni şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMessage('Girdiğiniz şifreler birbiriyle eşleşmiyor.');
      return;
    }

    setIsLoading(true);

    if (isRealSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage('Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz...');
          setTimeout(() => {
            router.push('/login');
          }, 1500);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Şifre güncellenirken hata oluştu.';
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    } else {
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMessage('Şifreniz güncellendi (Demo Modu)! Giriş sayfasına yönlendiriliyorsunuz...');
        setTimeout(() => {
          router.push('/login');
        }, 1200);
      }, 600);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500 selection:text-white" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b transition-colors glass-nav">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-100 to-indigo-300 bg-clip-text text-transparent">
            Dersly
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeSelector />
        </div>
      </header>

      {/* Main Form */}
      <main id="main-content" className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md rounded-3xl p-6 sm:p-8 glass-panel shadow-2xl relative overflow-hidden space-y-6">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold mb-2" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Yeni Şifre Belirleme</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Şifrenizi Güncelleyin</h1>
            <p className="text-xs text-slate-400">
              Hesabınız için güçlü ve yeni bir şifre belirleyin.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-xs font-semibold text-slate-300 mb-1.5">Yeni Şifre</label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="En az 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="new-password-confirm" className="block text-xs font-semibold text-slate-300 mb-1.5">Yeni Şifre Tekrarı</label>
              <input
                id="new-password-confirm"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Şifreyi tekrar girin"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-transform hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              <span>{isLoading ? 'Kaydediliyor...' : 'Şifreyi Güncelle ve Giriş Yap'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-center">
            <Link href="/login" className="text-xs text-slate-400 hover:text-white">
              Giriş sayfasına geri dön
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-800">
        Dersly © 2026 • Yeni Nesil Özel Ders Yönetim Platformu
      </footer>
    </div>
  );
}
