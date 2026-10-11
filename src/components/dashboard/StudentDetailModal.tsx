'use client';

import type { StudentWithStats } from '@/data/mockData';
import type { Lesson, Homework } from '@/types/database.types';
import { 
  X, 
  User, 
  Phone, 
  Calendar, 
  BookOpen, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  ExternalLink
} from 'lucide-react';

interface StudentDetailModalProps {
  student: StudentWithStats | null;
  lessons: Lesson[];
  homeworks: Homework[];
  onClose: () => void;
  onOpenAddLesson?: () => void;
}

export function StudentDetailModal({
  student,
  lessons,
  homeworks,
  onClose,
  onOpenAddLesson,
}: StudentDetailModalProps) {
  if (!student) return null;

  const studentLessons = lessons.filter((l) => l.student_id === student.profile.id);
  const studentHomeworks = homeworks.filter((h) => h.student_id === student.profile.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300">Teslim Edildi</span>;
      case 'reviewed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">İncelendi</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300">Bekliyor</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-4">
            <img
              src={student.profile.avatar_url || ''}
              alt={student.profile.full_name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{student.profile.full_name}</h3>
                {student.profile.username && (
                  <span className="text-xs font-mono text-indigo-400">@{student.profile.username}</span>
                )}
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300">
                  Öğrenci
                </span>
              </div>
              {student.profile.bio && (
                <p className="text-xs text-slate-300 italic mt-0.5 max-w-sm">
                  &ldquo;{student.profile.bio}&rdquo;
                </p>
              )}
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                {student.profile.phone}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Sınav Hedefleri & Netler */}
          {student.profile.exam_stats && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/20">
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <span>🎯</span> Sınav & Net İstatistikleri
                </h4>
                {student.profile.privacy_settings?.stats_visibility && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    Görünürlük: {student.profile.privacy_settings.stats_visibility}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">TYT Net</span>
                  <span className="text-base font-bold text-white font-mono">
                    {student.profile.exam_stats.tyt_net ?? '-'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">AYT Net</span>
                  <span className="text-base font-bold text-indigo-300 font-mono">
                    {student.profile.exam_stats.ayt_net ?? '-'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Haftalık Soru</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {student.profile.exam_stats.weekly_question_target ?? '-'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Hedef Hedef</span>
                  <span className="text-xs font-bold text-amber-300 truncate block mt-1" title={student.profile.exam_stats.target_university || ''}>
                    {student.profile.exam_stats.target_university || 'Belirtilmedi'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block font-medium">Toplam Ders</span>
              <span className="text-xl font-bold text-white font-mono mt-0.5 block">
                {student.totalLessons}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block font-medium">Kalan Paket Saati</span>
              <span className={`text-xl font-bold font-mono mt-0.5 block ${
                student.remainingHours <= 2 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {student.remainingHours} / {student.packageHours} Saat
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block font-medium">Paket Ödeme</span>
              <span className="text-xs font-bold text-emerald-400 font-mono mt-1.5 block">
                {student.payment?.paid_amount.toLocaleString('tr-TR')} ₺ ({student.payment?.status === 'completed' ? 'Tam' : 'Kısmi'})
              </span>
            </div>
          </div>

          {/* Kalan Paket Uyarısı */}
          {student.remainingHours <= 2 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                Dikkat: Bu öğrencinin sadece <strong>{student.remainingHours} saat</strong> paketi kaldı. Yeni paket yenilemesi talep edebilirsiniz.
              </span>
            </div>
          )}

          {/* Lessons History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Ders Geçmişi & Planlanan Dersler ({studentLessons.length})
              </h4>
            </div>

            <div className="space-y-2">
              {studentLessons.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">Henüz planlanan ders kaydı yok.</p>
              ) : (
                studentLessons.map((les) => (
                  <div
                    key={les.id}
                    className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white block">{les.title}</span>
                      <span className="text-slate-400 text-[11px]">
                        {les.start_time.replace('T', ' - ')}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold">
                      {les.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Homeworks List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Atanan Ödevler & Dosyalar ({studentHomeworks.length})
              </h4>
            </div>

            <div className="space-y-2">
              {studentHomeworks.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">Aktif ödev bulunmuyor.</p>
              ) : (
                studentHomeworks.map((hw) => (
                  <div
                    key={hw.id}
                    className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{hw.description}</span>
                      {getStatusBadge(hw.status)}
                    </div>
                    {hw.file_url && (
                      <div className="flex items-center gap-1.5 text-[11px] text-indigo-400 hover:text-indigo-300">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="truncate">{hw.file_url}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Kapat
          </button>
          {onOpenAddLesson && (
            <button
              onClick={() => {
                onClose();
                onOpenAddLesson();
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Calendar className="w-3.5 h-3.5" />
              Bu Öğrenciye Ders Planla
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
