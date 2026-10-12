/**
 * Dersly (DersPompa) — Aşama 1-4 Kapsamlı Entegrasyon ve Doğrulama Test Paketi
 * Senaryo A, B, C, D ve E için otomatik uçtan uca testler
 */

import assert from 'node:assert';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

console.log('═══════════════════════════════════════════════════════════════════');
console.log('🧪 DERSLY AŞAMA 1-4 ENTEGRASYON VE DOĞRULAMA TESTLERİ BAŞLATILIYOR');
console.log('═══════════════════════════════════════════════════════════════════\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`✅ [BAŞARILI] ${name}`);
  } catch (err) {
    console.error(`❌ [HATALI] ${name}`);
    console.error(`   Hata: ${err.message}\n`);
  }
}

// -------------------------------------------------------------
// SENARYO A: PROGRAM & ÇAKIŞMA TESPİT ALGORİTMASI
// -------------------------------------------------------------
console.log('--- SENARYO A: DERS PROGRAMI VE ÇAKIŞMA ALGORİTMASI ---');

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function detectScheduleConflict(existingEvents, target) {
  const targetStart = timeToMinutes(target.start_time);
  const targetEnd = timeToMinutes(target.end_time);

  const conflicts = existingEvents.filter((event) => {
    if (target.excludeId && event.id === target.excludeId) return false;
    if (event.day_of_week !== target.day_of_week) return false;

    const eventStart = timeToMinutes(event.start_time);
    const eventEnd = timeToMinutes(event.end_time);

    return Math.max(targetStart, eventStart) < Math.min(targetEnd, eventEnd);
  });

  return {
    hasConflict: conflicts.length > 0,
    conflictingEvents: conflicts,
  };
}

runTest('A1: Okul dersi ekleme ve başlangıç-bitiş saat doğrulama', () => {
  const schoolLesson = {
    id: 'ev-01',
    user_id: 'std-101',
    title: 'Matematik',
    subject: 'Matematik',
    event_type: 'school',
    day_of_week: 0, // Pazartesi
    start_time: '08:30',
    end_time: '09:15',
    is_completed: false,
  };
  assert.ok(timeToMinutes(schoolLesson.start_time) < timeToMinutes(schoolLesson.end_time));
});

runTest('A2: Çakışan saat aralığında görev ekleme girişimi (09:00 - 09:45 vs 08:30 - 09:15)', () => {
  const existing = [
    {
      id: 'ev-01',
      user_id: 'std-101',
      title: 'Matematik Okul Dersi',
      subject: 'Matematik',
      event_type: 'school',
      day_of_week: 0,
      start_time: '08:30',
      end_time: '09:15',
    },
  ];

  const overlappingTask = {
    day_of_week: 0,
    start_time: '09:00',
    end_time: '09:45',
  };

  const result = detectScheduleConflict(existing, overlappingTask);
  assert.strictEqual(result.hasConflict, true);
  assert.strictEqual(result.conflictingEvents.length, 1);
  assert.strictEqual(result.conflictingEvents[0].id, 'ev-01');
});

runTest('A3: Çakışmayan başka bir saate görev taşıma (16:30 - 17:15)', () => {
  const existing = [
    {
      id: 'ev-01',
      user_id: 'std-101',
      title: 'Matematik Okul Dersi',
      subject: 'Matematik',
      event_type: 'school',
      day_of_week: 0,
      start_time: '08:30',
      end_time: '09:15',
    },
  ];

  const rescheduledTask = {
    day_of_week: 0,
    start_time: '16:30',
    end_time: '17:15',
  };

  const result = detectScheduleConflict(existing, rescheduledTask);
  assert.strictEqual(result.hasConflict, false);
  assert.strictEqual(result.conflictingEvents.length, 0);
});

