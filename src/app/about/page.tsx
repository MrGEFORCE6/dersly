import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { 
  GraduationCap, 
  Target, 
  ShieldCheck, 
  Sparkles, 
  BookOpen, 
  Users, 
  CheckCircle2, 
  Heart,
  ArrowRight
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hakkımızda • Dersly',
  description: 'Dersly, özel ders öğretmenleri ve öğrencilerini buluşturan yeni nesil eğitim ve takip platformudur.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main id="main-content" className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vizyonumuz & Misyonumuz</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Özel Ders Deneyimini Modernleştiren Eğitim Teknolojisi
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Dersly; öğretmenlerin ders planlamasını, ödev takibini ve kredi yönetimini tek çatı altında toplarken, öğrencilerin hedeflerine adım adım ulaşmasını sağlayan bağımsız bir eğitim platformudur.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl glass-panel space-y-3 border border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">Öğrenci Odaklı Hedefler</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Her öğrencinin öğrenme hızı ve sınav stratejisi farklıdır. TYT ve AYT net takibi, çözülen soru hedefleri ve yapay zeka destekli soru analizleriyle öğrencinin gelişimini somutlaştırıyoruz.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel space-y-3 border border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">Öğretmen Verimliliği</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Öğretmenlerin ders saatlerini not defterlerinde veya WhatsApp mesajlarında kaybetmesini önlüyoruz. Kalan ders kredileri, ödev teslimleri ve takvim tek tıkla senkronize çalışır.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel space-y-3 border border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">Veri Güvenliği ve Gizlilik</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              KVKK ilkelerine sıkı sıkıya bağlıyız. Öğrenci verileri ve öğretmen materyalleri yalnızca izin verilen taraflarla paylaşılır, hiçbir üçüncü taraf reklam ağına satılmaz.
            </p>
          </div>
        </div>

        {/* Values list */}
        <div className="p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
          <h2 className="text-xl font-bold text-white text-center">Temel Değerlerimiz</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/40">
              <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-white">Şeffaflık ve Dürüstlük</h3>
                <p className="text-[11px] text-slate-400">Gizli abonelik ücreti veya sahte taahhütler yok. Ne görüyorsanız onu kullanırsınız.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/40">
              <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-white">Yapay Zeka Destekli Pedagoji</h3>
                <p className="text-[11px] text-slate-400">Yapay zeka asistanımız cevabı doğrudan vermek yerine öğrencinin düşünme becerisini geliştirecek ipuçları sunar.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/40">
              <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-white">Hızlı ve Hafif Altyapı</h3>
                <p className="text-[11px] text-slate-400">Mobil uyumlu, anında yüklenen modern web teknolojisiyle zaman kaybını sıfırlıyoruz.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/40">
              <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-white">Öğrenci & Öğretmen Dayanışması</h3>
                <p className="text-[11px] text-slate-400">Öğrenci Kampüsü ve Öğretmenler Odası ile bilgi paylaşımını ve soru çözümünü sosyal bir deneyime dönüştürüyoruz.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/50 border border-indigo-500/30 space-y-4">
          <h2 className="text-2xl font-black text-white">Dersly ile Eğitiminizi Yönetmeye Başlayın</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            İster öğrenci olarak netlerinizi takip edin, ister öğretmen olarak sınıflarınızı organize edin.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2"
            >
              <span>Ücretsiz Kaydolun</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 transition-colors border border-slate-700"
            >
              İletişime Geçin
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-800">
        Dersly © 2026 • Tüm Hakları Saklıdır.
      </footer>
    </div>
  );
}
