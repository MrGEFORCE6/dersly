'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  GraduationCap, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  BookOpen 
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { acceptTeacherInvite, fetchProfiles } from '@/lib/services/supabaseService';
import type { Profile } from '@/types/database.types';

function JoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const teacherCode = searchParams.get('teacherCode') || 'HOCA-T001-99';

  const [isLoading, setIsLoading] = useState(false);
  const [teacher, setTeacher] = useState<Profile | null>(null);
  const [student, setStudent] = useState<Profile | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadInfo() {
      const profiles = await fetchProfiles();
      const foundTeacher = profiles.find((p) => p.role === 'teacher') || {
        id: 't-001',
        full_name: 'Ahmet Hoca',
        username: 'ahmethoca',
        role: 'teacher',
        bio: 'Özel Ders Koçu & YKS Matematik Eğitmeni',
        phone: '+90 532 555 1020',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        exam_stats: null,
        privacy_settings: null,
        theme_preference: null,
        created_at: '2026-10-11T00:00:00.000Z',
        updated_at: '2026-10-11T00:00:00.000Z',
      };
      setTeacher(foundTeacher);

      const foundStudent = profiles.find((p) => p.role === 'student') || {
        id: 's-001',
        full_name: 'Zeynep Kaya',
        username: 'zeynep.kaya',
        role: 'student',
        bio: 'Hedef: Boğaziçi Bilgisayar',
        phone: '+90 542 111 2233',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        exam_stats: null,
        privacy_settings: null,
        theme_preference: null,
        created_at: '2026-10-11T00:00:00.000Z',
        updated_at: '2026-10-11T00:00:00.000Z',
      };
      setStudent(foundStudent);
    }
    loadInfo();
  }, []);

  const handleAcceptInvite = async () => {
    setIsLoading(true);
    const studentId = student?.id || 's-001';
    await acceptTeacherInvite(teacherCode, studentId);
    setIsLoading(false);
    setSuccess(true);
    setTimeout(() => {
      router.push('/student');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-xl mx-auto px-4 py-16 w-full flex flex-col justify-center">
        <div className="p-8 sm:p-10 rounded-3xl glass-panel shadow-2xl border border-stone-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Sınıfa Başarıyla Katıldınız! 🎉
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {teacher?.full_name} eğitmeninizin öğrenci portföyüne bağlandınız. Ders panelinize yönlendiriliyorsunuz...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                Özel Ders Davet Bağlantısı
              </div>

              {/* Teacher Profile Showcase */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700">
                <div className="w-14 h-14 rounded-full border-2 border-indigo-500 overflow-hidden bg-white dark:bg-slate-800 shrink-0">
                  <img
                    src={teacher?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={teacher?.full_name || 'Eğitmen'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-extrabold text-base text-slate-900 dark:text-white truncate block">
                    {teacher?.full_name}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {teacher?.bio || 'Özel Ders Eğitmeni'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-stone-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      Kod: {teacherCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message to Student */}
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {teacher?.full_name} sizi ders takip sınıfına davet ediyor
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Bu daveti onayladığınızda takvim dersleriniz, ödev teslimleriniz, akıllı kitaplığınız ve sesli ders notlarınız anında hocanızla senkronize edilecektir.
                </p>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-100/60 dark:bg-slate-800/40">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  Ders & Saat Kaydırma
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-100/60 dark:bg-slate-800/40">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  Akıllı Kaynak & Kitaplık
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-100/60 dark:bg-slate-800/40">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  Ödev & PDF Teslimi
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-100/60 dark:bg-slate-800/40">
                  <ShieldCheck className="w-4 h-4 text-rose-500" />
                  Birebir Güvenli DM
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col gap-3">
                <button
                  onClick={handleAcceptInvite}
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? (
                    'Bağlanıyor...'
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Daveti Kabul Et ve Sınıfa Katıl
                    </>
                  )}
                </button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold"
                  >
                    Farklı bir hesapla giriş yapmak istiyorum →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FBFBF9] dark:bg-[#0F172A] p-8 text-center">Yükleniyor...</div>}>
      <JoinContent />
    </Suspense>
  );
}
