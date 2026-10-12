-- ==============================================================================
-- DERSLY MIGRATION 05: GÜVENLİK TRİGGER'I VE STORAGE SERTLEŞTİRMESİ
-- ==============================================================================
-- 1. Öğrencilerin Puan, Öğretmen Notu ve Durum Tahrifatını Önleyen Veritabanı Trigger'ı
-- 2. Supabase Storage bucket politikaları ve sunucu taraflı dosya güvenliği

-- -------------------------------------------------------------
-- 1. ÖDEV GÜVENLİK TRİGGER'I (TAMPER-PROOF EVALUATION)
-- -------------------------------------------------------------
create or replace function public.check_homework_update_permissions()
returns trigger as $$
declare
    current_user_role text;
begin
    -- İstek yapan kullanıcının rolünü profiller tablosundan al
    select role::text into current_user_role from public.profiles where id = auth.uid();
    
    -- Eğer istek yapan kullanıcı bir öğrenciyse veya ödevin sahibi olan öğrenciyse:
    if current_user_role = 'student' or auth.uid() = old.student_id then
        -- 1. Puan değiştirilemez
        if new.score is distinct from old.score then
            raise exception 'GÜVENLİK İHLALİ: Öğrenciler ödev puanını değiştiremez veya kendilerine not veremez.';
        end if;

        -- 2. Öğretmen değerlendirme notu değiştirilemez
        if new.teacher_feedback is distinct from old.teacher_feedback then
            raise exception 'GÜVENLİK İHLALİ: Öğrenciler öğretmen değerlendirme notunu değiştiremez.';
        end if;

        -- 3. İnceleme tarihi değiştirilemez
        if new.reviewed_at is distinct from old.reviewed_at then
            raise exception 'GÜVENLİK İHLALİ: Öğrenciler inceleme tarihini değiştiremez.';
        end if;

        -- 4. Öğretmen tarafından belirlenen alanlar (başlık, açıklama, son tarih, öğretmen, sınıf vb.) tahrif edilemez
        if new.student_id is distinct from old.student_id or
           new.teacher_id is distinct from old.teacher_id or
           new.class_id is distinct from old.class_id or
           new.lesson_id is distinct from old.lesson_id or
           new.title is distinct from old.title or
           new.description is distinct from old.description or
           new.due_date is distinct from old.due_date or
           new.resource_url is distinct from old.resource_url or
           new.estimated_minutes is distinct from old.estimated_minutes then
            raise exception 'GÜVENLİK İHLALİ: Öğrenciler ödevin öğretmen tanımlı alanlarını (başlık, açıklama, teslim tarihi, sınıf vb.) değiştiremez.';
        end if;

        -- 5. Öğrenci durumu sadece 'submitted' yapabilir; 'reviewed' veya 'revision_requested' yapamaz
        if new.status in ('reviewed', 'revision_requested') and new.status is distinct from old.status then
            raise exception 'GÜVENLİK İHLALİ: Öğrenciler ödev inceleme durumunu değiştiremez.';
        end if;

        -- 6. Eğer ödev zaten incelenip onaylanmışsa (status = 'reviewed'),
        -- öğretmen düzeltme istemediği sürece (revision_requested) öğrenci teslimi değiştiremez
        if old.status = 'reviewed' and (new.status is distinct from old.status or new.file_url is distinct from old.file_url or new.submission_notes is distinct from old.submission_notes) then
            raise exception 'GÜVENLİK İHLALİ: Değerlendirilmiş ödevler üzerinde öğrenci tarafından değişiklik yapılamaz.';
        end if;
    end if;

    return new;
end;
$$ language plpgsql security definer;

-- Trigger'ı güvenle ekle
drop trigger if exists enforce_homework_update_permissions on public.homeworks;
create trigger enforce_homework_update_permissions
    before update on public.homeworks
    for each row
    execute function public.check_homework_update_permissions();

-- -------------------------------------------------------------
-- 2. SUPABASE STORAGE BUCKETLARI VE STORAGE RLS
-- -------------------------------------------------------------

-- Bucket'ları yoksa ekle (Dosya boyutu ve MIME tipi sınırlamaları ile)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'homework-files', 
    'homework-files', 
    true, 
    20971520, -- 20 MB
    array[
        'application/pdf', 
        'image/png', 
        'image/jpeg', 
        'image/webp', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
)
on conflict (id) do update set 
    public = true,
    file_size_limit = 20971520,
    allowed_mime_types = array[
        'application/pdf', 
        'image/png', 
        'image/jpeg', 
        'image/webp', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'avatars', 
    'avatars', 
    true, 
    5242880, -- 5 MB
    array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set 
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp'];

-- Storage RLS: Okuma (Public)
drop policy if exists "Dosyalar herkese okunabilir" on storage.objects;
create policy "Dosyalar herkese okunabilir"
    on storage.objects for select
    using (bucket_id in ('homework-files', 'avatars'));

-- Storage RLS: Yükleme (Authenticated kullanıcılar ve uzantı denetimi)
drop policy if exists "Kullanıcılar güvenli dosya yükleyebilir" on storage.objects;
create policy "Kullanıcılar güvenli dosya yükleyebilir"
    on storage.objects for insert
    to authenticated
    with check (
        bucket_id in ('homework-files', 'avatars')
        and (
            -- homework-files için sadece güvenli doküman ve görsel uzantıları
            (bucket_id = 'homework-files' and lower(storage.extension(name)) in ('pdf', 'png', 'jpg', 'jpeg', 'webp', 'doc', 'docx'))
            or
            -- avatars için sadece görsel uzantıları
            (bucket_id = 'avatars' and lower(storage.extension(name)) in ('png', 'jpg', 'jpeg', 'webp'))
        )
    );

-- Storage RLS: Güncelleme ve Silme (Kendi yüklediği dosyalar)
drop policy if exists "Kullanıcılar kendi dosyalarını silebilir veya güncelleyebilir" on storage.objects;
create policy "Kullanıcılar kendi dosyalarını silebilir veya güncelleyebilir"
    on storage.objects for all
    to authenticated
    using (bucket_id in ('homework-files', 'avatars') and auth.uid() = owner);
