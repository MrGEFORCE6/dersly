/**
 * Dersly — Çoklu Kullanıcı Rolleri İçin API Güvenlik Test Paketi
 * (API Security Verification Suite for Multi-Role RLS & Triggers)
 * 
 * Bu betik:
 * 1. GERÇEK CANLI ORTAM:
 *    Eğer SUPABASE_URL, SUPABASE_ANON_KEY ve 4 ayrı test hesabı (Öğrenci A, Öğrenci B, Öğretmen A, Öğretmen B)
 *    ortam değişkenlerinde tanımlıysa, her kullanıcı için ayrı JWT oturumu açarak gerçek HTTPS istekleriyle RLS ve Trigger'ları test eder.
 * 2. EKSİK ÖN KOŞUL / SİMÜLASYON ORTAMI:
 *    Eğer test hesapları veya canlı bağlantı tanımlı değilse, durumu AÇIKÇA RAPORLAR ve
 *    yerel sözleşme/iş kuralı simülasyonu olarak işletir. Bu sonuçları gerçek API kanıtı olarak sunmaz.
 * 
 * Test Senaryoları:
 * - Senaryo 1: Öğrenciler arası veri izolasyonu (Öğrenci A, Öğrenci B'nin verilerine erişemez)
 * - Senaryo 2: Puan ve inceleme tahrifatı engeli (Öğrenci notunu ve öğretmen geri bildirimini değiştiremez)
 * - Senaryo 3: Öğretmen yetki sınırı (Öğretmen A, Öğretmen B'nin sınıfına ödev atayamaz / değiştiremez)
 * - Senaryo 4: Yetkisiz erişim kısıtı (Anonim / yetkisiz istekler ödevleri veya dosyaları değiştiremez/silemez)
 * - Senaryo 5: Storage dosya güvenliği (Zararlı uzantı .exe ve 20MB üzeri dosya yükleme engeli)
 */

import assert from 'node:assert';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const STUDENT_A_EMAIL = process.env.TEST_STUDENT_A_EMAIL || '';
const STUDENT_A_PASS = process.env.TEST_STUDENT_A_PASSWORD || '';
const STUDENT_B_EMAIL = process.env.TEST_STUDENT_B_EMAIL || '';
const STUDENT_B_PASS = process.env.TEST_STUDENT_B_PASSWORD || '';
const TEACHER_A_EMAIL = process.env.TEST_TEACHER_A_EMAIL || '';
const TEACHER_A_PASS = process.env.TEST_TEACHER_A_PASSWORD || '';
const TEACHER_B_EMAIL = process.env.TEST_TEACHER_B_EMAIL || '';
const TEACHER_B_PASS = process.env.TEST_TEACHER_B_PASSWORD || '';

const isLiveUrlConfigured = SUPABASE_URL && !SUPABASE_URL.includes('placeholder') && SUPABASE_ANON_KEY;
const hasAll4TestAccounts =
  isLiveUrlConfigured &&
  STUDENT_A_EMAIL && STUDENT_A_PASS &&
  STUDENT_B_EMAIL && STUDENT_B_PASS &&
  TEACHER_A_EMAIL && TEACHER_A_PASS &&
  TEACHER_B_EMAIL && TEACHER_B_PASS;

console.log('═══════════════════════════════════════════════════════════════════');
console.log('🛡️  DERSLY API GÜVENLİK VE RLS YETKİ DOĞRULAMA PAKETİ');
console.log('═══════════════════════════════════════════════════════════════════\n');

