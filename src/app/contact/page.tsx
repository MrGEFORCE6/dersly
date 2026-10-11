'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Genel Bilgi ve Destek',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 transition-colors">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Müşteri Başarı & Destek</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Bizimle İletişime Geçin
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Platform kullanımı, kurumsal anlaşmalar veya teknik destek talepleriniz için ekibimiz 24 saat içinde yanıt verir.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Kolon: Kurumsal İletişim Bilgileri */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-stone-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Kurumsal Bilgiler
              </h2>
              
              <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-semibold text-slate-900 dark:text-white">E-posta</span>
                    <a href="mailto:destek@dersly.app" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                      destek@dersly.app
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-semibold text-slate-900 dark:text-white">Telefon</span>
                    <span>+90 (850) 885 24 34</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-semibold text-slate-900 dark:text-white">Destek Saatleri</span>
                    <span>Hafta içi 09:00 - 18:00 (Cumartesi 10:00 - 15:00)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-semibold text-slate-900 dark:text-white">Ofis Adresi</span>
                    <span>Maslak Mah. Büyükdere Cad. No: 255 Nurol Plaza, Sarıyer / İstanbul</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 space-y-2">
              <span className="font-bold block">🚀 Hızlı Kurulum & Demo Desteği</span>
              <p className="text-[11px] leading-relaxed opacity-90">
                10&apos;dan fazla öğrencisi olan özel ders öğretmenleri için ücretsiz 1-1 onboarding ve veri taşıma desteği sağlıyoruz.
              </p>
            </div>
          </div>

          {/* Sağ Kolon: İletişim Formu */}
          <div className="lg:col-span-2">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-stone-200 dark:border-slate-800 shadow-sm">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Mesajınız Başarıyla Alındı
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Talebiniz destek ekibimize ulaştı. 24 saat içerisinde <strong>{formData.email}</strong> adresine yanıt vereceğiz.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', subject: 'Genel Bilgi ve Destek', message: '' });
                    }}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
                  >
                    Yeni Mesaj Gönder
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    Bize Mesaj Gönderin
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Adınız Soyadınız *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        aria-label="Adınız Soyadınız"
                        placeholder="Örn: Ahmet Yılmaz"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-slate-800/80 border border-stone-300 dark:border-slate-700 text-slate-900 dark:text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        E-posta Adresiniz *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        aria-label="E-posta Adresiniz"
                        placeholder="Örn: ahmet@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-slate-800/80 border border-stone-300 dark:border-slate-700 text-slate-900 dark:text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Konu
                    </label>
                    <select
                      id="contact-subject"
                      aria-label="Mesaj Konusu"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-slate-800/80 border border-stone-300 dark:border-slate-700 text-slate-900 dark:text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                    >
                      <option value="Genel Bilgi ve Destek">Genel Bilgi ve Destek</option>
                      <option value="Öğretmen Hesabı ve Faturalandırma">Öğretmen Hesabı ve Faturalandırma</option>
                      <option value="Öneri ve Geri Bildirim">Öneri ve Geri Bildirim</option>
                      <option value="Hata Bildirimi (Bug Report)">Hata Bildirimi (Bug Report)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Mesajınız *
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={5}
                      aria-label="Mesajınız"
                      placeholder="Sorunuzu veya talebinizi detaylı olarak yazabilirsiniz..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-slate-800/80 border border-stone-300 dark:border-slate-700 text-slate-900 dark:text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                  >
                    <Send className="w-4 h-4" />
                    <span>Mesajı Gönder</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-200 dark:border-slate-800 flex justify-between items-center text-xs">
          <Link href="/" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
            ← Ana Sayfaya Dön
          </Link>
          <Link href="/privacy" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            Gizlilik Politikası →
          </Link>
        </div>
      </main>
    </div>
  );
}