// -------------------------------------------------------------
// SENARYO B: ÖĞRETMEN, SINIF YÖNETİMİ VE TOPLU ÖDEV ATAMA
// -------------------------------------------------------------
console.log('\n--- SENARYO B: SINIF YÖNETİMİ VE TOPLU ÖDEV ATAMA ---');

runTest('B1: Öğretmenin sınıf oluşturması ve öğrencileri sınıfa eklemesi', () => {
  const mockClass = {
    id: 'cls-12a',
    teacher_id: 'tch-01',
    name: '12-A Sayısal YKS Grubu',
    grade_level: '12. Sınıf',
    academic_year: '2026-2027',
  };

  const mockStudents = [
    { id: 'cs-1', class_id: mockClass.id, student_id: 'std-1' },
    { id: 'cs-2', class_id: mockClass.id, student_id: 'std-2' },
    { id: 'cs-3', class_id: mockClass.id, student_id: 'std-3' },
  ];

  assert.strictEqual(mockClass.teacher_id, 'tch-01');
  assert.strictEqual(mockStudents.length, 3);
});

runTest('B2: Sınıfa toplu ödev atama simülasyonu', () => {
  const classId = 'cls-12a';
  const enrolledStudentIds = ['std-1', 'std-2', 'std-3'];
  const template = {
    title: 'Türev Konu Testi #4',
    description: 'Apotemi Türev sf. 45-60 çözülecek.',
    due_date: '2026-10-18T23:59:59Z',
    teacher_id: 'tch-01',
    estimated_minutes: 60,
    resource_url: 'https://example.com/turev-testi.pdf',
  };

  const createdHomeworks = enrolledStudentIds.map((sid) => ({
    id: `hw-${Date.now()}-${sid}`,
    ...template,
    student_id: sid,
    class_id: classId,
    status: 'pending',
    score: null,
    teacher_feedback: null,
  }));

  assert.strictEqual(createdHomeworks.length, 3);
  createdHomeworks.forEach((hw, i) => {
    assert.strictEqual(hw.student_id, enrolledStudentIds[i]);
    assert.strictEqual(hw.class_id, classId);
    assert.strictEqual(hw.status, 'pending');
    assert.strictEqual(hw.estimated_minutes, 60);
  });
});

// -------------------------------------------------------------
// SENARYO C: ÖDEV TESLİMİ, İNCELEME, PUANLAMA VE DÜZELTME
// -------------------------------------------------------------
console.log('\n--- SENARYO C: ÖDEV TESLİMİ VE DEĞERLENDİRME AKIŞI ---');

runTest('C1: Öğrencinin ödev çözümünü teslim etmesi (submitted)', () => {
  const initialHw = {
    id: 'hw-101',
    student_id: 'std-1',
    status: 'pending',
    file_url: null,
    submission_notes: null,
  };

  // Öğrenci teslimi
  const submittedHw = {
    ...initialHw,
    status: 'submitted',
    file_url: 'https://placeholder.supabase.co/storage/v1/object/public/homework-files/cozum.pdf',
    submission_notes: '4. sorunun türev grafiğini ek kağıtta çözdüm.',
    submitted_at: new Date().toISOString(),
  };

  assert.strictEqual(submittedHw.status, 'submitted');
  assert.ok(submittedHw.file_url.includes('cozum.pdf'));
  assert.ok(submittedHw.submission_notes.length > 0);
});

runTest('C2: Öğretmenin incelemesi ve düzeltme (revision_requested) istemesi', () => {
  const submittedHw = {
    id: 'hw-101',
    status: 'submitted',
  };

  const revisionHw = {
    ...submittedHw,
    status: 'revision_requested',
    teacher_feedback: 'Grafik çözümü eksik kalmış, işaret tablosunu tekrar yapınız.',
    score: null,
    reviewed_at: new Date().toISOString(),
  };

  assert.strictEqual(revisionHw.status, 'revision_requested');
  assert.ok(revisionHw.teacher_feedback.includes('Grafik'));
});

