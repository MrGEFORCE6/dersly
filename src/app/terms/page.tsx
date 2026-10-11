import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Scale, RefreshCw, CheckCircle2, AlertCircle, FileCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları ve İptal/İade Politikası',
  description:
    'Dersly platform kullanım şartları, öğretmen abonelik esasları, 14 gün koşulsuz iptal ve iade süreçlerine ilişkin yasal koşullar.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 transition-colors">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mb-8 pb-8 border-b border-stone-200 dark:border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>Yasal Hizmet Sözleşmesi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Kullanım Koşulları ve İptal/İade Esasları
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Son Güncelleme: 11 Ekim 2026 • Sözleşme Kodu: DERSLY-TOS-2026
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-indigo-500" />
              1. Hizmet Tanımı ve Taraflar
            </h2>
            <p>
              İşbu Kullanım Koşulları; Dersly (&quot;Platform&quot;) ile platforma kayıt olan öğretmen, öğrenci ve veli (&quot;Kullanıcı&quot;) arasındaki hak ve yükümlülükleri düzenler. Dersly, özel ders planlaması, ödev ve içerik takibi, kütüphane organizasyonu ve veli izleme olanağı sunan bir bulut yazılım hizmetidir (SaaS).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-500" />
              2. Fiyatlandırma, Faturalandırma ve 14 Gün Deneme
            </h2>
            <p>
              Öğretmen hesapları için platform kullanım bedeli; <strong>Taban 50 TL/ay + Aktif Öğrenci Başı 15 TL/ay</strong> formülü ile hesaplanır. Fiyatlarımıza Katma Değer Vergisi (KDV) dahil değildir.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li><strong>14 Gün Ücretsiz Deneme:</strong> Yeni kaydolan tüm eğitmenler, platformu ilk 14 gün boyunca hiçbir kredi kartı gerekmeksizin tüm özellikleriyle ücretsiz deneyebilir.</li>
              <li><strong>Taahhütsüz Kullanım:</strong> Platformda yıllık bağlayıcı taahhüt zorunluluğu yoktur. İstediğiniz ay hesabınızı dondurabilir veya kapatabilirsiniz.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              3. İptal ve İade Politikası
            </h2>
            <p>
              Kullanıcı, dilediği zaman üyelik panelinden aboneliğini tek tıkla iptal edebilir. Faturalandırma döneminin bitimine kadar hizmetten faydalanmaya devam edilir ve bir sonraki dönem için herhangi bir ücret tahsil edilmez. Hizmetten memnun kalınmaması durumunda ilk 14 gün içerisinde bildirilen talepler için koşulsuz tam iade gerçekleştirilir.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              4. İçerik ve Fikri Mülkiyet
            </h2>
            <p>
              Öğretmenler ve öğrenciler tarafından yüklenen ders materyalleri, PDF ödev dosyaları ve dijital tahta notlarının telif hakları ilgili kullanıcıya aittir. Kullanıcılar, üçüncü tarafların telif haklarını ihlal eden korsan veya izinsiz materyalleri sisteme yüklememeyi taahhüt eder.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-200 dark:border-slate-800 flex justify-between items-center text-xs">
          <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
            ← Gizlilik Politikası
          </Link>
          <Link href="/contact" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            İletişim ve Destek →
          </Link>
        </div>
      </main>
    </div>
  );
}
