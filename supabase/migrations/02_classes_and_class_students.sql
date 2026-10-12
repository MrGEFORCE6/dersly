-- ==============================================================================
-- DERSLY MIGRATION 02: SINIF YÖNETİMİ (CLASSES & CLASS_STUDENTS)
-- ==============================================================================
-- Bu dosya öğretmen sınıfları ve öğrenci eşleşme altyapısını kurar.
-- DROP POLICY IF EXISTS ile çalıştığı için mükerrer çalıştırmada hata vermez.

-- 1. CLASSES Tablosu
create table if not exists public.classes (
    id uuid primary key default gen_random_uuid(),
    teacher_id uuid not null references public.profiles(id) on delete cascade,
    name text not null,
    grade_level text default '12. Sınıf',
    academic_year text default '2026-2027',
    description text,
    color text default 'indigo',
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

create index if not exists idx_classes_teacher_id on public.classes(teacher_id);

drop trigger if exists set_classes_updated_at on public.classes;
create trigger set_classes_updated_at
    before update on public.classes
    for each row
    execute function update_updated_at_column();

-- 2. CLASS_STUDENTS Tablosu
create table if not exists public.class_students (
    id uuid primary key default gen_random_uuid(),
    class_id uuid not null references public.classes(id) on delete cascade,
    student_id uuid not null references public.profiles(id) on delete cascade,
    enrolled_at timestamptz default now() not null,
    unique(class_id, student_id)
);

create index if not exists idx_class_students_class_id on public.class_students(class_id);
create index if not exists idx_class_students_student_id on public.class_students(student_id);

-- 3. RLS Güvenlik Politikaları (Classes)
alter table public.classes enable row level security;

drop policy if exists "Öğretmenler kendi sınıflarını yönetebilir" on public.classes;
create policy "Öğretmenler kendi sınıflarını yönetebilir"
    on public.classes for all
    to authenticated
    using (
        auth.uid() = teacher_id and
        exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
    )
    with check (
        auth.uid() = teacher_id and
        exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
    );

drop policy if exists "Öğrenciler kayıtlı oldukları sınıfları görebilir" on public.classes;
create policy "Öğrenciler kayıtlı oldukları sınıfları görebilir"
    on public.classes for select
    to authenticated
    using (
        exists (
            select 1 from public.class_students cs
            where cs.class_id = public.classes.id and cs.student_id = auth.uid()
        )
    );

-- 4. RLS Güvenlik Politikaları (Class Students)
alter table public.class_students enable row level security;

drop policy if exists "Öğretmenler sınıflarına öğrenci ekleyebilir ve yönetebilir" on public.class_students;
create policy "Öğretmenler sınıflarına öğrenci ekleyebilir ve yönetebilir"
    on public.class_students for all
    to authenticated
    using (
        exists (
            select 1 from public.classes c
            where c.id = public.class_students.class_id and c.teacher_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from public.classes c
            where c.id = public.class_students.class_id and c.teacher_id = auth.uid()
        )
    );

drop policy if exists "Öğrenciler kendi sınıf kayıtlarını görüntüleyebilir" on public.class_students;
create policy "Öğrenciler kendi sınıf kayıtlarını görüntüleyebilir"
    on public.class_students for select
    to authenticated
    using (auth.uid() = student_id);