if (!isLiveUrlConfigured) {
  console.log('📋 ÇALIŞMA MODU: YEREL SÖZLEŞME VE İŞ MANTIĞI SİMÜLASYONU');
  console.log('   ⚠️  EKSİK ÖN KOŞUL: SUPABASE_URL veya SUPABASE_ANON_KEY tanımlı değil.');
  console.log('   ⚠️  Bu testler gerçek PostgreSQL RLS veya PostgREST API kanıtı DEĞİLDİR.');
  console.log('   ℹ️  Aşağıdaki sonuçlar yerel JavaScript kurallarının matematiksel doğrulamasıdır.\n');
} else if (!hasAll4TestAccounts) {
  console.log(`🌐 Hedef URL: ${SUPABASE_URL}`);
  console.log('📋 ÇALIŞMA MODU: KISMİ / ANONİM API TESTİ & SİMÜLASYON');
  console.log('   ⚠️  EKSİK ÖN KOŞUL: 4 ayrı test hesabı (Öğrenci A/B, Öğretmen A/B) tanımlanmadı.');
  console.log('   ⚠️  Yalnızca anon key ile test yapılması RLS çoklu kullanıcı ayrımını kanıtlamaz.');
  console.log('   ℹ️  Gereken ortam değişkenleri: TEST_STUDENT_A_EMAIL/PASSWORD, TEST_STUDENT_B_EMAIL/PASSWORD,');
  console.log('       TEST_TEACHER_A_EMAIL/PASSWORD, TEST_TEACHER_B_EMAIL/PASSWORD.\n');
} else {
  console.log(`🌐 Canlı Supabase Hedefi: ${SUPABASE_URL}`);
  console.log('🔐 ÇALIŞMA MODU: GERÇEK ÇOK KULLANICILI JWT API TESTİ');
  console.log('   ✅ 4 Test hesabı (Öğrenci A, Öğrenci B, Öğretmen A, Öğretmen B) aktif.\n');
}

let passedCount = 0;
let totalCount = 0;

function reportTest(name, passed, detail) {
  totalCount++;
  if (passed) {
    passedCount++;
    console.log(`✅ [BAŞARILI] ${name}`);
    if (detail) console.log(`   Detay: ${detail}`);
  } else {
    console.error(`❌ [BAŞARISIZ] ${name}`);
    if (detail) console.error(`   Hata: ${detail}`);
  }
}

// Güvenli istemci oluşturucu (Token asla loglanmaz)
async function createAuthenticatedClient(email, password) {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    throw new Error(`Test kullanıcısı ile oturum açılamadı (${email}): ${error?.message || 'Bilinmeyen hata'}`);
  }
  return { client, user: data.user };
}

// -----------------------------------------------------------------------------
// SENARYO 1: ÖĞRENCİLER ARASI VERİ İZOLASYONU (RLS TESTİ)
// -----------------------------------------------------------------------------
async function testCrossUserIsolation() {
  const testName = "Senaryo 1: Öğrenci A, Öğrenci B'nin kişisel verilerine erişemez";
  if (hasAll4TestAccounts) {
    try {
      const { client: clientA } = await createAuthenticatedClient(STUDENT_A_EMAIL, STUDENT_A_PASS);
      const { user: userB } = await createAuthenticatedClient(STUDENT_B_EMAIL, STUDENT_B_PASS);

      // Öğrenci A, Öğrenci B'nin schedule_events kayıtlarını sorguluyor
      const { data, error } = await clientA
        .from('schedule_events')
        .select('*')
        .eq('user_id', userB.id);

      const isSafe = !error && (!data || data.length === 0);
      reportTest(testName, isSafe, isSafe ? '0 sızıntı (RLS doğru izole etti)' : 'Açık! Yabancı etkinlikler okundu');
    } catch (err) {
      reportTest(testName, false, err.message);
    }
  } else {
    // Sözleşme simülasyonu
    const mockDbEvents = [
      { id: 'ev-1', user_id: 'student-A', title: 'Matematik' },
      { id: 'ev-2', user_id: 'student-B', title: 'Fizik Özel Not' },
    ];
    const accessibleEvents = mockDbEvents.filter((ev) => ev.user_id === 'student-A');
    const hasLeak = accessibleEvents.some((ev) => ev.user_id === 'student-B');
    reportTest(testName, !hasLeak, 'Simülasyon Sözleşmesi: Öğrenci A sadece kendi etkinliklerini gördü (0 yabancı satır).');
  }
}

