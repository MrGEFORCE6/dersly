'use client';

import React, { useState, useEffect } from 'react';
import type { Homework, Lesson, Class, HomeworkStatus } from '@/types/database.types';
import type { StudentWithStats } from '@/data/mockData';
import {
  uploadFileToStorage,
  fetchClasses,
  createBulkClassHomework,
  reviewHomework,
  deleteHomework,
} from '@/lib/services/supabaseService';
import {
  BookOpen,
  UploadCloud,
  FileText,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  AlertCircle,
  AlertTriangle,
  FileCheck,
  Filter,
  Loader2,
  Trash2,
  Award,
  Users,
  Check,
  X,
  Link as LinkIcon,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export interface HomeworkWithMeta extends Homework {
  studentName?: string;
  lessonTitle?: string;
}

interface HomeworkModuleProps {
  homeworks: HomeworkWithMeta[];
  students: StudentWithStats[];
  lessons: Lesson[];
  classes?: Class[];
  onAddHomework: (hw: HomeworkWithMeta) => void;
  onUpdateStatus: (id: string, newStatus: HomeworkStatus) => void;
  onRefresh?: () => void;
}

export function HomeworkModule({
  homeworks,
  students,
  lessons,
  classes: initialClasses,
  onAddHomework,
  onUpdateStatus,
  onRefresh,
}: HomeworkModuleProps) {
  // Target Mode: 'student' | 'class'
  const [targetMode, setTargetMode] = useState<'student' | 'class'>('student');
  const [studentId, setStudentId] = useState(students[0]?.profile.id || '');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [classes, setClasses] = useState<Class[]>(initialClasses || []);

  // Form Fields
  const [title, setTitle] = useState('');
  const [lessonId, setLessonId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('2026-10-18');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(45);
  const [resourceUrl, setResourceUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Filter
  const [statusFilter, setStatusFilter] = useState<'all' | HomeworkStatus>('all');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Review & Evaluation Modal State
  const [evaluatingHw, setEvaluatingHw] = useState<HomeworkWithMeta | null>(null);
  const [evalScore, setEvalScore] = useState<number>(100);
  const [evalFeedback, setEvalFeedback] = useState<string>('');
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);

  useEffect(() => {
    if (!initialClasses || initialClasses.length === 0) {
      fetchClasses().then((cls) => {
        setClasses(cls);
        if (cls.length > 0 && !selectedClassId) {
          setSelectedClassId(cls[0].id);
        }
      });
    } else if (initialClasses.length > 0 && !selectedClassId) {
      setSelectedClassId(initialClasses[0].id);
    }
  }, [initialClasses, selectedClassId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsUploading(true);
    let fileUrl: string | null = null;

    if (selectedFile) {
      fileUrl = await uploadFileToStorage('homework-files', selectedFile, selectedFile.name);
    }

    if (targetMode === 'class' && selectedClassId) {
      // Bulk class assignment
      const createdList = await createBulkClassHomework(selectedClassId, {
        lesson_id: lessonId || null,
        title: title.trim() || null,
        description: description.trim(),
        due_date: `${dueDate}T23:59:59Z`,
        status: 'pending',
        file_url: fileUrl,
        resource_url: resourceUrl.trim() || null,
        estimated_minutes: estimatedMinutes,
      });

      createdList.forEach((hw) => {
        const student = students.find((s) => s.profile.id === hw.student_id);
        const lesson = lessons.find((l) => l.id === lessonId);
        onAddHomework({
          ...hw,
          studentName: student?.profile.full_name || 'Öğrenci',
          lessonTitle: lesson?.title || 'Genel Konu',
        });
      });

      setSuccessNotice(`Sınıftaki tüm öğrencilere (${createdList.length} öğrenci) ödev başarıyla atandı!`);
    } else {
      // Single student assignment
      const student = students.find((s) => s.profile.id === studentId);
      const lesson = lessons.find((l) => l.id === lessonId);

      const newHw: HomeworkWithMeta = {
        id: `hw-${Date.now()}`,
        lesson_id: lessonId || null,
        student_id: studentId,
        teacher_id: 't-001',
        class_id: null,
        title: title.trim() || null,
        studentName: student?.profile.full_name || 'Öğrenci',
        lessonTitle: lesson?.title || 'Genel Konu',
        description: description.trim(),
        due_date: `${dueDate}T23:59:59Z`,
        status: 'pending',
        file_url: fileUrl,
        resource_url: resourceUrl.trim() || null,
        estimated_minutes: estimatedMinutes,
        submission_notes: null,
        submitted_at: null,
        teacher_feedback: null,
        score: null,
        reviewed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      onAddHomework(newHw);
      setSuccessNotice('Yeni ödev ve PDF materyali öğrenciye iletildi!');
    }

    // Reset form
    setTitle('');
    setDescription('');
    setResourceUrl('');
    setFileName(null);
    setSelectedFile(null);
    setIsUploading(false);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const handleOpenEvaluationModal = (hw: HomeworkWithMeta) => {
    setEvaluatingHw(hw);
    setEvalScore(hw.score ?? 100);
    setEvalFeedback(hw.teacher_feedback || '');
  };

  const handleSaveEvaluation = async (decision: 'reviewed' | 'revision_requested') => {
    if (!evaluatingHw) return;
    setIsSubmittingEval(true);

    await reviewHomework(evaluatingHw.id, {
      status: decision,
      score: evalScore,
      teacher_feedback: evalFeedback.trim() || null,
    });

    onUpdateStatus(evaluatingHw.id, decision);

    setIsSubmittingEval(false);
    setEvaluatingHw(null);
    if (onRefresh) onRefresh();
  };

  const handleDeleteHw = async (id: string) => {
    if (!confirm('Bu ödevi silmek istediğinize emin misiniz?')) return;
    await deleteHomework(id);
    if (onRefresh) onRefresh();
  };

  const filteredHomeworks = homeworks.filter((h) => {
    if (statusFilter === 'all') return true;
    return h.status === statusFilter;
  });

  return (
    <div className="space-y-8">
      {/* 1. Ödev Verme & Materyal Yükleme Paneli */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 glass-panel p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/60 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Yeni Ödev Ata & Materyal / PDF Yükle
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tek bir öğrenciye veya tüm sınıfa çalışma kağıdı, soru linki ve tahmini süreyle ödev atayın.
              </p>
            </div>
          </div>

          {/* Atama Hedefi Toggle (Öğrenci vs Sınıf) */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => setTargetMode('student')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                targetMode === 'student'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Öğrenciye Özel
            </button>
            <button
              type="button"
              onClick={() => setTargetMode('class')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                targetMode === 'class'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Sınıfa Toplu Ata
            </button>
          </div>
        </div>

        {successNotice && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span className="font-semibold">{successNotice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-4">
            {/* Hedef Seçimi (Öğrenci veya Sınıf) */}
            {targetMode === 'student' ? (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  Öğrenci Seçimi *
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {students.map((st) => (
                    <option key={st.profile.id} value={st.profile.id}>
                      {st.profile.full_name} ({st.profile.username || 'ogrenci'})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  Hedef Sınıf / Grup *
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
                >
                  {classes.length === 0 ? (
                    <option value="">Kayıtlı sınıf bulunamadı</option>
                  ) : (
                    classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.grade_level || '12. Sınıf'}) - {cls.academic_year}
                      </option>
                    ))
                  )}
                </select>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Seçilen sınıfa kayıtlı tüm öğrencilere bu ödevden otomatik birer kopya tanımlanır.
                </span>
              </div>
            )}

            {/* Ödev Başlığı */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ödev Başlığı (Opsiyonel)
              </label>
              <input
                type="text"
                placeholder="Örn: Limit ve Süreklilik Fasikülü Test 1-3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* İlgili Ders & Tahmini Süre */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  İlgili Ders (Opsiyonel)
                </label>
                <select
                  value={lessonId}
                  onChange={(e) => setLessonId(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Genel / Bağımsız</option>
                  {lessons.map((les) => (
                    <option key={les.id} value={les.id}>
                      {les.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-500" />
                  Tahmini Süre
                </label>
                <select
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value={20}>20 Dakika</option>
                  <option value={30}>30 Dakika</option>
                  <option value={45}>45 Dakika</option>
                  <option value={60}>60 Dakika (1 Saat)</option>
                  <option value={90}>90 Dakika (1.5 Saat)</option>
                  <option value={120}>120 Dakika (2 Saat)</option>
                </select>
              </div>
            </div>

            {/* Son Teslim Tarihi */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                Son Teslim Tarihi *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Harici Materyal / Soru Linki */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-500" />
                Harici Materyal / Soru Linki (Opsiyonel)
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/... veya https://youtube.com/..."
                value={resourceUrl}
                onChange={(e) => setResourceUrl(e.target.value)}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {/* Açıklama & Yönergeler */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                Ödev Detayı & Yönergeler *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Örn: Fasikül Sayfa 45-52 arası testler çözülecek, yapamadığınız soruların üzerine işaret koyup teslim ediniz..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Dosya Yükleme (PDF Drag & Drop Zone) */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Çalışma Kağıdı / Test PDF'i Yükle (Opsiyonel)
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all flex flex-col items-center justify-center min-h-[240px] ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-indigo-400'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  PDF veya doküman dosyasını sürükleyin
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  veya bilgisayarınızdan seçmek için göz atın (PDF, DOCX, PNG)
                </p>

                <label className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer transition-colors shadow-sm">
                  Dosya Seç
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {fileName && (
                  <div className="mt-4 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-500" />
                    <span className="font-mono truncate max-w-[220px]">{fileName}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Materyal Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>
                    {targetMode === 'class' ? 'Sınıftaki Herkese Ödev Ata' : 'Ödevi Kaydet ve Öğrenciye İlet'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Ödev Takip, İnceleme ve Değerlendirme Listesi */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 glass-panel p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Ödev Takip, Teslim & İnceleme ({filteredHomeworks.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Teslim edilen öğrenci çözümlerini inceleyin, puan verin veya düzeltme isteyin.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'pending', label: 'Bekleyenler' },
              { id: 'submitted', label: 'Teslim Edilenler' },
              { id: 'reviewed', label: 'İncelenenler' },
              { id: 'revision_requested', label: 'Düzeltme İstenenler' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id as typeof statusFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === f.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Homework Items */}
        <div className="space-y-3">
          {filteredHomeworks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs italic">
              Bu filtreye ait ödev kaydı bulunamadı.
            </div>
          ) : (
            filteredHomeworks.map((hw) => {
              const student = students.find((s) => s.profile.id === hw.student_id);
              const dueDateDisplay = hw.due_date ? hw.due_date.split('T')[0] : 'Belirtilmedi';

              const isPending = hw.status === 'pending';
              const isSubmitted = hw.status === 'submitted';
              const isReviewed = hw.status === 'reviewed';
              const isRevision = hw.status === 'revision_requested';

              return (
                <div
                  key={hw.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {hw.title || hw.description}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                          ? `✓ İncelendi ${hw.score !== null ? `(${hw.score} Puan)` : ''}`
                          : isSubmitted
                          ? 'Teslim Edildi - İnceleme Bekliyor'
                          : isRevision
                          ? '⚠️ Düzeltme İstendi'
                          : 'Teslim Bekliyor'}
                      </span>
                    </div>

                    {hw.title && (
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {hw.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <User className="w-3.5 h-3.5 text-indigo-500" />
                        {hw.studentName || student?.profile.full_name || 'Öğrenci'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Son Teslim: {dueDateDisplay}
                      </span>
                      {hw.estimated_minutes && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                            {hw.estimated_minutes} dk
                          </span>
                        </>
                      )}
                      {hw.resource_url && (
                        <>
                          <span>•</span>
                          <a
                            href={hw.resource_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                          >
                            <LinkIcon className="w-3 h-3" />
                            Soru / Video Linki
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </>
                      )}
                      {hw.file_url && (
                        <>
                          <span>•</span>
                          <a
                            href={hw.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Çalışma PDF'i
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </>
                      )}
                    </div>

                    {/* Teacher Feedback / Notes if exists */}
                    {hw.teacher_feedback && (
                      <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700/60 text-xs text-indigo-900 dark:text-indigo-200 mt-1">
                        <span className="font-bold flex items-center gap-1 mb-0.5">
                          <MessageSquare className="w-3 h-3 text-indigo-500" />
                          Öğretmen Dönütü:
                        </span>
                        <span>{hw.teacher_feedback}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {/* Review & Evaluate Button */}
                    <button
                      onClick={() => handleOpenEvaluationModal(hw)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                        isSubmitted
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white animate-pulse'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{isReviewed ? 'Notu Güncelle' : 'İncele & Değerlendir'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteHw(hw.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                      title="Ödevi Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. ÖDEV DEĞERLENDİRME & DÖNÜT MODALI */}
      {evaluatingHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl text-white space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Ödev İnceleme & Dönüt</h3>
                  <p className="text-xs text-slate-400">
                    {evaluatingHw.studentName} • {evaluatingHw.title || evaluatingHw.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEvaluatingHw(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Submission File Card */}
            <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Öğrenci Çözüm Teslimi:</span>
                {evaluatingHw.submitted_at && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {evaluatingHw.submitted_at.replace('T', ' ').slice(0, 16)}
                  </span>
                )}
              </div>

              {evaluatingHw.file_url ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-950/40 border border-indigo-800/40">
                  <span className="text-xs text-indigo-300 font-mono flex items-center gap-1.5 truncate">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    Çözüm Dokümanı / PDF
                  </span>
                  <a
                    href={evaluatingHw.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <span>Dosyayı Aç</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Öğrenci henüz dosya yüklemedi veya metin olarak teslim etti.
                </p>
              )}

              {evaluatingHw.submission_notes && (
                <p className="text-xs text-slate-300 italic pt-1">
                  &ldquo;{evaluatingHw.submission_notes}&rdquo;
                </p>
              )}
            </div>

            {/* Score & Feedback Inputs */}
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Ödev Puanı (0 - 100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={evalScore}
                  onChange={(e) => setEvalScore(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Öğretmen Dönütü & Gelişim Yorumu
                </label>
                <textarea
                  rows={3}
                  value={evalFeedback}
                  onChange={(e) => setEvalFeedback(e.target.value)}
                  placeholder="Örn: 4. soruda işaret hatası yapmışsın, tekrar gözden geçir. Genel olarak gayet başarılı!"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            {/* Decision Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                disabled={isSubmittingEval}
                onClick={() => handleSaveEvaluation('revision_requested')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Düzeltme İste (Revizyon)</span>
              </button>

              <button
                type="button"
                disabled={isSubmittingEval}
                onClick={() => handleSaveEvaluation('reviewed')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-transform active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Onayla & İncelendi Olarak Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
