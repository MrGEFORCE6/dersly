'use client';

import React, { useState, useMemo } from 'react';
import type { ScheduleEvent, ScheduleEventType, ScheduleConflict } from '@/types/database.types';
import {
  fetchScheduleEvents,
  createScheduleEvent,
  updateScheduleEvent,
  deleteScheduleEvent,
  toggleScheduleEventCompleted,
  detectScheduleConflict,
} from '@/lib/services/supabaseService';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter,
  Flame,
  Check,
  X,
  MapPin,
  ExternalLink,
  Info
} from 'lucide-react';

interface SmartSchedulePlannerProps {
  userId: string;
  initialEvents?: ScheduleEvent[];
  isTeacherView?: boolean;
}

const DAYS = [
  { id: 0, name: 'Pazartesi', short: 'Pzt' },
  { id: 1, name: 'Salı', short: 'Sal' },
  { id: 2, name: 'Çarşamba', short: 'Çar' },
  { id: 3, name: 'Perşembe', short: 'Per' },
  { id: 4, name: 'Cuma', short: 'Cum' },
  { id: 5, name: 'Cumartesi', short: 'Cmt' },
  { id: 6, name: 'Pazar', short: 'Paz' },
];

const EVENT_TYPE_CONFIG: Record<
  ScheduleEventType,
  { label: string; icon: string; badgeClass: string; borderClass: string; bgClass: string; textClass: string }
> = {
  school: {
    label: 'Okul Dersi',
    icon: '🏫',
    badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    borderClass: 'border-l-blue-500',
    bgClass: 'hover:bg-blue-50/50 dark:hover:bg-blue-950/20',
    textClass: 'text-blue-600 dark:text-blue-400',
  },
  private_lesson: {
    label: 'Özel Ders',
    icon: '👨‍🏫',
    badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
    borderClass: 'border-l-purple-500',
    bgClass: 'hover:bg-purple-50/50 dark:hover:bg-purple-950/20',
    textClass: 'text-purple-600 dark:text-purple-400',
  },
  personal_study: {
    label: 'Bireysel Etüt',
    icon: '📖',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    borderClass: 'border-l-emerald-500',
    bgClass: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20',
    textClass: 'text-emerald-600 dark:text-emerald-400',
  },
  review: {
    label: 'Tekrar & Soru',
    icon: '🔁',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    borderClass: 'border-l-amber-500',
    bgClass: 'hover:bg-amber-50/50 dark:hover:bg-amber-950/20',
    textClass: 'text-amber-600 dark:text-amber-400',
  },
  exam: {
    label: 'Deneme / Sınav',
    icon: '📝',
    badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
    borderClass: 'border-l-rose-500',
    bgClass: 'hover:bg-rose-50/50 dark:hover:bg-rose-950/20',
    textClass: 'text-rose-600 dark:text-rose-400',
  },
};

