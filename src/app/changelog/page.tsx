import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Sparkles, Tag, Calendar, CheckCircle2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sürüm Notları (Changelog) • Dersly',
  description: 'Dersly platformunda yayımlanan güncellemeler, yeni özellikler ve hata düzeltmeleri.',
};

export default function ChangelogPage() {
  const releases = [
    {
      version: 'v2.0.0',
      date: 'Ekim 2026',
      tag: 'Büyük Sürüm — Üretime Geçiş',
      changes: [
        'Kullanıcı Rolü Sadeleştirmesi: Veli rolü tamamen kaldırılarak sistem %100 Öğrenci ve Öğretmen odaklı hale getirildi.',
        'Google OAuth Entegrasyonu: Sunucu taraflı session exchange ve PKCE akışını yöneten /auth/callback route handler eklendi.',
        'Eksiksiz Kimlik Doğrulama: /register, /forgot-password ve /reset-password sayfaları devreye alındı.',
        'Kurumsal & Yasal Sayfalar: /kvkk, /cookies, /about, /features, /pricing, /faq ve /help sayfaları tamamlandı.',
        'WCAG & Lighthouse İyileştirmeleri: Mobil touch target alanları ve accessible name etiketleri optimize edildi.',
        'Statik robots.txt & Netlify Edge CDN optimizasyonu.',
      ],
    },
    {
      version: 'v1.5.0',
      date: 'Ekim 2026',
      tag: 'Özellik Güncellemesi',
      changes: [
        'Yapay Zeka Destekli Ders Koçu: Gemini 1.5 Flash API ile pedagojik adım adım ipucu veren asistan entegrasyonu.',
        'Çift Sosyal Ağ Mimarisi: Öğrenci Kampüsü ve yalnızca eğitmenlerin girebildiği Öğretmenler Odası modülleri.',
        'OCR Kitap Tarama: Soru bankası kapağını tarayıp kütüphaneye ekleme altyapısı.',
        'Supabase Storage Entegrasyonu: PDF ödev yükleme ve online inceleme kabiliyeti.',
      ],
    },
    {
      version: 'v1.0.0',
      date: 'Eylül 2026',
      tag: 'İlk Sürüm',
      changes: [
        'Ders ve takvim planlama modülü.',
        'TYT ve AYT net takip grafikleri.',
        'Özel ders saat bakiyesi ve kredi takip sistemi.',
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main id="main-content" className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}>
            <Tag className="w-3.5 h-3.5" />
            <span>Geliştirme Geçmişi</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Sürüm Notları (Changelog)</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Dersly&apos;ye eklenen tüm yenilikler, performans geliştirmeleri ve güvenlik iyileştirmeleri.
          </p>
        </div>

        <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-800">
          {releases.map((rel, idx) => (
            <div key={idx} className="relative pl-10 space-y-3">
              {/* Dot */}
              <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-500 border-4 border-slate-900" />

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-black text-white font-mono">{rel.version}</span>
                <span className="text-xs text-slate-400 font-mono">• {rel.date}</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {rel.tag}
                </span>
              </div>

              <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-2">
                <ul className="space-y-2 text-xs text-slate-300">
                  {rel.changes.map((ch, cIdx) => (
                    <li key={cIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{ch}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-800">
        Dersly © 2026 • Tüm Hakları Saklıdır.
      </footer>
    </div>
  );
}
