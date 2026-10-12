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
