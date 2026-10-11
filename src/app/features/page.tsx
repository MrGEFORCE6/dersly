import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { 
  Calendar, 
  BookOpen, 
  Sparkles, 
  TrendingUp, 
  Camera, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  GraduationCap,
  Users
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Özellikler • Dersly',
  description: 'Dersly platformunun öğretmenler ve öğrenciler için sunduğu tüm modüller ve araçlar.',
};

export default function FeaturesPage() {
  const studentFeatures = [
    {
      icon: TrendingUp,
      title: 'TYT & AYT Net Takibi',
      desc: 'Her deneme sınavı sonrası netlerinizi kaydedin, haftalık ve aylık gelişim eğrinizi dinamik grafiklerle takip edin.',
    },
    {
      icon: Sparkles,
      title: 'Yapay Zeka Soru ve Ders Koçu',
      desc: 'Takıldığınız formül veya kavramları anında sorun. Doğrudan cevabı vermek yerine pedagojik ipuçlarıyla yol gösteren yapay zeka asistanı.',
    },
    {
      icon: Camera,
      title: 'OCR ile Akıllı Kitaplık',
      desc: 'Kullandığınız soru bankalarının kapağını kamerayla tarayarak kitaplığınıza ekleyin, hangi derste hangi kitabı çözdüğünüzü takip edin.',
    },
    {
      icon: BookOpen,
      title: 'Ödev ve PDF Teslim Sistemi',
      desc: 'Öğretmeninizin verdiği ödevleri tek ekranda görün, çözümlü PDF veya fotoğrafları yükleyerek teslim durumunuzu güncelleyin.',
    },
    {
      icon: Users,
      title: 'Öğrenci Kampüsü',
      desc: 'Diğer öğrencilerle soru paylaşın, YKS hazırlık stratejilerini tartışın ve dayanışma içinde çalışın.',
    },
    {
      icon: Calendar,
      title: 'Ders Saati ve Kalan Kredi',
      desc: 'Hangi gün hangi saatte dersiniz olduğunu bilin. Kalan özel ders saatlerinizi şeffaf bir şekilde görün.',
    },
  ];

  const teacherFeatures = [
    {
      icon: Calendar,
      title: 'Akıllı Ders Takvimi',
      desc: 'Ders oluşturun, tamamlandı olarak işaretleyin veya öğrenciden gelen saat kaydırma taleplerini onaylayın.',
    },
    {
      icon: Clock,
      title: 'Kredi ve Paket Yönetimi',
      desc: 'Öğrencilerinizin paket ders saatlerini ve kalan saatlerini otomatik hesaplayın. Karışıklığa son verin.',
    },
    {
      icon: BookOpen,
      title: 'Ödev Oluşturma & İnceleme',
      desc: 'Öğrencilerinize PDF veya test ödevleri atayın. Teslim edilen çözümleri tarayıcı üzerinden açıp inceleyin.',
    },
    {
      icon: TrendingUp,
      title: 'Öğrenci Gelişim İzleme',
      desc: 'Öğrencilerinizin sınav netlerini, haftalık çözdüğü soru sayılarını ve hedeflerini tek bakışta analiz edin.',
    },
    {
      icon: ShieldCheck,
      title: 'Öğretmenler Odası',
      desc: 'Yalnızca doğrulanmış eğitmenlerin erişebildiği kapalı forumda kaynak, pedagoji ve ders notu paylaşımı.',
    },
    {
      icon: Users,
      title: 'Tek Tıkla Öğrenci Daveti',
      desc: 'Öğrencilerinize özel dinamik davet bağlantısı oluşturun; kaydolan öğrenciler anında portföyünüze eklensin.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main id="main-content" className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kapsamlı Eğitim Araçları</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Öğretmen ve Öğrenciler İçin Tasarlanmış Özellikler
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Dersly, karmaşık hesap tabloları ve kaybolan mesajlaşmalar yerine modern, düzenli ve güvenli bir çalışma alanı sunar.
          </p>
        </div>

        {/* Student Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
              🎓
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Öğrenciler İçin Özellikler</h2>
              <p className="text-xs text-slate-400">Hedeflerinize odaklanın, çalışma disiplininizi ölçün.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {studentFeatures.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-2.5 hover:border-slate-700 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Teacher Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
              👨‍🏫
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Öğretmenler İçin Özellikler</h2>
              <p className="text-xs text-slate-400">Sınıflarınızı yönetin, zamandan tasarruf edin.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teacherFeatures.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-2.5 hover:border-slate-700 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="text-center p-8 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <h2 className="text-xl font-black text-white">Hemen Kullanmaya Başlayın</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Öğrenciler için tamamen ücretsizdir. Öğretmenler sınıflarını dakikalar içinde oluşturabilir.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2"
            >
              <span>Hesap Oluşturun</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              Fiyatlandırmayı İnceleyin
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
