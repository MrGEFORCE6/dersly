'use client';

import React, { useState, useEffect } from 'react';
import type { Lesson, Book } from '@/types/database.types';
import type { StudentWithStats } from '@/data/mockData';
import { fetchBooks, updateLessonVoiceAndNotes } from '@/lib/services/supabaseService';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Trash2, 
  RotateCcw,
  BookOpen,
  CalendarClock,
  AlertTriangle,
  Mic,
  Play,
  Pause,
  Download,
  Paperclip,
  Upload
} from 'lucide-react';

interface LessonDetailModalProps {
  lesson: Lesson | null;
  student?: StudentWithStats;
  onClose: () => void;
  onCompleteLesson: (lessonId: string, studentId: string) => void;
  onCancelLesson?: (lessonId: string) => void;
  onDeleteLesson?: (lessonId: string) => void;
  onReactivateLesson?: (lessonId: string) => void;
  onRescheduleLesson?: (lessonId: string, newStartTime: string, newEndTime: string) => void;
  onSetRequiredBook?: (lessonId: string, bookTitle: string) => void;
}

export function LessonDetailModal({
  lesson,
  student,
  onClose,
  onCompleteLesson,
  onCancelLesson,
  onDeleteLesson,
  onReactivateLesson,
  onRescheduleLesson,
  onSetRequiredBook,
}: LessonDetailModalProps) {
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  
  // Reschedule form state
  const [newDate, setNewDate] = useState('');
  const [newStartHour, setNewStartHour] = useState('14:00');
  const [newEndHour, setNewEndHour] = useState('15:30');

  // Student books state
  const [studentBooks, setStudentBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState(lesson?.required_book || '');

  // Voice note and digital whiteboard notes state
  const [audioNoteUrl, setAudioNoteUrl] = useState(lesson?.audio_note_url || '');
  const [digitalNotesUrl, setDigitalNotesUrl] = useState(lesson?.digital_notes_url || '');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [writtenNotes, setWrittenNotes] = useState(lesson?.notes || '');
  const [saveVoiceSuccess, setSaveVoiceSuccess] = useState(false);

  useEffect(() => {
    if (lesson?.start_time) {
      setNewDate(lesson.start_time.split('T')[0] || '');
      setSelectedBook(lesson.required_book || '');
      setAudioNoteUrl(lesson.audio_note_url || '');
      setDigitalNotesUrl(lesson.digital_notes_url || '');
      setWrittenNotes(lesson.notes || '');
    }
    if (student?.profile.id) {
      fetchBooks(student.profile.id).then((b) => setStudentBooks(b));
    }
  }, [lesson, student]);

  if (!lesson) return null;

  const startTime = lesson.start_time.replace('T', ' ').slice(0, 16);
  const endTime = lesson.end_time.split('T')[1]?.slice(0, 5) || '';

  const isCompleted = lesson.status === 'completed';
  const isCancelled = lesson.status === 'cancelled';

  const handleApplyReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newStartHour || !newEndHour) return;
    const newStartISO = `${newDate}T${newStartHour}:00`;
    const newEndISO = `${newDate}T${newEndHour}:00`;
    onRescheduleLesson?.(lesson.id, newStartISO, newEndISO);
    setRescheduleModalOpen(false);
    onClose();
  };

  const handleApplyBook = (bookTitle: string) => {
    setSelectedBook(bookTitle);
    onSetRequiredBook?.(lesson.id, bookTitle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-xl border ${
              isCompleted 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                : isCancelled
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
            }`}>
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Ders Detayı ve Yönetimi</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Akıllı takvim & öğrenci oturum kontrolü</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Status Alert */}
          {isCompleted ? (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Bu ders <strong>tamamlandı</strong> ve öğrencinin paket kredisinden 1 saat otomatik düşüldü.</span>
            </div>
          ) : isCancelled ? (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>Bu ders <strong>iptal olarak saklandı</strong> (takvimde soluk yedek olarak tutuluyor).</span>
              </div>
              {onReactivateLesson && (
                <button
                  onClick={() => {
                    onReactivateLesson(lesson.id);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-semibold text-[11px] hover:bg-indigo-500 transition-all flex items-center gap-1 shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  Geri Al / Aktif Et
                </button>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-900 dark:text-indigo-300 text-xs flex items-center gap-2.5">
              <Clock className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
              <span>Ders planlandı durumunda. Tamamlandığında 1 tıkla kredi düşümü yapabilir veya saati kaydırabilirsiniz.</span>
            </div>
          )}

          {/* Reschedule Alert if Pending */}
          {lesson.reschedule_request?.status === 'pending' && (
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/25 text-blue-900 dark:text-blue-200 text-xs flex items-center gap-2.5">
              <CalendarClock className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                <strong>Saat Güncellemesi Talebi:</strong> Öğrenciye ({lesson.reschedule_request.new_start_time.replace('T', ' ')} - {lesson.reschedule_request.new_end_time.split('T')[1]}) bildirimi iletildi, onay bekleniyor.
              </span>
            </div>
          )}

          {/* Lesson Title */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Ders Başlığı & Konu
            </span>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              {lesson.title}
            </h4>
          </div>

          {/* Student Profile Card */}
          {student && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={student.profile.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                  alt={student.profile.full_name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow"
                />
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">{student.profile.full_name}</h5>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {student.profile.phone || 'Telefon Kaydı Yok'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Kalan Paket</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {student.remainingHours} Saat
                </span>
              </div>
            </div>
          )}

          {/* Time & Date Display */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">Zaman Aralığı</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                {startTime.split(' ')[1]} - {endTime}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">Tarih</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                {startTime.split(' ')[0]}
              </span>
            </div>
          </div>

          {/* Akıllı Kitaplık: Bu Derse Kitap İste */}
          <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-500" />
                Bu Derse Kitap / Kaynak İste
              </span>
              {selectedBook && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ İstenen Kitap Seçili
                </span>
              )}
            </div>

            {studentBooks.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                Öğrencinin kütüphanesine henüz kitap eklenmemiş. Öğrenci portalından TYT/AYT kitapları eklendiğinde burada listelenecektir.
              </p>
            ) : (
              <select
                value={selectedBook}
                onChange={(e) => handleApplyBook(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Kitap Seçimi Yok --</option>
                {studentBooks.map((b) => (
                  <option key={b.id} value={b.title}>
                    📖 {b.title} ({b.publisher || b.subject || 'Kaynak'})
                  </option>
                ))}
              </select>
            )}
            {selectedBook && (
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                📌 Öğrenciye not iletilecektir: <em>"Bu derse {selectedBook} kitabını getir."</em>
              </p>
            )}
          </div>

          {/* Voice Note & Digital Whiteboard (Hoca Geri Bildirimi) */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 space-y-3">
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Sesli Not & Dijital Tahta Notu Bırak
            </span>

            {/* Voice Recording Control */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isRecording) {
                      setIsRecording(false);
                      setAudioNoteUrl('https://derspompa.app/audio/ders_ozeti_sesli.mp3');
                    } else {
                      setIsRecording(true);
                      setTimeout(() => {
                        setIsRecording(false);
                        setAudioNoteUrl('https://derspompa.app/audio/ders_ozeti_sesli.mp3');
                      }, 2500);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse'
                      : audioNoteUrl
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  {isRecording ? 'Kaydediliyor (00:03)...' : audioNoteUrl ? 'Yeniden Kaydet' : '🎙️ Sesli Not Kaydet'}
                </button>

                {audioNoteUrl && (
                  <button
                    type="button"
                    onClick={() => setIsPlayingVoice(!isPlayingVoice)}
                    className="p-1.5 rounded-lg bg-stone-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-stone-200 transition-colors"
                    title="Kaydı Dinle"
                  >
                    {isPlayingVoice ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              <span className="text-[11px] text-slate-500 font-mono">
                {audioNoteUrl ? '✓ 1 dk 15 sn' : 'Ses kaydı yok'}
              </span>
            </div>

            {/* Digital Whiteboard File Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ders tahtası PDF/Görsel linki (örn: https://...)"
                value={digitalNotesUrl}
                onChange={(e) => setDigitalNotesUrl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setDigitalNotesUrl('https://derspompa.app/files/turev_tahta_ozeti_ders.pdf')}
                className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-50 transition-colors"
                title="Örnek Tahta PDF Ekle"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Save Voice & Whiteboard Button */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={async () => {
                  await updateLessonVoiceAndNotes(lesson.id, audioNoteUrl, digitalNotesUrl, writtenNotes);
                  setSaveVoiceSuccess(true);
                  setTimeout(() => setSaveVoiceSuccess(false), 2000);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {saveVoiceSuccess ? 'Kaydedildi!' : 'Sesli & Dijital Notu Kaydet'}
              </button>

              {saveVoiceSuccess && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ Öğrenci & Veli paneline iletildi
                </span>
              )}
            </div>
          </div>

          {/* Written Notes */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Yazılı Eğitmen Notu
            </span>
            <textarea
              rows={2}
              value={writtenNotes}
              onChange={(e) => setWrittenNotes(e.target.value)}
              placeholder="Ders sırasında dikkat edilen noktalar veya ödev talimatı..."
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Kapat
            </button>

            {/* İptal / Sil Butonu */}
            <button
              onClick={() => setCancelModalOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>İptal / Sil</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Ders Kaydırma Butonu */}
            {!isCompleted && !isCancelled && (
              <button
                onClick={() => setRescheduleModalOpen(true)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 transition-all flex items-center gap-1.5"
              >
                <CalendarClock className="w-3.5 h-3.5" />
                <span>Saatini Kaydır</span>
              </button>
            )}

            {/* Tamamlandı İşaretle */}
            {!isCompleted && !isCancelled && (
              <button
                onClick={() => {
                  onCompleteLesson(lesson.id, lesson.student_id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Dersi Tamamla (-1 Saat)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 1. İptal & Silme Seçim Diyaloğu */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Dersi Nasıl Kaldırmak İstersiniz?</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Takvim ve öğrenci geçmişi için tercihinizi seçin</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>"{lesson.title}"</strong> dersi için iki seçeneğiniz bulunmaktadır:
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  onCancelLesson?.(lesson.id);
                  setCancelModalOpen(false);
                  onClose();
                }}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-500">
                    📁 İptal Olarak Sakla (Yedekte Tut)
                  </span>
                  <span className="text-[10px] text-amber-500 font-mono">Önerilen</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Ders takvimde soluk ve üstü çizili kalır. İstediğiniz an tek tıkla geri alıp tekrar aktif edebilirsiniz.
                </p>
              </button>

              <button
                onClick={() => {
                  onDeleteLesson?.(lesson.id);
                  setCancelModalOpen(false);
                  onClose();
                }}
                className="w-full p-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    🗑️ Tamamen Sil (Kalıcı Olarak Uçur)
                  </span>
                  <span className="text-[10px] text-rose-500 font-mono">Kalıcı</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Ders veritabanından ve takvimden tamamen silinir. Geri alınamaz.
                </p>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Ders Kaydırma (Reschedule) Modalı */}
      {rescheduleModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <form
            onSubmit={handleApplyReschedule}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <CalendarClock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Ders Saatini Kaydır</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Yeni tarih ve saat öğrenciye onay olarak iletilir</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Yeni Tarih
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Başlangıç Saati
                  </label>
                  <input
                    type="time"
                    required
                    value={newStartHour}
                    onChange={(e) => setNewStartHour(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bitiş Saati
                  </label>
                  <input
                    type="time"
                    required
                    value={newEndHour}
                    onChange={(e) => setNewEndHour(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-300 text-[11px] leading-relaxed">
              💡 Bu saat güncellemesi öğrencinin web ve mobil paneline anlık onay kartı olarak düşecektir. Öğrenci kabul ettiğinde ders saati otomatik güncellenir.
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRescheduleModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
              >
                Güncelleme Talebi Gönder
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
