import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Compass, CheckCircle2, Clock, Sparkles, Smartphone, Mic, BarChart2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Geliştirme Planı (Roadmap) • Dersly',
  description: 'Dersly ürün ekibinin üzerinde çalıştığı ve planladığı gelecek özellikler.',
};

export default function RoadmapPage() {
  const roadmapStages = [
    {
      quarter: 'Mevcut Aşama (Tamamlandı)',
      status: 'Tamamlandı',
      items: [
        {
          title: 'Tam Web Üretim Altyapısı & Rol Optimizasyonu',
          desc: 'Öğrenci ve öğretmen odaklı iki rollü güvenli erişim mimarisi, Supabase RLS ve Google OAuth entegrasyonu.',
        },
        {
          title: 'Yapay Zeka Özel Ders Koçu',
          desc: 'Gemini 1.5 Flash destekli interaktif soru yönlendirme motoru.',
        },
        {
          title: 'Çift Sosyal Ağ Mimarisi',
          desc: 'Öğrenci Kampüsü ve bağımsız Öğretmenler Odası topluluk duvarları.',
        },
      ],
    },
    {
      quarter: '2026 Q4 (Geliştirme Aşamasında)',
      status: 'Geliştiriliyor',
      items: [
        {
          title: 'Yerel Mobil Uygulama (Expo / React Native)',
          desc: 'iOS App Store ve Android Google Play üzerinde bağımsız mobil uygulama yayın süreci.',
        },
        {
          title: 'Otomatik WhatsApp / SMS Hatırlatıcıları',
          desc: 'Ders saatine 1 saat kala öğrenciye otomatik ders hatırlatma bildirimi gönderimi.',
        },
        {
          title: 'Toplu Ödev Şablonları',
          desc: 'Öğretmenlerin sık kullandığı soru paketlerini tek tıkla birden fazla öğrenciye dağıtabilmesi.',
        },
      ],
    },
    {
      quarter: '2027 Q1 (Planlandı)',
      status: 'Planlandı',
      items: [
        {
          title: 'Sesli Ders Özetleri & Transkripsiyon',
          desc: 'Ders kaydının önemli noktalarını otomatik metne döken ve özetleyen yapay zeka entegrasyonu.',
        },
        {
          title: 'Gelişmiş Deneme Optik Okuma',
          desc: 'Öğrencinin deneme optik formunu telefon kamerasıyla tarayarak netleri anında sisteme aktarması.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main id="main-content" className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}>
            <Compass className="w-3.5 h-3.5" />
            <span>Gelecek Planlarımız</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Ürün Geliştirme Planı (Roadmap)</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Dersly&apos;yi daha güçlü, verimli ve sezgisel bir eğitim platformu haline getirmek için üzerinde çalıştığımız aşamalar.
          </p>
        </div>

        <div className="space-y-8">
          {roadmapStages.map((stage, idx) => (
            <div key={idx} className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-sm font-bold text-white">{stage.quarter}</span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    stage.status === 'Tamamlandı'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : stage.status === 'Geliştiriliyor'
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {stage.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stage.items.map((it, iIdx) => (
                  <div key={iIdx} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60 space-y-1.5">
                    <h3 className="text-xs font-bold text-white">{it.title}</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{it.desc}</p>
                  </div>
                ))}
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