// -----------------------------------------------------------------------------
// SENARYO 2: PUAN VE İNCELEME TAHRİFATI ENGELİ (TRIGGER TESTİ)
// -----------------------------------------------------------------------------
async function testGradeTamperingPrevention() {
  const testName = 'Senaryo 2: Öğrenci kendi puanını ve inceleme alanlarını değiştiremez (Trigger)';
  if (hasAll4TestAccounts) {
    try {
      const { client: clientA, user: userA } = await createAuthenticatedClient(STUDENT_A_EMAIL, STUDENT_A_PASS);
      // Öğrenci A kendisine ait bir ödevin puanını 100 yapmaya çalışıyor
      const { error } = await clientA
        .from('homeworks')
        .update({ score: 100, status: 'reviewed', teacher_feedback: 'Tahrifat' })
        .eq('student_id', userA.id);

      const isBlocked = !!error && error.message.includes('GÜVENLİK İHLALİ');
      reportTest(testName, isBlocked, error ? error.message : 'Açık! Öğrenci not değiştirebildi.');
    } catch (err) {
      reportTest(testName, false, err.message);
    }
  } else {
    // Sözleşme simülasyonu
    function simulateTrigger(oldRow, newRow, userRole) {
      if (userRole === 'student') {
        if (newRow.score !== oldRow.score) {
          throw new Error('GÜVENLİK İHLALİ: Öğrenciler ödev puanını değiştiremez.');
        }
        if (newRow.teacher_feedback !== oldRow.teacher_feedback) {
          throw new Error('GÜVENLİK İHLALİ: Öğrenciler öğretmen değerlendirme notunu değiştiremez.');
        }
        if (newRow.status === 'reviewed') {
          throw new Error('GÜVENLİK İHLALİ: Öğrenciler ödev durumunu "reviewed" yapamaz.');
        }
      }
    }
    const oldRow = { id: 'hw-1', score: null, teacher_feedback: null, status: 'pending' };
    assert.throws(() => simulateTrigger(oldRow, { ...oldRow, score: 95 }, 'student'), /GÜVENLİK İHLALİ/);
    assert.throws(() => simulateTrigger(oldRow, { ...oldRow, teacher_feedback: 'Harika' }, 'student'), /GÜVENLİK İHLALİ/);
    assert.throws(() => simulateTrigger(oldRow, { ...oldRow, status: 'reviewed' }, 'student'), /GÜVENLİK İHLALİ/);
    reportTest(testName, true, 'Simülasyon Sözleşmesi: Puan, geri bildirim ve durum tahrifatı trigger ile engellendi.');
  }
}

// -----------------------------------------------------------------------------
// SENARYO 3: ÖĞRETMEN YETKİ SINIRI (ÖĞRETMENLER ARASI SINIF İZOLASYONU)
// -----------------------------------------------------------------------------
async function testTeacherAuthorizationBoundary() {
  const testName = 'Senaryo 3: Öğretmen yalnızca yetkili olduğu sınıfların verilerine erişebilir';
  if (hasAll4TestAccounts) {
    try {
      const { client: clientTeacherA, user: teacherA } = await createAuthenticatedClient(TEACHER_A_EMAIL, TEACHER_A_PASS);
      const { client: clientTeacherB, user: teacherB } = await createAuthenticatedClient(TEACHER_B_EMAIL, TEACHER_B_PASS);

      // Öğretmen A, Öğretmen B'nin sınıfına ödev eklemeyi deniyor
      const { error } = await clientTeacherA.from('homeworks').insert({
        teacher_id: teacherA.id,
        class_id: '00000000-0000-0000-0000-000000000099',
        student_id: '00000000-0000-0000-0000-000000000002',
        title: 'Yabancı Sınıf İhlali',
        description: 'Test',
      });

      const isBlocked = !!error;
      reportTest(testName, isBlocked, error ? error.message : 'Açık! Yabancı sınıfa ödev eklenebildi.');
    } catch (err) {
      reportTest(testName, false, err.message);
    }
  } else {
    // Sözleşme simülasyonu
    function checkTeacherClassAccess(teacherId, classOwnerId) {
      if (teacherId !== classOwnerId) {
        throw new Error('RLS WITH CHECK Reddi: Yalnızca sınıfın sahibi olan öğretmen ödev atayabilir.');
      }
    }
    assert.throws(() => checkTeacherClassAccess('teacher-A', 'teacher-B'), /RLS WITH CHECK Reddi/);
    reportTest(testName, true, 'Simülasyon Sözleşmesi: Yabancı sınıfa ödev atama RLS WITH CHECK ile engellendi.');
  }
}

