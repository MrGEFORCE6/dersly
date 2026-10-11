'use client';

import { useState } from 'react';
import type { Homework, Lesson } from '@/types/database.types';
import type { StudentWithStats } from '@/data/mockData';
import { uploadFileToStorage } from '@/lib/services/supabaseService';
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
  FileCheck,
  Filter,
  Loader2
} from 'lucide-react';

interface HomeworkWithMeta extends Homework {
  studentName?: string;
  lessonTitle?: string;
}

interface HomeworkModuleProps {
  homeworks: HomeworkWithMeta[];
  students: StudentWithStats[];
  lessons: Lesson[];
  onAddHomework: (hw: HomeworkWithMeta) => void;
  onUpdateStatus: (id: string, newStatus: 'pending' | 'submitted' | 'reviewed') => void;
}

export function HomeworkModule({
  homeworks,
  students,
  lessons,
  onAddHomework,
  onUpdateStatus,
}: HomeworkModuleProps) {
  const [studentId, setStudentId] = useState(students[0]?.profile.id || '');
  const [lessonId, setLessonId] = useState<string>(lessons[0]?.id || '');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('2026-10-18');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'submitted' | 'reviewed'>('all');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

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

    const student = students.find((s) => s.profile.id === studentId);
    const lesson = lessons.find((l) => l.id === lessonId);

    const newHw: HomeworkWithMeta = {
      id: `hw-${Date.now()}`,
      lesson_id: lessonId || null,
      student_id: studentId,
      studentName: student?.profile.full_name || 'Öğrenci',
      lessonTitle: lesson?.title || 'Genel Konu',
      description: description.trim(),
      due_date: `${dueDate}T23:59:59Z`,
      status: 'pending',
      file_url: fileUrl,
      submission_notes: null,
      submitted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onAddHomework(newHw);
    setDescription('');
    setFileName(null);
    setSelectedFile(null);
    setIsUploading(false);
    setSuccessNotice('Yeni ödev ve PDF materyali Supabase Storage\'a yüklendi!');
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  const filteredHomeworks = homeworks.filter((h) => {
    if (statusFilter === 'all') return true;
    return h.status === statusFilter;
  });

  return (
    <div className="space-y-8">
      {/* 1. Ödev Verme & Dosya Yükleme Alanı */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Yeni Ödev Ata & Materyal / PDF Yükle</h3>
            <p className="text-xs text-slate-400">
              Öğrenciye özel test, çalışma kağıdı veya konu özetini sisteme yükleyip teslim tarihi belirleyin.
            </p>
          </div>
        </div>

        {successNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Öğrenci Seçimi */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                Öğrenci
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {students.map((st) => (
                  <option key={st.profile.id} value={st.profile.id}>
                    {st.profile.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* İlgili Ders */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                İlgili Ders (Opsiyonel)
              </label>
              <select
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Genel / Bağımsız Ödev</option>
                {lessons.map((les) => (
                  <option key={les.id} value={les.id}>
                    {les.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Son Teslim Tarihi */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Son Teslim Tarihi
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Ödev Açıklaması */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Ödev Detayı & Çözülecek Sorular
              </label>
              <textarea
                rows={3}
                required
                placeholder="Örn: Limit ve Süreklilik fasikülü Sayfa 45-52 arası testler çözülecek..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Dosya Yükleme (PDF Drag & Drop Zone) */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                PDF veya Çalışma Notu Yükle
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center min-h-[220px] ${
                  isDragging
                    ? 'border-indigo-400 bg-indigo-500/10'
                    : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-white">
                  PDF veya doküman dosyasını sürükleyin
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  veya bilgisayarınızdan seçmek için göz atın (PDF, DOCX, PNG)
                </p>

                <label className="mt-4 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-medium text-white cursor-pointer transition-colors">
                  Dosya Seç
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {fileName && (
                  <div className="mt-4 p-2 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono">{fileName}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Supabase Storage'a Yükleniyor...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Ödevi Kaydet ve Öğrenciye İlet</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Ödev Takip & İnceleme Listesi */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Ödev Takip & Teslim Yönetimi ({filteredHomeworks.length})
            </h3>
            <p className="text-xs text-slate-400">
              Öğrencilerin ödev teslim durumlarını takip edin ve tek tıkla inceleyin.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'pending', label: 'Bekleyenler' },
              { id: 'submitted', label: 'Teslim Edilenler' },
              { id: 'reviewed', label: 'İncelenenler' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id as typeof statusFilter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === f.id
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
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
            <div className="py-12 text-center text-slate-500 text-xs">
              Bu filtreye ait ödev kaydı bulunamadı.
            </div>
          ) : (
            filteredHomeworks.map((hw) => {
              const student = students.find((s) => s.profile.id === hw.student_id);
              const dueDateDisplay = hw.due_date ? hw.due_date.split('T')[0] : 'Belirtilmedi';

              return (
                <div
                  key={hw.id}
                  className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-indigo-500/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-white">{hw.description}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        hw.status === 'reviewed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : hw.status === 'submitted'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {hw.status === 'reviewed' ? 'İncelendi' : hw.status === 'submitted' ? 'Teslim Edildi' : 'Bekliyor'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        {hw.studentName || student?.profile.full_name || 'Öğrenci'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Son Teslim: {dueDateDisplay}
                      </span>
                      {hw.file_url && (
                        <>
                          <span>•</span>
                          <a
                            href={hw.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono text-[11px]"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            PDF Materyali
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Durum Değiştirme Butonları */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {hw.status !== 'reviewed' && (
                      <button
                        onClick={() => onUpdateStatus(hw.id, 'reviewed')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        İncelendi Olarak İşaretle
                      </button>
                    )}
                    {hw.status === 'pending' && (
                      <button
                        onClick={() => onUpdateStatus(hw.id, 'submitted')}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        Teslim Alındı
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
