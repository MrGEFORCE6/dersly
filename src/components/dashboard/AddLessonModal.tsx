'use client';

import { useState, useEffect } from 'react';
import type { Lesson, ScheduleEvent } from '@/types/database.types';
import type { StudentWithStats } from '@/data/mockData';
import { fetchScheduleEvents, detectLessonConflictWithSchedule } from '@/lib/services/supabaseService';
import { X, Calendar, Clock, BookOpen, User, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AddLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentWithStats[];
  onAddLesson: (lesson: Lesson) => void;
}

export function AddLessonModal({
  isOpen,
  onClose,
  students,
  onAddLesson,
}: AddLessonModalProps) {
  const [studentId, setStudentId] = useState(students[0]?.profile.id || '');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-10-12');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:30');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [studentSchedule, setStudentSchedule] = useState<ScheduleEvent[]>([]);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchScheduleEvents(studentId).then((events) => {
        setStudentSchedule(events);
      });
    }
  }, [isOpen, studentId]);

  useEffect(() => {
    if (studentSchedule.length > 0 && date && startTime && endTime && startTime < endTime) {
      const check = detectLessonConflictWithSchedule(studentSchedule, {
        start_time: `${date}T${startTime}:00`,
        end_time: `${date}T${endTime}:00`,
      });
      if (check.hasConflict) {
        setConflictWarning(check.message || 'Öğrencinin bu saatte başka bir dersi var!');
      } else {
        setConflictWarning(null);
      }
    } else {
      setConflictWarning(null);
    }
  }, [studentSchedule, date, startTime, endTime]);


  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Lütfen bir ders başlığı girin.');
      return;
    }
    if (!studentId) {
      setError('Lütfen bir öğrenci seçin.');
      return;
    }
    if (startTime >= endTime) {
      setError('Bitiş saati başlangıç saatinden sonra olmalıdır.');
      return;
    }

    const newLesson: Lesson = {
      id: `les-${Date.now()}`,
      teacher_id: 't-001',
      student_id: studentId,
      title: title.trim(),
      start_time: `${date}T${startTime}:00`,
      end_time: `${date}T${endTime}:00`,
      status: 'scheduled',
      notes: notes.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onAddLesson(newLesson);
    setTitle('');
    setNotes('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Yeni Ders Randevusu Oluştur</h3>
              <p className="text-xs text-slate-400">Takvime yeni bir özel ders oturumu ekleyin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {conflictWarning && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">⚠️ Dikkat: Öğrenci Zaman Çakışması</span>
              <span>{conflictWarning}</span>
            </div>
          </div>
        )}


        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Öğrenci Seçimi */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              Öğrenci Seçimi
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {students.map((st) => (
                <option key={st.profile.id} value={st.profile.id}>
                  {st.profile.full_name} (Kalan: {st.remainingHours} saat)
                </option>
              ))}
            </select>
          </div>

          {/* Ders Başlığı */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              Ders Başlığı & Konu
            </label>
            <input
              type="text"
              required
              placeholder="Örn: AYT Matematik - Polinomlar ve Çarpanlara Ayırma"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Tarih */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              Ders Tarihi
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Saat Aralığı */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Başlangıç Saati
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Bitiş Saati
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Notlar */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Ders Notları & Hazırlıklar (Opsiyonel)
            </label>
            <textarea
              rows={2}
              placeholder="Öğrencinin getirmesi gereken kaynaklar veya odaklanılacak özel sorular..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Butonlar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Dersi Takvime Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
