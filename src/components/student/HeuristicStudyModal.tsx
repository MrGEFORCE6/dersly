'use client';

import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Target,
  Clock,
  BookOpen,
  Calendar,
  CheckCircle2,
  X,
  Layers,
  ArrowRight,
  Flame,
} from 'lucide-react';
import type { ScheduleEvent, ScheduleEventInsert } from '@/types/database.types';
import {
  generateHeuristicStudyPlan,
  TURKISH_DAYS,
  EVENT_TYPE_LABELS,
  type HeuristicPlanOptions,
} from '@/lib/services/exportImportService';
import { createBulkScheduleEvents } from '@/lib/services/supabaseService';

interface HeuristicStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  existingEvents: ScheduleEvent[];
  onPlanApplied: (created: ScheduleEvent[]) => void;
}

export function HeuristicStudyModal({
  isOpen,
  onClose,
  userId,
  existingEvents,
  onPlanApplied,
}: HeuristicStudyModalProps) {
  const [examType, setExamType] = useState<'yks' | 'lgs' | 'school_exams' | 'general'>('yks');
  const [targetDailyHours, setTargetDailyHours] = useState<number>(3);
  const [sessionDuration, setSessionDuration] = useState<number>(45);
  const [breakDuration, setBreakDuration] = useState<number>(15);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'Matematik',
    'Fizik',
    'Türkçe (Paragraf)',
    'Kimya',
    'Biyoloji',
    'Geometri',
  ]);

  const [proposedPlan, setProposedPlan] = useState<ScheduleEventInsert[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const allAvailableSubjects = [
    'Matematik',
    'Fizik',
    'Kimya',
    'Biyoloji',
    'Geometri',
    'Türkçe (Paragraf)',
    'Edebiyat',
    'Tarih',
    'Coğrafya',
    'Felsefe & Din',
    'Fen Bilimleri',
    'T.C. İnkılap Tarihi',
    'İngilizce',
  ];

  const handleToggleSubject = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handleGeneratePlan = () => {
    if (selectedSubjects.length === 0) {
      alert('Lütfen en az bir ders seçin.');
      return;
    }

    const options: HeuristicPlanOptions = {
      userId,
      examType,
      targetDailyHours,
      sessionDurationMinutes: sessionDuration,
      breakDurationMinutes: breakDuration,
      selectedSubjects,
    };

    const generated = generateHeuristicStudyPlan(existingEvents, options);
    setProposedPlan(generated);
  };

  const handleApplyPlan = async () => {
    if (!proposedPlan || proposedPlan.length === 0) return;
    setIsLoading(true);

    try {
      const created = await createBulkScheduleEvents(proposedPlan);
      onPlanApplied(created);
      onClose();
    } catch (e: any) {
      alert('Plan uygulanırken hata oluştu: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Group proposed plan by day
  const groupedProposed = proposedPlan
    ? proposedPlan.reduce((acc, cur) => {
        const d = cur.day_of_week;
        if (!acc[d]) acc[d] = [];
        acc[d].push(cur);
        return acc;
      }, {} as Record<number, ScheduleEventInsert[]>)
    : {};

  const totalSessions = proposedPlan?.length || 0;
  const totalMinutes = totalSessions * sessionDuration;
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Yapay Zeka Destekli Akıllı Etüt Planlayıcı
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Sezgisel Motor
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Okul ve özel ders saatlerinizi bloke ederek boş vakitlerinize en verimli etüt çizelgesini oluşturur
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!proposedPlan ? (
            <div className="space-y-6">
              {/* Exam Focus Target */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-500" />
                  Hedef ve Çalışma Odak Alanı
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'yks', title: 'YKS (TYT - AYT)', desc: 'Yoğun soru & tekrar' },
                    { id: 'lgs', title: 'LGS Hazırlık', desc: 'Yeni nesil sorular' },
                    { id: 'school_exams', title: 'Okul Yazılıları', desc: 'Konu pekiştirme' },
                    { id: 'general', title: 'Genel Gelişim', desc: 'Düzenli çalışma' },
                  ].map((target) => (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => setExamType(target.id as any)}
                      className={`p-3 rounded-2xl border text-left transition ${
                        examType === target.id
                          ? 'bg-indigo-500/10 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{target.title}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {target.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Study Pace & Duration Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    Günlük Hedef Çalışma Süresi
                  </label>
                  <select
                    value={targetDailyHours}
                    onChange={(e) => setTargetDailyHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value={2}>2 Saat / Gün (Hafif Tempo)</option>
                    <option value={3}>3 Saat / Gün (İdeal Denge)</option>
                    <option value={4}>4 Saat / Gün (Sınav Kampı)</option>
                    <option value={5}>5 Saat / Gün (Maksimum Odak)</option>
                  </select>
                </div>

                <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    Oturum Süresi (Pomodoro)
                  </label>
                  <select
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value={30}>30 Dakika</option>
                    <option value={45}>45 Dakika (Önerilen)</option>
                    <option value={50}>50 Dakika</option>
                    <option value={60}>60 Dakika (Blok)</option>
                  </select>
                </div>

                <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    Mola Süresi
                  </label>
                  <select
                    value={breakDuration}
                    onChange={(e) => setBreakDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value={10}>10 Dakika</option>
                    <option value={15}>15 Dakika (Standart)</option>
                    <option value={20}>20 Dakika</option>
                  </select>
                </div>
              </div>

              {/* Subject Selection Chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    Planlamaya Dahil Edilecek Dersler
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {selectedSubjects.length} ders seçildi
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allAvailableSubjects.map((sub) => {
                    const isSelected = selectedSubjects.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => handleToggleSubject(sub)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Generated Plan Preview */
            <div className="space-y-5">
              {/* Summary Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase">
                    Toplam Oturum
                  </div>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-300">
                    {totalSessions} Blok
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                    Haftalık Çalışma
                  </div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-300">
                    {totalHours} Saat
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">
                    Hedef Soru & Tekrar
                  </div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-300">
                    {totalSessions * 35}+ Soru
                  </div>
                </div>
              </div>

              {/* Day-by-Day Plan Cards */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {Object.keys(groupedProposed).map((dayKey) => {
                  const dayNum = Number(dayKey);
                  const dayEvents = groupedProposed[dayNum] || [];
                  return (
                    <div
                      key={dayNum}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          {TURKISH_DAYS[dayNum]}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {dayEvents.length} Çalışma Bloğu
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {dayEvents.map((ev, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                {ev.title}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                {ev.notes}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block">
                                {ev.start_time} - {ev.end_time}
                              </span>
                              <span className="text-[9px] uppercase font-bold text-slate-400">
                                {EVENT_TYPE_LABELS[ev.event_type || 'personal_study']}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          {proposedPlan ? (
            <button
              onClick={() => setProposedPlan(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Parametreleri Değiştir
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Vazgeç
            </button>
          )}

          {!proposedPlan ? (
            <button
              onClick={handleGeneratePlan}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition"
            >
              <Sparkles className="w-4 h-4" />
              Akıllı Planı Oluştur
            </button>
          ) : (
            <button
              disabled={isLoading || totalSessions === 0}
              onClick={handleApplyPlan}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              {totalSessions} Etüt Bloğunu Takvime Ekle
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
