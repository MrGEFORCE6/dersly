'use client';

import React from 'react';
import {
  Printer,
  FileSpreadsheet,
  Download,
  X,
  Calendar,
  Sparkles,
  BookOpen,
  CheckSquare,
} from 'lucide-react';
import type { ScheduleEvent } from '@/types/database.types';
import {
  TURKISH_DAYS,
  EVENT_TYPE_LABELS,
  exportScheduleToXLSX,
  exportScheduleToCSV,
} from '@/lib/services/exportImportService';

interface PrintableTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: ScheduleEvent[];
  studentName?: string;
  className?: string;
}

export function PrintableTimetableModal({
  isOpen,
  onClose,
  events,
  studentName = 'Öğrenci',
  className = 'Dersly Sınıfı',
}: PrintableTimetableModalProps) {
  if (!isOpen) return null;

  // Group events by day 0 to 6
  const eventsByDay: Record<number, ScheduleEvent[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  };

  events.forEach((e) => {
    if (eventsByDay[e.day_of_week]) {
      eventsByDay[e.day_of_week].push(e);
    }
  });

  // Sort each day chronologically
  Object.keys(eventsByDay).forEach((k) => {
    eventsByDay[Number(k)].sort((a, b) => a.start_time.localeCompare(b.start_time));
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportXLSX = () => {
    exportScheduleToXLSX(events, `${studentName.replace(/\s+/g, '_')}_haftalik_program.xlsx`);
  };

  const handleExportCSV = () => {
    exportScheduleToCSV(events, `${studentName.replace(/\s+/g, '_')}_haftalik_program.csv`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-schedule-area,
          #printable-schedule-area * {
            visibility: visible;
          }
          #printable-schedule-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            margin: 0;
            padding: 10mm;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 landscape;
            margin: 6mm;
          }
        }
      `}</style>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Toolbar (hidden on print) */}
        <div className="no-print px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                A4 Yazdırma & Çizelge Önizlemesi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A4 yatay formatta hazır ders çizelgenizi yazdırın veya Excel/CSV olarak indirin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportXLSX}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 flex items-center gap-1.5 shadow-sm transition"
              title="Excel Olarak İndir"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              Excel (.xlsx)
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 flex items-center gap-1.5 shadow-sm transition"
              title="CSV Olarak İndir"
            >
              <Download className="w-4 h-4 text-indigo-500" />
              CSV (.csv)
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition"
            >
              <Printer className="w-4 h-4" />
              Yazdır / PDF Kaydet
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Preview Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/50 dark:bg-slate-950/60">
          <div
            id="printable-schedule-area"
            className="bg-white text-slate-900 border border-slate-300 rounded-2xl p-6 sm:p-8 shadow-md max-w-5xl mx-auto space-y-6"
          >
            {/* Document Header */}
            <div className="flex items-center justify-between border-b-2 border-indigo-600 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black tracking-tight text-indigo-900">
                    DERSLY
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded font-bold bg-indigo-100 text-indigo-800">
                    EĞİTİM PLATFORMU
                  </span>
                </div>
                <h1 className="text-lg font-black uppercase text-slate-800">
                  Haftalık Ders ve Kişisel Etüt Çizelgesi
                </h1>
              </div>

              <div className="text-right text-xs space-y-0.5">
                <div>
                  <span className="text-slate-500 font-bold">Öğrenci:</span>{' '}
                  <span className="font-black text-slate-900">{studentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold">Sınıf / Grup:</span>{' '}
                  <span className="font-semibold text-slate-800">{className}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold">Tarih:</span>{' '}
                  <span className="font-mono text-slate-700">
                    {new Date().toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>

            {/* 7-Days Timetable Grid */}
            <div className="grid grid-cols-7 gap-2">
              {TURKISH_DAYS.map((dayName, dayIndex) => {
                const dayList = eventsByDay[dayIndex] || [];
                const isWeekend = dayIndex >= 5;

                return (
                  <div
                    key={dayIndex}
                    className={`border rounded-xl flex flex-col min-h-[360px] ${
                      isWeekend ? 'bg-slate-50/70 border-slate-300' : 'bg-white border-slate-300'
                    }`}
                  >
                    {/* Day Column Header */}
                    <div
                      className={`p-2 text-center border-b font-black text-xs uppercase tracking-wider ${
                        isWeekend
                          ? 'bg-amber-100/60 text-amber-900 border-amber-200'
                          : 'bg-indigo-50 text-indigo-900 border-indigo-100'
                      }`}
                    >
                      {dayName}
                      <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                        {dayList.length} Etkinlik
                      </span>
                    </div>

                    {/* Day Schedule Items */}
                    <div className="p-1.5 space-y-1.5 flex-1 overflow-visible">
                      {dayList.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-[10px] text-slate-300 italic">
                          Ders Yok
                        </div>
                      ) : (
                        dayList.map((item) => (
                          <div
                            key={item.id}
                            className={`p-2 rounded-lg border text-[11px] leading-tight space-y-1 ${
                              item.event_type === 'school'
                                ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
                                : item.event_type === 'private_lesson'
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                : item.event_type === 'exam'
                                ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                                : item.event_type === 'review'
                                ? 'bg-violet-50/70 border-violet-200 text-violet-950'
                                : 'bg-amber-50/70 border-amber-200 text-amber-950'
                            }`}
                          >
                            <div className="font-mono text-[10px] font-bold text-slate-600">
                              {item.start_time} - {item.end_time}
                            </div>
                            <div className="font-black text-slate-900 line-clamp-2">
                              {item.title}
                            </div>
                            {item.notes && (
                              <div className="text-[10px] text-slate-600 line-clamp-1 italic">
                                {item.notes}
                              </div>
                            )}
                            <div className="text-[9px] uppercase font-bold text-slate-500">
                              {EVENT_TYPE_LABELS[item.event_type]}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Document Bottom Sections: Goals, Advisor Note & Signature */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t-2 border-slate-200 text-xs">
              {/* Weekly Goals Checklist */}
              <div className="border border-slate-300 rounded-xl p-3 space-y-1.5">
                <div className="font-black text-slate-800 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                  Haftalık Hedefler & Kazanımlar
                </div>
                <div className="space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded border border-slate-400 inline-block" />
                    <span>Planlanan tüm okul ve etütlere eksiksiz katılım</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded border border-slate-400 inline-block" />
                    <span>Haftalık minimum 350+ branş sorusu çözümü</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded border border-slate-400 inline-block" />
                    <span>Eksik kazanımların etüt sonrası tekrarı</span>
                  </div>
                </div>
              </div>

              {/* Legend & Stats */}
              <div className="border border-slate-300 rounded-xl p-3 space-y-1.5">
                <div className="font-black text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  Program İstatistikleri & Renk Kodları
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-indigo-500" /> Okul Dersi
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Özel Ders
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500" /> Bireysel Etüt
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-rose-500" /> Sınav / Deneme
                  </div>
                </div>
                <div className="text-[11px] font-bold text-slate-700 pt-1 border-t border-slate-200">
                  Toplam {events.length} Planlı Etkinlik / Oturum
                </div>
              </div>

              {/* Advisor / Teacher Note & Signature */}
              <div className="border border-slate-300 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <div className="font-black text-slate-800">
                    Öğretmen / Eğitim Danışmanı Onayı
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 italic">
                    Notlar & Değerlendirme Görüşü:
                  </div>
                </div>
                <div className="pt-4 border-t border-dashed border-slate-300 flex items-center justify-between text-[10px] text-slate-500 font-bold">
                  <span>İmza / Kaşe:</span>
                  <span>Tarih: ___ / ___ / 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
