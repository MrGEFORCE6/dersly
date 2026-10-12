-- ==============================================================================
-- DERSLY: MIGRATION SONRASI KAPSAMLI DOĞRULAMA SORGUSU (POST-MIGRATION ASSERT)
-- ==============================================================================
-- Bu sorguyu tüm migration'lar çalıştırıldıktan sonra Supabase SQL Editor'de
-- çalıştırın. Tüm kontrollerin 'BAŞARILI (PASS)' döndüğünden emin olun.

with verification_suite as (
    -- 1. Enum Check
    select 
        'ENUM: homework_status.revision_requested' as test_adi,
        count(*) > 0 as is_pass,
        'homework_status enumında revision_requested mevcut' as aciklama
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'homework_status' and e.enumlabel = 'revision_requested'

    union all

    -- 2. Classes Table Check
    select 
        'TABLO: public.classes' as test_adi,
        count(*) > 0 as is_pass,
        'classes tablosu mevcut ve RLS devrede' as aciklama
    from pg_tables 
    where schemaname = 'public' and tablename = 'classes' and rowsecurity = true

    union all

    -- 3. Class Students Table Check
    select 
        'TABLO: public.class_students' as test_adi,
        count(*) > 0 as is_pass,
        'class_students tablosu mevcut ve RLS devrede' as aciklama
    from pg_tables 
    where schemaname = 'public' and tablename = 'class_students' and rowsecurity = true

    union all

    -- 4. Schedule Events Table Check
    select 
        'TABLO: public.schedule_events' as test_adi,
        count(*) > 0 as is_pass,
        'schedule_events tablosu mevcut ve RLS devrede' as aciklama
    from pg_tables 
    where schemaname = 'public' and tablename = 'schedule_events' and rowsecurity = true

    union all

    -- 5. Homework Columns Count Check (En az 8 yeni kolon eklenmiş olmalı)
    select 
        'KOLONLAR: homeworks yeni alanları' as test_adi,
        count(*) = 8 as is_pass,
        'teacher_id, class_id, title, resource_url, estimated_minutes, submission_notes, score, teacher_feedback' as aciklama
    from information_schema.columns 
    where table_schema = 'public' 
      and table_name = 'homeworks' 
      and column_name in (
          'teacher_id', 'class_id', 'title', 'resource_url', 
          'estimated_minutes', 'submission_notes', 'score', 'teacher_feedback'
      )

    union all

    -- 6. Homework Security Trigger Check
    select 
        'GÜVENLİK: enforce_homework_update_permissions' as test_adi,
        count(*) > 0 as is_pass,
        'Öğrencinin not/puan değiştirmesini engelleyen trigger aktif' as aciklama
    from information_schema.triggers 
    where trigger_schema = 'public' 
      and event_object_table = 'homeworks'
      and trigger_name = 'enforce_homework_update_permissions'

    union all

    -- 7. Storage Buckets Check
    select 
        'STORAGE: homework-files ve avatars bucketları' as test_adi,
        count(*) = 2 as is_pass,
        'Her iki storage bucket da hazır' as aciklama
    from storage.buckets 
    where id in ('homework-files', 'avatars')

    union all

    -- 8. Storage Hardened RLS Policy Check
    select 
        'STORAGE: Uzantı denetimli yükleme politikası' as test_adi,
        count(*) > 0 as is_pass,
        'storage.objects üzerinde güvenli uzantı kontrolü devrede' as aciklama
    from pg_policies 
    where schemaname = 'storage' 
      and tablename = 'objects' 
      and policyname = 'Kullanıcılar güvenli dosya yükleyebilir'
)
select 
    test_adi,
    case when is_pass then '✅ BAŞARILI (PASS)' else '❌ BAŞARISIZ (FAIL)' end as sonuc,
    aciklama
from verification_suite;
