'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import {
  fetchLessons,
  fetchHomeworks,
  fetchProfiles,
  uploadFileToStorage,
  updateHomework,
  respondToReschedule,
  fetchBooks,
  createBook,
  deleteBook,
  fetchStudentClasses,
  fetchScheduleEvents,
} from '@/lib/services/supabaseService';
import type { Lesson, Homework, Profile, Book, Class, ScheduleEvent } from '@/types/database.types';
import { SmartSchedulePlanner } from '@/components/student/SmartSchedulePlanner';
import { ThemeSelector } from '@/components/theme/ThemeSelector';
import {
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  UploadCloud,

  CheckCircle2,
  FileText,
  ExternalLink,
  ArrowLeft,
  User,
  Settings,
  Sparkles,
  Bot,
  Send,
  X,
  Smartphone,
  MessageSquare,
  CalendarClock,
  Camera,
  Plus,
  Trash2,
  Check,
  Library,
  BookMarked,
  Mic,
  Download,
  Play,
  Pause,
  AlertTriangle,
  Link as LinkIcon
} from 'lucide-react';

import { Navbar } from '@/components/Navbar';

export default function StudentPortalPage() {
  const { accentClasses } = useTheme();

  const [studentProfile, setStudentProfile] = useState<Profile>({
    id: 's-001',
    full_name: 'Zeynep Kaya',
    username: 'zeynep.kaya',
    role: 'student',
    bio: 'Hedef: Boğaziçi Bilgisayar Müh. 🚀',
    phone: '+90 542 111 2233',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    exam_stats: { tyt_net: 98.5, ayt_net: 72.0, weekly_question_target: 750 },
    privacy_settings: { stats_visibility: 'public' },
    theme_preference: { mode: 'light', accent: 'sapphire' },
    created_at: '2026-10-11T00:00:00.000Z',
    updated_at: '2026-10-11T00:00:00.000Z',
  });

  // Clean initial empty state
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [remainingHours, setRemainingHours] = useState(8);
  const [totalPackage, setTotalPackage] = useState(20);

  // Upload modal state
  const [activeUploadHw, setActiveUploadHw] = useState<Homework | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNote, setUploadNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Books / Scan state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualPublisher, setManualPublisher] = useState('');
  const [manualSubject, setManualSubject] = useState('TYT Matematik');

  // AI Chat state
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: 'Merhaba! 👋 Ben senin özel ders koçunum. Takıldığın bir soru veya konu olursa adım adım birlikte çözelim! Nasıl yardımcı olabilirim?',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [studentClasses, setStudentClasses] = useState<Class[]>([]);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'schedule' | 'overview' | 'library'>('schedule');

  useEffect(() => {
    async function loadData() {
      const [dbProfiles, dbLessons, dbHws, dbBooks, dbSchedule] = await Promise.all([
        fetchProfiles(),
        fetchLessons(),
        fetchHomeworks(),
        fetchBooks(),
        fetchScheduleEvents(),
      ]);

      let currentStudentId = 's-001';
      if (dbProfiles && dbProfiles.length > 0) {
        const student = dbProfiles.find((p) => p.role === 'student') || dbProfiles[0];
        setStudentProfile(student);
        currentStudentId = student.id;
      }
      setLessons(dbLessons || []);
      setHomeworks(dbHws || []);
      setBooks(dbBooks || []);
      setScheduleEvents(dbSchedule || []);

      const classes = await fetchStudentClasses(currentStudentId);
      setStudentClasses(classes);
    }
    loadData();
  }, []);


  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleCompleteUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUploadHw || !selectedFile) return;

    setIsUploading(true);
    const storageUrl = await uploadFileToStorage(
      'homework-files',
      selectedFile,
      `${studentProfile.id}_${activeUploadHw.id}_${selectedFile.name}`
    );

    await updateHomework(activeUploadHw.id, {
      status: 'submitted',
      file_url: storageUrl,
      submission_notes: uploadNote.trim() || 'Öğrenci tarafından teslim edildi.',
      submitted_at: new Date().toISOString(),
    });

    setHomeworks((prev) =>
      prev.map((h) =>
        h.id === activeUploadHw.id
          ? {
            ...h,
            status: 'submitted' as const,
            file_url: storageUrl,
            submission_notes: uploadNote.trim(),
          }
          : h
      )
    );

    setIsUploading(false);
    setActiveUploadHw(null);
    setSelectedFile(null);
    setUploadNote('');
    showToast('✓ Çözüm dosyası başarıyla teslim edildi ve öğretmeninize iletildi!');
  };

  // Reschedule approval or rejection
  const handleRespondReschedule = async (lessonId: string, accept: boolean) => {
    const updated = await respondToReschedule(lessonId, accept);
    if (updated) {
      setLessons((prev) => prev.map((l) => (l.id === lessonId ? updated : l)));
      showToast(accept ? '✓ Yeni ders saati onaylandı ve takvim güncellendi!' : 'Ders saati değişikliği reddedildi.');
    }
  };

  // Scan book via Gemini Vision API
  const handleScanBook = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    showToast('🔍 Kitap kapağı Gemini Vision API ile taranıyor...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch('/api/scan-book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, sampleName: file.name }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.book) {
            const created = await createBook({
              student_id: studentProfile.id,
              title: data.book.title,
              publisher: data.book.publisher,
              subject: data.book.subject,
              topics: data.book.topics,
            });
            setBooks((prev) => [created, ...prev]);
            showToast(`✓ "${created.title}" kitaplığınıza eklendi!`);
          }
        }
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setIsScanning(false);
      showToast('Kitap tarama sırasında bir sorun oluştu.');
    }
  };

  const handleAddManualBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const created = await createBook({
      student_id: studentProfile.id,
      title: manualTitle.trim(),
      publisher: manualPublisher.trim() || 'Kaynak Yayınevi',
      subject: manualSubject,
      topics: ['Genel Konu Testleri'],
    });

    setBooks((prev) => [created, ...prev]);
    setManualTitle('');
    setManualPublisher('');
    setIsBookModalOpen(false);
    showToast(`✓ "${created.title}" kütüphanenize eklendi!`);
  };

  const handleDeleteBook = async (id: string) => {
    await deleteBook(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
    showToast('Kitap kütüphanenizden kaldırıldı.');
  };

  // AI chat send
  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          studentName: studentProfile.full_name,
          course: 'AYT Matematik & Fizik',
        }),
      });

      const data = await res.json();
      setChatMessages((prev) => [...prev, { sender: 'ai', text: data.reply || 'Harika bir soru!' }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Harika bir soru! 💡 Önce soruda verilen teğet eğimini ve formülü bir kenara yazalım. Adım adım gidelim!',
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const percentageUsed = Math.round(((totalPackage - remainingHours) / totalPackage) * 100);
  const pendingReschedules = lessons.filter((l) => l.reschedule_request?.status === 'pending');

  return (
    <div className="min-h-screen transition-colors duration-200" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-400/40 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navbar */}
      <Navbar />

      {/* Main Container */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Pending Reschedule Notification Card */}
        {pendingReschedules.length > 0 && (
          <div className="space-y-3">
            {pendingReschedules.map((les) => (
              <div
                key={les.id}
                className="p-4 sm:p-5 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg animate-in fade-in"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                    <CalendarClock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Ders Saati Güncelleme Talebi
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200">
                    Öğretmeniniz <strong>"{les.title}"</strong> dersinizi{' '}
                    <strong className="font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {les.reschedule_request?.new_start_time.replace('T', ' ')} - {les.reschedule_request?.new_end_time.split('T')[1]}
                    </strong>{' '}
                    olarak güncellemek istiyor.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRespondReschedule(les.id, true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Onayla ve Güncelle</span>
                  </button>
                  <button
                    onClick={() => handleRespondReschedule(les.id, false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 transition-all"
                  >
                    Reddet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Welcome & Social Stats Banner */}
        <div className="rounded-3xl p-6 sm:p-8 glass-panel shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}>
              <Sparkles className="w-3.5 h-3.5" />
              Canlı Öğrenci Akademik Takip Paneli
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Hoş Geldin, {studentProfile.full_name} ✨
            </h1>
            {studentClasses.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {studentClasses.map((cls) => (
                  <span
                    key={cls.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    Sınıfım: {cls.name} ({cls.grade_level || '12. Sınıf'})
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Kalan paket saatlerinizi, yaklaşan derslerinizi, kütüphanenizi ve ödevlerinizi canlı takip edin.
            </p>
          </div>

          {/* Package Hours Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 min-w-[260px] space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kalan Paket Saati</span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">%{percentageUsed} Kullanıldı</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">{remainingHours}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">/ {totalPackage} Saat</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${percentageUsed}%` }} />
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block pt-0.5">
              Paket bitiminde ders kredisi bildiriminiz otomatik iletilir.
            </span>
          </div>
        </div>

        {/* Student Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'schedule'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Haftalık Ders & Etüt Programı
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Ödevler & Randevular
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'library'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Library className="w-4 h-4" />
            Akıllı Kitaplığım ({books.length})
          </button>
        </div>

        {/* Schedule Tab View */}
        {activeTab === 'schedule' && (
          <SmartSchedulePlanner
            userId={studentProfile.id}
            initialEvents={scheduleEvents}
            studentName={studentProfile.full_name}
            className={studentClasses[0]?.name || 'Dersly Sınıfı'}
          />
        )}

        {/* Overview Tab (Lessons & Homeworks) */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Upcoming & Completed Lessons */}
            <div className="rounded-3xl p-6 glass-panel shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700/60">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Ders Takvimim
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{lessons.length} Oturum</span>
                </div>


              {lessons.length === 0 ? (
                <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs italic">
                  Planlanmış ders bulunmuyor.
                </div>
              ) : (
                <div className="space-y-3">
                  {lessons.map((les) => (
                    <div
                      key={les.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">{les.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${les.status === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                            : les.status === 'scheduled'
                              ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                              : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                          }`}>
                          {les.status === 'completed' ? 'Tamamlandı' : les.status === 'scheduled' ? 'Planlandı' : 'İptal'}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {les.start_time.replace('T', ' ')}
                      </span>

                      {/* Required Book Special Notice Badge */}
                      {les.required_book && (
                        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>📌 Hocandan Not: Bu derse <u>{les.required_book}</u> kitabını getir.</span>
                        </div>
                      )}

                      {/* Teacher Voice Feedback if available */}
                      {les.audio_note_url && (
                        <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                            <Mic className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            Hocanın Sesli Geri Bildirimi
                          </span>
                          <button
                            type="button"
                            onClick={() => alert('Hocanızın ses kaydı dinleniyor: "Zeynep bu hafta türev testlerinde çok iyiydin..."')}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-bold flex items-center gap-1 hover:bg-indigo-500 transition-colors"
                          >
                            <Play className="w-3 h-3" /> Dinle
                          </button>
                        </div>
                      )}

                      {/* Digital Whiteboard Notes Download */}
                      {les.digital_notes_url && (
                        <div className="p-2 rounded-xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-emerald-500" />
                            Ders Tahtası / Notlar
                          </span>
                          <button
                            type="button"
                            onClick={() => alert('Ders tahtası PDF dokümanı indiriliyor...')}
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                          >
                            <Download className="w-3 h-3" /> İndir
                          </button>
                        </div>
                      )}

                      {les.notes && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">&ldquo;{les.notes}&rdquo;</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. Homeworks & Solution Upload */}
          <div className="rounded-3xl p-6 glass-panel shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700/60">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Ödevlerim & Materyaller
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {homeworks.filter((h) => h.status === 'pending').length} Bekleyen
                </span>
              </div>

              {homeworks.length === 0 ? (
                <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs italic">
                  Bekleyen ödev bulunmuyor.
                </div>
              ) : (
                <div className="space-y-3">
                  {homeworks.map((hw) => {
                    const isPending = hw.status === 'pending';
                    const isSubmitted = hw.status === 'submitted';
                    const isReviewed = hw.status === 'reviewed';
                    const isRevision = hw.status === 'revision_requested';

                    return (
                      <div
                        key={hw.id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isReviewed
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                                : isSubmitted
                                ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                                : isRevision
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {isReviewed
                              ? `✓ İncelendi ${hw.score !== null ? `(${hw.score}/100)` : ''}`
                              : isSubmitted
                              ? 'Teslim Edildi'
                              : isRevision
                              ? '⚠️ Düzeltme İstendi'
                              : 'Çözüm Bekliyor'}
                          </span>

                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {hw.due_date ? hw.due_date.split('T')[0] : 'Tarih Yok'}
                          </span>
                        </div>

                        <div>
                          {hw.title && (
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                              {hw.title}
                            </h4>
                          )}
                          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                            {hw.description}
                          </p>
                        </div>

                        {/* Badges: Time & Resources */}
                        <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px]">
                          {hw.estimated_minutes && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-semibold">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {hw.estimated_minutes} dk
                            </span>
                          )}

                          {hw.resource_url && (
                            <a
                              href={hw.resource_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                            >
                              <LinkIcon className="w-3 h-3" />
                              <span>Çalışma Kağıdı / Video</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>

                        {/* Submitted File Link */}
                        {hw.file_url && (
                          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                            <a
                              href={hw.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-mono flex items-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Yüklenen Çözüm Dosyası</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {/* Teacher Feedback Note if available */}
                        {hw.teacher_feedback && (
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs font-medium space-y-1">
                            <span className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                              <MessageSquare className="w-3.5 h-3.5" />
                              Öğretmeninin Değerlendirme Notu:
                            </span>
                            <p>{hw.teacher_feedback}</p>
                          </div>
                        )}

                        {/* Upload Button or Submission Status */}
                        {isPending || isRevision ? (
                          <button
                            type="button"
                            onClick={() => setActiveUploadHw(hw)}
                            className="w-full mt-2 py-2.5 rounded-xl text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                            style={{ backgroundColor: isRevision ? '#f59e0b' : 'var(--accent-primary)' }}
                          >
                            <UploadCloud className="w-4 h-4" />
                            <span>
                              {isRevision
                                ? '⚠️ Düzeltilmiş Çözümü / PDF Yükle'
                                : 'PDF veya Çözüm Yükle'}
                            </span>
                          </button>
                        ) : (
                          <div className="py-1 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-[11px] text-center font-mono">
                            {hw.submission_notes || 'Dosya öğretmeninizin paneline iletildi.'}
                          </div>
                        )}
                      </div>
                    );
                  })}

                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Library Tab (Bookshelf & Gemini Vision Scan) */}
        {activeTab === 'library' && (
          <div className="rounded-3xl p-6 sm:p-7 glass-panel shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Library className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Akıllı Kitaplığım & Kaynaklar</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Öğretmeninizin takip edebilmesi için kullandığınız ders kitaplarını ve soru bankalarını ekleyin.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <label className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95">
                  <Camera className="w-4 h-4" />
                  <span>{isScanning ? 'Taranıyor...' : 'Kamera / Fotoğraf ile Tara'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isScanning}
                    onChange={handleScanBook}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(true)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Manuel Kitap Ekle</span>
                </button>
              </div>
            </div>

            {books.length === 0 ? (
              <div className="py-16 text-center space-y-3 text-slate-500 dark:text-slate-400">
                <BookMarked className="w-12 h-12 mx-auto text-amber-500/50" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Kitaplığınıza henüz kaynak eklenmedi</p>
                <p className="text-xs max-w-md mx-auto">
                  Kitap kapağını fotoğraflayarak veya manuel ekleyerek öğretmeninize kaynaklarınızı gösterin.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {books.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 group hover:border-amber-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{b.title}</h4>
                        <span className="text-xs text-amber-700 dark:text-amber-400 font-mono block mt-1">
                          {b.publisher} • {b.subject}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteBook(b.id)}
                        className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {b.topics && b.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        {b.topics.map((t, idx) => (
                          <span key={idx} className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>


      {/* Manual Book Add Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleAddManualBook}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                Kitaplığıma Yeni Kaynak Ekle
              </h3>
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                aria-label="Kapat"
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kitap Adı
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 3D TYT Matematik Soru Bankası"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Yayınevi
                </label>
                <input
                  type="text"
                  placeholder="Örn: 3D Yayınları, Apotemi, Palme"
                  value={manualPublisher}
                  onChange={(e) => setManualPublisher(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ders / Alan
                </label>
                <select
                  value={manualSubject}
                  onChange={(e) => setManualSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="TYT Matematik">TYT Matematik</option>
                  <option value="AYT Matematik">AYT Matematik</option>
                  <option value="TYT-AYT Geometri">TYT-AYT Geometri</option>
                  <option value="TYT Fizik">TYT Fizik</option>
                  <option value="AYT Fizik">AYT Fizik</option>
                  <option value="LGS Hazırlık">LGS Hazırlık</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md"
              >
                Kütüphaneye Ekle
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Homework Upload Modal */}
      {activeUploadHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleCompleteUpload}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ödev Çözümü Yükle</h3>
              <button
                type="button"
                onClick={() => setActiveUploadHw(null)}
                aria-label="Kapat"
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold mb-3">
                "{activeUploadHw.description}"
              </p>

              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-500 transition-colors">
                <UploadCloud className="w-8 h-8 text-indigo-500" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {selectedFile ? selectedFile.name : 'PDF veya Görsel Dosyası Seçin'}
                </span>
                <span className="text-[10px] text-slate-400">PDF, PNG, JPG (Maks 20MB)</span>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Öğretmene Teslim Notu (İsteğe bağlı)
              </label>
              <textarea
                rows={2}
                value={uploadNote}
                onChange={(e) => setUploadNote(e.target.value)}
                placeholder="Örn: 4. soruda takıldım, diğerlerini tamamladım."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveUploadHw(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md"
              >
                {isUploading ? 'Yükleniyor...' : 'Teslim Et'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating AI Coach Button */}
      <button
        type="button"
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white cursor-pointer transition-transform hover:scale-105 z-40"
        style={{ backgroundColor: 'var(--accent-primary)', boxShadow: 'var(--accent-glow)' }}
        title="Yapay Zeka Özel Ders Koçu"
      >
        <Bot className="w-7 h-7" />
      </button>

      {/* AI Chat Window Modal */}
      {isAiOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[92vw] h-[480px] rounded-3xl glass-panel shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Özel Ders Yapay Zeka Koçu</h4>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Çevrimiçi • Sokratik Rehber</span>
              </div>
            </div>
            <button
              onClick={() => setIsAiOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-900/40">
            {chatMessages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm border border-slate-200 dark:border-slate-700/80 shadow-sm'
                    }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isAiLoading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 text-xs text-indigo-600 dark:text-indigo-300 italic flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                  <span>Koç ipucu hazırlıyor...</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendAiMessage} className="p-3 border-t border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-950 flex gap-2">
            <input
              type="text"
              placeholder="Sorunu veya formülü sor..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isAiLoading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