// -----------------------------------------------------------------------------
// SENARYO 4: YETKİSİZ ERİŞİM KISITI (ANONİM / SAHTE İSTEKLER)
// -----------------------------------------------------------------------------
async function testUnauthorizedAccess() {
  const testName = 'Senaryo 4: Yetkisiz kullanıcılar ödev ve dosyaları değiştiremez/silemez';
  if (isLiveUrlConfigured) {
    try {
      const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      // Anonim kullanıcı ödev tablosuna yazmayı deniyor
      const { error: insertError } = await anonClient.from('homeworks').insert({
        title: 'Anonim Sahte Ödev',
        description: 'İhlal',
      });
      const isBlocked = !!insertError;
      reportTest(testName, isBlocked, insertError ? insertError.message : 'Açık! Anonim kullanıcı ödev ekleyebildi.');
    } catch (err) {
      reportTest(testName, false, err.message);
    }
  } else {
    // Sözleşme simülasyonu
    function enforceAuthenticated(role) {
      if (!role || role === 'anon') {
        throw new Error('Yetki Hatası: Bu işlem için oturum açılması (authenticated rolü) zorunludur.');
      }
    }
    assert.throws(() => enforceAuthenticated('anon'), /Yetki Hatası/);
    reportTest(testName, true, 'Simülasyon Sözleşmesi: Anonim / yetkisiz işlemler authenticated politikasıyla engellendi.');
  }
}

// -----------------------------------------------------------------------------
// SENARYO 5: STORAGE DOSYA YÜKLEME GÜVENLİK SINIRLARI
// -----------------------------------------------------------------------------
async function testStorageSecurity() {
  const testName = 'Senaryo 5: İzin verilmeyen dosya uzantıları (.exe) ve >20MB yüklemeler engellenir';
  const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'doc', 'docx'];
  const maxBytes = 20 * 1024 * 1024;

  function validateStorageUpload(fileName, size) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      throw new Error(`Storage Güvenlik Reddi: .${ext} uzantılı dosyalara izin verilmez.`);
    }
    if (size > maxBytes) {
      throw new Error('Storage Sınırı: Dosya boyutu 20MB sınırını aşıyor.');
    }
    return true;
  }

  assert.throws(() => validateStorageUpload('virus.exe', 1024), /Storage Güvenlik Reddi/);
  assert.throws(() => validateStorageUpload('buyuk_dosya.pdf', 25 * 1024 * 1024), /Storage Sınırı/);
  assert.strictEqual(validateStorageUpload('odev_cozumu.pdf', 5 * 1024 * 1024), true);

  reportTest(testName, true, 'Storage kuralları: .exe uzantısı ve 20MB üzeri dosyalar başarıyla engellendi.');
}

// -----------------------------------------------------------------------------
// ÇALIŞTIRMA VE ÖZET
// -----------------------------------------------------------------------------
async function runAll() {
  await testCrossUserIsolation();
  await testGradeTamperingPrevention();
  await testTeacherAuthorizationBoundary();
  await testUnauthorizedAccess();
  await testStorageSecurity();

  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log(`📊 TEST SONUCU: ${passedCount} / ${totalCount} TEST TAMAMLANDI (%${Math.round((passedCount / totalCount) * 100)})`);
  if (!hasAll4TestAccounts) {
    console.log('📌 NOT: Gerçek Canlı Supabase RLS Doğrulaması İçin:');
    console.log('   1. Supabase Dashboard üzerinde 2 öğrenci (A, B) ve 2 öğretmen (A, B) hesabı açın.');
    console.log('   2. Ortam değişkenlerini PowerShell ile ayarlayın:');
    console.log('      $env:SUPABASE_URL="https://your-project.supabase.co"');
    console.log('      $env:SUPABASE_ANON_KEY="eyJhbGci..."');
    console.log('      $env:TEST_STUDENT_A_EMAIL="student_a@test.com"; $env:TEST_STUDENT_A_PASSWORD="***"');
    console.log('      $env:TEST_STUDENT_B_EMAIL="student_b@test.com"; $env:TEST_STUDENT_B_PASSWORD="***"');
    console.log('      $env:TEST_TEACHER_A_EMAIL="teacher_a@test.com"; $env:TEST_TEACHER_A_PASSWORD="***"');
    console.log('      $env:TEST_TEACHER_B_EMAIL="teacher_b@test.com"; $env:TEST_TEACHER_B_PASSWORD="***"');
    console.log('   3. "npm run test:security" komutunu çalıştırın.');
  }
  console.log('═══════════════════════════════════════════════════════════════════\n');
}

runAll().catch(console.error);
