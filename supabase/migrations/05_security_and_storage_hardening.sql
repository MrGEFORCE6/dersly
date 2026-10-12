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
    select role into current_user_role from public.profiles where id = auth.uid();
    
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

        -- 4. Durum 'reviewed' veya 'revision_requested' yapılamaz (sadece öğretmen yapabilir)
        if new.status in ('reviewed', 'revision_requested') and new.status is distinct from old.status then
            raise exception 'GÜVENLİK İHLALİ: Öğrenciler ödev inceleme durumunu değiştiremez.';
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

-- Bucket'ları yoksa ekle
insert into storage.buckets (id, name, public)
values ('homework-files', 'homework-files', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

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
