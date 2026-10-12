'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { isRealSupabaseConfigured } from '@/lib/services/supabaseService';
import { ThemeSelector } from '@/components/theme/ThemeSelector';
import { 
  GraduationCap, 
  Users, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [roleTab, setRoleTab] = useState<'student' | 'teacher'>('student');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDevOptions, setShowDevOptions] = useState(false);
  const [isLiveBackend] = useState(() => isRealSupabaseConfigured());

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'missing_oauth_code') {
        setErrorMessage('OAuth onay kodu alınamadı veya oturum zaman aşımına uğradı.');
      } else if (errorParam === 'oauth_internal_error') {
        setErrorMessage('Giriş sağlayıcısıyla bağlantı kurulurken bir sorun oluştu.');
      } else {
        setErrorMessage(decodeURIComponent(errorParam));
      }
    }
  }, [searchParams]);

  const setAuthSession = (role: 'teacher' | 'student', userId: string) => {
    if (typeof document !== 'undefined') {
      const maxAge = 604800; // 7 days
      document.cookie = `dersly_auth_token=auth_${userId}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `dersly_user_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `dersly_user_id=${userId}; path=/; max-age=${maxAge}; SameSite=Lax`;

      // Legacy fallback cookies for compatibility
      document.cookie = `derspompa_auth_token=auth_${userId}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `derspompa_user_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `derspompa_user_id=${userId}; path=/; max-age=${maxAge}; SameSite=Lax`;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('dersly_current_user_id', userId);
      localStorage.setItem('dersly_current_role', role);
      localStorage.setItem('derspompa_current_user_id', userId);
      localStorage.setItem('derspompa_current_role', role);
    }
  };

  // Google OAuth Handler
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const targetRole = roleTab === 'teacher' ? 'teacher' : 'student';

    if (isLiveBackend) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?role=${targetRole}`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });
        if (error) {
          if (error.message.toLowerCase().includes('provider is not enabled') || error.message.toLowerCase().includes('unsupported provider')) {
            setErrorMessage(
              'Google Girişi için Supabase Dashboard > Authentication > Providers > Google alanından Google Client ID & Secret eklenmelidir. Şimdilik e-posta veya demo ile giriş yapabilirsiniz.'
            );
          } else {
            setErrorMessage(`Google kimlik doğrulaması başlatılamadı: ${error.message}`);
          }
          setIsLoading(false);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Google OAuth hatası';
        setErrorMessage(message);
        setIsLoading(false);
      }
    } else {
      // Offline / Local development fallback
      const targetId = roleTab === 'teacher' ? 't-001' : 's-001';
      setAuthSession(targetRole, targetId);
      router.push(targetRole === 'teacher' ? '/dashboard' : '/student');
    }
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const targetRole = roleTab === 'teacher' ? 'teacher' : 'student';

    if (isLiveBackend) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailOrPhone.trim(),
          password: password,
        });

        if (error) {
          setErrorMessage(
            error.message === 'Invalid login credentials'
              ? 'Geçersiz e-posta adresi veya şifre girdiniz.'
              : error.message
          );
          setIsLoading(false);
          return;
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();

          const resolvedRole: 'teacher' | 'student' =
            profile?.role === 'teacher'
              ? 'teacher'
              : profile?.role === 'student'
              ? 'student'
              : targetRole;
          setAuthSession(resolvedRole, data.user.id);

          if (resolvedRole === 'teacher') {
            router.push('/dashboard');
          } else {
            router.push('/student');
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Giriş işlemi gerçekleştirilemedi.';
        setErrorMessage(message);
        setIsLoading(false);
      }
    } else {
      // Local fallback
      const targetId = roleTab === 'teacher' ? 't-001' : 's-001';
      setAuthSession(targetRole, targetId);
      setTimeout(() => {
        setIsLoading(false);
        if (targetRole === 'teacher') {
          router.push('/dashboard');
        } else {
          router.push('/student');
        }
      }, 400);
    }
  };

  const handleDevTestLogin = (targetRole: 'teacher' | 'student') => {
    setIsLoading(true);
    const targetId = targetRole === 'teacher' ? 't-001' : 's-001';
    setAuthSession(targetRole, targetId);

    setTimeout(() => {
      if (targetRole === 'teacher') {
        router.push('/dashboard');
      } else {
        router.push('/student');
      }
    }, 250);
  };

  return (
    <div className="w-full max-w-md rounded-3xl p-6 sm:p-8 glass-panel shadow-2xl relative overflow-hidden space-y-6">
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold mb-2" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>Güvenli Kimlik Doğrulama</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">Platforma Giriş Yap</h1>
        <p className="text-xs text-slate-400">
          Öğrenci veya öğretmen hesabınıza güvenle bağlanın.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      {/* Role Tabs */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-900/60 border border-slate-700/60">
        <button
          type="button"
          onClick={() => setRoleTab('student')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            roleTab === 'student'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Öğrenci Girişi</span>
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
        className="w-full py-2.5 px-4 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2.5 shadow-sm cursor-pointer disabled:opacity-50"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
          veya e-posta / şifre ile
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleStandardLogin} className="space-y-4">
        <div>
          <label htmlFor="login-identifier" className="block text-xs font-semibold text-slate-300 mb-1.5">
            {roleTab === 'teacher' ? 'E-Posta Adresi' : 'E-Posta veya Kullanıcı Adı'}
          </label>
          <div className="relative">
            <input
              id="login-identifier"
              type="text"
              required
              placeholder={roleTab === 'teacher' ? 'ogretmen@dersly.app' : 'ogrenci@dersly.app veya @zeynep'}
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="text-xs font-semibold text-slate-300">Şifre</label>
            <Link href="/forgot-password" className="text-[11px] text-indigo-400 hover:text-indigo-300">Şifremi Unuttum</Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
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
              aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-transform hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent-primary)' }}
        >
          <span>{isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Register CTA */}
        <div className="text-center pt-1">
          <span className="text-xs text-slate-400">Henüz hesabınız yok mu? </span>
          <Link href="/register" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">
            Hemen Kayıt Olun
          </Link>
        </div>
      </form>

      {/* Developer / Quick Preview Toggle */}
      <div className="pt-2 border-t border-slate-800">
        <button
          type="button"
          onClick={() => setShowDevOptions(!showDevOptions)}
          className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 py-1 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Geliştirici & Hızlı Rol Testi</span>
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDevOptions ? 'rotate-180' : ''}`} />
        </button>

        {showDevOptions && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <p className="text-[10px] text-slate-400 leading-normal">
              Canlı Supabase kimlik sağlayıcısı yapılandırılana kadar rolleri yerel oturumla anında deneyebilirsiniz:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDevTestLogin('teacher')}
                className="py-1.5 px-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold text-center transition-colors cursor-pointer"
              >
                👨‍🏫 Öğretmen
              </button>
              <button
                type="button"
                onClick={() => handleDevTestLogin('student')}
                className="py-1.5 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold text-center transition-colors cursor-pointer"
              >
                👩‍🎓 Öğrenci
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
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
            href="/"
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Ana Sayfa
          </Link>
        </div>
      </header>

      {/* Login Card Center */}
      <main id="main-content" className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <Suspense fallback={<div className="text-white text-xs">Yükleniyor...</div>}>
          <LoginForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-800">
        Dersly © 2026 • Yeni Nesil Özel Ders Yönetim Platformu
      </footer>
    </div>
  );
}
