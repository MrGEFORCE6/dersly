import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Cookie, Shield, CheckCircle2, Lock } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Çerez Politikası • Dersly',
  description: 'Dersly platformunda kullanılan zorunlu, analitik ve işlevsel çerezler hakkında bilgilendirme.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main id="main-content" className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}>
            <Cookie className="w-3.5 h-3.5" />
            <span>Şeffaf Çerez Yönetimi</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Çerez (Cookie) Politikası</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Dersly olarak kullanıcı deneyiminizi güvenli kılmak ve oturumunuzu sürdürebilmek için çerezler kullanmaktayız.
          </p>
        </div>

        <div className="p-7 sm:p-9 rounded-3xl glass-panel border border-slate-800 space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
              1. Çerez Nedir?
            </h2>
            <p>
              Çerezler (cookies), bir web sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla bilgisayarınıza veya mobil cihazınıza kaydedilen küçük metin dosyalarıdır. Çerezler web sitesinin düzgün çalışmasını sağlamak, güvenliği artırmak ve tercihlerinizi hatırlamak için kullanılır.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
              2. Kullandığımız Çerez Türleri
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <h3 className="text-xs font-bold text-white">A. Kesinlikle Zorunlu Çerezler (Oturum & Güvenlik)</h3>
                <p className="text-xs text-slate-400">
                  Platforma giriş yapabilmeniz, oturumunuzun korunması ve rol tabanlı güvenlik (öğrenci/öğretmen) yetkilendirmesi için zorunludur. Bu çerezler olmadan sistem güvenli şekilde çalışamaz (`dersly_auth_token`, `dersly_user_role`, Supabase `sb-*-auth-token`).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <h3 className="text-xs font-bold text-white">B. İşlevsel Çerezler (Tercihler)</h3>
                <p className="text-xs text-slate-400">
                  Açık/koyu tema tercihiniz ve arayüz vurgu rengi (accent color) seçiminizin sonraki ziyaretlerinizde hatırlanmasını sağlar (`dersly_theme_mode`, `dersly_theme_accent`).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <h3 className="text-xs font-bold text-white">C. Reklam & Üçüncü Taraf Takip Çerezleri Kullanılmamaktadır</h3>
                <p className="text-xs text-slate-400">
                  Dersly, kullanıcılarını internet genelinde takip eden üçüncü taraf reklam veya profil çıkarma çerezleri KULLANMAZ.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
              3. Çerezleri Nasıl Kontrol Edebilirsiniz?
            </h2>
            <p>
              Tarayıcınızın ayarlarından çerezleri dilediğiniz zaman silebilir veya yeni çerez kabulünü engelleyebilirsiniz. Ancak zorunlu oturum çerezlerini engellemeniz durumunda platforma giriş yapamayacağınızı hatırlatmak isteriz.
            </p>
          </section>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
            Dersly Çerez Politikası hakkında sorularınız için <Link href="/contact" className="text-indigo-400 underline">İletişim sayfamız</Link> üzerinden bize ulaşabilirsiniz.
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-800">
        Dersly © 2026 • Tüm Hakları Saklıdır.
      </footer>
    </div>
  );
}