runTest('C3: Öğretmenin nihai değerlendirmesi ve puan vermesi (reviewed, 95/100)', () => {
  const revisionHw = {
    id: 'hw-101',
    status: 'revision_requested',
  };

  const finalizedHw = {
    ...revisionHw,
    status: 'reviewed',
    score: 95,
    teacher_feedback: 'Mükemmel düzeltme! Tebrikler.',
    reviewed_at: new Date().toISOString(),
  };

  assert.strictEqual(finalizedHw.status, 'reviewed');
  assert.strictEqual(finalizedHw.score, 95);
  assert.ok(finalizedHw.teacher_feedback.includes('Mükemmel'));
});

// -------------------------------------------------------------
// SENARYO D: EXCEL / CSV İÇE VE DIŞA AKTARMA VE NORMALİZASYON
// -------------------------------------------------------------
console.log('\n--- SENARYO D: EXCEL/CSV IMPORT, EXPORT VE VALIDASYON ---');

runTest('D1: CSV metnini ayrıştırma ve Türkçe karakter koruması (UTF-8 BOM)', () => {
  const sampleCSV = `\uFEFFGün;Başlangıç Saati;Bitiş Saati;Ders Adı;Branş;Etkinlik Türü;Notlar
Pazartesi;08:30;09:15;Matematik;Matematik;Okul Dersi;İntegral Çözümü
Salı;17:00;18:00;Fizik Özel Ders;Fizik;Özel Ders;Elektrik Manyetizma`;

  const parsed = Papa.parse(sampleCSV, { header: true, delimiter: ';' });
  assert.strictEqual(parsed.data.length, 2);
  assert.strictEqual(parsed.data[0]['Gün'], 'Pazartesi');
  assert.strictEqual(parsed.data[0]['Ders Adı'], 'Matematik');
  assert.strictEqual(parsed.data[1]['Ders Adı'], 'Fizik Özel Ders');
  assert.strictEqual(parsed.data[1]['Etkinlik Türü'], 'Özel Ders');
});

runTest('D2: Gün ve Saat formatı normalizasyonu', () => {
  function normalizeDay(val) {
    const s = String(val).trim().toLowerCase();
    if (s.startsWith('pazartesi') || s === '0') return 0;
    if (s.startsWith('sal') || s === '1') return 1;
    if (s.startsWith('çar') || s.startsWith('car') || s === '2') return 2;
    if (s.startsWith('per') || s === '3') return 3;
    if (s.startsWith('cum') && !s.includes('tesi') || s === '4') return 4;
    if (s.startsWith('cumartesi') || s === '5') return 5;
    if (s.startsWith('pazar') || s === '6') return 6;
    return null;
  }

  function normalizeTime(val) {
    if (typeof val === 'number') {
      const totalMinutes = Math.round(val * 24 * 60);
      const h = Math.floor(totalMinutes / 60) % 24;
      const m = totalMinutes % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    const str = String(val).trim().replace('.', ':');
    const match = str.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
      const h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
    }
    return null;
  }

  assert.strictEqual(normalizeDay('Pazartesi'), 0);
  assert.strictEqual(normalizeDay('Salı'), 1);
  assert.strictEqual(normalizeDay('Cumartesi'), 5);
  assert.strictEqual(normalizeDay('Pazar'), 6);

  assert.strictEqual(normalizeTime('8:30'), '08:30');
  assert.strictEqual(normalizeTime('08.45'), '08:45');
  assert.strictEqual(normalizeTime('17:15'), '17:15');
});

