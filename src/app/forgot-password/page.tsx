'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { isRealSupabaseConfigured } from '@/lib/services/supabaseService';
import { ThemeSelector } from '@/components/theme/ThemeSelector';
import { 
  GraduationCap, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft 
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    if (isRealSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage(
            'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu (ve gerekiyorsa spam klasörünü) kontrol ediniz.'
          );
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Bir hata oluştu.';
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Local demo feedback
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMessage(
          'Simülasyon Modu: Şifre sıfırlama talebiniz simüle edildi. Gerçek Supabase bağlantısı yapılandırıldığında bu adrese tek seferlik bağlantı iletilecektir.'
        );
      }, 700);
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
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Giriş Yap
          </Link>
        </div>
      </header>

      {/* Center Card */}
      <main id="main-content" className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md rounded-3xl p-6 sm:p-8 glass-panel shadow-2xl relative overflow-hidden space-y-6">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold mb-2" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hesap Güvenliği</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Şifremi Unuttum</h1>
            <p className="text-xs text-slate-400">
              Dersly hesabınıza kayıtlı e-posta adresinizi girin, sıfırlama bağlantısını hemen iletelim.
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

          <form onSubmit={handleResetRequest} className="space-y-4">
            <div>
              <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-300 mb-1.5">Kayıtlı E-Posta Adresiniz</label>
              <div className="relative">
                <input
                  id="forgot-email"
                  type="email"
                  required
                  placeholder="ornek@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-transform hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              <span>{isLoading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-center">
            <Link href="/login" className="text-xs font-semibold text-slate-400 hover:text-white inline-flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Giriş ekranına dön</span>
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
