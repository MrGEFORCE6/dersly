'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { 
  Check, 
  Sparkles, 
  GraduationCap, 
  Users, 
  Building, 
  ArrowRight, 
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

export default function PricingPage() {
  const [studentCount, setStudentCount] = useState<number>(5);

  const baseTeacherPrice = 50;
  const perStudentPrice = 15;
  const calculatedMonthly = baseTeacherPrice + studentCount * perStudentPrice;

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main id="main-content" className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Şeffaf & Adil Fiyatlandırma</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            İhtiyacınıza Uygun Planı Seçin
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Öğrenciler için platform her zaman tamamen ücretsizdir. Öğretmenler ise yalnızca aktif öğrenci sayıları oranında öder.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Student Card */}
          <div className="p-7 rounded-3xl glass-panel border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span>🎓 Öğrenci Planı</span>
              </div>
              <div>
                <span className="text-3xl font-black text-white">0 ₺</span>
                <span className="text-xs text-slate-400"> / süresiz ücretsiz</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tüm YKS/LGS öğrencileri için platformun tüm öğrenme araçları tamamen ücretsizdir.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ders programı & takvim görüntüleme</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ödev & PDF dosya teslimi</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>TYT/AYT net grafikleri & hedef takibi</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Yapay Zeka Soru ve Ders Koçu</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>OCR Kitaplık & Öğrenci Kampüsü</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="w-full py-2.5 rounded-xl font-bold text-xs text-center text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 block"
            >
              Öğrenci Olarak Kaydol
            </Link>
          </div>

          {/* 2. Teacher Card (Highlighted) */}
          <div className="p-7 rounded-3xl glass-panel border-2 border-indigo-500 relative space-y-6 flex flex-col justify-between shadow-2xl shadow-indigo-500/10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Özel Ders Eğitmeni</span>
                </div>
                <span className="text-[10px] font-mono uppercase bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">
                  En Popüler
                </span>
              </div>

              <div>
                <span className="text-3xl font-black text-white">{calculatedMonthly} ₺</span>
                <span className="text-xs text-slate-400"> / ay ({studentCount} öğrenci için)</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Taban 50 ₺/ay + her aktif öğrenci için 15 ₺. Fazladan hiçbir komisyon kesilmez.
              </p>

              {/* Dynamic Range Slider */}
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Öğrenci Sayınız:</span>
                  <span className="font-bold text-white font-mono">{studentCount} Öğrenci</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={studentCount}
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Sınırsız ders saati & takvim kaydı</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Öğrenci kredi & paket bakiye takibi</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>PDF ödev atama & online teslim inceleme</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Öğretmenler Odası kapalı topluluğu</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Öğrenciye özel davet linki oluşturma</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="w-full py-2.5 rounded-xl font-bold text-xs text-center text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30 block"
            >
              14 Gün Ücretsiz Dene
            </Link>
          </div>

          {/* 3. Boutique Institution */}
          <div className="p-7 rounded-3xl glass-panel border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <span>🏢 Kurumsal / Dershane</span>
              </div>
              <div>
                <span className="text-3xl font-black text-white">Özel Teklif</span>
                <span className="text-xs text-slate-400"> / yıllık</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Çoklu öğretmen kadrosuna sahip butik eğitim kurumları ve etüt merkezleri için.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Çoklu öğretmen & şube yönetimi</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Kurumsal logo ve özel alan adı desteği</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Toplu öğrenci içe aktarma (Excel/CSV)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Öncelikli SLA & telefonla destek</span>
                </li>
              </ul>
            </div>

            <Link
              href="/contact"
              className="w-full py-2.5 rounded-xl font-bold text-xs text-center text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 block"
            >
              Kurumsal İletişime Geç
            </Link>
          </div>
        </div>

        {/* Guarantees */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">🛡️ 14 Gün İade Garantisi</h3>
            <p className="text-xs text-slate-400">Memnun kalmazsanız ilk 14 gün koşulsuz tam iade.</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">🔒 Gizli Ücret Yok</h3>
            <p className="text-xs text-slate-400">Ders başına veya öğrenci ödemesinden komisyon alınmaz.</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">⚡ İstediğiniz Zaman İptal</h3>
            <p className="text-xs text-slate-400">Taahhüt yok. Aboneliğinizi tek tıkla sonlandırabilirsiniz.</p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-800">
        Dersly © 2026 • Tüm Hakları Saklıdır.
      </footer>
    </div>
  );
}
