import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type { ScheduleEvent, ScheduleEventInsert, ScheduleEventType } from '@/types/database.types';
import { detectScheduleConflict } from './supabaseService';

export interface ParsedFileResult {
  headers: string[];
  rows: Record<string, any>[];
  fileName: string;
  rowCount: number;
}

export interface ScheduleImportMapping {
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  title?: string;
  subject?: string;
  event_type?: string;
  location_or_link?: string;
  notes?: string;
}

export interface ValidatedImportItem {
  index: number;
  event: ScheduleEventInsert;
  raw: Record<string, any>;
  isValid: boolean;
  errors: string[];
  conflicts: string[];
}

export interface HeuristicPlanOptions {
  userId: string;
  examType: 'yks' | 'lgs' | 'school_exams' | 'general';
  targetDailyHours: number; // e.g. 2, 3, 4
  sessionDurationMinutes?: number; // default 45
  breakDurationMinutes?: number; // default 15
  selectedSubjects?: string[];
}

export const TURKISH_DAYS = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar',
];

export const EVENT_TYPE_LABELS: Record<ScheduleEventType, string> = {
  school: 'Okul Dersi',
  private_lesson: 'Özel Ders',
  personal_study: 'Bireysel Çalışma',
  review: 'Haftalık Tekrar',
  exam: 'Sınav / Deneme',
};

// Helper: Download a Blob in browser
function downloadBlob(blob: Blob, fileName: string) {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// -------------------------------------------------------------
// 1. EXPORT TO CSV / EXCEL
// -------------------------------------------------------------

/**
 * Export Schedule events to CSV with UTF-8 BOM (proper Turkish character rendering in Excel)
 */
export function exportScheduleToCSV(events: ScheduleEvent[], fileName = 'haftalik_ders_programi.csv') {
  const data = events.map((e) => ({
    'Gün': TURKISH_DAYS[e.day_of_week] || `Gün ${e.day_of_week}`,
    'Başlangıç Saati': e.start_time,
    'Bitiş Saati': e.end_time,
    'Ders Adı': e.title,
    'Branş / Kategori': e.subject,
    'Etkinlik Türü': EVENT_TYPE_LABELS[e.event_type] || e.event_type,
    'Konum / Bağlantı': e.location_or_link || '',
    'Açıklama / Not': e.notes || '',
    'Tamamlandı': e.is_completed ? 'Evet' : 'Hayır',
  }));

  const csv = Papa.unparse(data, {
    delimiter: ';', // Excel uses semicolon in Turkish locale
  });

  // UTF-8 BOM
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, fileName);
}

/**
 * Export Schedule events to XLSX
 */
