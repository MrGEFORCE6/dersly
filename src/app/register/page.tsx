'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { isRealSupabaseConfigured } from '@/lib/services/supabaseService';
import { ThemeSelector } from '@/components/theme/ThemeSelector';
import { 
  GraduationCap, 
  Users, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  Lock,
  Mail,
  User
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [teacherBranch, setTeacherBranch] = useState('Matematik');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!acceptTerms) {
      setErrorMessage('Lütfen kullanım koşullarını ve gizlilik politikasını kabul ediniz.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Şifreniz en az 6 karakterden oluşmalıdır.');
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMessage('Girdiğiniz şifreler birbiriyle eşleşmiyor.');
      return;
    }

    setIsLoading(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    if (isRealSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName,
              role,
              branch: role === 'teacher' ? teacherBranch : null,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          setErrorMessage(error.message);
          setIsLoading(false);
          return;
        }

        if (data.user) {
          // Attempt to record in profiles table
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName,
            username: email.split('@')[0],
            role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          if (data.session) {
            // Logged in immediately
            const maxAge = 604800;
            document.cookie = `dersly_auth_token=auth_${data.user.id}; path=/; max-age=${maxAge}; SameSite=Lax`;
            document.cookie = `dersly_user_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
            document.cookie = `dersly_user_id=${data.user.id}; path=/; max-age=${maxAge}; SameSite=Lax`;
            setSuccessMessage('Hesabınız başarıyla oluşturuldu! Yönlendiriliyorsunuz...');
            setTimeout(() => {
              router.push(role === 'teacher' ? '/dashboard' : '/student');
            }, 1200);
          } else {
            // Email confirmation required
            setSuccessMessage(
              'Kaydınız alındı! Lütfen e-posta kutunuza gönderilen doğrulama bağlantısına tıklayarak hesabınızı onaylayın.'
            );
            setIsLoading(false);
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Kayıt işlemi sırasında beklenmeyen bir hata oluştu.';
        setErrorMessage(message);
        setIsLoading(false);
      }
    } else {
      // Local development simulation
      const simulatedId = role === 'teacher' ? 't-demo-new' : 's-demo-new';
      const maxAge = 604800;
      document.cookie = `dersly_auth_token=auth_${simulatedId}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `dersly_user_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `dersly_user_id=${simulatedId}; path=/; max-age=${maxAge}; SameSite=Lax`;
      
      setSuccessMessage('Hesabınız oluşturuldu! Sisteme yönlendiriliyorsunuz...');
      setTimeout(() => {
        setIsLoading(false);
        router.push(role === 'teacher' ? '/dashboard' : '/student');
      }, 1000);
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

      {/* Register Form Center */}
      <main id="main-content" className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-lg rounded-3xl p-6 sm:p-8 glass-panel shadow-2xl relative overflow-hidden space-y-6">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold mb-2" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ücretsiz Hesap Oluşturun</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Dersly&apos;ye Katılın</h1>
            <p className="text-xs text-slate-400">
              Eğitim yolculuğunuzu düzenlemek için rolünüzü seçip bilgilerinizi girin.
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

          {/* Role Choice */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Hesap Türü Seçin</label>
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-900/60 border border-slate-700/60">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  role === 'student'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Öğrenci Hesabı</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  role === 'teacher'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Öğretmen Portalı</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name and Surname */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-first-name" className="block text-xs font-semibold text-slate-300 mb-1.5">Adınız</label>
                <input
                  id="reg-first-name"
                  type="text"
                  required
                  placeholder="Zeynep"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="reg-last-name" className="block text-xs font-semibold text-slate-300 mb-1.5">Soyadınız</label>
                <input
                  id="reg-last-name"
                  type="text"
                  required
                  placeholder="Kaya"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-300 mb-1.5">E-Posta Adresi</label>
              <input
                id="reg-email"
                type="email"
                required
                placeholder="ornek@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Teacher Branch (if teacher) */}
            {role === 'teacher' && (
              <div>
                <label htmlFor="reg-branch" className="block text-xs font-semibold text-slate-300 mb-1.5">Branş / Uzmanlık Alanı</label>
                <select
                  id="reg-branch"
                  value={teacherBranch}
                  onChange={(e) => setTeacherBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Matematik">YKS / LGS Matematik</option>
                  <option value="Fizik">Fizik</option>
                  <option value="Kimya">Kimya</option>
                  <option value="Biyoloji">Biyoloji</option>
                  <option value="Türkçe & Edebiyat">Türkçe & Edebiyat</option>
                  <option value="İngilizce">İngilizce</option>
                  <option value="Diğer">Diğer Branş</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  🛡️ Öğretmen hesapları öğrenci ödev ve ders yönetim yetkilerine sahip olur.
                </span>
              </div>
            )}

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-300 mb-1.5">Şifre</label>
                <div className="relative">
                  <input
                    id="reg-password"
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
                <label htmlFor="reg-password-confirm" className="block text-xs font-semibold text-slate-300 mb-1.5">Şifre Tekrarı</label>
                <input
                  id="reg-password-confirm"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Şifreyi onaylayın"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Terms & Privacy checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="terms-checkbox"
                type="checkbox"
                required
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-800 cursor-pointer"
              />
              <label htmlFor="terms-checkbox" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
                <Link href="/terms" className="text-indigo-400 underline hover:text-indigo-300" target="_blank">
                  Kullanım Koşulları
                </Link>
                {', '}
                <Link href="/privacy" className="text-indigo-400 underline hover:text-indigo-300" target="_blank">
                  Gizlilik Politikası
                </Link>
                {' ve '}
                <Link href="/kvkk" className="text-indigo-400 underline hover:text-indigo-300" target="_blank">
                  KVKK Aydınlatma Metni
                </Link>
                &apos;ni okudum, kabul ediyorum.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-transform hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              <span>{isLoading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Already have an account */}
          <div className="pt-2 border-t border-slate-800 text-center">
            <span className="text-xs text-slate-400">Zaten bir hesabınız var mı? </span>
            <Link href="/login" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">
              Giriş Yapın
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
