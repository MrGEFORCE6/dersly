'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Lesson } from '@/types/database.types';
import type { StudentWithStats } from '@/data/mockData';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  User, 
  FileText,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  BookOpen,
  CalendarDays
} from 'lucide-react';

interface CalendarViewProps {
  lessons: Lesson[];
  students: StudentWithStats[];
  onOpenAddLesson: () => void;
  onSelectLesson?: (lesson: Lesson) => void;
}

function getDynamicWeekDays(offsetWeeks: number = 0, baseDate: Date = new Date('2026-10-12T00:00:00.000Z')) {
  const now = baseDate;
  const dayOfWeek = now.getDay();
  const distanceToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday + offsetWeeks * 7);
  monday.setHours(0, 0, 0, 0);

  const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const todayStr = baseDate.toISOString().slice(0, 10);

  return Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const fullDate = `${year}-${month}-${day}`;
    const dateStr = `${d.getDate()} ${monthNames[d.getMonth()]}`;
    return {
      name: dayNames[idx],
      dateStr,
      fullDate,
      rawDate: d,
      isToday: fullDate === todayStr,
    };
  });
}

export function CalendarView({
  lessons,
  students,
  onOpenAddLesson,
  onSelectLesson,
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = current week, unlimited +-
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date('2026-10-12T00:00:00.000Z'));

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const weekDays = useMemo(() => getDynamicWeekDays(currentWeekOffset, currentDate), [currentWeekOffset, currentDate]);
  const activeDay = weekDays[selectedDayIndex] || weekDays[0];

  const weekRangeLabel = `${weekDays[0].dateStr} - ${weekDays[6].dateStr} ${weekDays[6].rawDate.getFullYear()}`;

  const getStudent = (studentId: string) => {
    return students.find((s) => s.profile.id === studentId);
  };

  const getLessonsForDate = (datePrefix: string) => {
    return lessons.filter((l) => l.start_time.startsWith(datePrefix));
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700/80">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'week'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Haftalık Görünüm
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'day'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Günlük Görünüm
            </button>
          </div>

          {/* Date Navigation (Kesintisiz Gezinti) */}
          <div className="flex items-center gap-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
            <button
              onClick={() => {
                if (viewMode === 'day') {
                  setSelectedDayIndex((prev) => (prev > 0 ? prev - 1 : 6));
                } else {
                  setCurrentWeekOffset((prev) => prev - 1);
                }
              }}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Önceki Hafta / Gün"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
              {viewMode === 'week'
                ? weekRangeLabel
                : `${activeDay.name}, ${activeDay.dateStr} ${activeDay.rawDate.getFullYear()}`}
            </span>

            <button
              onClick={() => {
                if (viewMode === 'day') {
                  setSelectedDayIndex((prev) => (prev < 6 ? prev + 1 : 0));
                } else {
                  setCurrentWeekOffset((prev) => prev + 1);
                }
              }}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Sonraki Hafta / Gün"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Return to Current Week */}
          {currentWeekOffset !== 0 && (
            <button
              onClick={() => {
                setCurrentWeekOffset(0);
                setSelectedDayIndex(0);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Bu Hafta</span>
            </button>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={onOpenAddLesson}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          Yeni Ders Planla
        </button>
      </div>

      {/* View Content */}
      {viewMode === 'week' ? (
        /* WEEKLY GRID VIEW */
        <div className="rounded-2xl glass-panel p-4 overflow-x-auto shadow-xl">
          <div className="grid grid-cols-7 gap-3 min-w-[850px]">
            {weekDays.map((day) => {
              const dayLessons = getLessonsForDate(day.fullDate);

              return (
                <div
                  key={day.fullDate}
                  className={`flex flex-col rounded-xl border p-3 min-h-[460px] transition-colors ${
                    day.isToday
                      ? 'bg-indigo-50/40 dark:bg-slate-900/90 border-indigo-500/40 shadow-sm'
                      : 'bg-white dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                    <div>
                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        {day.name}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {day.dateStr}
                      </span>
                    </div>
                    {day.isToday && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                        Bugün
                      </span>
                    )}
                  </div>

                  {/* Lessons list for day */}
                  <div className="space-y-2.5 flex-1">
                    {dayLessons.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-3 text-slate-400 dark:text-slate-500 text-xs">
                        <span className="text-[11px] italic">Ders yok</span>
                      </div>
                    ) : (
                      dayLessons.map((lesson) => {
                        const student = getStudent(lesson.student_id);
                        const startTime = lesson.start_time.split('T')[1]?.slice(0, 5) || '14:00';
                        const endTime = lesson.end_time.split('T')[1]?.slice(0, 5) || '15:30';
                        const isCancelled = lesson.status === 'cancelled';
                        const isCompleted = lesson.status === 'completed';

                        return (
                          <div
                            key={lesson.id}
                            onClick={() => onSelectLesson?.(lesson)}
                            className={`group relative rounded-xl p-2.5 transition-all cursor-pointer shadow-sm border ${
                              isCancelled
                                ? 'opacity-50 line-through bg-rose-50/50 dark:bg-rose-950/20 border-dashed border-rose-300 dark:border-rose-900/40 text-slate-500'
                                : isCompleted
                                ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                                : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/80 hover:border-indigo-500/60'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-300 font-mono mb-1">
                              <span className="flex items-center gap-1 font-semibold">
                                <Clock className="w-3 h-3" />
                                {startTime} - {endTime}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                                isCancelled
                                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 font-normal no-underline'
                                  : isCompleted
                                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                                  : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                              }`}>
                                {isCancelled ? 'İptal' : isCompleted ? 'Tamamlandı' : 'Planlandı'}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                              {lesson.title}
                            </h4>

                            {/* Required Book Badge */}
                            {lesson.required_book && (
                              <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 truncate">
                                <BookOpen className="w-3 h-3 shrink-0 text-amber-500" />
                                <span className="truncate">Kitap: {lesson.required_book}</span>
                              </div>
                            )}

                            {/* Reschedule Pending Badge */}
                            {lesson.reschedule_request?.status === 'pending' && (
                              <div className="mt-1 flex items-center gap-1 text-[10px] text-blue-700 dark:text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 animate-pulse">
                                <span>⏳ Kaydırma Onayı Bekleniyor</span>
                              </div>
                            )}

                            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2 text-[11px]">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                                  {student?.profile.full_name || 'Öğrenci'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* DAILY VIEW */
        <div className="rounded-2xl glass-panel p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {activeDay.name}, {activeDay.dateStr} {activeDay.rawDate.getFullYear()}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Seçilen gün için planlanan dersler ({getLessonsForDate(activeDay.fullDate).length} Ders)
              </p>
            </div>

            {/* Day Selector Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {weekDays.map((d, index) => (
                <button
                  key={d.fullDate}
                  onClick={() => setSelectedDayIndex(index)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedDayIndex === index
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {d.name.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {getLessonsForDate(activeDay.fullDate).length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <CalendarDays className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Bu güne ait planlanmış ders bulunmuyor
                </p>
                <button
                  onClick={onOpenAddLesson}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  + Yeni Ders Planla
                </button>
              </div>
            ) : (
              getLessonsForDate(activeDay.fullDate).map((lesson) => {
                const student = getStudent(lesson.student_id);
                const startTime = lesson.start_time.split('T')[1]?.slice(0, 5) || '14:00';
                const endTime = lesson.end_time.split('T')[1]?.slice(0, 5) || '15:30';
                const isCancelled = lesson.status === 'cancelled';

                return (
                  <div
                    key={lesson.id}
                    onClick={() => onSelectLesson?.(lesson)}
                    className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 p-3 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono text-xs font-bold text-center min-w-[75px]">
                        <div>{startTime}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{endTime}</div>
                      </div>

                      <div className="space-y-1">
                        <h4 className={`text-sm font-bold text-slate-900 dark:text-white ${isCancelled ? 'line-through text-slate-400' : ''}`}>
                          {lesson.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {student?.profile.full_name || 'Öğrenci'}
                          </span>
                          {lesson.required_book && (
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              <BookOpen className="w-3.5 h-3.5" />
                              {lesson.required_book}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      isCancelled
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300'
                        : lesson.status === 'completed'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                        : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300'
                    }`}>
                      {isCancelled ? 'İptal Edildi' : lesson.status === 'completed' ? 'Tamamlandı' : 'Planlandı'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
