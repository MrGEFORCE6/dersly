'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  MessageSquare, 
  Sun, 
  Moon, 
  Laptop, 
  LogOut, 
  Menu, 
  X, 
  Sparkles,
  HelpCircle,
  Palette
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import type { UserRole, AccentColor } from '@/types/database.types';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, setMode, accent, setAccent, accentClasses, resolvedMode } = useTheme();

  const [userRole, setUserRole] = useState<UserRole>('teacher');
  const [userName, setUserName] = useState<string>('Ahmet Hoca');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteMenuOpen, setPaletteMenuOpen] = useState(false);

  useEffect(() => {
    // Detect role from cookies or path
    const cookieMatch =
      document.cookie.match(/dersly_user_role=([^;]+)/) ||
      document.cookie.match(/derspompa_user_role=([^;]+)/);
    if (cookieMatch) {
      setUserRole(cookieMatch[1] as UserRole);
    } else if (pathname.startsWith('/student') || pathname.startsWith('/feed/students')) {
      setUserRole('student');
      setUserName('Zeynep Kaya');
    } else if (pathname.startsWith('/dashboard') || pathname.startsWith('/feed/teachers')) {
      setUserRole('teacher');
      setUserName('Ahmet Hoca');
    }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    document.cookie = 'dersly_auth_token=; path=/; max-age=0';
    document.cookie = 'dersly_user_role=; path=/; max-age=0';
    document.cookie = 'dersly_user_id=; path=/; max-age=0';
    document.cookie = 'derspompa_auth_token=; path=/; max-age=0';
    document.cookie = 'derspompa_user_role=; path=/; max-age=0';
    document.cookie = 'derspompa_user_id=; path=/; max-age=0';
    router.push('/login');
  };

  const accents: { id: AccentColor; name: string; color: string }[] = [
    { id: 'sapphire', name: 'Safir', color: '#2563eb' },
    { id: 'emerald', name: 'Zümrüt', color: '#10b981' },
    { id: 'lavender', name: 'Lavanta', color: '#8b5cf6' },
    { id: 'amber', name: 'Amber', color: '#f59e0b' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-stone-200/80 dark:border-slate-800/80 bg-[#FBFBF9]/90 dark:bg-[#0F172A]/90 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-slate-100">
                Dersly
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-1 hidden sm:inline">
              Akıllı Özel Ders & Akademi
            </span>
          </div>
        </Link>

        {/* Role-based Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {/* TEACHER LINKS */}
          {userRole === 'teacher' && (
            <>
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname.startsWith('/dashboard')
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-stone-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-stone-100/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Eğitmen Paneli
              </Link>

              <Link
                href="/feed/teachers"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname.startsWith('/feed/teachers')
                    ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm border border-amber-200 dark:border-amber-900/50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-stone-100/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                Öğretmenler Odası 🔒
              </Link>
            </>
          )}

          {/* STUDENT LINKS */}
          {userRole === 'student' && (
            <>
              <Link
                href="/student"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname === '/student'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-stone-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-stone-100/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Derslerim
              </Link>

              <Link
                href="/student/library"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname.startsWith('/student/library')
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-stone-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-stone-100/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Kitaplığım 📚
              </Link>
            </>
          )}

          {/* COMMON SOCIAL LINKS */}
          <Link
            href="/feed/students"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              pathname.startsWith('/feed/students')
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-stone-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-stone-100/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Öğrenci Kampüsü
          </Link>

          <Link
            href="/messages"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              pathname.startsWith('/messages') || pathname.startsWith('/chat')
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-stone-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-stone-100/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Mesajlar (DM)
          </Link>
        </nav>

        {/* Right Controls: Role Switch, Accent, Theme, Profile */}
        <div className="flex items-center gap-2">
          {/* Quick Role Emulator Switcher */}
          <div className="hidden lg:flex items-center bg-stone-200/60 dark:bg-slate-800/60 p-0.5 rounded-xl border border-stone-300/40 dark:border-slate-700/60">
            <button
              onClick={() => {
                setUserRole('teacher');
                document.cookie = 'dersly_user_role=teacher; path=/; max-age=604800; SameSite=Lax';
                document.cookie = 'derspompa_user_role=teacher; path=/; max-age=604800; SameSite=Lax';
                if (pathname.startsWith('/student')) router.push('/dashboard');
              }}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                userRole === 'teacher'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Öğretmen
            </button>
            <button
              onClick={() => {
                setUserRole('student');
                document.cookie = 'dersly_user_role=student; path=/; max-age=604800; SameSite=Lax';
                document.cookie = 'derspompa_user_role=student; path=/; max-age=604800; SameSite=Lax';
                if (pathname.startsWith('/dashboard') || pathname.startsWith('/feed/teachers')) router.push('/student');
              }}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                userRole === 'student'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Öğrenci
            </button>
          </div>

          {/* Accent Color Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPaletteMenuOpen(!paletteMenuOpen)}
              aria-label="Vurgu rengi paleti ayarları"
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              title="Vurgu Rengi"
            >
              <Palette className="w-4 h-4" />
            </button>

            {paletteMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 p-2 shadow-xl z-50 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 px-2 py-1">Vurgu Paleti</span>
                {accents.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => {
                      setAccent(acc.id);
                      setPaletteMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                      accent === acc.id ? 'bg-stone-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400 hover:bg-stone-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: acc.color }} />
                    {acc.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Mode Toggle (Warm Paper Light vs Dark) */}
          <button
            onClick={() => setMode(resolvedMode === 'dark' ? 'light' : 'dark')}
            aria-label={resolvedMode === 'dark' ? 'Açık sıcak kağıt moduna geç' : 'Karanlık gece moduna geç'}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            title={resolvedMode === 'dark' ? 'Sıcak Kağıt Moduna Geç (#FBFBF9)' : 'Karanlık Gece Moduna Geç (#0F172A)'}
          >
            {resolvedMode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>

          {/* User Profile Avatar Link */}
          <Link
            href="/profile"
            aria-label={`Kullanıcı profili: ${userName}`}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            <div className="w-8 h-8 rounded-full border-2 border-stone-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shrink-0">
              <img
                src={
                  userRole === 'teacher'
                    ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
                    : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
                }
                alt={userName}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden xl:inline">
              {userName}
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Navigasyon menüsünü aç veya kapat"
            className="md:hidden p-2 rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 border-t border-stone-200 dark:border-slate-800 bg-[#FBFBF9] dark:bg-[#0F172A] space-y-2">
          {userRole === 'teacher' && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800"
              >
                <Calendar className="w-4 h-4 text-indigo-500" /> Eğitmen Paneli
              </Link>
              <Link
                href="/feed/teachers"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800"
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" /> Öğretmenler Odası (Akademi)
              </Link>
            </>
          )}

          {userRole === 'student' && (
            <>
              <Link
                href="/student"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800"
              >
                <Calendar className="w-4 h-4 text-indigo-500" /> Derslerim & Ödevler
              </Link>
              <Link
                href="/student/library"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800"
              >
                <BookOpen className="w-4 h-4 text-indigo-500" /> Akıllı Kitaplığım
              </Link>
            </>
          )}

          <Link
            href="/feed/students"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" /> Öğrenci Kampüsü & Soru Havuzu
          </Link>

          <Link
            href="/messages"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800"
          >
            <MessageSquare className="w-4 h-4 text-indigo-500" /> Direkt Mesajlar (DM)
          </Link>

          <div className="pt-2 border-t border-stone-200 dark:border-slate-800 flex items-center justify-between">
            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-400"
            >
              Ayarlar
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" /> Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
