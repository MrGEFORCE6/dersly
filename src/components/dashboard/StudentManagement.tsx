'use client';

import { useState } from 'react';
import type { StudentWithStats } from '@/data/mockData';
import type { Lesson, Homework, Profile } from '@/types/database.types';
import { StudentDetailModal } from './StudentDetailModal';
import { StudentSocialBadge } from '@/components/profile/StudentSocialBadge';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { 
  Users, 
  Search, 
  Clock, 
  BookOpen, 
  CreditCard, 
  Phone, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  Edit3,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { exportStudentsToXLSX, exportStudentsToCSV } from '@/lib/services/exportImportService';

interface StudentManagementProps {
  students: StudentWithStats[];
  lessons: Lesson[];
  homeworks: Homework[];
  onOpenAddLesson: () => void;
  onProfileUpdated?: (updated: Profile) => void;
}

export function StudentManagement({
  students,
  lessons,
  homeworks,
  onOpenAddLesson,
  onProfileUpdated,
}: StudentManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentWithStats | null>(null);
  const [profileModalStudent, setProfileModalStudent] = useState<Profile | null>(null);

  const filteredStudents = students.filter((s) =>
    s.profile.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getHomeworkBadge = (hw?: Homework) => {
    if (!hw) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
          Ödev Yok
        </span>
      );
    }
    switch (hw.status) {
      case 'submitted':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Teslim Edildi
          </span>
        );
      case 'reviewed':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> İncelendi
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Bekliyor
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            aria-label="Öğrenci adı ile ara"
            placeholder="Öğrenci adı ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Toplam: <strong>{students.length}</strong> Aktif Öğrenci
          </span>
          <button
            onClick={() => exportStudentsToXLSX(students)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 hover:text-emerald-400 flex items-center gap-1.5 transition"
            title="Öğrenci Listesini Excel Olarak İndir"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel (.xlsx)</span>
          </button>
          <button
            onClick={() => exportStudentsToCSV(students)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 hover:text-indigo-400 flex items-center gap-1.5 transition"
            title="Öğrenci Listesini CSV Olarak İndir"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>CSV (.csv)</span>
          </button>
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {filteredStudents.map((student) => {
          const isLowHours = student.remainingHours <= 2;
          const percentageUsed = Math.min(
            100,
            Math.round((student.usedHours / student.packageHours) * 100)
          );

          return (
            <div
              key={student.profile.id}
              onClick={() => setSelectedStudent(student)}
              className="group relative rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-indigo-500/50 p-6 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-indigo-500/5 flex flex-col justify-between"
            >
              <div>
                {/* Header with Avatar & Details */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={student.profile.avatar_url || ''}
                      alt={student.profile.full_name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow shrink-0"
                    />
                    <div>
                      <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {student.profile.full_name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <Phone className="w-3 h-3 text-indigo-400" />
                        <span>{student.profile.phone}</span>
                      </div>
                      <div className="mt-2.5">
                        <StudentSocialBadge profile={student.profile} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Öğrenci
                    </span>
                    {isLowHours && (
                      <span className="mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-2.5 h-2.5" /> Paket Azaldı
                      </span>
                    )}
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="mt-5 grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Toplam Ders</span>
                    <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                      {student.totalLessons} Ders
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Kalan Paket</span>
                    <span className={`text-sm font-bold font-mono mt-0.5 block ${
                      isLowHours ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {student.remainingHours} Saat
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Son Ödev</span>
                    <div className="mt-0.5">
                      {getHomeworkBadge(student.lastHomework)}
                    </div>
                  </div>
                </div>

                {/* Package Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Paket Kullanımı ({student.usedHours} / {student.packageHours} saat)</span>
                    <span className="font-mono">{percentageUsed}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLowHours
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                          : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
                      }`}
                      style={{ width: `${percentageUsed}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  {student.payment?.paid_amount.toLocaleString('tr-TR')} ₺ Ödendi
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileModalStudent(student.profile);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 flex items-center gap-1 transition-colors"
                    title="Sosyal Profil & TYT/AYT Netlerini Düzenle"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Net / Profil</span>
                  </button>

                  <button
                    type="button"
                    className="text-indigo-400 group-hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    Detaylar
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Student Detail Modal */}
      <StudentDetailModal
        student={selectedStudent}
        lessons={lessons}
        homeworks={homeworks}
        onClose={() => setSelectedStudent(null)}
        onOpenAddLesson={onOpenAddLesson}
      />

      {/* Student Social Profile & Exam Stats Modal */}
      {profileModalStudent && (
        <ProfileModal
          isOpen={!!profileModalStudent}
          profile={profileModalStudent}
          onClose={() => setProfileModalStudent(null)}
          onSave={(updated) => {
            if (onProfileUpdated) onProfileUpdated(updated);
            setProfileModalStudent(null);
          }}
        />
      )}
    </div>
  );
}
