-- ==============================================================================
-- DERSLY MIGRATION 04: ÖDEV MODÜLÜ GÜNCELLEMESİ (HOMEWORKS ENRICHMENT)
-- ==============================================================================
-- Bu migration, mevcut homeworks tablosundaki hiçbir veriyi silmeden (non-destructive)
-- Aşama 3 gereksinimleri olan sınıf ödevi, kaynak linki, puan ve geri bildirim alanlarını ekler.

-- 1. Tablo yoksa oluştur, varsa sütunları ekle
create table if not exists public.homeworks (
    id uuid primary key default gen_random_uuid(),
    lesson_id uuid references public.lessons(id) on delete set null,
    student_id uuid not null references public.profiles(id) on delete cascade,
    description text not null,
    due_date timestamptz,
    status homework_status not null default 'pending',
    file_url text,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- 2. Yeni Sütunların Güvenle Eklenmesi (ADD COLUMN IF NOT EXISTS)
alter table public.homeworks add column if not exists teacher_id uuid references public.profiles(id) on delete cascade;
alter table public.homeworks add column if not exists class_id uuid references public.classes(id) on delete set null;
alter table public.homeworks add column if not exists title text;
alter table public.homeworks add column if not exists resource_url text;
alter table public.homeworks add column if not exists estimated_minutes int default 45;
alter table public.homeworks add column if not exists submission_notes text;
alter table public.homeworks add column if not exists submitted_at timestamptz;
alter table public.homeworks add column if not exists teacher_feedback text;
alter table public.homeworks add column if not exists score int;
alter table public.homeworks add column if not exists reviewed_at timestamptz;

-- 3. İndeksler
create index if not exists idx_homeworks_lesson_id on public.homeworks(lesson_id);
create index if not exists idx_homeworks_student_id on public.homeworks(student_id);
create index if not exists idx_homeworks_teacher_id on public.homeworks(teacher_id);
create index if not exists idx_homeworks_class_id on public.homeworks(class_id);
create index if not exists idx_homeworks_status on public.homeworks(status);

drop trigger if exists set_homeworks_updated_at on public.homeworks;
create trigger set_homeworks_updated_at
    before update on public.homeworks
    for each row
    execute function update_updated_at_column();

-- 4. RLS Güvenlik Politikaları Güncellemesi
alter table public.homeworks enable row level security;

-- SELECT Politikası (Öğrenci veya İlgili Öğretmen)
drop policy if exists "İlgili öğrenci veya öğretmen görüntüleyebilir" on public.homeworks;
create policy "İlgili öğrenci veya öğretmen görüntüleyebilir"
    on public.homeworks for select
    to authenticated
    using (
        auth.uid() = student_id or 
        auth.uid() = teacher_id or
        exists (
            select 1 from public.lessons l 
            where l.id = public.homeworks.lesson_id and l.teacher_id = auth.uid()
        ) or
        exists (
            select 1 from public.classes c
            where c.id = public.homeworks.class_id and c.teacher_id = auth.uid()
        )
    );

-- INSERT Politikası (Öğretmenler)
drop policy if exists "Öğretmenler ödev ekleyebilir" on public.homeworks;
create policy "Öğretmenler ödev ekleyebilir"
    on public.homeworks for insert
    to authenticated
    with check (
        auth.uid() = teacher_id or
        exists (
            select 1 from public.lessons l 
            where l.id = public.homeworks.lesson_id and l.teacher_id = auth.uid()
        ) or exists (
            select 1 from public.classes c
            where c.id = public.homeworks.class_id and c.teacher_id = auth.uid()
        ) or exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'teacher'
        )
    );

-- UPDATE Politikası (Öğrenci Teslim veya Öğretmen Değerlendirme)
drop policy if exists "Öğrenci veya öğretmen ödev güncelleyebilir" on public.homeworks;
create policy "Öğrenci veya öğretmen ödev güncelleyebilir"
    on public.homeworks for update
    to authenticated
    using (
        auth.uid() = student_id or 
        auth.uid() = teacher_id or
        exists (
            select 1 from public.lessons l 
            where l.id = public.homeworks.lesson_id and l.teacher_id = auth.uid()
        ) or
        exists (
            select 1 from public.classes c
            where c.id = public.homeworks.class_id and c.teacher_id = auth.uid()
        )
    );

-- DELETE Politikası (Ödevi Veren Öğretmen)
drop policy if exists "Öğretmenler ödev silebilir" on public.homeworks;
create policy "Öğretmenler ödev silebilir"
    on public.homeworks for delete
    to authenticated
    using (
        auth.uid() = teacher_id or
        exists (
            select 1 from public.lessons l 
            where l.id = public.homeworks.lesson_id and l.teacher_id = auth.uid()
        ) or
        exists (
            select 1 from public.classes c
            where c.id = public.homeworks.class_id and c.teacher_id = auth.uid()
        )
    );
