import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Shield, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gizlilik ve KVKK Politikası',
  description:
    'Dersly platformunda kişisel verilerin korunması, işlenmesi ve saklanmasına ilişkin 6698 sayılı KVKK kapsamındaki aydınlatma metnimiz.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 transition-colors">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mb-8 pb-8 border-b border-stone-200 dark:border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>6698 Sayılı KVKK Uyumlu</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Gizlilik Politikası ve KVKK Aydınlatma Metni
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Son Güncelleme: 11 Ekim 2026 • Yürürlük Sürümü: v2.1
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-500" />
              1. Veri Sorumlusu ve Kapsam
            </h2>
            <p>
              Dersly Eğitim Teknolojileri A.Ş. (&quot;Dersly&quot; veya &quot;Şirket&quot;) olarak, platformumuzu kullanan eğitmenler ve öğrencilerin kişisel verilerinin korunmasına ve mahremiyetine en üst düzeyde önem veriyoruz. 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca veri sorumlusu sıfatıyla hareket etmekteyiz.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-500" />
              2. Toplanan Kişisel Veriler ve İşlenme Amaçları
            </h2>
            <p>
              Hizmetlerimizin ifası, ders planlaması ve eğitim süreçlerinin takibi amacıyla aşağıdaki veriler işlenmektedir:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li><strong>Kimlik ve İletişim Bilgileri:</strong> Ad, soyad, e-posta adresi, telefon numarası.</li>
              <li><strong>Eğitim ve Performans Verileri:</strong> TYT/AYT deneme sınavı netleri, konu başarı analizleri, ödev teslim durumları ve ders katılım istatistikleri.</li>
              <li><strong>Kullanıcı İçeriği:</strong> Ders sırasında işlenen dijital tahta notları, öğretmen değerlendirmeleri, kütüphaneye eklenen taranmış kitap üniteleri.</li>
              <li><strong>Finansal Bilgiler:</strong> Satın alınan özel ders paketleri, kullanılan ve kalan ders saatleri, ödeme teyit kayıtları.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              3. Banka Düzeyinde Veri İzolasyonu ve Güvenlik
            </h2>
            <p>
              Verileriniz, satır düzeyinde güvenlik (Row Level Security - RLS) politikaları ile izole edilmiştir. Bir öğrencinin sınav netleri ve kişisel bilgileri, yalnızca o öğrenciye ve ders aldığı öğretmene özel olarak şifreli tüneller üzerinden sunulur. Üçüncü şahıslara veya reklam ağlarına hiçbir şekilde veri aktarımı yapılmaz.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              4. İlgili Kişi Hakları (KVKK Madde 11)
            </h2>
            <p>
              Kanun kapsamında veri sahipleri; kişisel verilerinin işlenip işlenmediğini öğrenme, yanlış işlenmişse düzeltilmesini talep etme, verilerin silinmesini (unutulma hakkı) isteme haklarına sahiptir. Taleplerinizi <a href="mailto:destek@dersly.app" className="text-indigo-600 dark:text-indigo-400 font-semibold underline">destek@dersly.app</a> e-posta adresi üzerinden bize iletebilirsiniz.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-200 dark:border-slate-800 flex justify-between items-center text-xs">
          <Link href="/" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
            ← Ana Sayfaya Dön
          </Link>
          <Link href="/terms" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            Kullanım Koşulları →
          </Link>
        </div>
      </main>
    </div>
  );
}
