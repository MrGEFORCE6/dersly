-- ==============================================================================
-- DERS POMPA - SUPABASE POSTGRESQL VERİTABANI ŞEMASI (schema.sql)
-- ==============================================================================

-- 1. Gerekli Eklentiler (Extensions)
create extension if not exists "uuid-ossp";

-- 2. Özel Tipler / ENUM Tanımlamaları
do $$ begin
    create type user_role as enum ('teacher', 'student', 'parent');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type lesson_status as enum ('scheduled', 'completed', 'cancelled');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type homework_status as enum ('pending', 'submitted', 'reviewed', 'revision_requested');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type payment_status as enum ('pending', 'partially_paid', 'completed', 'cancelled');
exception
    when duplicate_object then null;
end $$;

-- 3. Otomatik Updated_at Güncelleme Fonksiyonu
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- ==============================================================================
-- TABLOLAR
-- ==============================================================================

-- 1. PROFILES (Kullanıcı Profilleri, Instagram Tarzı Sosyal ve Net İstatistikleri)
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null,
    username text unique,
    bio text,
    role user_role not null default 'student',
    phone text,
    avatar_url text,
    exam_stats jsonb default '{
        "tyt_net": 85.5,
        "ayt_net": 68.25,
        "weekly_question_target": 750,
        "weekly_questions_solved": 540,
        "latest_trial_rank": "12/180"
    }'::jsonb,
    privacy_settings jsonb default '{
        "stats_visibility": "public"
    }'::jsonb,
    theme_preference jsonb default '{
        "mode": "dark",
        "accent": "indigo"
    }'::jsonb,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

create index if not exists idx_profiles_username on public.profiles(username);
create index if not exists idx_profiles_role on public.profiles(role);

-- Profiles Updated_at Tetikleyicisi
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
    before update on public.profiles
    for each row
    execute function update_updated_at_column();

-- 2. LESSONS (Dersler / Randevular)
create table if not exists public.lessons (
    id uuid primary key default gen_random_uuid(),
    teacher_id uuid not null references public.profiles(id) on delete cascade,
    student_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    start_time timestamptz not null,
    end_time timestamptz not null,
    status lesson_status not null default 'scheduled',
    notes text,
    required_book text,
    reschedule_request jsonb,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    
    constraint check_lesson_times check (end_time > start_time)
);

create index if not exists idx_lessons_teacher_id on public.lessons(teacher_id);
create index if not exists idx_lessons_student_id on public.lessons(student_id);
create index if not exists idx_lessons_start_time on public.lessons(start_time);
create index if not exists idx_lessons_status on public.lessons(status);

-- Lessons Updated_at Tetikleyicisi
drop trigger if exists set_lessons_updated_at on public.lessons;
create trigger set_lessons_updated_at
    before update on public.lessons
    for each row
    execute function update_updated_at_column();

