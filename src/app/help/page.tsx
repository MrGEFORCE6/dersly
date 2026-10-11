'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { 
  LifeBuoy, 
  Search, 
  BookOpen, 
  Calendar, 
  ShieldCheck, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  MessageSquare,
  HelpCircle,
  FileQuestion
} from 'lucide-react';

export default function HelpCenterPage() {
  const [topic, setTopic] = useState('teknik');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setSubmitError('Lütfen tüm zorunlu alanları doldurunuz.');
      return;
    }

    setIsSubmitting(true);
    // Simulate safe support ticket handling
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    }, 700);
  };

  const helpTopics = [
    {
      icon: BookOpen,
      title: 'Başlarken & Hesap Oluşturma',
      desc: 'Öğrenci ve öğretmen kayıt süreçleri, şifre belirleme ve profil ayarları.',
    },
    {
      icon: Calendar,
      title: 'Ders ve Takvim Yönetimi',
      desc: 'Özel ders oluşturma, saat erteleme talepleri ve kalan paket kredileri.',
    },
    {
      icon: MessageSquare,
      title: 'Ödev ve Materyal Yükleme',
      desc: 'PDF teslimi, dosya formatları ve öğretmen inceleme notları.',
    },
    {
      icon: ShieldCheck,
      title: 'Güvenlik, Gizlilik & KVKK',
      desc: 'Hesap silme, veri erişim hakları ve veri izolasyonu politikaları.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main id="main-content" className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-14">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}>
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Yardım & Destek Merkezi</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Nasıl Yardımcı Olabiliriz?</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Kılavuzlarımızı inceleyin, sıkça sorulan sorulara göz atın veya doğrudan teknik ekibimize talep iletin.
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {helpTopics.map((topicItem, idx) => {
            const Icon = topicItem.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <h2 className="text-xs font-bold text-white">{topicItem.title}</h2>
                <p className="text-[11px] text-slate-400 leading-relaxed">{topicItem.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Contact / Ticket Form */}
        <div className="p-7 sm:p-9 rounded-3xl glass-panel border border-slate-800 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Destek Talebi Oluşturun</h2>
            <p className="text-xs text-slate-400">
              Yaşadığınız teknik sorunu veya önerinizi iletin. Talebiniz en geç 24 saat içinde yanıtlanacaktır.
            </p>
          </div>

          {/* Warning regarding sensitive information */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">
              <strong>Önemli Güvenlik Uyarısı:</strong> Destek mesajınızda T.C. Kimlik numarası, banka bilgisi, şifre veya hassas kişisel verilerinizi kesinlikle paylaşmayınız.
            </span>
          </div>

          {submitSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold">Destek Talebiniz Alındı!</strong>
                <span>Talebiniz kayıt altına alındı. İlettiğiniz e-posta adresi üzerinden sizinle iletişime geçilecektir.</span>
              </div>
            </div>
          )}

          {submitError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ticket-name" className="block text-xs font-semibold text-slate-300 mb-1.5">Adınız Soyadınız</label>
                <input
                  id="ticket-name"
                  type="text"
                  required
                  placeholder="Zeynep Kaya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="ticket-email" className="block text-xs font-semibold text-slate-300 mb-1.5">E-Posta Adresiniz</label>
                <input
                  id="ticket-email"
                  type="email"
                  required
                  placeholder="ornek@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ticket-topic" className="block text-xs font-semibold text-slate-300 mb-1.5">Konu Başlığı</label>
              <select
                id="ticket-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="teknik">Teknik Sorun / Hata Bildirimi</option>
                <option value="hesap">Giriş / Hesap Doğrulama Sorunu</option>
                <option value="odev_dosya">Ödev ve PDF Dosya Yükleme</option>
                <option value="fatura">Fiyatlandırma & Abonelik</option>
                <option value="oneri">Yeni Özellik Önerisi</option>
              </select>
            </div>

            <div>
              <label htmlFor="ticket-message" className="block text-xs font-semibold text-slate-300 mb-1.5">Açıklama</label>
              <textarea
                id="ticket-message"
                rows={4}
                required
                placeholder="Lütfen yaşadığınız durumu veya soruyu ayrıntılı biçimde açıklayınız..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-transform hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Gönderiliyor...' : 'Talebi İlet'}</span>
            </button>
          </form>
        </div>

        {/* Direct Email channel */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl bg-slate-900/60 border border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Doğrudan E-Posta</span>
              <span className="text-xs text-slate-400">destek@dersly.app</span>
            </div>
          </div>
          <Link
            href="/faq"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1.5"
          >
            <span>Sık Sorulan Soruları Gör</span>
            <HelpCircle className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-800">
        Dersly © 2026 • Tüm Hakları Saklıdır.
      </footer>
    </div>
  );
}
