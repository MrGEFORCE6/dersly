'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { ThemeSelector } from '@/components/theme/ThemeSelector';
import { 
  GraduationCap, 
  Calendar, 
  UploadCloud,
  Bot,
  Smartphone,
  CheckCircle2, 
  Award, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Users,
  FileText,
  Mail,
  Shield,
  Scale
} from 'lucide-react';

export default function Home() {
  const { accentClasses } = useTheme();

  // Pricing calculator state with strictly bounded values [1, 100]
  const [studentCount, setStudentCount] = useState<number>(15);
  const baseMonthly = 50;
  const perStudent = 15;
  const safeStudentCount = Math.max(1, Math.min(100, Math.floor(Number(studentCount) || 1)));
  const calculatedTotal = baseMonthly + safeStudentCount * perStudent;

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* 1. Cam Efektli (Backdrop-Blur) Navbar */}
      <header className="sticky top-0 z-50 transition-colors glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group" aria-label="Dersly - Özel Ders ve Öğrenci Yönetimi">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform text-white">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight bg-gradient-to-r from-slate-100 via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                  Dersly
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase font-semibold">
                  Özel Ders & Öğrenci Yönetimi
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-300" aria-label="Ana Menü">
              <Link href="/features" className="hover:text-white transition-colors">Özellikler</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Fiyatlandırma</Link>
              <Link href="/feed/students" className="hover:text-white transition-colors">Öğrenci Kampüsü ✨</Link>
              <Link href="/feed/teachers" className="hover:text-white transition-colors">Öğretmenler Odası 🔒</Link>
              <Link href="/faq" className="hover:text-white transition-colors">S.S.S.</Link>
              <Link href="/help" className="hover:text-white transition-colors">Yardım</Link>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <ThemeSelector />

            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              Giriş Yap
            </Link>

            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              style={{ backgroundColor: 'var(--accent-primary)', boxShadow: 'var(--accent-glow)' }}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Öğretmen Portalı</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area with Skip Target */}
      <main id="main-content" className="flex-1">
        {/* 2. Lüks Hero Bölümü */}
        <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-800/60" aria-labelledby="hero-heading">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-25" style={{ background: 'var(--accent-primary)' }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-bold border transition-colors shadow-sm" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)', borderColor: 'var(--accent-border)' }}>
              <Sparkles className="w-4 h-4" />
              <span>Yeni Nesil Özel Ders Yönetimi • Akıllı Takvim ve Kütüphane</span>
            </div>

            <h1 id="hero-heading" className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
              Özel Ders Süreçlerinizi <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Profesyonelce
              </span> Yönetin
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Öğretmenler için tek tıkla ders tamamlama ve otomatik kredi düşümü; öğrenciler için sınav neti vitrini, PDF ödev teslimi ve Sokratik yapay zeka ders koçu.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/dashboard"
                className="px-6 py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-xl transition-all hover:scale-105 flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                style={{ backgroundColor: 'var(--accent-primary)', boxShadow: 'var(--accent-glow)' }}
              >
                <GraduationCap className="w-5 h-5" />
                <span>Eğitmen Paneline Başla</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/mobile-preview"
                className="px-6 py-3.5 rounded-2xl text-slate-200 hover:text-white font-bold text-sm bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/80 transition-all flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              >
                <Smartphone className="w-4 h-4 text-purple-400" />
                <span>Öğrenci & Veli Arayüzü</span>
              </Link>

              <Link
                href="/profile"
                className="px-5 py-3.5 rounded-2xl text-slate-300 hover:text-white font-semibold text-sm bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 transition-all flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Sosyal Profil & Net Vitrini</span>
              </Link>
            </div>

            {/* Trust Badges Strip (Jargon-free) */}
            <div className="pt-10 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400 border-t border-slate-800/60 max-w-3xl mx-auto">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Banka Düzeyinde Veri İzolasyonu</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Anlık ve Güvenli Veri Akışı</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Güvenilir ve Kesintisiz Altyapı</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. İnteraktif Özellik Kartları */}
        <section id="ozellikler" className="py-20 border-b border-slate-800/60" aria-labelledby="features-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider font-mono" style={{ color: 'var(--accent-text)' }}>
                Eksiksiz Ürün Mimarisi
              </span>
              <h2 id="features-heading" className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Özel Ders Koçluğunda İhtiyacınız Olan Her Şey
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Öğretmen, öğrenci ve veli arasında kesintisiz eşzamanlı çalışan modern modüller.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Kart 1: Ders Yönetimi & Kredi Senkronizasyonu */}
              <article className="rounded-3xl p-6 glass-panel border border-slate-800 shadow-xl space-y-4 hover:border-indigo-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Canlı Ders & Otomatik Saat Düşümü</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Öğretmen dersi tamamladığında öğrencinin paket kredisinden otomatik 1 saat düşer. Ders notları ve takvim anında veli ve öğrenci kartlarına yansır.
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-emerald-400 font-mono">
                  <span>✓ İki Yönlü Gerçek Zamanlı</span>
                </div>
              </article>

              {/* Kart 2: Dosya & Materyal Depolama */}
              <article className="rounded-3xl p-6 glass-panel border border-slate-800 shadow-xl space-y-4 hover:border-purple-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Güvenli PDF & Materyal Paylaşımı</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Öğretmen ders föyü ve çalışma planı yükler; öğrenci çözdüğü soruların fotoğraf veya PDF ödevlerini tek tıkla teslim eder.
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-purple-400 font-mono">
                  <span>✓ PDF & Görsel Depolama</span>
                </div>
              </article>

              {/* Kart 3: Sınav Neti & Sosyal Profil */}
              <article className="rounded-3xl p-6 glass-panel border border-slate-800 shadow-xl space-y-4 hover:border-pink-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Sınav Net Vitrini & Öğrenci Profili</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Öğrencinin benzersiz kullanıcı adı, biyografisi ve TYT/AYT net istatistik vitrini bulunur. Gizlilik seviyesi tamamen öğrenci kontrolündedir.
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-pink-400 font-mono">
                  <span>✓ TYT & AYT Canlı İstatistik</span>
                </div>
              </article>

              {/* Kart 4: Sokratik AI Öğrenci Koçu */}
              <article className="rounded-3xl p-6 glass-panel border border-slate-800 shadow-xl space-y-4 hover:border-emerald-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Yapay Zeka Sokratik Koç</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Öğrenci takıldığı soruyu sorduğunda cevabı doğrudan vermek yerine adım adım ipucu veren, motive eden pedagojik AI rehber.
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-emerald-400 font-mono">
                  <span>✓ 7/24 Yanıt & Rehberlik</span>
                </div>
              </article>

              {/* Kart 5: Kullanıcı Kontrollü Tema Motoru */}
              <article className="rounded-3xl p-6 glass-panel border border-slate-800 shadow-xl space-y-4 hover:border-amber-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Warm Paper & Lüks Gece Teması</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Gözü yormayan sıcak fildişi (Warm Paper) ve derin lüks slate (Dark) modları; Sapphire, Emerald, Lavender ve Amber vurgu paletleri.
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-amber-400 font-mono">
                  <span>✓ Canlı Renk Kişiselleştirme</span>
                </div>
              </article>

              {/* Kart 6: Öğrenci Kitaplığı & OCR Tarama */}
              <article className="rounded-3xl p-6 glass-panel border border-slate-800 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Akıllı Kitaplık & OCR Tarama</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Öğrenci elindeki kaynak kitapları kamerasından taratarak içindekiler konularını otomatik dijital kütüphanesine kaydeder.
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-blue-400 font-mono">
                  <span>✓ Gemini Vision OCR Desteği</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 4. Veli, Öğrenci & Öğretmen Avantajları */}
        <section id="veli-ogrenci" className="py-20 border-b border-slate-800/60 bg-slate-950/40" aria-labelledby="stakeholders-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-indigo-400">
                Taraflar İçin Şeffaflık
              </span>
              <h2 id="stakeholders-heading" className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Herkes İçin Güven ve Takip Kolaylığı
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <article className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 inline-block">
                  👨‍🏫 Öğretmen İçin
                </span>
                <h3 className="text-base font-bold text-white">Ders Kaçırma & Saat Karışıklığına Son</h3>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li>• Tek tıkla ders tamamlama (-1 saat otomatik)</li>
                  <li>• Öğrencilerin kalan kredi saatlerini canlı izleme</li>
                  <li>• Ödevleri PDF olarak açıp notlandırma</li>
                  <li>• Aylık kazanç ve dinamik abonelik faturası</li>
                </ul>
              </article>

              <article className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 inline-block">
                  👩‍🎓 Öğrenci İçin
                </span>
                <h3 className="text-base font-bold text-white">Hedefe Yürürken Motivasyon & Koçluk</h3>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li>• TYT / AYT Net vitrini ve soru hedefi çubuğu</li>
                  <li>• Çözülen soruları fotoğrafla/PDF ile tek tıkla teslim</li>
                  <li>• Takıldığı sorularda 7/24 Sokratik AI desteği</li>
                  <li>• Yaklaşan dersler ve geri sayım sayacı</li>
                </ul>
              </article>

              <article className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-300 inline-block">
                  👨‍👩‍👧 Veli İçin
                </span>
                <h3 className="text-base font-bold text-white">Tam Finansal Şeffaflık & İç Huzuru</h3>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li>• Çocuğunun kalan ders saatini anlık görme</li>
                  <li>• Yapılan ödemelerin ve dekontların dökümü</li>
                  <li>• Öğretmenin bıraktığı sesli ders değerlendirmeleri</li>
                  <li>• Çocuğunun deneme net gelişim grafiği</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* 5. Fiyatlandırma Hesaplayıcı Bölümü */}
        <section id="fiyatlandirma" className="py-20 border-b border-slate-800/60" aria-labelledby="pricing-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-emerald-400">
                Şeffaf ve Adil Fiyatlandırma
              </span>
              <h2 id="pricing-heading" className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Öğretmenler İçin Aylık Kullanım Ücreti
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Sadece aktif olarak ders verdiğiniz öğrenci sayısı kadar ödeyin. Gizli maliyet veya taahhüt yok.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 shadow-2xl space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="student-count-slider" className="text-xs font-semibold text-slate-300 block mb-2">
                      Aktif Öğrenci Sayınız: <strong className="text-white text-base font-mono">{safeStudentCount} Kişi</strong>
                    </label>
                    <input
                      id="student-count-slider"
                      name="student-count-slider"
                      type="range"
                      min={1}
                      max={100}
                      step={1}
                      aria-label="Aktif Öğrenci Sayısı"
                      value={safeStudentCount}
                      onChange={(e) => setStudentCount(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                      <span>1 Öğrenci</span>
                      <span>50 Öğrenci</span>
                      <span>100 Öğrenci</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between pb-1 border-b border-slate-800">
                      <span>Platform Taban Ücreti</span>
                      <span className="font-mono text-white">50 ₺ / ay</span>
                    </div>
                    <div className="flex justify-between pb-1 border-b border-slate-800">
                      <span>Aktif Öğrenci Başı ({safeStudentCount} × 15 ₺)</span>
                      <span className="font-mono text-white">{safeStudentCount * perStudent} ₺ / ay</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">
                    * Fiyatlarımıza KDV dahil değildir. İstediğiniz zaman koşulsuz iptal edebilirsiniz.
                  </p>
                </div>

                {/* Total Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-tr from-indigo-950/60 to-slate-900 border border-indigo-500/30 text-center space-y-3">
                  <h3 className="text-xs text-indigo-300 font-semibold block">Toplam Aylık Tutar</h3>
                  <div className="text-4xl sm:text-5xl font-black text-white font-mono">
                    {calculatedTotal} <span className="text-lg font-normal text-indigo-300">₺/ay</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Tüm özellikler, sınırsız ders takvimi ve güvenli dosya depolama dahil.
                  </p>
                  <Link
                    href="/dashboard"
                    className="inline-block w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                  >
                    14 Gün Ücretsiz Dene
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Footer (Kurumsal & Yasal Bağlantılar - E-E-A-T Sinyalleri) */}
      <footer id="guvenlik" className="py-12 border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs" aria-label="Sayfa Altı Kurumsal Bilgiler">
        <h2 className="sr-only">Kurumsal ve Yasal Bilgiler</h2>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-base text-white">Dersly</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Özel ders öğretmenleri ve öğrencileri için uçtan uca modern ders, ödev ve kredi yönetim platformu.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Banka Düzeyinde Veri İzolasyonu</span>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white mb-3 text-xs">Hızlı Bağlantılar</h3>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/dashboard" className="py-1.5 inline-flex items-center hover:text-white transition-colors">Öğretmen Portalı</Link></li>
              <li><Link href="/student" className="py-1.5 inline-flex items-center hover:text-white transition-colors">Öğrenci Portalı</Link></li>
              <li><Link href="/features" className="py-1.5 inline-flex items-center hover:text-white transition-colors">Platform Özellikleri</Link></li>
              <li><Link href="/pricing" className="py-1.5 inline-flex items-center hover:text-white transition-colors">Fiyatlandırma & Planlar</Link></li>
              <li><Link href="/feed/students" className="py-1.5 inline-flex items-center hover:text-white transition-colors">Öğrenci Kampüsü</Link></li>
              <li><Link href="/faq" className="py-1.5 inline-flex items-center hover:text-white transition-colors">Sık Sorulan Sorular</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-3 text-xs">Kurumsal & Yasal</h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/about" className="py-1.5 hover:text-white transition-colors inline-flex items-center gap-1.5">
                  <span>Hakkımızda</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="py-1.5 hover:text-white transition-colors inline-flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Gizlilik Politikası</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="py-1.5 hover:text-white transition-colors inline-flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kullanım Koşulları</span>
                </Link>
              </li>
              <li>
                <Link href="/kvkk" className="py-1.5 hover:text-white transition-colors inline-flex items-center gap-1.5">
                  <span>KVKK Aydınlatma Metni</span>
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="py-1.5 hover:text-white transition-colors inline-flex items-center gap-1.5">
                  <span>Çerez Politikası</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="py-1.5 hover:text-white transition-colors inline-flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>İletişim & Destek</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-3 text-xs">Şeffaflık & Güvenlik</h3>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Öğrenci akademik verileri ve öğretmen eğitim materyalleri PostgreSQL satır düzeyinde veri izolasyonu (RLS) politikalarıyla korunmaktadır.
            </p>
            <div className="space-y-1 text-xs">
              <div><Link href="/status" className="text-indigo-400 hover:text-indigo-300 transition-colors">Sistem Durumu (Status) 🟢</Link></div>
              <div><Link href="/changelog" className="text-slate-400 hover:text-slate-200 transition-colors">Sürüm Notları (Changelog)</Link></div>
              <div><Link href="/roadmap" className="text-slate-400 hover:text-slate-200 transition-colors">Geliştirme Planı (Roadmap)</Link></div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
          Dersly © 2026 • Tüm Hakları Saklıdır.
        </div>
      </footer>
    </div>
  );
}
