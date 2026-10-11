'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  BookOpen, 
  Award, 
  Mic, 
  Play, 
  Pause, 
  FileText, 
  Download, 
  MessageSquare, 
  Phone, 
  Sparkles,
  ShieldCheck,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { fetchLessons, fetchHomeworks, fetchProfiles } from '@/lib/services/supabaseService';
import type { Lesson, Homework, Profile } from '@/types/database.types';

export default function ParentPortalPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [teacher, setTeacher] = useState<Profile | null>(null);

  // Audio player state for teacher's voice note
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(35);

  useEffect(() => {
    async function loadParentData() {
      const [dbLessons, dbHws, profiles] = await Promise.all([
        fetchLessons(),
        fetchHomeworks(),
        fetchProfiles(),
      ]);

      setLessons(dbLessons || []);
      setHomeworks(dbHws || []);

      const foundTeacher = profiles.find((p) => p.role === 'teacher');
      if (foundTeacher) setTeacher(foundTeacher);
    }
    loadParentData();
  }, []);

  const togglePlayAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Parent Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel bg-white/80 dark:bg-slate-900/80 border border-stone-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Veli İzleme & Gelişim Raporu
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Zeynep Kaya'nın Eğitim Durumu ✨
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                12. Sınıf Sayısal Hazırlık • Hedef: Boğaziçi Üniversitesi Bilgisayar Müh.
              </p>
            </div>
          </div>

          {/* Teacher Quick Contact */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700">
            <div className="w-10 h-10 rounded-full border border-indigo-500 overflow-hidden shrink-0">
              <img
                src={teacher?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt="Ahmet Hoca"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">
                {teacher?.full_name || 'Ahmet Hoca'}
              </span>
              <span className="text-[11px] text-slate-400">Matematik & Koçluk</span>
            </div>
            <Link
              href="/messages"
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              title="Hocaya Mesaj Gönder"
            >
              <MessageSquare className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl glass-panel bg-white/90 dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-500" /> Kalan Paket Saati
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">8</span>
              <span className="text-xs text-slate-400 font-semibold">/ 20 Saat</span>
            </div>
            <div className="w-full bg-stone-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-indigo-600 h-full w-[60%]" />
            </div>
          </div>

          <div className="p-5 rounded-3xl glass-panel bg-white/90 dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-500" /> Bu Ayki Dersler
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono block">
              12 Saat
            </span>
            <span className="text-[11px] text-slate-400">Toplam 8 oturum tamamlandı</span>
          </div>

          <div className="p-5 rounded-3xl glass-panel bg-white/90 dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-500" /> Teslim Edilen Ödev
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono block">
              %95
            </span>
            <span className="text-[11px] text-slate-400">Hepsini eksiksiz teslim etti</span>
          </div>

          <div className="p-5 rounded-3xl glass-panel bg-white/90 dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-rose-500" /> Son Deneme Neti
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">98.5</span>
              <span className="text-xs text-emerald-500 font-bold">▲ +4 Net Artış</span>
            </div>
            <span className="text-[11px] text-slate-400">TYT Türkiye Geneli Denemesi</span>
          </div>
        </div>

        {/* Middle Section: Teacher Voice Feedback & Digital Whiteboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. HOCANIN SESLİ GERİ BİLDİRİMİ (Voice Feedback) */}
          <div className="p-6 sm:p-7 rounded-3xl glass-panel bg-white/90 dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Hocadan Sesli Not & Veli Raporu 🎙️
                  </h2>
                  <span className="text-[11px] text-slate-400">11 Ekim 2026 • 1 dk 15 sn</span>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Yeni Not
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              "Ahmet Hoca: Zeynep bu hafta türev teğet eğimi testlerinde çok başarılı bir performans sergiledi. Ödev sorularındaki dikkat hatalarını giderdik. Haftaya integral başlangıcı yapacağız."
            </p>

            {/* Simulated Audio Player */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 flex items-center gap-3">
              <button
                onClick={togglePlayAudio}
                className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-95"
              >
                {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>{isPlayingAudio ? '0:28' : '0:00'}</span>
                  <span>1:15</span>
                </div>
                <div className="w-full bg-stone-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-300"
                    style={{ width: isPlayingAudio ? '45%' : '0%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. DİJİTAL DERS NOTLARI VE TAHTA ÇIKTILARI */}
          <div className="p-6 sm:p-7 rounded-3xl glass-panel bg-white/90 dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Dijital Ders Notları & Tahta PDF'i
                  </h2>
                  <span className="text-[11px] text-slate-400">Son Derste İşlenen Konular</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                      Türevin_Geometrik_Yorumu_Ders_Tahtasi.pdf
                    </h3>
                    <span className="text-[10px] text-slate-400">4 Sayfa • 2.4 MB • 11 Ekim</span>
                  </div>
                </div>

                <button
                  onClick={() => alert('Ders tahtası PDF dokümanı indiriliyor...')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-stone-200 dark:border-slate-600 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:bg-stone-50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> İndir
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                      Haftalik_Soru_Plani_ve_Odev_Foyu.pdf
                    </h3>
                    <span className="text-[10px] text-slate-400">2 Sayfa • 1.1 MB • 10 Ekim</span>
                  </div>
                </div>

                <button
                  onClick={() => alert('Ödev föyü indiriliyor...')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-stone-200 dark:border-slate-600 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:bg-stone-50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> İndir
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Lesson History & Homework Feedback */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel bg-white/90 dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="font-black text-base text-slate-900 dark:text-white">
            Son Tamamlanan Oturumlar & Konu Başlıkları
          </h2>

          <div className="divide-y divide-stone-100 dark:divide-slate-800">
            {[
              {
                date: '10 Ekim 2026',
                time: '14:00 - 15:30',
                title: 'AYT Matematik: Türevde Maksimum-Minimum Problemleri',
                notes: 'Öğrenci konuyu kavradı, Apotemi testleri ödev olarak verildi.',
                status: 'Tamamlandı (1.5 Saat)',
              },
              {
                date: '08 Ekim 2026',
                time: '16:00 - 17:30',
                title: 'AYT Fizik: Elektriksel Potansiyel ve İş',
                notes: 'Formül çıkarımları yapıldı, 30 soru çözüldü.',
                status: 'Tamamlandı (1.5 Saat)',
              },
              {
                date: '05 Ekim 2026',
                time: '10:00 - 11:30',
                title: 'AYT Matematik: Türev Alma Kuralları ve Bileşke',
                notes: 'Temel kavramlar pekiştirildi.',
                status: 'Tamamlandı (1.5 Saat)',
              },
            ].map((ses, idx) => (
              <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {ses.title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {ses.status}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    📌 Hoca Notu: {ses.notes}
                  </p>
                </div>

                <div className="text-right sm:shrink-0 font-mono text-slate-400">
                  {ses.date} • {ses.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