export function exportScheduleToXLSX(events: ScheduleEvent[], fileName = 'haftalik_ders_programi.xlsx') {
  const data = events.map((e) => ({
    'Gün': TURKISH_DAYS[e.day_of_week] || `Gün ${e.day_of_week}`,
    'Başlangıç Saati': e.start_time,
    'Bitiş Saati': e.end_time,
    'Ders Adı': e.title,
    'Branş / Kategori': e.subject,
    'Etkinlik Türü': EVENT_TYPE_LABELS[e.event_type] || e.event_type,
    'Konum / Bağlantı': e.location_or_link || '',
    'Açıklama / Not': e.notes || '',
    'Tamamlandı': e.is_completed ? 'Evet' : 'Hayır',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 14 }, // Gün
    { wch: 16 }, // Başlangıç
    { wch: 16 }, // Bitiş
    { wch: 22 }, // Ders Adı
    { wch: 18 }, // Branş
    { wch: 20 }, // Tür
    { wch: 22 }, // Konum
    { wch: 30 }, // Not
    { wch: 12 }, // Durum
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Haftalık Program');
  XLSX.writeFile(wb, fileName);
}

/**
 * Export Students roster for Teachers
 */
export function exportStudentsToXLSX(students: any[], fileName = 'ogrenci_listesi.xlsx') {
  const data = students.map((s) => ({
    'Öğrenci Adı Soyadı': s.profile?.full_name || s.name || '',
    'Kullanıcı Adı': s.profile?.username ? `@${s.profile.username}` : '',
    'Telefon': s.profile?.phone || '',
    'Kalan Kredi Saati': s.stats?.remainingHours ?? s.remainingHours ?? 0,
    'Kayıtlı Sınıf': s.className || (s.classes && s.classes[0]?.name) || 'Atanmamış',
    'Tamamlanan Ödev': s.stats?.completedHomeworks ?? 0,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 25 },
    { wch: 18 },
    { wch: 16 },
    { wch: 18 },
    { wch: 20 },
    { wch: 18 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Öğrenciler');
  XLSX.writeFile(wb, fileName);
}

export function exportStudentsToCSV(students: any[], fileName = 'ogrenci_listesi.csv') {
  const data = students.map((s) => ({
    'Öğrenci Adı Soyadı': s.profile?.full_name || s.name || '',
    'Kullanıcı Adı': s.profile?.username ? `@${s.profile.username}` : '',
    'Telefon': s.profile?.phone || '',
    'Kalan Kredi Saati': s.stats?.remainingHours ?? s.remainingHours ?? 0,
    'Kayıtlı Sınıf': s.className || (s.classes && s.classes[0]?.name) || 'Atanmamış',
    'Tamamlanan Ödev': s.stats?.completedHomeworks ?? 0,
  }));

  const csv = Papa.unparse(data, { delimiter: ';' });
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, fileName);
}

/**
 * Export Homeworks for Teachers
 */
export function exportHomeworksToXLSX(homeworks: any[], fileName = 'odev_degerlendirme_raporu.xlsx') {
  const data = homeworks.map((h) => ({
    'Ödev Başlığı': h.title || h.description || '',
    'Ders': h.lesson?.title || h.subject || 'Genel',
    'Öğrenci / Sınıf': h.student?.full_name || h.class_name || '',
    'Teslim Tarihi': h.due_date ? new Date(h.due_date).toLocaleDateString('tr-TR') : 'Belirtilmedi',
    'Tahmini Süre (Dk)': h.estimated_minutes || '-',
    'Durum': h.status === 'reviewed' ? 'İncelendi' : h.status === 'submitted' ? 'Teslim Edildi' : h.status === 'revision_requested' ? 'Revizyon İstendi' : 'Bekliyor',
    'Puan': h.score ?? '-',
    'Öğretmen Geri Bildirimi': h.teacher_feedback || '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 28 },
    { wch: 18 },
    { wch: 22 },
    { wch: 15 },
    { wch: 16 },
    { wch: 18 },
    { wch: 10 },
    { wch: 35 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ödevler ve Değerlendirmeler');
  XLSX.writeFile(wb, fileName);
}

// -------------------------------------------------------------
// 2. DOWNLOADABLE TEMPLATES (ŞABLONLAR)
// -------------------------------------------------------------

export function downloadScheduleTemplate(format: 'xlsx' | 'csv' = 'xlsx') {
  const sampleData = [
    {
      'Gün': 'Pazartesi',
      'Başlangıç Saati': '08:30',
      'Bitiş Saati': '09:10',
      'Ders Adı': 'Matematik',
      'Branş': 'Matematik',
      'Etkinlik Türü': 'Okul Dersi',
      'Konum / Link': 'Derslik 11-B',
      'Notlar': 'Türev ve Anlık Değişim',
    },
    {
      'Gün': 'Pazartesi',
      'Başlangıç Saati': '09:20',
      'Bitiş Saati': '10:00',
      'Ders Adı': 'Fizik',
      'Branş': 'Fizik',
      'Etkinlik Türü': 'Okul Dersi',
      'Konum / Link': 'Derslik 11-B',
      'Notlar': 'Elektrik & Manyetizma',
    },
    {
      'Gün': 'Pazartesi',
      'Başlangıç Saati': '16:30',
      'Bitiş Saati': '17:15',
      'Ders Adı': 'Matematik Soru Çözümü',
      'Branş': 'Matematik',
      'Etkinlik Türü': 'Bireysel Çalışma',
      'Konum / Link': 'Ev Çalışma Masası',
      'Notlar': 'Hedef 40 Soru',
    },
    {
      'Gün': 'Salı',
      'Başlangıç Saati': '17:00',
      'Bitiş Saati': '18:00',
      'Ders Adı': 'Özel Ders (Ahmet Hoca)',
      'Branş': 'Geometri',
      'Etkinlik Türü': 'Özel Ders',
      'Konum / Link': 'Zoom Linki',
      'Notlar': 'Çemberde Açılar Konu Pekiştirme',
    },
    {
      'Gün': 'Çarşamba',
      'Başlangıç Saati': '19:00',
      'Bitiş Saati': '20:00',
      'Ders Adı': 'Biyoloji Haftalık Tekrar',
      'Branş': 'Biyoloji',
      'Etkinlik Türü': 'Haftalık Tekrar',
      'Konum / Link': 'Kütüphane',
      'Notlar': 'Kalıtım ve Genetik Şifre',
    },
    {
      'Gün': 'Cumartesi',
      'Başlangıç Saati': '10:00',
      'Bitiş Saati': '12:45',
      'Ders Adı': 'TYT Genel Deneme Sınavı',
      'Branş': 'Genel',
      'Etkinlik Türü': 'Sınav / Deneme',
      'Konum / Link': 'Etüt Merkezi',
      'Notlar': '120 Soru, Süreli Çözüm',
    },
  ];

  if (format === 'csv') {
    const csv = Papa.unparse(sampleData, { delimiter: ';' });
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, 'dersly_haftalik_program_sablonu.csv');
  } else {
    const ws = XLSX.utils.json_to_sheet(sampleData);
    ws['!cols'] = [
      { wch: 14 },
      { wch: 16 },
      { wch: 16 },
      { wch: 26 },
      { wch: 16 },
      { wch: 18 },
      { wch: 22 },
      { wch: 32 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Program Şablonu');
    XLSX.writeFile(wb, 'dersly_haftalik_program_sablonu.xlsx');
  }
}

// -------------------------------------------------------------
// 3. FILE PARSING & NORMALIZATION (SPREADSHEET / CSV)
// -------------------------------------------------------------

export async function parseSpreadsheetOrCSV(file: File): Promise<ParsedFileResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'csv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || [];
          const rows = results.data as Record<string, any>[];
          resolve({
            headers,
            rows,
            fileName: file.name,
            rowCount: rows.length,
          });
        },
        error: (err) => reject(new Error('CSV dosyası okunamadı: ' + err.message)),
      });
    });
  }

  // Excel (.xlsx, .xls)
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('Excel dosyasında çalışma sayfası bulunamadı.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  if (jsonData.length === 0) {
    throw new Error('Excel çalışma sayfası boş.');
  }

  const headers = Object.keys(jsonData[0] || {});
  return {
    headers,
    rows: jsonData,
    fileName: file.name,
    rowCount: jsonData.length,
  };
}

/**
 * Smart fuzzy header auto-detection for schedule columns
 */
export function detectDefaultScheduleMapping(headers: string[]): ScheduleImportMapping {
  const mapping: ScheduleImportMapping = {};

  const clean = (str: string) => str.toLowerCase().replace(/[^a-z0-9ğüşıöç]/g, '');

  headers.forEach((h) => {
    const c = clean(h);
    if (!mapping.day_of_week && (c.includes('gun') || c.includes('day') || c.includes('tarih'))) {
      mapping.day_of_week = h;
    } else if (
      !mapping.start_time &&
      (c.includes('baslangic') || c.includes('start') || c.includes('giris') || c === 'saat')
    ) {
      mapping.start_time = h;
    } else if (
      !mapping.end_time &&
      (c.includes('bitis') || c.includes('end') || c.includes('cikis'))
    ) {
      mapping.end_time = h;
    } else if (
      !mapping.title &&
      (c.includes('dersadi') || c.includes('baslik') || c.includes('title') || c.includes('etkinlik') || c === 'ders')
    ) {
      mapping.title = h;
    } else if (!mapping.subject && (c.includes('brans') || c.includes('konu') || c.includes('subject'))) {
      mapping.subject = h;
    } else if (!mapping.event_type && (c.includes('tur') || c.includes('kategori') || c.includes('type'))) {
      mapping.event_type = h;
    } else if (!mapping.location_or_link && (c.includes('konum') || c.includes('link') || c.includes('yer') || c.includes('oda'))) {
      mapping.location_or_link = h;
    } else if (!mapping.notes && (c.includes('not') || c.includes('aciklama') || c.includes('detay'))) {
      mapping.notes = h;
    }
  });

  return mapping;
}

/**
 * Normalizes day of week to 0 (Pazartesi) through 6 (Pazar)
 */
export function normalizeDayOfWeek(val: any): number | null {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val === 'number') {
    if (val >= 0 && val <= 6) return val;
    if (val >= 1 && val <= 7) return val - 1; // 1=Mon .. 7=Sun
  }

  const s = String(val).trim().toLowerCase();
  if (s.startsWith('pazar') && !s.includes('tesi')) return 6;
  if (s.startsWith('pazartesi') || s.includes('pzt') || s === 'mon' || s === 'monday') return 0;
  if (s.startsWith('sal') || s.includes('tue') || s === 'tuesday') return 1;
  if (s.startsWith('çar') || s.startsWith('car') || s.includes('wed') || s === 'wednesday') return 2;
  if (s.startsWith('per') || s.includes('thu') || s === 'thursday') return 3;
  if (s.startsWith('cum') && !s.includes('tesi') || s.includes('fri') || s === 'friday') return 4;
  if (s.startsWith('cumartesi') || s.includes('cmt') || s.includes('sat') || s === 'saturday') return 5;

  const num = parseInt(s, 10);
  if (!isNaN(num)) {
    if (num >= 0 && num <= 6) return num;
    if (num >= 1 && num <= 7) return num - 1;
  }
  return null;
}

/**
 * Normalizes time string to standard "HH:mm"
 */
export function normalizeTimeString(val: any): string | null {
  if (val === undefined || val === null || val === '') return null;

  // If number (Excel fraction of day, e.g. 0.3541666667 = 08:30)
  if (typeof val === 'number') {
    const totalMinutes = Math.round(val * 24 * 60);
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  let str = String(val).trim().replace('.', ':');
  // Match HH:mm or H:mm
  const match = str.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  }

  return null;
}

/**
 * Normalizes event type to ScheduleEventType
 */
export function normalizeEventType(val: any): ScheduleEventType {
  if (!val) return 'school';
  const s = String(val).trim().toLowerCase();
  if (s.includes('okul') || s.includes('school')) return 'school';
  if (s.includes('özel') || s.includes('ozel') || s.includes('private') || s.includes('birebir')) return 'private_lesson';
  if (s.includes('bireysel') || s.includes('etüt') || s.includes('etut') || s.includes('çalışma') || s.includes('study')) return 'personal_study';
  if (s.includes('tekrar') || s.includes('review')) return 'review';
  if (s.includes('sınav') || s.includes('sinav') || s.includes('deneme') || s.includes('exam')) return 'exam';
  return 'school';
}

/**
 * Validates and maps raw rows into ScheduleEventInsert items with conflict checking
 */
export function validateAndMapScheduleRows(
  rows: Record<string, any>[],
  mapping: ScheduleImportMapping,
  userId: string,
  existingEvents: ScheduleEvent[]
): ValidatedImportItem[] {
  const result: ValidatedImportItem[] = [];

  rows.forEach((row, idx) => {
    const errors: string[] = [];
    const conflicts: string[] = [];

    const rawDay = mapping.day_of_week ? row[mapping.day_of_week] : row['Gün'];
    const rawStart = mapping.start_time ? row[mapping.start_time] : row['Başlangıç Saati'];
    const rawEnd = mapping.end_time ? row[mapping.end_time] : row['Bitiş Saati'];
    const rawTitle = mapping.title ? row[mapping.title] : row['Ders Adı'] || row['Başlık'];
    const rawSubject = mapping.subject ? row[mapping.subject] : row['Branş'] || row['Konu'];
    const rawType = mapping.event_type ? row[mapping.event_type] : row['Etkinlik Türü'] || row['Tür'];
    const rawLocation = mapping.location_or_link ? row[mapping.location_or_link] : row['Konum / Link'];
    const rawNotes = mapping.notes ? row[mapping.notes] : row['Notlar'] || row['Not'];

    const day = normalizeDayOfWeek(rawDay);
    if (day === null) {
      errors.push(`Geçersiz gün formatı ('${rawDay || 'Boş'}'). Pazartesi-Pazar arası olmalıdır.`);
    }

    const start = normalizeTimeString(rawStart);
    if (!start) {
      errors.push(`Geçersiz başlangıç saati ('${rawStart || 'Boş'}'). Örn: 08:30`);
    }

    const end = normalizeTimeString(rawEnd);
    if (!end) {
      errors.push(`Geçersiz bitiş saati ('${rawEnd || 'Boş'}'). Örn: 09:15`);
    }

    if (start && end && start >= end) {
      errors.push(`Bitiş saati (${end}) başlangıç saatinden (${start}) sonra olmalıdır.`);
    }

    const title = String(rawTitle || rawSubject || 'Ders').trim();
    if (!title) {
      errors.push('Ders adı boş olamaz.');
    }

    const subject = String(rawSubject || title).trim();
    const eventType = normalizeEventType(rawType);

    const eventToInsert: ScheduleEventInsert = {
      user_id: userId,
      title,
      subject,
      event_type: eventType,
      day_of_week: day ?? 0,
      start_time: start || '09:00',
      end_time: end || '09:40',
      location_or_link: rawLocation ? String(rawLocation).trim() : null,
      notes: rawNotes ? String(rawNotes).trim() : null,
      is_completed: false,
    };

    // Check conflict if valid times
    if (day !== null && start && end && start < end) {
      const conflictCheck = detectScheduleConflict(existingEvents, {
        day_of_week: day,
        start_time: start,
        end_time: end,
      });

      if (conflictCheck.hasConflict) {
        conflictCheck.conflictingEvents.forEach((c) => {
          conflicts.push(`"${c.title}" (${c.start_time} - ${c.end_time}) ile çakışıyor`);
        });
      }
    }

    result.push({
      index: idx + 1,
      event: eventToInsert,
      raw: row,
      isValid: errors.length === 0,
      errors,
      conflicts,
    });
  });

  return result;
}

// -------------------------------------------------------------
// 4. HEURISTIC STUDY PLAN GENERATOR (AKILLI ETÜT MOTORU)
// -------------------------------------------------------------

export function generateHeuristicStudyPlan(
  existingEvents: ScheduleEvent[],
  options: HeuristicPlanOptions
): ScheduleEventInsert[] {
  const {
    userId,
    examType,
    targetDailyHours,
    sessionDurationMinutes = 45,
    breakDurationMinutes = 15,
    selectedSubjects,
  } = options;

  // Preset subject packages according to target exam
  const defaultSubjects: Record<string, string[]> = {
    yks: ['Matematik', 'Fizik', 'Türkçe (Paragraf)', 'Kimya', 'Biyoloji', 'Geometri'],
    lgs: ['Matematik', 'Fen Bilimleri', 'Türkçe', 'T.C. İnkılap Tarihi', 'İngilizce'],
    school_exams: ['Matematik', 'Fizik / Fen', 'Edebiyat / Türkçe', 'Tarih', 'İngilizce'],
    general: ['Matematik', 'Türkçe', 'Fen / Fen Bilimleri', 'Sosyal Bilgiler'],
  };

  const subjects = selectedSubjects && selectedSubjects.length > 0
    ? selectedSubjects
    : defaultSubjects[examType] || defaultSubjects.general;

  const plannedEvents: ScheduleEventInsert[] = [];

  // Helper to convert HH:mm to minutes
  const toMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const toTimeStr = (mins: number) => {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  let subjectPointer = 0;

  // Loop each day of the week: 0 (Mon) to 6 (Sun)
  for (let day = 0; day <= 6; day++) {
    const isWeekend = day >= 5;

    // Available windows (in minutes of the day)
    // Weekdays: 16:30 to 22:30 (avoid dinner 19:00 - 19:45)
    // Weekends: 10:00 to 21:00 (avoid lunch 13:00 - 14:00, dinner 19:00 - 19:45)
    const availableWindows: { start: number; end: number }[] = isWeekend
      ? [
          { start: 10 * 60, end: 13 * 60 },
          { start: 14 * 60, end: 18 * 60 + 30 },
          { start: 20 * 60, end: 21 * 60 + 30 },
        ]
      : [
          { start: 16 * 60 + 30, end: 19 * 60 },
          { start: 20 * 60, end: 22 * 60 + 30 },
        ];

    // Existing occupied intervals for this day
    const dayOccupied = existingEvents
      .filter((e) => e.day_of_week === day)
      .map((e) => ({ start: toMins(e.start_time), end: toMins(e.end_time) }))
      .sort((a, b) => a.start - b.start);

    let minutesScheduledToday = 0;
    const targetMinutesToday = targetDailyHours * 60;

    for (const win of availableWindows) {
      if (minutesScheduledToday >= targetMinutesToday) break;

      let cursor = win.start;

      while (cursor + sessionDurationMinutes <= win.end && minutesScheduledToday < targetMinutesToday) {
        const sessionEnd = cursor + sessionDurationMinutes;

        // Check if [cursor, sessionEnd] overlaps with any occupied interval
        const hasOverlap = dayOccupied.some((occ) => {
          return Math.max(cursor, occ.start) < Math.min(sessionEnd, occ.end);
        });

        if (!hasOverlap) {
          const currentSubject = subjects[subjectPointer % subjects.length];
          subjectPointer++;

          const isReview = (plannedEvents.length + 1) % 4 === 0;
          const eventType: ScheduleEventType = isReview ? 'review' : 'personal_study';

          const title = isReview
            ? `${currentSubject} Hafta Tekrarı`
            : `${currentSubject} Soru Çözümü`;

          const notes = isReview
            ? 'Kavram haritası ve özet not incelemesi (Hedef: 25 Soru)'
            : 'Seviye pekiştirme ve soru bankası çözümü (Hedef: 40 Soru)';

          plannedEvents.push({
            user_id: userId,
            title,
            subject: currentSubject,
            event_type: eventType,
            day_of_week: day,
            start_time: toTimeStr(cursor),
            end_time: toTimeStr(sessionEnd),
            location_or_link: 'Çalışma Masası / Kütüphane',
            notes,
            is_completed: false,
          });

          // Register in occupied list so subsequent study blocks don't collide
          dayOccupied.push({ start: cursor, end: sessionEnd });
          dayOccupied.sort((a, b) => a.start - b.start);

          minutesScheduledToday += sessionDurationMinutes;
          cursor = sessionEnd + breakDurationMinutes;
        } else {
          // Advance cursor past the earliest overlapping event's end
          const nextOcc = dayOccupied.find((occ) => occ.start <= cursor && occ.end > cursor);
          if (nextOcc) {
            cursor = nextOcc.end + 10;
          } else {
            cursor += 15;
          }
        }
      }
    }
  }

  return plannedEvents;
}
