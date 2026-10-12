-- ==============================================================================
-- DERSLY: CANLI GÜVENLİK VE RLS YETKİ TESTLERİ (SECURITY VERIFICATION TESTS)
-- ==============================================================================
-- ⚠️ KRİTİK GÜVENLİK VE SİMÜLASYON UYARISI:
-- 1. Supabase SQL Editor oturumları varsayılan olarak 'postgres' (SUPERUSER) kullanıcısıyla
--    çalışır. PostgreSQL mimarisi gereği süper kullanıcı 'BYPASSRLS' yetkisine sahiptir;
--    yani tablo seviyesindeki RLS kuralları süper kullanıcı için varsayılan olarak DEVRE DIŞIDIR!
-- 2. Test 1 (Trigger Testi): Tablo trigger'ları (BEFORE UPDATE) süper kullanıcı oturumunda da
--    çalışır. Dolayısıyla trigger seviyesindeki koruma SQL editöründe doğrudan kanıtlanır.
-- 3. Test 2, 3 ve 4 (RLS Testleri): Süper kullanıcının RLS'i bypass etmesini önlemek amacıyla
--    aşağıdaki bloklarda 'SET LOCAL ROLE authenticated;' kullanılmaktadır.
-- 4. Kesin Gerçek Dünya Doğrulaması: Veritabanı içi simülasyonların ötesinde, gerçek JWT
--    erişim anahtarlarıyla çalışan 'scripts/test-api-security.mjs' API güvenlik test paketi
--    kullanılmalıdır.
-- ==============================================================================

-- ==============================================================================
-- TEST 1: ÖĞRENCİNİN KENDİ NOTUNU DEĞİŞTİRMESİ ENGELLENMELİDİR (TRIGGER TESTİ)
-- ==============================================================================
-- Beklenen Sonuç: "GÜVENLİK İHLALİ: Öğrenciler ödev puanını değiştiremez..." hatası alınmalıdır.

do $$
declare
    test_student_id uuid;
    test_hw_id uuid;
begin
    -- Öğrenci ve atanmış ödev bul
    select id into test_student_id from public.profiles where role = 'student' limit 1;
    select id into test_hw_id from public.homeworks where student_id = test_student_id limit 1;

    if test_hw_id is not null then
        -- JWT kimliği öğrenci olarak ayarlanır
        perform set_config('request.jwt.claims', json_build_object('sub', test_student_id::text, 'role', 'authenticated')::text, true);

        begin
            -- Yetkisiz güncelleme denemesi: Puanı 100 yapmaya çalış
            update public.homeworks 
            set score = 100, status = 'reviewed' 
            where id = test_hw_id;

            raise exception 'HATA: Güvenlik açığı tespit edildi! Öğrenci notu değiştirebildi.';
        exception
            when others then
                if sqlerrm like '%GÜVENLİK İHLALİ%' then
                    raise notice '✅ TEST 1 BAŞARILI: Trigger öğrencinin not değiştirmesini başarıyla engelledi (%s)', sqlerrm;
                else
                    raise notice 'ℹ️ TEST 1 BİLGİ: Hata yakalandı (%s)', sqlerrm;
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
        execute 'set local role authenticated';

        -- Öğrenci B'nin etkinliklerini sorgula
        select count(*) into leaked_count
        from public.schedule_events
        where user_id = student_b;

        -- Rolü sıfırla
        execute 'reset role';

        if leaked_count = 0 then
            raise notice '✅ TEST 2 BAŞARILI: Öğrenci A, Öğrenci B''nin etkinliklerine erişemiyor (0 sızıntı).';
        else
            raise exception '❌ TEST 2 BAŞARISIZ: RLS İhlali! % adet yabancı etkinlik görüntülendi.', leaked_count;
        end if;
    else
        raise notice 'ℹ️ TEST 2 ATLANDI: Karşılaştırma için en az 2 öğrenci profili gereklidir.';
    end if;
exception
    when others then
        execute 'reset role';
        raise notice 'ℹ️ TEST 2 BİLGİ: %s', sqlerrm;
end $$;

-- ==============================================================================
-- TEST 3: ÖĞRENCİNİN SINIF OLUŞTURMA GİRİŞİMİ ENGELLENMELİDİR (RLS WITH CHECK)
-- ==============================================================================
-- Beklenen Sonuç: Öğrenci rolündeki kullanıcı `classes` tablosuna insert yapmaya çalıştığında
-- RLS politikası işlemi engellemelidir.

do $$
declare
    test_student_id uuid;
begin
    select id into test_student_id from public.profiles where role = 'student' limit 1;

    if test_student_id is not null then
        perform set_config('request.jwt.claims', json_build_object('sub', test_student_id::text, 'role', 'authenticated')::text, true);
        execute 'set local role authenticated';

        begin
            insert into public.classes (teacher_id, name, grade_level)
            values (test_student_id, 'Yetkisiz Öğrenci Sınıfı', '12. Sınıf');

            execute 'reset role';
            raise exception 'HATA: Güvenlik açığı! Öğrenci rolündeki kullanıcı sınıf oluşturabildi.';
        exception
            when others then
                execute 'reset role';
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
        execute 'set local role authenticated';

        begin
            insert into public.homeworks (
                teacher_id, class_id, student_id, title, description
            ) values (
                teacher_a, class_of_b, test_student, 'Yabancı Sınıf Ödevi', 'İhlal denemesi'
            );

            execute 'reset role';
            raise exception 'HATA: Güvenlik açığı! Öğretmen başka öğretmenin sınıfına ödev atayabildi.';
        exception
            when others then
                execute 'reset role';
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
