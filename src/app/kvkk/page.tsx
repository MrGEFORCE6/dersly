import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Shield, Scale, FileText, CheckCircle2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni • Dersly',
  description: '6698 Sayılı Kişisel Verilerin Korunması Kanunu kapsamında Dersly veri işleme ve haklarınız.',
};

export default function KvkkPage() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main id="main-content" className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}>
            <Scale className="w-3.5 h-3.5" />
            <span>6698 Sayılı Kanun Uyarınca</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">KVKK Aydınlatma Metni</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Dersly olarak öğrencilerimizin ve öğretmenlerimizin kişisel verilerinin korunmasına en üst düzeyde önem veriyoruz.
          </p>
        </div>

        <div className="p-7 sm:p-9 rounded-3xl glass-panel border border-slate-800 space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
              1. Veri Sorumlusu
            </h2>
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla <strong>Dersly Eğitim Teknolojileri</strong> (&quot;Dersly&quot; veya &quot;Şirket&quot;) tarafından aşağıda açıklanan kapsamda işlenmektedir.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
              2. İşlenen Kişisel Veri Kategorileri
            </h2>
            <ul className="space-y-2 list-disc list-inside text-xs text-slate-300">
              <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, kullanıcı adı.</li>
              <li><strong>İletişim Bilgileri:</strong> E-posta adresi, varsa telefon numarası.</li>
              <li><strong>Eğitim & Süreç Bilgileri:</strong> Ders planları, ödev teslim dosyaları (PDF/görsel), TYT/AYT deneme net istatistikleri, haftalık soru hedefleri.</li>
              <li><strong>İşlem Güvenliği Bilgileri:</strong> IP adresi, oturum belirteçleri ve oturum açma kayıtları.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
              3. Kişisel Verilerin İşlenme Amaçları ve Hukuki Sebepleri
            </h2>
            <p>
              Kişisel verileriniz KVKK&apos;nın 5. maddesinde belirtilen:
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-300">
              <li>Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması (Platform hizmetlerinin sunulması),</li>
              <li>Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi,</li>
              <li>İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla meşru menfaatlerimiz için zorunlu olması (Sistem güvenliği, hata giderme)</li>
            </ul>
            <p>
              hukuki sebeplerine dayalı olarak otomatik yollarla işlenmektedir.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
              4. Kişisel Verilerin Aktarılması
            </h2>
            <p>
              Öğrenci verileri yalnızca öğrencinin yetki verdiği kendi öğretmeni ile paylaşılır. Verileriniz hiçbir reklam veren, veri komisyoncusu veya üçüncü taraf pazarlama şirketiyle paylaşılmaz veya satılmaz.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
              5. İlgili Kişinin KVKK Madde 11 Kapsamındaki Hakları
            </h2>
            <p>
              KVKK&apos;nın 11. maddesi uyarınca veri sahipleri;
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-300">
              <li>Kişisel verilerinin işlenip işlenmediğini öğrenme,</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
              <li>Kişisel verilerin silinmesini veya yok edilmesini isteme,</li>
              <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme haklarına sahiptir.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
              6. Başvuru ve İletişim
            </h2>
            <p>
              Haklarınıza ilişkin taleplerinizi <Link href="/settings" className="text-indigo-400 underline">Ayarlar</Link> sayfasından doğrudan hesabınızı yöneterek veya <strong>kvkk@dersly.app</strong> adresine e-posta göndererek iletebilirsiniz. Başvurularınız en geç 30 gün içinde ücretsiz olarak sonuçlandırılacaktır.
            </p>
          </section>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-800">
        Dersly © 2026 • Tüm Hakları Saklıdır.
      </footer>
    </div>
  );
}
