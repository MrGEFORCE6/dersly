'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  currentTeacher, 
  initialStudents, 
  initialLessons, 
  initialHomeworks, 
  type StudentWithStats 
} from '@/data/mockData';
import type { Lesson, Homework, Profile, HomeworkStatus } from '@/types/database.types';

import { 
  fetchProfiles, 
  fetchLessons, 
  createLesson, 
  updateLesson, 
  deleteLesson,
  rescheduleLesson,
  fetchHomeworks, 
  createHomework, 
  updateHomework 
} from '@/lib/services/supabaseService';
import { ThemeSelector } from '@/components/theme/ThemeSelector';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { CalendarView } from '@/components/dashboard/CalendarView';
import { AddLessonModal } from '@/components/dashboard/AddLessonModal';
import { LessonDetailModal } from '@/components/dashboard/LessonDetailModal';
import { StudentManagement } from '@/components/dashboard/StudentManagement';
import { HomeworkModule } from '@/components/dashboard/HomeworkModule';
import { BillingSection } from '@/components/dashboard/BillingSection';
import { AddStudentInviteModal } from '@/components/dashboard/AddStudentInviteModal';
import { ClassManagement } from '@/components/dashboard/ClassManagement';
import { Navbar } from '@/components/Navbar';
import { 
  GraduationCap, 
  Calendar, 
  Users, 
  BookOpen, 
  Clock, 
  Plus, 
  Receipt,
  CheckCircle2, 
  ArrowLeft,
  Smartphone,
  Sparkles,
  Settings,
  UserPlus,
  School
} from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'classes' | 'students' | 'homeworks' | 'billing'>('calendar');
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [selectedLessonForDetail, setSelectedLessonForDetail] = useState<Lesson | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Real-time Supabase-synced state (Initial state starts clean & empty)
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [homeworks, setHomeworks] = useState<(Homework & { studentName?: string; lessonTitle?: string })[]>([]);
  const [teacherProfile, setTeacherProfile] = useState<Profile>({
    id: 't-001',
    full_name: 'Ahmet Hoca',
    username: 'ahmethoca',
    role: 'teacher',
    bio: 'Özel Ders Koçu & Matematik/Fizik Eğitmeni',
    phone: '+90 532 555 1020',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    exam_stats: null,
    privacy_settings: { stats_visibility: 'public' },
    theme_preference: { mode: 'light', accent: 'sapphire' },
    created_at: '2026-10-11T00:00:00.000Z',
    updated_at: '2026-10-11T00:00:00.000Z',
  });
  const [isTeacherProfileModalOpen, setIsTeacherProfileModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load from Supabase database
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [dbProfiles, dbLessons, dbHomeworks] = await Promise.all([
          fetchProfiles(),
          fetchLessons(),
          fetchHomeworks(),
        ]);

        if (!isMounted) return;

        setLessons(dbLessons || []);
        setHomeworks((dbHomeworks || []) as (Homework & { studentName?: string; lessonTitle?: string })[]);

        if (dbProfiles && dbProfiles.length > 0) {
          const teacher = dbProfiles.find((p) => p.role === 'teacher') || dbProfiles[0];
          if (teacher) setTeacherProfile(teacher);

          const studentProfiles = dbProfiles.filter((p) => p.role === 'student');
          const mappedStudents: StudentWithStats[] = studentProfiles.map((sp) => {
            const studentLessons = (dbLessons || []).filter((l) => l.student_id === sp.id);
            const studentHws = (dbHomeworks || []).filter((h) => h.student_id === sp.id);
            const completedCount = studentLessons.filter((l) => l.status === 'completed').length;
            return {
              profile: sp,
              totalLessons: studentLessons.length,
              packageHours: 20,
              usedHours: completedCount,
              remainingHours: Math.max(0, 20 - completedCount),
              lastHomework: studentHws[0],
            };
          });
          setStudents(mappedStudents);
        }
      } catch (err) {
        console.error('Veri yükleme hatası:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // New lesson handler with Supabase write
  const handleAddLesson = async (newLesson: Lesson) => {
    const created = await createLesson(newLesson);
    setLessons((prev) => [created, ...prev]);

    // Update remaining hours for that student
    setStudents((prev) =>
      prev.map((s) => {
        if (s.profile.id === newLesson.student_id) {
          const newRemaining = Math.max(0, s.remainingHours - 1);
          return {
            ...s,
            totalLessons: s.totalLessons + 1,
            usedHours: s.usedHours + 1,
            remainingHours: newRemaining,
          };
        }
        return s;
      })
    );
    showToast('✓ Yeni ders Supabase veritabanına ve takvime eklendi!');
  };

  // Complete lesson handler (1-click completion & automatic 1-hour deduction)
  const handleCompleteLesson = async (lessonId: string, studentId: string) => {
    await updateLesson(lessonId, { status: 'completed' });

    setLessons((prev) =>
      prev.map((l) => (l.id === lessonId ? { ...l, status: 'completed' as const } : l))
    );

    setStudents((prev) =>
      prev.map((s) => {
        if (s.profile.id === studentId) {
          const newRemaining = Math.max(0, s.remainingHours - 1);
          return {
            ...s,
            usedHours: s.usedHours + 1,
            remainingHours: newRemaining,
          };
        }
        return s;
      })
    );

    showToast('✓ Ders "Tamamlandı" olarak işaretlendi ve 1 saat düşüldü!');
  };

  // Cancel lesson handler (keeps as cancelled in calendar)
  const handleCancelLesson = async (lessonId: string) => {
    await updateLesson(lessonId, { status: 'cancelled' });
    setLessons((prev) =>
      prev.map((l) => (l.id === lessonId ? { ...l, status: 'cancelled' as const } : l))
    );
    showToast('✓ Ders "İptal Olarak Saklandı" (takvimde yedek olarak tutuluyor).');
  };

  // Delete lesson handler (Permanently purges from calendar & DB)
  const handleDeleteLesson = async (lessonId: string) => {
    await deleteLesson(lessonId);
    setLessons((prev) => prev.filter((l) => l.id !== lessonId));
    showToast('✓ Ders takvimden ve veritabanından tamamen silindi.');
  };

  // Reactivate / Undo cancelled lesson
  const handleReactivateLesson = async (lessonId: string) => {
    await updateLesson(lessonId, { status: 'scheduled' });
    setLessons((prev) =>
      prev.map((l) => (l.id === lessonId ? { ...l, status: 'scheduled' as const } : l))
    );
    showToast('✓ Ders tekrar aktif edildi ve takvime geri alındı!');
  };

  // Reschedule lesson handler
  const handleRescheduleLesson = async (lessonId: string, newStartTime: string, newEndTime: string) => {
    const updated = await rescheduleLesson(lessonId, newStartTime, newEndTime);
    if (updated) {
      setLessons((prev) => prev.map((l) => (l.id === lessonId ? updated : l)));
    }
    showToast('✓ Saat güncellemesi öğrenci paneline onay kartı olarak iletildi!');
  };

  // Set required book for lesson
  const handleSetRequiredBook = async (lessonId: string, bookTitle: string) => {
    await updateLesson(lessonId, { required_book: bookTitle });
    setLessons((prev) =>
      prev.map((l) => (l.id === lessonId ? { ...l, required_book: bookTitle } : l))
    );
    showToast(`✓ "${bookTitle}" bu derse getirilecek kitap olarak kaydedildi!`);
  };

  // Add Homework handler
  const handleAddHomework = async (newHw: Homework & { studentName?: string; lessonTitle?: string }) => {
    const created = await createHomework(newHw);
    setHomeworks((prev) => [created as any, ...prev]);

    setStudents((prev) =>
      prev.map((s) => {
        if (s.profile.id === newHw.student_id) {
          return {
            ...s,
            lastHomework: created,
          };
        }
        return s;
      })
    );
    showToast('✓ Ödev ve materyal Supabase Storage & DB\'ye kaydedildi!');
  };

  // Update Homework status handler
  const handleUpdateHomeworkStatus = async (
    id: string,
    newStatus: HomeworkStatus
  ) => {
    await updateHomework(id, { status: newStatus });
    const refreshed = await fetchHomeworks();
    setHomeworks(refreshed);
    const label =
      newStatus === 'reviewed'
        ? 'İncelendi'
        : newStatus === 'submitted'
        ? 'Teslim Edildi'
        : newStatus === 'revision_requested'
        ? 'Düzeltme İstendi'
        : 'Bekliyor';
    showToast(`✓ Ödev durumu "${label}" olarak güncellendi.`);
  };


  const handleProfileUpdated = (updated: Profile) => {
    setStudents((prev) =>
      prev.map((s) => (s.profile.id === updated.id ? { ...s, profile: updated } : s))
    );
    if (teacherProfile.id === updated.id) {
      setTeacherProfile(updated);
    }
    showToast(`✓ @${updated.username || updated.full_name} profili başarıyla senkronize edildi!`);
  };

  const totalRemainingHours = students.reduce((acc, s) => acc + s.remainingHours, 0);
  const pendingReviewsCount = homeworks.filter((h) => h.status === 'submitted').length;

  const currentLessonStudent = students.find((s) => s.profile.id === selectedLessonForDetail?.student_id);

  return (
    <div 
      className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600/95 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-400/40 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="border-b transition-colors glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
                Dersly
              </span>
            </Link>

            <span className="hidden md:inline-block text-slate-600">/</span>

            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Eğitmen Portalı
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/mobile-preview"
              className="text-xs font-medium text-indigo-300 hover:text-white px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Öğrenci Mobil Demo</span>
            </Link>

            <Link
              href="/"
              className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ana Sayfa</span>
            </Link>

            <button
              onClick={() => setIsAddStudentOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Öğrenci Davet Et</span>
            </button>

            <button
              onClick={() => setIsAddLessonOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Yeni Ders</span>
            </button>

            <div className="flex items-center gap-2">
              <Link
                href="/settings"
                className="p-2 rounded-xl border border-slate-800 hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
                title="Sistem & Profil Ayarları"
              >
                <Settings className="w-4 h-4" />
              </Link>
              <ThemeSelector />

              {/* Profile pill with edit trigger */}
              <button
                onClick={() => setIsTeacherProfileModalOpen(true)}
                className="flex items-center gap-2.5 pl-3 border-l border-slate-800 hover:opacity-80 transition-opacity text-left cursor-pointer"
                title="Eğitmen Profilini & Ayarlarını Düzenle"
              >
                <img
                  src={teacherProfile.avatar_url || ''}
                  alt={teacherProfile.full_name}
                  className="w-8 h-8 rounded-xl object-cover border border-slate-700"
                />
                <div className="hidden lg:block text-left">
                  <span className="block text-xs font-bold text-white leading-tight">
                    {teacherProfile.full_name}
                  </span>
                  <span className="text-[10px] text-indigo-400 font-mono">
                    {teacherProfile.username ? `@${teacherProfile.username}` : 'Öğretmen Hesabı'}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl glass-panel shadow-sm flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-600 dark:text-slate-400 block font-medium">Planlanan Dersler</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">{lessons.length} Oturum</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl glass-panel shadow-sm flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-600 dark:text-slate-400 block font-medium">Kayıtlı Öğrenciler</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">{students.length} Kişi</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl glass-panel shadow-sm flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-600 dark:text-slate-400 block font-medium">Toplam Paket Kalan</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{totalRemainingHours} Saat</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl glass-panel shadow-sm flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-600 dark:text-slate-400 block font-medium">Teslim Edilen Ödev</span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">{pendingReviewsCount} Bekliyor</span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-6 overflow-x-auto">
          {[
            { id: 'calendar', label: 'Ders Takvimi (Haftalık & Günlük)', icon: Calendar, badge: lessons.length },
            { id: 'classes', label: 'Sınıflar & Gruplar', icon: School, badge: 'Sınıf' },
            { id: 'students', label: 'Öğrenci Yönetimi & Paketler', icon: Users, badge: students.length },
            { id: 'homeworks', label: 'Ödev Verme & Dosya Takibi', icon: BookOpen, badge: homeworks.length },
            { id: 'billing', label: 'Abonelik ve Fatura (Tarife)', icon: Receipt, badge: `${students.length} Öğr.` },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 pb-3.5 px-2 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className={`ml-1 text-[11px] px-2 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Panel */}
        {activeTab === 'calendar' && (
          <CalendarView
            lessons={lessons}
            students={students}
            onOpenAddLesson={() => setIsAddLessonOpen(true)}
            onSelectLesson={(lesson) => setSelectedLessonForDetail(lesson)}
          />
        )}

        {activeTab === 'classes' && (
          <ClassManagement teacherId={teacherProfile.id} />
        )}

        {activeTab === 'students' && (
          <StudentManagement
            students={students}
            lessons={lessons}
            homeworks={homeworks}
            onOpenAddLesson={() => setIsAddLessonOpen(true)}
            onProfileUpdated={handleProfileUpdated}
          />
        )}

        {activeTab === 'homeworks' && (
          <HomeworkModule
            homeworks={homeworks}
            students={students}
            lessons={lessons}
            onAddHomework={handleAddHomework}
            onUpdateStatus={handleUpdateHomeworkStatus}
            onRefresh={() => fetchHomeworks().then(setHomeworks)}
          />
        )}


        {activeTab === 'billing' && (
          <BillingSection activeStudentCount={students.length} />
        )}
      </main>

      {/* Global Add Lesson Modal */}
      <AddLessonModal
        isOpen={isAddLessonOpen}
        onClose={() => setIsAddLessonOpen(false)}
        students={students}
        onAddLesson={handleAddLesson}
      />

      {/* Lesson Detail & Complete Modal */}
      <LessonDetailModal
        lesson={selectedLessonForDetail}
        student={currentLessonStudent}
        onClose={() => setSelectedLessonForDetail(null)}
        onCompleteLesson={handleCompleteLesson}
        onCancelLesson={handleCancelLesson}
        onDeleteLesson={handleDeleteLesson}
        onReactivateLesson={handleReactivateLesson}
        onRescheduleLesson={handleRescheduleLesson}
        onSetRequiredBook={handleSetRequiredBook}
      />

      {/* Teacher Profile & Theme Modal */}
      {isTeacherProfileModalOpen && (
        <ProfileModal
          isOpen={isTeacherProfileModalOpen}
          profile={teacherProfile}
          onClose={() => setIsTeacherProfileModalOpen(false)}
          onSave={(updated) => {
            handleProfileUpdated(updated);
            setIsTeacherProfileModalOpen(false);
          }}
        />
      )}

      {/* Add Student & Invite Link Modal */}
      <AddStudentInviteModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        teacherId={teacherProfile.id}
        teacherName={teacherProfile.full_name}
        showToast={showToast}
        onStudentMatched={(matchedStudent) => {
          setStudents((prev) => [
            ...prev,
            {
              profile: matchedStudent,
              totalLessons: 0,
              packageHours: 20,
              usedHours: 0,
              remainingHours: 20,
              lastHomework: undefined,
              payment: undefined,
            },
          ]);
        }}
      />
    </div>
  );
}
