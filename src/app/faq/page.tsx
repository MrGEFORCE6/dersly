'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { 
  HelpCircle, 
  ChevronDown, 
  Search, 
  Sparkles, 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  Mail 
} from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
  category: 'genel' | 'ogrenci' | 'ogretmen' | 'guvenlik';
}

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'genel' | 'ogrenci' | 'ogretmen' | 'guvenlik'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  const faqs: FaqItem[] = [
    {
      category: 'genel',
      q: 'Dersly nedir ve ne işe yarar?',
      a: 'Dersly, özel ders öğretmenleri ile öğrencilerini buluşturan, ders takvimini, ödev teslimlerini, sınav netlerini ve ders kredilerini tek bir güvenli arayüzde toplayan yeni nesil bir eğitim platformudur.',
    },
    {
      category: 'genel',
      q: 'Öğrenciler için platform ücretli midir?',
      a: 'Hayır. Dersly, öğrenciler için tamamen ve süresiz olarak ücretsizdir. Öğrenciler ders programlarını takip edebilir, ödev yükleyebilir, net grafiklerini inceleyebilir ve yapay zeka asistanından ücretsiz faydalanabilir.',
    },
    {
      category: 'ogrenci',
      q: 'Öğretmenimin portföyüne nasıl bağlanabilirim?',
      a: 'Öğretmeninizin size ileteceği özel davet bağlantısına (örneğin: dersly.app/join?teacherCode=XYZ) tıklayarak kaydolduğunuzda veya profilinizi eşleştirdiğinizde otomatik olarak öğretmeninizin sınıfına bağlanırsınız.',
    },
    {
      category: 'ogrenci',
      q: 'Yapay zeka asistanı sorularımı nasıl çözüyor?',
      a: 'Yapay zeka asistanımız bir Özel Ders Koçu olarak tasarlanmıştır. Sorunun cevabını doğrudan vermek yerine sorunun mantığını, temel formülünü ve çözüm adımlarını aşama aşama size rehberlik ederek açıklar.',
    },
    {
      category: 'ogretmen',
      q: 'Öğretmen olarak fiyatlandırma nasıl işliyor?',
      a: 'Öğretmenler için taban kullanım ücreti aylık 50 TL olup, her aktif öğrenci için aylık 15 TL eklenir. Ders başı veya öğrenci ödemelerinden hiçbir gizli komisyon alınmaz.',
    },
    {
      category: 'ogretmen',
      q: 'Öğrencilerimin ödevlerini nasıl kontrol edebilirim?',
      a: 'Öğretmen panelindeki Ödev Yönetimi modülünden ödev atayabilirsiniz. Öğrenci çözümü PDF veya fotoğraf olarak yüklediğinde dosya doğrudan panelinize düşer ve tarayıcıda açarak inceleyebilirsiniz.',
    },
    {
      category: 'ogretmen',
      q: 'Ders kredisi veya paket saat takibi nasıl yapılıyor?',
      a: 'Öğrencinize örneğin 10 saatlik paket tanımladığınızda, takvimden tamamlandı olarak işaretlediğiniz her ders otomatik olarak kalan bakiye saatten düşer. Öğrenci de kalan saatini kendi ekranında şeffafça görür.',
    },
    {
      category: 'guvenlik',
      q: 'Kişisel verilerim ve deneme netlerim güvende mi?',
      a: 'Evet. Dersly, Supabase altyapısı üzerinde PostgreSQL Row Level Security (RLS) politikalarıyla çalışır. Öğrencinin özel sınav netleri ve kişisel bilgileri yalnızca kendisi ve yetkili öğretmeni tarafından görülebilir.',
    },
    {
      category: 'guvenlik',
      q: 'Hesabımı ve verilerimi dilediğim zaman silebilir miyim?',
      a: 'Evet. KVKK ve gizlilik haklarınız kapsamında /settings sayfasındaki Hesap Yönetimi sekmesinden dilediğiniz an hesabınızı ve tüm ilişkili verilerinizi kalıcı olarak silebilirsiniz.',
    },
  ];

  const filteredFaqs = faqs.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (index: number) => {
    if (openIndexes.includes(index)) {
      setOpenIndexes(openIndexes.filter((i) => i !== index));
    } else {
      setOpenIndexes([...openIndexes, index]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main id="main-content" className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}>
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Merak Edilenler</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Sık Sorulan Sorular</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Dersly kullanımı, öğretmen ve öğrenci modülleri ve hesap yönetimi hakkında en çok merak edilen konular.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-lg mx-auto">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Sorularda arayın (ör: ödev, fiyat, yapay zeka)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'genel', label: 'Genel' },
            { id: 'ogrenci', label: 'Öğrenci' },
            { id: 'ogretmen', label: 'Öğretmen' },
            { id: 'guvenlik', label: 'Güvenlik & KVKK' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              Aramanızla eşleşen soru bulunamadı. Destek merkezimize yazabilirsiniz.
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndexes.includes(idx);
              return (
                <div
                  key={idx}
                  className="rounded-2xl glass-panel border border-slate-800 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(idx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-white hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-indigo-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still have questions */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 text-center space-y-3">
          <h2 className="text-base font-bold text-white">Başka bir sorunuz mu var?</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Ekibimiz her türlü sorunuzda ve teknik talebinizde yardımcı olmaktan mutluluk duyar.
          </p>
          <div className="pt-1">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Destek Ekibine Yazın</span>
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
