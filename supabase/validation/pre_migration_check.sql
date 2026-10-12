-- ==============================================================================
-- DERSLY: MIGRATION ÖNCESİ MEVCUT DURUM DENETİM SORGUSU (PRE-MIGRATION CHECK)
-- ==============================================================================
-- Bu sorguyu Supabase SQL Editor'de çalıştırarak canlı veritabanında hangi
-- tabloların, sütunların ve enum değerlerinin mevcut olduğunu kontrol edin.

select 
    '1. ENUM DEĞERİ (revision_requested)' as kontrol_alani,
    case when exists (
        select 1 from pg_enum e
        join pg_type t on t.oid = e.enumtypid
        where t.typname = 'homework_status' and e.enumlabel = 'revision_requested'
    ) then 'MEVCUT (HAZIR)' else 'EKSİK (01_safe_enums_and_extensions.sql GEREKLİ)' end as durum

union all

select 
    '2. TABLO: classes' as kontrol_alani,
    case when exists (
        select 1 from information_schema.tables 
        where table_schema = 'public' and table_name = 'classes'
    ) then 'MEVCUT (HAZIR)' else 'EKSİK (02_classes_and_class_students.sql GEREKLİ)' end as durum

union all

select 
    '3. TABLO: class_students' as kontrol_alani,
    case when exists (
        select 1 from information_schema.tables 
        where table_schema = 'public' and table_name = 'class_students'
    ) then 'MEVCUT (HAZIR)' else 'EKSİK (02_classes_and_class_students.sql GEREKLİ)' end as durum

union all

select 
    '4. TABLO: schedule_events' as kontrol_alani,
    case when exists (
        select 1 from information_schema.tables 
        where table_schema = 'public' and table_name = 'schedule_events'
    ) then 'MEVCUT (HAZIR)' else 'EKSİK (03_schedule_events.sql GEREKLİ)' end as durum

union all

select 
    '5. ÖDEV ALANI: homeworks.class_id' as kontrol_alani,
    case when exists (
        select 1 from information_schema.columns 
        where table_schema = 'public' and table_name = 'homeworks' and column_name = 'class_id'
    ) then 'MEVCUT (HAZIR)' else 'EKSİK (04_homeworks_patch.sql GEREKLİ)' end as durum

union all

select 
    '6. ÖDEV ALANI: homeworks.teacher_feedback' as kontrol_alani,
    case when exists (
        select 1 from information_schema.columns 
        where table_schema = 'public' and table_name = 'homeworks' and column_name = 'teacher_feedback'
    ) then 'MEVCUT (HAZIR)' else 'EKSİK (04_homeworks_patch.sql GEREKLİ)' end as durum

union all

select 
    '7. ÖDEV ALANI: homeworks.score' as kontrol_alani,
    case when exists (
        select 1 from information_schema.columns 
        where table_schema = 'public' and table_name = 'homeworks' and column_name = 'score'
    ) then 'MEVCUT (HAZIR)' else 'EKSİK (04_homeworks_patch.sql GEREKLİ)' end as durum

union all

select 
    '8. GÜVENLİK TRİGGERI: enforce_homework_update_permissions' as kontrol_alani,
    case when exists (
        select 1 from information_schema.triggers 
        where trigger_name = 'enforce_homework_update_permissions'
    ) then 'MEVCUT (HAZIR)' else 'EKSİK (05_security_and_storage_hardening.sql GEREKLİ)' end as durum

union all

select 
    '9. STORAGE BUCKET: homework-files' as kontrol_alani,
    case when exists (
        select 1 from storage.buckets where id = 'homework-files'
    ) then 'MEVCUT (HAZIR)' else 'EKSİK (05_security_and_storage_hardening.sql GEREKLİ)' end as durum;
