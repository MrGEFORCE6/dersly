'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { ThemeSelector } from '@/components/theme/ThemeSelector';
import { 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  CreditCard, 
  Database, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  UploadCloud,
  Bot,
  Smartphone,
  Check,
  Star,
  Users,
  Award,
  Zap,
  TrendingUp,
  FileText,
  ChevronRight,
  Shield,
  HelpCircle
} from 'lucide-react';

export default function Home() {
  const { accentClasses } = useTheme();

  // Pricing calculator state
  const [studentCount, setStudentCount] = useState(15);
  const baseMonthly = 50;
  const perStudent = 15;
  const calculatedTotal = baseMonthly + studentCount * perStudent;

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* 1. Cam Efektli (Backdrop-Blur) Navbar */}
      <header className="sticky top-0 z-50 transition-colors glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight bg-gradient-to-r from-slate-100 via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                  DersPompa
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase font-semibold">
                  Eğitmen & Öğrenci Platformu
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-300">
              <Link href="/feed/students" className="hover:text-white transition-colors">Öğrenci Kampüsü ✨</Link>
              <Link href="/feed/teachers" className="hover:text-white transition-colors">Öğretmenler Odası 🔒</Link>
              <Link href="/parent" className="hover:text-white transition-colors">Veli Portalı</Link>
              <Link href="/student/library" className="hover:text-white transition-colors">Kitaplık (OCR)</Link>
              <a href="#fiyatlandirma" className="hover:text-white transition-colors">Fiyatlandırma</a>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <ThemeSelector />

            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 transition-all shadow-sm"
            >
              Giriş Yap
            </Link>

            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5"
              style={{ backgroundColor: 'var(--accent-primary)', boxShadow: 'var(--accent-glow)' }}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Öğretmen Portalı</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Lüks Hero Bölümü */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-800/60">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-25" style={{ background: 'var(--accent-primary)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-bold border transition-colors shadow-sm" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)', borderColor: 'var(--accent-border)' }}>
            <Sparkles className="w-4 h-4" />
            <span>Yeni Nesil Özel Ders Yönetimi • Canlı Supabase DB + Storage Entegrasyonu</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
            Özel Derslerinizi <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Ultra Premium
            </span> Düzeyde Yönetin
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Hocalar için 1 tıkla ders tamamlama ve otomatik kredi düşümü; öğrenciler için Instagram tarzı sınav neti vitrini, PDF ödev teslimi ve Sokratik yapay zeka ders koçu.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-xl transition-all hover:scale-105 flex items-center gap-2.5"
              style={{ backgroundColor: 'var(--accent-primary)', boxShadow: 'var(--accent-glow)' }}
            >
              <GraduationCap className="w-5 h-5" />
              <span>Eğitmen Paneline Başla</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/mobile-preview"
              className="px-6 py-3.5 rounded-2xl text-slate-200 hover:text-white font-bold text-sm bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/80 transition-all flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>Öğrenci & Veli Mobil Demo</span>
            </Link>

            <Link
              href="/profile"
              className="px-5 py-3.5 rounded-2xl text-slate-300 hover:text-white font-semibold text-sm bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Sosyal Profil & Net Vitrini</span>
            </Link>
          </div>

          {/* Social Proof Strip */}
          <div className="pt-10 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400 border-t border-slate-800/60 max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Supabase RLS Güvenliği</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Sıfır Mock Veri • Canlı CRUD</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>PDF Supabase Storage Depolama</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. İnteraktif Özellik Kartları */}
      <section id="ozellikler" className="py-20 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider font-mono" style={{ color: 'var(--accent-text)' }}>
              Eksiksiz Ürün Mimarisi
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Özel Ders Koçluğunda İhtiyacınız Olan Her Şey
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Hem web hem mobil cihazlarda kusursuz çalışan, tam senkronize modüller.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Kart 1: Ders Yönetimi & Kredi Senkronizasyonu */}
            <div className="rounded-3xl p-6 glass-panel border border-slate-800 shadow-xl space-y-4 hover:border-indigo-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Canlı Ders & Otomatik Saat Düşümü</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hoca dersi tamamladığında öğrencinin paket kredisinden otomatik 1 saat düşer. Ders notları ve takvim doğrudan Supabase <code className="text-indigo-300">lessons</code> tablosuna yazılır.
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-emerald-400 font-mono">
                <span>✓ İki Yönlü Gerçek Zamanlı</span>
              </div>
            </div>

            {/* Kart 2: Supabase Storage PDF & Dosya Yükleme */}
            <div className="rounded-3xl p-6 glass-panel border border-slate-800 shadow-xl space-y-4 hover:border-purple-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Supabase Storage Dosya Yükleme</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Öğretmen ders föyü ve test yükler; öğrenci çözdüğü PDF veya görseli yükler. Dosyalar <code className="text-purple-300">homework-files</code> bucket&apos;ında depolanır ve tek tıkla açılır.
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-purple-400 font-mono">
                <span>✓ PDF & Görsel Desteği</span>
              </div>
            </div>

            {/* Kart 3: Instagram Tarzı Sosyal Netler */}
            <div className="rounded-3xl p-6 glass-panel border border-slate-800 shadow-xl space-y-4 hover:border-pink-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Instagram Tarzı Profil & Netler</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Her öğrencinin benzersiz <code className="text-pink-300">@kullaniciadi</code>, biyografisi, avatarı ve TYT/AYT net istatistik vitrini bulunur. Gizlilik seviyesi öğrenci kontrolündedir.
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-pink-400 font-mono">
                <span>✓ TYT & AYT Canlı İstatistik</span>
              </div>
            </div>

            {/* Kart 4: Sokratik AI Öğrenci Koçu */}
            <div className="rounded-3xl p-6 glass-panel border border-slate-800 shadow-xl space-y-4 hover:border-emerald-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Yapay Zeka Sokratik Koç</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Öğrenci takıldığı soruyu sorduğunda cevabı doğrudan vermek yerine adım adım ipucu veren, motive eden pedagojik AI asistanı.
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-emerald-400 font-mono">
                <span>✓ 7/24 Yanıt & Rehberlik</span>
              </div>
            </div>

            {/* Kart 5: Kullanıcı Kontrollü Tema Motoru */}
            <div className="rounded-3xl p-6 glass-panel border border-slate-800 shadow-xl space-y-4 hover:border-amber-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">4 Vurgu Rengi & Koyu/Açık Tema</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Emerald, Sapphire, Lavender ve Amber renk paletleri. Light (Ferah Açık), Dark (Derin Lüks Slate) ve System modları.
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-amber-400 font-mono">
                <span>✓ next-themes + CSS Değişkenleri</span>
              </div>
            </div>

            {/* Kart 6: Mobil Expo React Native Desteği */}
            <div className="rounded-3xl p-6 glass-panel border border-slate-800 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Öğrenci & Veli Mobil Deneyimi</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Expo SDK 52 tabanlı mobil uygulama mimarisi ve web üzerinden anlık test edilebilen canlı mobil simülatörü.
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-blue-400 font-mono">
                <span>✓ iOS & Android Uyumlu</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Veli, Öğrenci & Öğretmen Avantajları */}
      <section id="veli-ogrenci" className="py-20 border-b border-slate-800/60 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-indigo-400">
              Taraflar İçin Şeffaflık
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Herkes İçin Güven ve Takip Kolaylığı
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300">
                👨‍🏫 Öğretmen İçin
              </span>
              <h4 className="text-base font-bold text-white">Ders Kaçırma & Saat Karışıklığına Son</h4>
              <ul className="text-xs text-slate-300 space-y-2">
                <li>• Tek tıkla ders tamamlama (-1 saat otomatik)</li>
                <li>• Öğrencilerin kalan kredi saatlerini canlı izleme</li>
                <li>• Ödevleri PDF olarak açıp notlandırma</li>
                <li>• Aylık kazanç ve dinamik abonelik faturası</li>
              </ul>
            </div>

            <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300">
                👩‍🎓 Öğrenci İçin
              </span>
              <h4 className="text-base font-bold text-white">Hedefe Yürürken Motivasyon & Koçluk</h4>
              <ul className="text-xs text-slate-300 space-y-2">
                <li>• TYT / AYT Net vitrini ve soru hedefi çubuğu</li>
                <li>• Çözülen soruları fotoğrafla/PDF ile tek tıkla teslim</li>
                <li>• Takıldığı sorularda 7/24 Sokratik AI desteği</li>
                <li>• Yaklaşan dersler ve geri sayım sayacı</li>
              </ul>
            </div>

            <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-300">
                👨‍👩‍👧 Veli İçin
              </span>
              <h4 className="text-base font-bold text-white">Tam Finansal Şeffaflık & İç Huzuru</h4>
              <ul className="text-xs text-slate-300 space-y-2">
                <li>• Çocuğunun kalan ders saatini anlık görme</li>
                <li>• Yapılan ödemelerin ve dekontların dökümü</li>
                <li>• Ders öncesi otomatik WhatsApp / SMS hatırlatıcı</li>
                <li>• Çocuğunun deneme net gelişim grafiği</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Fiyatlandırma Hesaplayıcı Bölümü */}
      <section id="fiyatlandirma" className="py-20 border-b border-slate-800/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-emerald-400">
              Şeffaf ve Adil Fiyatlandırma
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Öğretmenler İçin Aylık Kullanım Ücreti
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Sadece aktif olarak ders verdiğiniz öğrenci sayısı kadar ödeyin. Gizli maliyet yok.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 shadow-2xl space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    Aktif Öğrenci Sayınız: <strong className="text-white text-base font-mono">{studentCount} Kişi</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={studentCount}
                    onChange={(e) => setStudentCount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>1 Öğrenci</span>
                    <span>25 Öğrenci</span>
                    <span>50 Öğrenci</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between pb-1 border-b border-slate-800">
                    <span>Platform Taban Ücreti</span>
                    <span className="font-mono text-white">50 ₺ / ay</span>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-slate-800">
                    <span>Aktif Öğrenci Başı ({studentCount} × 15 ₺)</span>
                    <span className="font-mono text-white">{studentCount * perStudent} ₺ / ay</span>
                  </div>
                </div>
              </div>

              {/* Total Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-tr from-indigo-950/60 to-slate-900 border border-indigo-500/30 text-center space-y-3">
                <span className="text-xs text-indigo-300 font-semibold block">Toplam Aylık Tutar</span>
                <div className="text-4xl sm:text-5xl font-black text-white font-mono">
                  {calculatedTotal} <span className="text-lg font-normal text-indigo-300">₺/ay</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Tüm özellikler, sınırsız ders takvimi ve PDF storage depolama dahil.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-block w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
                >
                  14 Gün Ücretsiz Dene
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer id="guvenlik" className="py-12 border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-base text-white">DersPompa</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Özel ders öğretmenleri ve öğrencileri için uçtan uca modern ders, ödev ve kredi yönetim platformu.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Supabase RLS & Storage Güvenliği</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-xs">Hızlı Bağlantılar</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Eğitmen Portalı</Link></li>
              <li><Link href="/student" className="hover:text-white transition-colors">Öğrenci & Veli Portalı</Link></li>
              <li><Link href="/profile" className="hover:text-white transition-colors">Sosyal Profil & Netler</Link></li>
              <li><Link href="/settings" className="hover:text-white transition-colors">Tema & Ayarlar</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-xs">Teknoloji Yığını</h4>
            <ul className="space-y-2 text-[11px]">
              <li>Next.js 16 (App Router + Turbopack)</li>
              <li>Supabase SSR (Auth + DB + Storage)</li>
              <li>Tailwind CSS v4 + Tema Motoru</li>
              <li>Expo SDK 52 (React Native)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-xs">Güvenlik & Gizlilik</h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Öğrenci sınav istatistikleri ve veli iletişim bilgileri Row Level Security (RLS) politikalarıyla korunmaktadır.
            </p>
            <span className="text-[10px] font-mono text-indigo-400">v1.0 Production Ready</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-slate-900 text-center text-[11px] text-slate-600">
          DersPompa © 2026 • Tüm Hakları Saklıdır.
        </div>
      </footer>
    </div>
  );
}