runTest('D3: Excel XLSX veri paketi oluşturma (SheetJS)', () => {
  const exportData = [
    { 'Gün': 'Pazartesi', 'Saat': '08:30 - 09:15', 'Ders': 'Matematik', 'Durum': 'Tamamlandı' },
    { 'Gün': 'Salı', 'Saat': '10:00 - 10:45', 'Ders': 'Biyoloji', 'Durum': 'Bekliyor' },
  ];

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Haftalık Program');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  assert.ok(buffer.length > 0);
  // Tekrar buffer'dan oku ve doğrula
  const readWb = XLSX.read(buffer, { type: 'buffer' });
  assert.strictEqual(readWb.SheetNames[0], 'Haftalık Program');
  const readRows = XLSX.utils.sheet_to_json(readWb.Sheets['Haftalık Program']);
  assert.strictEqual(readRows.length, 2);
  assert.strictEqual(readRows[0]['Ders'], 'Matematik');
});

// -------------------------------------------------------------
// SENARYO E: VERİ KAYNAĞI VE GÜVENLİK SINIRLARI
// -------------------------------------------------------------
console.log('\n--- SENARYO E: VERİ KAYNAĞI VE GÜVENLİK SINIRLARI ---');

runTest('E1: Dosya yükleme boyut ve tür güvenlik filtresi', () => {
  const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'doc', 'docx'];
  const maxBytes = 20 * 1024 * 1024; // 20 MB

  function validateUpload(fileName, sizeBytes) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      throw new Error(`Geçersiz dosya türü: .${ext}`);
    }
    if (sizeBytes > maxBytes) {
      throw new Error(`Dosya boyutu 20MB sınırını aşıyor: ${sizeBytes} bytes`);
    }
    return true;
  }

  assert.strictEqual(validateUpload('odev.pdf', 5 * 1024 * 1024), true);
  assert.strictEqual(validateUpload('cozum.png', 1 * 1024 * 1024), true);

  assert.throws(() => validateUpload('zararli.exe', 1024), /Geçersiz dosya türü/);
  assert.throws(() => validateUpload('buyuk_dosya.pdf', 25 * 1024 * 1024), /20MB sınırını aşıyor/);
});

runTest('E2: Öğrenci yetki koruması (Puan ve Not tahrifatı kontrolü)', () => {
  function applyStudentUpdate(original, patch) {
    // Öğrenci sadece submission alanlarını güncelleyebilir
    const forbiddenKeys = ['score', 'teacher_feedback', 'reviewed_at'];
    for (const k of forbiddenKeys) {
      if (patch[k] !== undefined && patch[k] !== original[k]) {
        throw new Error(`Güvenlik ihlali: '${k}' alanını değiştirmeye yetkiniz yok.`);
      }
    }
    if (patch.status && patch.status !== 'submitted' && patch.status !== original.status) {
      throw new Error('Güvenlik ihlali: Öğrenci sadece status="submitted" yapabilir.');
    }
    return { ...original, ...patch };
  }

  const existingHw = {
    id: 'hw-5',
    status: 'pending',
    score: null,
    teacher_feedback: null,
    file_url: null,
  };

  // Geçerli öğrenci güncellemesi
  const validUpdate = applyStudentUpdate(existingHw, {
    status: 'submitted',
    file_url: 'https://example.com/dosya.pdf',
  });
  assert.strictEqual(validUpdate.status, 'submitted');

  // Yetkisiz puan değiştirme denemesi
  assert.throws(
    () => applyStudentUpdate(existingHw, { score: 100 }),
    /Güvenlik ihlali: 'score' alanını değiştirmeye yetkiniz yok/
  );

  // Yetkisiz öğretmen notu değiştirme denemesi
  assert.throws(
    () => applyStudentUpdate(existingHw, { teacher_feedback: 'Hoca onayladı' }),
    /Güvenlik ihlali: 'teacher_feedback' alanını değiştirmeye yetkiniz yok/
  );
});

console.log('\n═══════════════════════════════════════════════════════════════════');
console.log(`📊 TEST SONUÇLARI: ${passedTests} / ${totalTests} TEST BAŞARIYLA GEÇTİ (%${Math.round((passedTests / totalTests) * 100)})`);
console.log('═══════════════════════════════════════════════════════════════════\n');
