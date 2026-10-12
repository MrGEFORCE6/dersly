'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  BookOpen, 
  GraduationCap, 
  CheckCircle2, 
  X, 
  Search,
  UserPlus,
  Sparkles,
  School,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  fetchClasses, 
  createClass, 
  deleteClass, 
  fetchClassStudents, 
  addStudentToClass, 
  removeStudentFromClass,
  fetchProfiles 
} from '@/lib/services/supabaseService';
import type { Class, Profile } from '@/types/database.types';

interface ClassManagementProps {
  teacherId?: string;
  onSelectClassForTask?: (cls: Class) => void;
}

export function ClassManagement({ teacherId = 't-001', onSelectClassForTask }: ClassManagementProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classStudents, setClassStudents] = useState<{ id: string; enrolled_at: string; student: Profile }[]>([]);
  const [allStudents, setAllStudents] = useState<Profile[]>([]);
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [searchStudentTerm, setSearchStudentTerm] = useState('');
  
  // Create Class Form
  const [newClassName, setNewClassName] = useState('');
  const [newGradeLevel, setNewGradeLevel] = useState('12. Sınıf');
  const [newAcademicYear, setNewAcademicYear] = useState('2026-2027');
  const [newDescription, setNewDescription] = useState('');
  const [newColor, setNewColor] = useState('indigo');
  const [formError, setFormError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleSelectClass = async (cls: Class) => {
    setSelectedClass(cls);
    const students = await fetchClassStudents(cls.id);
    setClassStudents(students);
  };

  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await fetchClasses(teacherId);
      setClasses(data);
      if (data.length > 0 && !selectedClass) {
        handleSelectClass(data[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAllStudents = async () => {
    const profiles = await fetchProfiles();
    setAllStudents(profiles.filter((p) => p.role === 'student'));
  };

  useEffect(() => {
    loadClasses();
    loadAllStudents();
  }, [teacherId]);

  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault();
    if (!newClassName.trim()) {
      setFormError('Lütfen sınıf adını giriniz.');
      return;
    }

    try {
      const created = await createClass({
        teacher_id: teacherId,
        name: newClassName.trim(),
        grade_level: newGradeLevel,
        academic_year: newAcademicYear,
        description: newDescription.trim() || null,
        color: newColor,
      });

      setClasses((prev) => [created, ...prev]);
      setSelectedClass(created);
      setClassStudents([]);
      setShowCreateModal(false);
      setNewClassName('');
      setNewDescription('');
      setFormError(null);
      showNotification('Sınıf başarıyla oluşturuldu!');
    } catch {
      setFormError('Sınıf oluşturulurken bir hata meydana geldi.');
    }
  }

  async function handleDeleteClass(classId: string, className: string) {
    if (!confirm(`"${className}" sınıfını silmek istediğinize emin misiniz? Bu işlem sınıf-öğrenci bağlantılarını kaldırır.`)) {
      return;
    }

    await deleteClass(classId);
    setClasses((prev) => prev.filter((c) => c.id !== classId));
    if (selectedClass?.id === classId) {
      const remaining = classes.filter((c) => c.id !== classId);
      if (remaining.length > 0) {
        handleSelectClass(remaining[0]);
      } else {
        setSelectedClass(null);
        setClassStudents([]);
      }
    }
    showNotification('Sınıf silindi.');
  }

  async function handleAddStudent(studentId: string) {
    if (!selectedClass) return;
    await addStudentToClass(selectedClass.id, studentId);
    const updated = await fetchClassStudents(selectedClass.id);
    setClassStudents(updated);
    showNotification('Öğrenci sınıfa eklendi.');
  }

  async function handleRemoveStudent(studentId: string) {
    if (!selectedClass) return;
    await removeStudentFromClass(selectedClass.id, studentId);
    setClassStudents((prev) => prev.filter((cs) => cs.student.id !== studentId));
    showNotification('Öğrenci sınıftan çıkarıldı.');
  }

  function showNotification(msg: string) {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  }

  const enrolledStudentIds = new Set(classStudents.map((cs) => cs.student.id));
  const availableStudents = allStudents.filter(
    (s) =>
      !enrolledStudentIds.has(s.id) &&
      (s.full_name.toLowerCase().includes(searchStudentTerm.toLowerCase()) ||
       (s.username && s.username.toLowerCase().includes(searchStudentTerm.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <School className="w-5 h-5 text-indigo-500" />
            Sınıflar ve Öğrenci Grupları
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Öğrencilerinizi gruplandırarak ortak ders programı oluşturun ve toplu görevler atayın.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Yeni Sınıf Oluştur
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {actionSuccess}
        </div>
      )}

      {/* Classes Grid & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Classes List */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
            Mevcut Sınıflar ({classes.length})
          </span>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 glass-panel rounded-2xl">
              Sınıflar yükleniyor...
            </div>
          ) : classes.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 glass-panel rounded-2xl border border-dashed border-slate-700/60 space-y-3">
              <School className="w-8 h-8 text-slate-600 mx-auto" />
              <p>Henüz tanımlı bir sınıf bulunmuyor.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-indigo-400 font-bold hover:underline"
              >
                + İlk Sınıfınızı Ekleyin
              </button>
            </div>
          ) : (
            classes.map((cls) => {
              const isSelected = selectedClass?.id === cls.id;
              return (
                <div
                  key={cls.id}
                  onClick={() => handleSelectClass(cls)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-indigo-600/10 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                      : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {cls.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        <span>{cls.grade_level || 'Belirtilmedi'}</span>
                        <span>•</span>
                        <span>{cls.academic_year || '2026-2027'}</span>
                      </div>
                      {cls.description && (
                        <p className="text-xs text-slate-400 line-clamp-1 pt-1">
                          {cls.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClass(cls.id, cls.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Sınıfı Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Class Students and Roster */}
        <div className="lg:col-span-2 space-y-4">
          {selectedClass ? (
            <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 mb-2">
                    <Sparkles className="w-3 h-3" />
                    Aktif Sınıf Yönetimi
                  </div>
                  <h3 className="text-lg font-black text-white">
                    {selectedClass.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedClass.description || 'Bu sınıf için özel açıklama girilmemiş.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {onSelectClassForTask && (
                    <button
                      onClick={() => onSelectClassForTask(selectedClass)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Sınıfa Görev Ata
                    </button>
                  )}
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Öğrenci Ekle
                  </button>
                </div>
              </div>

              {/* Students in Class */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Kayıtlı Öğrenciler ({classStudents.length})</span>
                </div>

                {classStudents.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl space-y-2">
                    <Users className="w-6 h-6 mx-auto text-slate-600" />
                    <p>Bu sınıfa henüz öğrenci eklenmedi.</p>
                    <button
                      onClick={() => setShowAddStudentModal(true)}
                      className="text-indigo-400 font-bold hover:underline"
                    >
                      Öğrenci Portföyünüzden Ekleme Yapın
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {classStudents.map((cs) => (
                      <div
                        key={cs.id}
                        className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-3 group hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
                            {cs.student.full_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-white block">
                              {cs.student.full_name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              @{cs.student.username || 'ogrenci'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveStudent(cs.student.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                          title="Sınıftan Çıkar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 glass-panel rounded-3xl border border-slate-800">
              Detayları ve öğrenci listesini görmek için soldan bir sınıf seçin.
            </div>
          )}
        </div>
      </div>

      {/* CREATE CLASS MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <School className="w-4 h-4 text-indigo-400" />
                Yeni Sınıf Oluştur
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Sınıf / Grup Adı *
                </label>
                <input
                  type="text"
                  placeholder="Örn: 12-A YKS Sayısal Grubu"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Sınıf Düzeyi
                  </label>
                  <select
                    value={newGradeLevel}
                    onChange={(e) => setNewGradeLevel(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="9. Sınıf">9. Sınıf</option>
                    <option value="10. Sınıf">10. Sınıf</option>
                    <option value="11. Sınıf">11. Sınıf</option>
                    <option value="12. Sınıf">12. Sınıf</option>
                    <option value="Mezun">Mezun</option>
                    <option value="LGS Hazırlık">LGS Hazırlık</option>
                    <option value="Özel Grup">Özel Grup</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Akademik Dönem
                  </label>
                  <input
                    type="text"
                    value={newAcademicYear}
                    onChange={(e) => setNewAcademicYear(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Açıklama / Hedef (Opsiyonel)
                </label>
                <textarea
                  rows={2}
                  placeholder="Örn: Haftalık 20 saat soru çözümü ve deneme analizleri"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all"
                >
                  Sınıfı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STUDENT TO CLASS MODAL */}
      {showAddStudentModal && selectedClass && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-400" />
                {selectedClass.name} Sınıfına Öğrenci Ekle
              </h3>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Öğrenci adı veya kullanıcı adı ile ara..."
                value={searchStudentTerm}
                onChange={(e) => setSearchStudentTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Students List */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {availableStudents.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  Eklenebilecek öğrenci bulunamadı veya tüm öğrenciler zaten sınıfta.
                </div>
              ) : (
                availableStudents.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center">
                        {s.full_name.slice(0, 1)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {s.full_name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          @{s.username || 'ogrenci'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddStudent(s.id)}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all"
                    >
                      Ekle
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 text-right">
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700"
              >
                Tamamla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
