-- ==============================================================================
-- DERSLY: MIGRATION DOĞRULAMA SORGULARI VE GERİ ALMA PLANI (ROLLBACK PLAN)
-- ==============================================================================
-- Bu dosya canlı geçiş sırasında:
-- 1. Her migration öncesi ve sonrası çalıştırılacak doğrulama sorgularını,
-- 2. Bir sorun çıkması durumunda geriye dönüş (Rollback) SQL komutlarını içerir.
-- ==============================================================================

-- ==============================================================================
-- BÖLÜM 1: HER AŞAMA İÇİN DOĞRULAMA SORGULARI (VERIFICATION QUERIES)
-- ==============================================================================

-- 1. Migration 01 Doğrulaması (Enum & Extensions):
select 
    exists(select 1 from pg_extension where extname = 'uuid-ossp') as has_uuid_ossp,
    exists(select 1 from pg_enum where enumlabel = 'revision_requested') as has_revision_requested_enum;

-- 2. Migration 02 Doğrulaması (Classes & Class Students):
select 
    exists(select 1 from information_schema.tables where table_schema = 'public' and table_name = 'classes') as has_classes_table,
    exists(select 1 from information_schema.tables where table_schema = 'public' and table_name = 'class_students') as has_class_students_table,
    (select count(*) from pg_policies where schemaname = 'public' and tablename in ('classes', 'class_students')) as class_policy_count;

-- 3. Migration 03 Doğrulaması (Schedule Events):
select 
    exists(select 1 from information_schema.tables where table_schema = 'public' and table_name = 'schedule_events') as has_schedule_events,
    (select count(*) from pg_policies where schemaname = 'public' and tablename = 'schedule_events') as schedule_policy_count;

-- 4. Migration 04 Doğrulaması (Homeworks Enrichment & Backfill):
select 
    column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'homeworks'
  and column_name in ('teacher_id', 'class_id', 'title', 'resource_url', 'estimated_minutes', 'submission_notes', 'submitted_at', 'teacher_feedback', 'score', 'reviewed_at')
order by column_name;

-- 5. Migration 05 Doğrulaması (Security Trigger & Storage):
select 
    exists(select 1 from pg_trigger where tgname = 'enforce_homework_update_permissions') as has_tamper_trigger,
    (select count(*) from storage.buckets where id in ('homework-files', 'avatars')) as storage_bucket_count,
    (select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects') as storage_policy_count;


-- ==============================================================================
-- BÖLÜM 2: GERİ ALMA PLANI (REVERSE ROLLBACK PLAN)
-- ==============================================================================
-- ⚠️ UYARI: Rollback yalnızca beklenmeyen bir hata durumunda ve TERS SIRAYLA (05 -> 01) çalıştırılmalıdır.

-- ROLLBACK 05: Trigger ve Storage Politikalarını Kaldır
drop trigger if exists enforce_homework_update_permissions on public.homeworks;
drop function if exists public.check_homework_update_permissions();
drop policy if exists "Dosyalar herkese okunabilir" on storage.objects;
drop policy if exists "Kullanıcılar güvenli dosya yükleyebilir" on storage.objects;
drop policy if exists "Kullanıcılar kendi dosyalarını silebilir veya güncelleyebilir" on storage.objects;

-- ROLLBACK 04: Homeworks Ek Sütunları ve Politikaları Geri Al
-- ⚠️ UYARI: Eklenen sütunlar (teacher_id, title, score vb.) ve backfill verileri bilerek DROP edilmemiştir.
-- Sütunları DROP etmek bu süreçte girilen tüm ödev puan ve açıklamalarının KALICI KAYBINA yol açar.
drop policy if exists "İlgili öğrenci veya öğretmen görüntüleyebilir" on public.homeworks;
drop policy if exists "Öğretmenler ödev ekleyebilir" on public.homeworks;
drop policy if exists "Öğrenci veya öğretmen ödev güncelleyebilir" on public.homeworks;
drop policy if exists "Öğretmenler ödev silebilir" on public.homeworks;

-- 🛡️ KRİTİK GÜVENLİK ADIMI: Homeworks tablosunda RLS aktif olduğu için politikaların düşürülmesi
-- tablonun tüm kullanıcılara KAPANMASINA (Deny-All) neden olur. Eski şemadaki temel politikalar yeniden kurulmalıdır:
create policy "Öğrenciler kendi ödevlerini görüntüleyebilir"
    on public.homeworks for select to authenticated
    using (auth.uid() = student_id);

create policy "Öğretmenler ders ödevlerini yönetebilir"
    on public.homeworks for all to authenticated
    using (exists (select 1 from public.lessons l where l.id = public.homeworks.lesson_id and l.teacher_id = auth.uid()));

-- ROLLBACK 03: Schedule Events Tablosunu Kaldır
-- ⚠️ UYARI: Eğer canlı ortamda öğrenciler program oluşturduysa tabloyu silmek VERİ KAYBIDIR.
drop policy if exists "Kullanıcılar kendi program etkinliklerini yönetebilir" on public.schedule_events;
drop policy if exists "Öğretmenler bağlı öğrencilerinin programlarını görüntüleyebilir" on public.schedule_events;
-- drop table if exists public.schedule_events cascade; -- Yalnızca test ortamında veri yoksa açılabilir

-- ROLLBACK 02: Classes ve Class Students Tablolarını Kaldır
-- ⚠️ UYARI: Sınıf ve kayıt tablolarını silmek öğretmenlerin açtığı sınıfları ve öğrenci eşleşmelerini yok eder.
drop policy if exists "Öğretmenler kendi sınıflarını yönetebilir" on public.classes;
drop policy if exists "Öğrenciler kayıtlı oldukları sınıfları görebilir" on public.classes;
drop policy if exists "Öğretmenler sınıflarına öğrenci ekleyebilir ve yönetebilir" on public.class_students;
drop policy if exists "Öğrenciler kendi sınıf kayıtlarını görüntüleyebilir" on public.class_students;
-- drop table if exists public.class_students cascade; -- Yalnızca test ortamında veri yoksa açılabilir
-- drop table if exists public.classes cascade; -- Yalnızca test ortamında veri yoksa açılabilir

-- ROLLBACK 01: Geri Alınamayan İşlem (Irreversible Operation)
-- ⚠️ TEKNİK KISIT: PostgreSQL çekirdeğinde ENUM değerleri ("alter type ... drop value") silinemez.
-- 'revision_requested' değeri 'homework_status' enum tipinde kalacaktır. Bu durum mevcut eski verilere veya sisteme hiçbir zarar vermez.