-- 3. HOMEWORKS (Gelişmiş Ödevler ve Materyal Takibi)
create table if not exists public.homeworks (
    id uuid primary key default gen_random_uuid(),
    lesson_id uuid references public.lessons(id) on delete set null,
    student_id uuid not null references public.profiles(id) on delete cascade,
    teacher_id uuid references public.profiles(id) on delete cascade,
    class_id uuid references public.classes(id) on delete set null,
    title text,
    description text not null,
    due_date timestamptz,
    status homework_status not null default 'pending',
    file_url text,
    resource_url text,
    estimated_minutes int default 45,
    submission_notes text,
    submitted_at timestamptz,
    teacher_feedback text,
    score int,
    reviewed_at timestamptz,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

create index if not exists idx_homeworks_lesson_id on public.homeworks(lesson_id);
create index if not exists idx_homeworks_student_id on public.homeworks(student_id);
create index if not exists idx_homeworks_teacher_id on public.homeworks(teacher_id);
create index if not exists idx_homeworks_class_id on public.homeworks(class_id);
create index if not exists idx_homeworks_status on public.homeworks(status);


-- Homeworks Updated_at Tetikleyicisi
drop trigger if exists set_homeworks_updated_at on public.homeworks;
create trigger set_homeworks_updated_at
    before update on public.homeworks
    for each row
    execute function update_updated_at_column();

-- 4. PAYMENTS (Ödemeler & Ders Paketleri)
create table if not exists public.payments (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references public.profiles(id) on delete cascade,
    teacher_id uuid not null references public.profiles(id) on delete cascade,
    package_hours numeric(6, 2) not null check (package_hours > 0),
    total_amount numeric(10, 2) not null check (total_amount >= 0),
    paid_amount numeric(10, 2) not null default 0.00 check (paid_amount >= 0),
    status payment_status not null default 'pending',
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

create index if not exists idx_payments_student_id on public.payments(student_id);
create index if not exists idx_payments_teacher_id on public.payments(teacher_id);
create index if not exists idx_payments_status on public.payments(status);

-- Payments Updated_at Tetikleyicisi
drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
    before update on public.payments
    for each row
    execute function update_updated_at_column();

-- ==============================================================================
-- SUPABASE STORAGE BUCKETS (homework-files & avatars)
-- ==============================================================================
insert into storage.buckets (id, name, public)
values ('homework-files', 'homework-files', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Storage RLS Politikaları
create policy "Dosyalar herkese okunabilir"
    on storage.objects for select
    using (bucket_id in ('homework-files', 'avatars'));

create policy "Kullanıcılar dosya yükleyebilir"
    on storage.objects for insert
    with check (bucket_id in ('homework-files', 'avatars'));

create policy "Kullanıcılar kendi dosyalarını güncelleyebilir veya silebilir"
    on storage.objects for update
    using (bucket_id in ('homework-files', 'avatars'));

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.lessons enable row level security;
alter table public.homeworks enable row level security;
alter table public.payments enable row level security;

-- PROFILES RLS
create policy "Profiller herkese okunabilir"
    on public.profiles for select
    using (true);

create policy "Kullanıcı kendi profilini güncelleyebilir"
    on public.profiles for update
    to authenticated
    using (auth.uid() = id);

-- LESSONS RLS
create policy "Kullanıcılar dahil oldukları dersleri görüntüleyebilir"
    on public.lessons for select
    to authenticated
    using (auth.uid() = teacher_id or auth.uid() = student_id);

create policy "Öğretmenler ders oluşturabilir"
    on public.lessons for insert
    to authenticated
    with check (auth.uid() = teacher_id);

create policy "Öğretmenler ve öğrenciler kendi derslerini güncelleyebilir"
    on public.lessons for update
    to authenticated
    using (auth.uid() = teacher_id or auth.uid() = student_id);

-- HOMEWORKS RLS
create policy "İlgili öğrenci veya öğretmen görüntüleyebilir"
    on public.homeworks for select
    to authenticated
    using (
        auth.uid() = student_id or 
        exists (
            select 1 from public.lessons l 
            where l.id = public.homeworks.lesson_id and l.teacher_id = auth.uid()
        )
    );

create policy "Öğretmenler ödev ekleyebilir"
    on public.homeworks for insert
    to authenticated
    with check (
        exists (
            select 1 from public.lessons l 
            where l.id = public.homeworks.lesson_id and l.teacher_id = auth.uid()
        ) or exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'teacher'
        )
    );

create policy "Öğrenci veya öğretmen ödev güncelleyebilir"
    on public.homeworks for update
    to authenticated
    using (
        auth.uid() = student_id or 
        exists (
            select 1 from public.lessons l 
            where l.id = public.homeworks.lesson_id and l.teacher_id = auth.uid()
        )
    );

-- PAYMENTS RLS
create policy "İlgili öğretmen ve öğrenci ödeme kayıtlarını görebilir"
    on public.payments for select
    to authenticated
    using (auth.uid() = teacher_id or auth.uid() = student_id);

create policy "Öğretmenler ödeme talebi veya kaydı oluşturabilir"
    on public.payments for insert
    to authenticated
    with check (auth.uid() = teacher_id);

create policy "İlgili taraflar ödeme kaydını güncelleyebilir"
    on public.payments for update
    to authenticated
    using (auth.uid() = teacher_id or auth.uid() = student_id);

-- 5. MESSAGES (Öğrenciler ve Eğitmenler Arası Canlı Mesajlaşma)
create table if not exists public.messages (
    id uuid primary key default gen_random_uuid(),
    sender_id uuid not null references public.profiles(id) on delete cascade,
    receiver_id uuid not null references public.profiles(id) on delete cascade,
    content text not null,
    is_read boolean default false not null,
    created_at timestamptz default now() not null
);

create index if not exists idx_messages_sender_id on public.messages(sender_id);
create index if not exists idx_messages_receiver_id on public.messages(receiver_id);
create index if not exists idx_messages_created_at on public.messages(created_at);

-- MESSAGES RLS
alter table public.messages enable row level security;

create policy "Kullanıcılar dahil oldukları mesajları görebilir"
    on public.messages for select
    to authenticated
    using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Kullanıcılar mesaj gönderebilir"
    on public.messages for insert
    to authenticated
    with check (auth.uid() = sender_id);

-- 6. BOOKS (Öğrenci Akıllı Kitaplığı & Kaynaklar)
create table if not exists public.books (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    publisher text,
    subject text,
    topics text[],
    cover_image_url text,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

create index if not exists idx_books_student_id on public.books(student_id);

alter table public.books enable row level security;

create policy "Kitaplar herkese okunabilir"
    on public.books for select
    to authenticated
    using (true);

create policy "Öğrenciler kendi kitaplarını ekleyebilir veya güncelleyebilir"
    on public.books for all
    to authenticated
    using (auth.uid() = student_id);

-- ==============================================================================
-- AUTH.USERS KAYIT TETİKLEYİCİSİ (Otomatik Profil Oluşturma)
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, full_name, username, role, phone, avatar_url)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', 'Kullanıcı'),
        coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
        coalesce((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role),
        new.raw_user_meta_data->>'phone',
        new.raw_user_meta_data->>'avatar_url'
    );
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ==============================================================================
-- 7. CLASSES (Öğretmen Sınıfları) & CLASS_STUDENTS (Sınıf-Öğrenci İlişkisi)
-- ==============================================================================
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

alter table public.classes enable row level security;

create policy "Öğretmenler kendi sınıflarını yönetebilir"
    on public.classes for all
    to authenticated
    using (auth.uid() = teacher_id);

create policy "Öğrenciler kayıtlı oldukları sınıfları görebilir"
    on public.classes for select
    to authenticated
    using (
        exists (
            select 1 from public.class_students cs
            where cs.class_id = public.classes.id and cs.student_id = auth.uid()
        )
    );

create table if not exists public.class_students (
    id uuid primary key default gen_random_uuid(),
    class_id uuid not null references public.classes(id) on delete cascade,
    student_id uuid not null references public.profiles(id) on delete cascade,
    enrolled_at timestamptz default now() not null,
    unique(class_id, student_id)
);

create index if not exists idx_class_students_class_id on public.class_students(class_id);
create index if not exists idx_class_students_student_id on public.class_students(student_id);

alter table public.class_students enable row level security;

create policy "Öğretmenler sınıflarına öğrenci ekleyebilir ve yönetebilir"
    on public.class_students for all
    to authenticated
    using (
        exists (
            select 1 from public.classes c
            where c.id = public.class_students.class_id and c.teacher_id = auth.uid()
        )
    );

create policy "Öğrenciler kendi sınıf kayıtlarını görüntüleyebilir"
    on public.class_students for select
    to authenticated
    using (auth.uid() = student_id);

-- ==============================================================================
-- 8. SCHEDULE_EVENTS (Akıllı Ders Programı, Okul Dersleri & Kişisel Çalışma Planı)
-- ==============================================================================
create table if not exists public.schedule_events (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    subject text not null,
    event_type text not null default 'school', -- 'school' | 'private_lesson' | 'personal_study' | 'review' | 'exam'
    day_of_week int not null check (day_of_week between 0 and 6), -- 0=Pazartesi, ..., 6=Pazar
    start_time text not null, -- '09:00'
    end_time text not null, -- '09:45'
    specific_date text, -- '2026-10-15' opsiyonel tek seferlik tarih
    location_or_link text,
    color text default 'indigo',
    notes text,
    is_completed boolean default false,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,

    constraint check_event_times check (end_time > start_time)
);

create index if not exists idx_schedule_events_user_id on public.schedule_events(user_id);
create index if not exists idx_schedule_events_day on public.schedule_events(day_of_week);
create index if not exists idx_schedule_events_type on public.schedule_events(event_type);

drop trigger if exists set_schedule_events_updated_at on public.schedule_events;
create trigger set_schedule_events_updated_at
    before update on public.schedule_events
    for each row
    execute function update_updated_at_column();

alter table public.schedule_events enable row level security;

create policy "Kullanıcılar kendi program etkinliklerini yönetebilir"
    on public.schedule_events for all
    to authenticated
    using (auth.uid() = user_id);

create policy "Öğretmenler bağlı öğrencilerinin programlarını görüntüleyebilir"
    on public.schedule_events for select
    to authenticated
    using (
        exists (
            select 1 from public.teacher_students ts
            where ts.student_id = public.schedule_events.user_id and ts.teacher_id = auth.uid()
        )
        or
        exists (
            select 1 from public.class_students cs
            join public.classes c on c.id = cs.class_id
            where cs.student_id = public.schedule_events.user_id and c.teacher_id = auth.uid()
        )
    );

