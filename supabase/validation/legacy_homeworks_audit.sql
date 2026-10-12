-- ==============================================================================
-- DERSLY: ESKİ ÖDEV KAYITLARI GÜVENLİK VE GÖRÜNÜRLÜK DENETİMİ (READ-ONLY AUDIT)
-- ==============================================================================
-- Bu dosya veritabanında HİÇBİR DEĞİŞİKLİK YAPMAZ (Salt Okunur / Read-Only).
-- Amacı: Canlı migration 04 çalıştırılmadan önce ve sonra legacy verilerin durumunu tespit etmektir.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. GENEL ÖDEV DAĞILIMI VE EKSİK ALAN SAYILARI
-- ------------------------------------------------------------------------------
select 
    count(*) as toplam_odev_sayisi,
    count(*) filter (where lesson_id is null) as lesson_id_eksik_sayisi,
    count(*) filter (where teacher_id is null) as teacher_id_eksik_sayisi,
    count(*) filter (where teacher_id is null and lesson_id is not null) as migration04_tarafindan_kurtarilacak_sayi,
    count(*) filter (where teacher_id is null and lesson_id is null) as sahipsiz_kalacak_legacy_odev_sayisi
from public.homeworks;

-- ------------------------------------------------------------------------------
-- 2. SAHİPSİZ KALACAK ÖDEVLERİN ÖĞRENCİ VE ÖĞRETMEN BAĞLANTI DAĞILIMI
-- ------------------------------------------------------------------------------
-- Bir öğrencinin 'teacher_students' tablosunda kaç öğretmeni olduğunu tespit eder:
-- - 1 Öğretmeni varsa: Bu ödevin o öğretmene ait olma ihtimali çok yüksektir (Güvenli aday).
-- - >1 Öğretmeni varsa: Hangi öğretmene ait olduğu belirsizdir (Çakışma / Yanlış atama riski).
-- - 0 Öğretmeni varsa: Öğrencinin şu an atanmış öğretmeni yoktur.
with orphaned_homeworks as (
    select id, student_id, title, description, created_at
    from public.homeworks
    where teacher_id is null and lesson_id is null
),
student_teacher_counts as (
    select 
        oh.student_id,
        count(distinct ts.teacher_id) as bagli_ogretmen_sayisi,
        array_agg(distinct ts.teacher_id) as ogretmen_id_listesi
    from orphaned_homeworks oh
    left join public.teacher_students ts on ts.student_id = oh.student_id
    group by oh.student_id
)
select 
    stc.bagli_ogretmen_sayisi,
    count(oh.id) as etkilenen_odev_adedi,
    case 
        when stc.bagli_ogretmen_sayisi = 1 then 'DÜŞÜK RİSK: Öğrencinin tek bir öğretmeni var; güvenle o öğretmene bağlanabilir.'
        when stc.bagli_ogretmen_sayisi > 1 then 'YÜKSEK RİSK: Öğrencinin birden çok öğretmeni var; otomatik atama yanlış branş öğretmenine ödevi gösterebilir.'
        else 'İZOLASYON: Öğrencinin öğretmeni yok; ödev yalnızca öğrencinin kendi panelinde görünür kalır.'
    end as risk_degerlendirmesi
from orphaned_homeworks oh
join student_teacher_counts stc on stc.student_id = oh.student_id
group by stc.bagli_ogretmen_sayisi;

-- ------------------------------------------------------------------------------
-- 3. RLS GÖRÜNÜRLÜK ANALİZİ VE MEVCUT KOD ETKİSİ
-- ------------------------------------------------------------------------------
-- [ÖĞRENCİ AÇISINDAN GÖRÜNÜRLÜK]:
-- RLS Kuralı: USING (auth.uid() = student_id OR ...)
-- Sonuç: teacher_id ve lesson_id NULL olsa dahi öğrenci kendi ödevini görebilir, dosya yükleyebilir ve notlarını okuyabilir.
--
-- [ÖĞRETMEN AÇISINDAN GÖRÜNÜRLÜK]:
-- RLS Kuralı: USING (auth.uid() = teacher_id OR exists(select 1 from lessons where teacher_id = auth.uid()) OR exists(select 1 from classes where teacher_id = auth.uid()))
-- Sonuç: teacher_id, lesson_id ve class_id hepsi NULL olan eski ödevleri HİÇBİR ÖĞRETMEN GÖRÜNTÜLEYEMEZ, PUANLAYAMAZ VEYA GERİ BİLDİRİM VEREMEZ.

-- ------------------------------------------------------------------------------
-- 4. ÖNERİLEN GÜVENLİ İYİLEŞTİRME (VERİ KAYBI OLMADAN, KOŞULLU BACKFILL)
-- ------------------------------------------------------------------------------
-- ⚠️ NOT: Bu sorgu otomatik çalıştırılmamalıdır! Önce üstteki analiz sonuçları incelenmelidir.
--
-- Adım A: Yalnızca ve yalnızca sistemde TEK bir öğretmene bağlı olan öğrencilerin sahipsiz ödevlerini güvenle aktar:
/*
with single_teacher_students as (
    select student_id, min(teacher_id) as sole_teacher_id
    from public.teacher_students
    group by student_id
    having count(distinct teacher_id) = 1
)
update public.homeworks h
set teacher_id = sts.sole_teacher_id
from single_teacher_students sts
where h.student_id = sts.student_id
  and h.teacher_id is null
  and h.lesson_id is null;
*/
--
-- Adım B: Birden fazla öğretmeni olan öğrenciler için ödevler NULL bırakılarak öğretmen panellerinde çakışma önlenir.
