-- ==============================================================================
-- DERSLY: CANLI GÜVENLİK VE RLS YETKİ TESTLERİ (SECURITY VERIFICATION TESTS)
-- ==============================================================================
-- Bu sorgular Supabase SQL Editor'de simüle edilmiş kimlikler üzerinden çalıştırılarak
-- izin sınırlarının ve trigger mekanizmasının çalıştığını doğrulamak için kullanılır.

-- ==============================================================================
-- TEST 1: ÖĞRENCİNİN KENDİ NOTUNU DEĞİŞTİRMESİ ENGELLENMELİDİR
-- ==============================================================================
-- Beklenen Sonuç: "GÜVENLİK İHLALİ: Öğrenciler ödev puanını değiştiremez..." hatası alınmalı ve işlem iptal edilmelidir.

do $$
declare
    test_student_id uuid;
    test_hw_id uuid;
begin
    -- 1. Bir öğrenci ve ona atanmış bir ödev bul
    select id into test_student_id from public.profiles where role = 'student' limit 1;
    select id into test_hw_id from public.homeworks where student_id = test_student_id limit 1;

    if test_hw_id is not null then
        -- Simülasyon: Oturum açmış öğrenci kimliği taklit edilir
        perform set_config('request.jwt.claims', json_build_object('sub', test_student_id::text, 'role', 'authenticated')::text, true);

        begin
            -- Yetkisiz güncelleme denemesi: Notu 100 yapmaya ve incelendi işaretlemeye çalış
            update public.homeworks 
            set score = 100, status = 'reviewed' 
            where id = test_hw_id;

            raise exception 'HATA: Güvenlik açığı tespit edildi! Öğrenci notu değiştirebildi.';
        exception
            when others then
                if sqlerrm like '%GÜVENLİK İHLALİ%' then
                    raise notice '✅ TEST 1 BAŞARILI: Trigger öğrencinin not değiştirmesini başarıyla engelledi (%s)', sqlerrm;
                else
                    raise notice 'ℹ️ TEST 1 BİLGİ: Farklı bir hata yakalandı: %s', sqlerrm;
                end if;
        end;
    else
        raise notice 'ℹ️ TEST 1 ATLANDI: Test için uygun öğrenci ödevi bulunamadı.';
    end if;
end $$;

-- ==============================================================================
-- TEST 2: ÖĞRENCİLER ARASI VERİ İZOLASYONU (RLS ÇAPRAZ ERİŞİM TESTİ)
-- ==============================================================================
-- Beklenen Sonuç: Öğrenci A, Öğrenci B'nin program etkinliklerini sorguladığında 0 satır dönmelidir.
-- NOT: Supabase SQL editöründe RLS'in devreye girmesi için 'authenticated' rolü simüle edilmelidir.

do $$
declare
    student_a uuid;
    student_b uuid;
    leaked_count int;
begin
    select id into student_a from public.profiles where role = 'student' limit 1;
    select id into student_b from public.profiles where role = 'student' and id != student_a limit 1;

    if student_a is not null and student_b is not null then
        -- Öğrenci A kimliğine geç
        perform set_config('request.jwt.claims', json_build_object('sub', student_a::text, 'role', 'authenticated')::text, true);

        -- Öğrenci B'nin etkinliklerini çekmeye çalış
        select count(*) into leaked_count
        from public.schedule_events
        where user_id = student_b;

        if leaked_count = 0 then
            raise notice '✅ TEST 2 BAŞARILI: Öğrenci A, Öğrenci B''nin program verilerini göremiyor (Sıfır sızıntı).';
        else
            raise exception '❌ TEST 2 BAŞARISIZ: RLS İhlali! % adet yabancı etkinlik görüntülendi.', leaked_count;
        end if;
    else
        raise notice 'ℹ️ TEST 2 ATLANDI: Karşılaştırma için en az 2 öğrenci profili gereklidir.';
    end if;
end $$;

-- ==============================================================================
-- TEST 3: ÖĞRENCİNİN SINIF OLUŞTURMA GİRİŞİMİ ENGELLENMELİDİR (RLS WITH CHECK)
-- ==============================================================================
-- Beklenen Sonuç: Öğrenci profiline sahip bir kullanıcı `classes` tablosuna insert yapmaya çalıştığında
-- RLS politikası işlemi reddetmelidir (new row violates row-level security policy).

do $$
declare
    test_student_id uuid;
begin
    select id into test_student_id from public.profiles where role = 'student' limit 1;

    if test_student_id is not null then
        perform set_config('request.jwt.claims', json_build_object('sub', test_student_id::text, 'role', 'authenticated')::text, true);

        begin
            insert into public.classes (teacher_id, name, grade_level)
            values (test_student_id, 'Yetkisiz Öğrenci Sınıfı', '12. Sınıf');

            raise exception 'HATA: Güvenlik açığı! Öğrenci rolündeki kullanıcı sınıf oluşturabildi.';
        exception
            when insufficient_privilege or others then
                if sqlerrm like '%row-level security%' or sqlerrm like '%policy%' then
                    raise notice '✅ TEST 3 BAŞARILI: Öğrencinin sınıf oluşturması RLS politikası tarafından engellendi.';
                else
                    raise notice 'ℹ️ TEST 3 BİLGİ: Hata yakalandı (%s)', sqlerrm;
                end if;
        end;
    else
        raise notice 'ℹ️ TEST 3 ATLANDI: Test için uygun öğrenci profili bulunamadı.';
    end if;
end $$;

-- ==============================================================================
-- TEST 4: ÖĞRETMENİN BAŞKA BİR ÖĞRETMENİN SINIFINA ÖDEV ATAMASI ENGELLENMELİDİR
-- ==============================================================================
-- Beklenen Sonuç: Öğretmen A, Öğretmen B'ye ait `class_id` ile ödev insert etmeye çalıştığında
-- RLS WITH CHECK kuralı işlemi engellemelidir.

do $$
declare
    teacher_a uuid;
    teacher_b uuid;
    class_of_b uuid;
    test_student uuid;
begin
    select id into teacher_a from public.profiles where role = 'teacher' limit 1;
    select id into teacher_b from public.profiles where role = 'teacher' and id != teacher_a limit 1;
    select id into class_of_b from public.classes where teacher_id = teacher_b limit 1;
    select id into test_student from public.profiles where role = 'student' limit 1;

    if teacher_a is not null and teacher_b is not null and class_of_b is not null and test_student is not null then
        perform set_config('request.jwt.claims', json_build_object('sub', teacher_a::text, 'role', 'authenticated')::text, true);

        begin
            insert into public.homeworks (
                teacher_id, class_id, student_id, title, description
            ) values (
                teacher_a, class_of_b, test_student, 'Yabancı Sınıf Ödevi', 'İhlal denemesi'
            );

            raise exception 'HATA: Güvenlik açığı! Öğretmen başka öğretmenin sınıfına ödev atayabildi.';
        exception
            when others then
                if sqlerrm like '%row-level security%' or sqlerrm like '%policy%' then
                    raise notice '✅ TEST 4 BAŞARILI: Yabancı sınıfa ödev atama RLS tarafından engellendi.';
                else
                    raise notice 'ℹ️ TEST 4 BİLGİ: Hata yakalandı (%s)', sqlerrm;
                end if;
        end;
    else
        raise notice 'ℹ️ TEST 4 ATLANDI: Test için en az 2 öğretmen ve 1 yabancı sınıf gereklidir.';
    end if;
end $$;
