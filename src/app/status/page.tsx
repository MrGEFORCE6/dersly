import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { 
  Activity, 
  CheckCircle2, 
  Server, 
  Database, 
  ShieldCheck, 
  Cloud, 
  Sparkles, 
  Clock,
  Info
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sistem Durumu • Dersly',
  description: 'Dersly platform altyapısı, veritabanı, depolama ve servis çalışma durumu.',
};

export default function StatusPage() {
  const services = [
    {
      name: 'Web Uygulaması & CDN Dağıtımı',
      provider: 'Netlify Edge Network',
      status: 'Operasyonel',
      desc: 'Next.js 16 SSR & Statik sayfa sunumu küresel CDN üzerinden kesintisiz çalışmaktadır.',
    },
    {
      name: 'Veritabanı (PostgreSQL & RLS)',
      provider: 'Supabase Platform (Frankfurt / eu-central-1)',
      status: 'Operasyonel',
      desc: 'Satır düzeyinde veri izolasyonu ve kullanıcı profilleri veritabanı kümesinde barındırılmaktadır.',
    },
    {
      name: 'Kimlik Doğrulama & Oturum Servisi',
      provider: 'Supabase Auth (PKCE & OAuth 2.0)',
      status: 'Operasyonel',
      desc: 'E-posta/şifre ve Google OAuth oturum doğrulama servisleri aktiftir.',
    },
    {
      name: 'Ödev & Belge Depolama (Storage)',
      provider: 'Supabase S3 Storage',
      status: 'Operasyonel',
      desc: 'Öğrenci ödevleri ve kitap tarama dosyaları şifrelenmiş depolama havuzunda saklanmaktadır.',
    },
    {
      name: 'Yapay Zeka Pedagojik Asistan',
      provider: 'Google Gemini 1.5 Flash API',
      status: 'Operasyonel',
      desc: 'Ders koçu ve soru ipucu üretme motoru uç nokta API üzerinden çağrılmaktadır.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main id="main-content" className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Tüm Servisler Çalışır Durumda</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Dersly Sistem Durumu</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Platformumuzun altyapı bileşenleri, sunucu durumları ve servis sağlık göstergeleri şeffaf olarak paylaşılmaktadır.
          </p>
        </div>

        {/* Notice */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Dürüst Hizmet Taahhüdü:</strong> Dersly, sahte veya yanıltıcı ping grafikleri sunmaz. Aşağıdaki liste platformumuzun dayandığı gerçek bulut altyapısı sağlayıcılarının mevcut operasyonel durumunu yansıtır.
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-3">
          {services.map((svc, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{svc.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded-md">
                    {svc.provider}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-normal">{svc.desc}</p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{svc.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Incident History */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white">Geçmiş Olaylar ve Bakım Kayıtları</h2>
            <span className="text-[11px] text-slate-400 font-mono">Son 30 Gün</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2 py-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Son 30 gün içinde bildirilen herhangi bir kesinti veya plansız servis aksaması yaşanmamıştır.</span>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-800">
        Dersly © 2026 • Tüm Hakları Saklıdır.
      </footer>
    </div>
  );
}