export function SmartSchedulePlanner({
  userId,
  initialEvents = [],
  isTeacherView = false,
}: SmartSchedulePlannerProps) {
  const [events, setEvents] = useState<ScheduleEvent[]>(initialEvents);
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [todayDayIndex, setTodayDayIndex] = useState<number>(-1);

  React.useEffect(() => {
    const today = new Date().getDay();
    const idx = (today + 6) % 7;
    setSelectedDay(idx);
    setTodayDayIndex(idx);
  }, []);


  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Matematik');
  const [eventType, setEventType] = useState<ScheduleEventType>('school');
  const [dayOfWeek, setDayOfWeek] = useState<number>(selectedDay);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:40');
  const [locationOrLink, setLocationOrLink] = useState('');
  const [notes, setNotes] = useState('');
  const [liveConflictWarning, setLiveConflictWarning] = useState<string | null>(null);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (filterType !== 'all' && ev.event_type !== filterType) return false;
      return true;
    });
  }, [events, filterType]);

  // Overall Completion Stats
  const completionStats = useMemo(() => {
    const total = events.length;
    const completed = events.filter((e) => e.is_completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [events]);

  // Live Conflict Check on Form Inputs
  const handleTimeOrDayChange = (
    newDay: number,
    newStart: string,
    newEnd: string
  ) => {
    setDayOfWeek(newDay);
    setStartTime(newStart);
    setEndTime(newEnd);

    if (newStart && newEnd && newStart < newEnd) {
      const conflictCheck = detectScheduleConflict(events, {
        day_of_week: newDay,
        start_time: newStart,
        end_time: newEnd,
      });

      if (conflictCheck.hasConflict) {
        setLiveConflictWarning(conflictCheck.message || 'Seçili saatte çakışma var!');
      } else {
        setLiveConflictWarning(null);
      }
    } else {
      setLiveConflictWarning(null);
    }
  };

  const handleOpenAddModal = (defaultDay?: number) => {
    const targetDay = defaultDay !== undefined ? defaultDay : selectedDay;
    setDayOfWeek(targetDay);
    setTitle('');
    setSubject('Matematik');
    setEventType('school');
    setStartTime('09:00');
    setEndTime('09:40');
    setLocationOrLink('');
    setNotes('');
    setLiveConflictWarning(null);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (startTime >= endTime) {
      alert('Bitiş saati başlangıç saatinden sonra olmalıdır.');
      return;
    }

    const created = await createScheduleEvent({
      user_id: userId,
      title: title.trim(),
      subject: subject.trim(),
      event_type: eventType,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      location_or_link: locationOrLink.trim() || null,
      notes: notes.trim() || null,
      is_completed: false,
    });

    setEvents((prev) => [...prev, created]);
    setIsModalOpen(false);
  };

  const handleToggleComplete = async (ev: ScheduleEvent) => {
    const nextCompleted = !ev.is_completed;
    const updated = await toggleScheduleEventCompleted(ev.id, nextCompleted);
    if (updated) {
      setEvents((prev) => prev.map((item) => (item.id === ev.id ? updated : item)));
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Bu ders/etkinliği programınızdan silmek istediğinize emin misiniz?')) return;
    const ok = await deleteScheduleEvent(id);
    if (ok) {
      setEvents((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Group events by day
  const eventsByDay = useMemo(() => {
    const map: Record<number, ScheduleEvent[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };
    filteredEvents.forEach((ev) => {
      if (map[ev.day_of_week]) {
        map[ev.day_of_week].push(ev);
      }
    });
    // Sort each day chronologically
    Object.keys(map).forEach((d) => {
      map[Number(d)].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });
    return map;
  }, [filteredEvents]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Weekly Completion Tracker */}
      <div className="rounded-3xl p-6 sm:p-7 glass-panel shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Akıllı Çakışma Korumalı Takvim & Etüt Planı
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Ders Programı & Kişisel Çalışma Planı
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Okul ders saatlerinizi, özel derslerinizi ve bireysel etütlerinizi tek takvimde yönetin.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => handleOpenAddModal()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Etkinlik / Ders Ekle
            </button>
          </div>
        </div>

        {/* Weekly Completion Progress */}
        <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                Haftalık Hedef Gerçekleşme Oranı
              </span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                %{completionStats.percentage}
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${completionStats.percentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400 sm:col-span-2 sm:justify-end">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {completionStats.completed} Tamamlandı
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {completionStats.total - completionStats.completed} Bekleyen
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-mono">
              Toplam {completionStats.total} Etkinlik
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & View Switcher */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl glass-panel border border-slate-200/80 dark:border-slate-800">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Tümü
          </button>
          {(Object.keys(EVENT_TYPE_CONFIG) as ScheduleEventType[]).map((type) => {
            const conf = EVENT_TYPE_CONFIG[type];
            const isActive = filterType === type;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{conf.icon}</span>
                <span>{conf.label}</span>
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700/80 shrink-0 self-end md:self-auto">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'week'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Haftalık Matris
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'day'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Günlük Akış
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: WEEKLY MATRIX (7 COLUMNS) */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3.5">
          {DAYS.map((day) => {
            const dayEvents = eventsByDay[day.id] || [];
            const isToday = todayDayIndex === day.id;


            return (
              <div
                key={day.id}
                className={`rounded-2xl flex flex-col p-3.5 glass-panel border transition-all ${
                  isToday
                    ? 'border-indigo-500/50 shadow-md ring-2 ring-indigo-500/20 bg-indigo-500/[0.02]'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200/60 dark:border-slate-800/80">
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      {day.name}
                      {isToday && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {dayEvents.length} Etkinlik
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenAddModal(day.id)}
                    title={`${day.name} gününe ders ekle`}
                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Day Events Stack */}
                <div className="space-y-2 flex-1">
                  {dayEvents.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-[11px] italic">
                      Planlanmış ders yok
                    </div>
                  ) : (
                    dayEvents.map((ev, idx) => {
                      const conf = EVENT_TYPE_CONFIG[ev.event_type] || EVENT_TYPE_CONFIG.school;
                      // Conflict check with other events on same day
                      const hasConflict = dayEvents.some(
                        (other, otherIdx) =>
                          otherIdx !== idx &&
                          ev.start_time < other.end_time &&
                          ev.end_time > other.start_time
                      );

                      return (
                        <div
                          key={ev.id}
                          className={`group relative p-2.5 rounded-xl border border-l-4 transition-all ${conf.borderClass} ${
                            ev.is_completed
                              ? 'bg-slate-50/80 dark:bg-slate-900/40 opacity-75 border-slate-200 dark:border-slate-800'
                              : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm'
                          } ${conf.bgClass}`}
                        >
                          {/* Time & Conflict Badge */}
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {ev.start_time} - {ev.end_time}
                            </span>
                            {hasConflict && (
                              <span
                                title="Bu saatte başka bir etkinlik ile çakışma var!"
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[9px] font-bold"
                              >
                                <AlertTriangle className="w-2.5 h-2.5" />
                                Çakışma
                              </span>
                            )}
                          </div>

                          {/* Event Title */}
                          <p
                            className={`text-xs font-bold leading-tight ${
                              ev.is_completed
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {ev.title}
                          </p>

                          {/* Subject & Type Label */}
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${conf.badgeClass}`}>
                              {conf.icon} {ev.subject}
                            </span>
                          </div>

                          {/* Location / Note if exists */}
                          {ev.location_or_link && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 truncate">
                              <MapPin className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{ev.location_or_link}</span>
                            </p>
                          )}

                          {/* Action overlay on hover */}
                          <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/60">
                            <button
                              onClick={() => handleToggleComplete(ev)}
                              className="text-[10px] font-bold flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            >
                              {ev.is_completed ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  <span>Tamam</span>
                                </>
                              ) : (
                                <>
                                  <Circle className="w-3 h-3" />
                                  <span>Tamamla</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleDeleteEvent(ev.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all rounded hover:bg-rose-50 dark:hover:bg-rose-950/20"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
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
      )}

      {/* VIEW MODE 2: DAILY FLOW STREAM */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          {/* Day Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {DAYS.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDay(d.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedDay === d.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {d.name} ({eventsByDay[d.id]?.length || 0})
              </button>
            ))}
          </div>

          {/* Selected Day's Stream */}
          <div className="rounded-3xl p-6 glass-panel border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {DAYS[selectedDay]?.name} Günlük Akışı
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bugün için planlanan ders ve etütlerin saat bazlı sıralı dökümü
                </p>
              </div>
              <button
                onClick={() => handleOpenAddModal(selectedDay)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Bu Güne Ekle
              </button>
            </div>

            {eventsByDay[selectedDay]?.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs italic">
                Bu gün için kayıtlı bir ders veya etüt bulunmuyor.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {eventsByDay[selectedDay]?.map((ev, idx, list) => {
                  const conf = EVENT_TYPE_CONFIG[ev.event_type] || EVENT_TYPE_CONFIG.school;
                  const hasConflict = list.some(
                    (other, otherIdx) =>
                      otherIdx !== idx &&
                      ev.start_time < other.end_time &&
                      ev.end_time > other.start_time
                  );

                  return (
                    <div
                      key={ev.id}
                      className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleComplete(ev)}
                          className="pt-1 text-slate-400 hover:text-emerald-500 transition-colors"
                        >
                          {ev.is_completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                              {ev.start_time} - {ev.end_time}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${conf.badgeClass}`}>
                              {conf.icon} {conf.label}
                            </span>
                            {hasConflict && (
                              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Zaman Çakışması!
                              </span>
                            )}
                          </div>
                          <h4
                            className={`text-sm font-bold ${
                              ev.is_completed
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {ev.title}
                          </h4>
                          {ev.notes && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                              &ldquo;{ev.notes}&rdquo;
                            </p>
                          )}
                          {ev.location_or_link && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {ev.location_or_link}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD / EDIT EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Yeni Ders / Etüt Planı Ekle</h3>
                  <p className="text-xs text-slate-400">Akıllı çakışma denetimiyle takviminize işleyin</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Conflict Warning Box */}
            {liveConflictWarning && (
              <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5 animate-in shake">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div>
                  <span className="font-bold block">⚠️ Dikkat: Zaman Çakışması</span>
                  <span>{liveConflictWarning}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveEvent} className="mt-5 space-y-4 text-xs">
              {/* Event Title */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Ders / Etüt Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="örn: AYT Matematik (Türev Fasikülü), 12-A Fizik Dersi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Subject & Type Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Ders / Alan *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="örn: Matematik, Fizik, Türkçe"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Etkinlik Türü *</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as ScheduleEventType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="school">🏫 Okul Dersi</option>
                    <option value="private_lesson">👨‍🏫 Özel Ders</option>
                    <option value="personal_study">📖 Bireysel Etüt/Çalışma</option>
                    <option value="review">🔁 Tekrar & Soru Çözümü</option>
                    <option value="exam">📝 Deneme / Yazılı Sınav</option>
                  </select>
                </div>
              </div>

              {/* Day & Hours Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Haftanın Günü *</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) =>
                      handleTimeOrDayChange(Number(e.target.value), startTime, endTime)
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {DAYS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Başlangıç *</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) =>
                      handleTimeOrDayChange(dayOfWeek, e.target.value, endTime)
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Bitiş *</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) =>
                      handleTimeOrDayChange(dayOfWeek, startTime, e.target.value)
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Location or Link */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Yer / Sınıf / Bağlantı (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  value={locationOrLink}
                  onChange={(e) => setLocationOrLink(e.target.value)}
                  placeholder="örn: 12-A Sınıfı, Kütüphane Masası 4, Zoom Linki"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Notlar & Hedefler (İsteğe Bağlı)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="örn: Apotemi sf. 45-60 çözülecek, yanlış sorular tekrar edilecek"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-semibold transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  Programı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
