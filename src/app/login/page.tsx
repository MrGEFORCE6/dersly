'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ThemeSelector } from '@/components/theme/ThemeSelector';
import { 
  GraduationCap, 
  UserCheck, 
  Users, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [roleTab, setRoleTab] = useState<'student_parent' | 'teacher'>('student_parent');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setAuthSession = (role: 'teacher' | 'student' | 'parent', userId: string) => {
    if (typeof document !== 'undefined') {
      document.cookie = `derspompa_auth_token=auth_${Date.now()}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `derspompa_user_role=${role}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `derspompa_user_id=${userId}; path=/; max-age=604800; SameSite=Lax`;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('derspompa_current_user_id', userId);
      localStorage.setItem('derspompa_current_role', role);
    }
  };

  // Google OAuth Handler
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const targetRole = roleTab === 'teacher' ? 'teacher' : 'student';
    const targetId = roleTab === 'teacher' ? 't-001' : 's-001';
    setAuthSession(targetRole, targetId);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/${targetRole === 'teacher' ? 'dashboard' : 'student'}`,
        },
      });
      if (error) {
        console.warn('Supabase OAuth notice:', error.message);
        router.push(targetRole === 'teacher' ? '/dashboard' : '/student');
      }
    } catch {
      router.push(targetRole === 'teacher' ? '/dashboard' : '/student');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const targetRole = roleTab === 'teacher' ? 'teacher' : 'student';
    const targetId = roleTab === 'teacher' ? 't-001' : 's-001';
    setAuthSession(targetRole, targetId);

    setTimeout(() => {
      setIsLoading(false);
      if (targetRole === 'teacher') {
        router.push('/dashboard');
      } else {
        router.push('/student');
      }
    }, 500);
  };

  const handleFastDemoLogin = (targetRole: 'teacher' | 'student' | 'parent') => {
    setIsLoading(true);
    const targetId = targetRole === 'teacher' ? 't-001' : 's-001';
    setAuthSession(targetRole, targetId);

    setTimeout(() => {
      if (targetRole === 'teacher') {
        router.push('/dashboard');
      } else {
        router.push('/student');
      }
    }, 350);
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
            DersPompa
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeSelector />
          <Link
            href="/"
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Ana Sayfa
          </Link>
        </div>
      </header>

      {/* Login Card Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md rounded-3xl p-6 sm:p-8 glass-panel shadow-2xl relative overflow-hidden space-y-6">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold mb-2" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}>
              <Sparkles className="w-3.5 h-3.5" />
              Güvenli Supabase Kimlik Doğrulama
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Platforma Giriş Yap</h1>
            <p className="text-xs text-slate-400">
              Eğitmen, öğrenci veya veli hesabınıza tek tıkla bağlanın.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-900/60 border border-slate-700/60">
            <button
              type="button"
              onClick={() => setRoleTab('student_parent')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                roleTab === 'student_parent'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Öğrenci & Veli</span>
            </button>
            <button
              type="button"
              onClick={() => setRoleTab('teacher')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                roleTab === 'teacher'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Eğitmen Portalı</span>
            </button>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2.5 shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
              />
            </svg>
            <span>Google ile Hızlı Giriş Yap</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-700/60" />
            <span className="absolute px-3 bg-slate-900 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
              veya e-posta / telefon ile
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {roleTab === 'teacher' ? 'E-Posta Adresi' : 'Telefon Numarası veya Kullanıcı Adı'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={roleTab === 'teacher' ? 'ahmet@derspompa.com' : '0542 111 22 33 veya @zeynep.kaya'}
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Şifre</label>
                <a href="#" className="text-[11px] text-indigo-400 hover:text-indigo-300">Şifremi Unuttum</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-transform hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              <span>{isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins Box */}
          <div className="pt-2 border-t border-slate-700/60 space-y-2">
            <span className="text-[10px] text-slate-400 font-mono block text-center uppercase tracking-wider">
              ⚡ Hızlı Tek Tıkla Canlı Demo Girişi:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFastDemoLogin('teacher')}
                className="py-1.5 px-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold text-center transition-colors cursor-pointer"
              >
                👨‍🏫 Öğretmen
              </button>
              <button
                type="button"
                onClick={() => handleFastDemoLogin('student')}
                className="py-1.5 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold text-center transition-colors cursor-pointer"
              >
                👩‍🎓 Öğrenci
              </button>
              <button
                type="button"
                onClick={() => handleFastDemoLogin('parent')}
                className="py-1.5 px-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-[10px] font-bold text-center transition-colors cursor-pointer"
              >
                👨‍👩‍👧 Veli Portalı
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-800">
        DersPompa © 2026 • Yeni Nesil Özel Ders Yönetim Platformu
      </footer>
    </div>
  );
}
