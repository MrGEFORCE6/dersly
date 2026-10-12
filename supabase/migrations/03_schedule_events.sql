-- ==============================================================================
-- DERSLY MIGRATION 03: AKILLI DERS PROGRAMI VE ETÜT PLANI (SCHEDULE_EVENTS)
-- ==============================================================================
-- Okul ders çizelgesi, özel dersler, bireysel çalışma ve tekrar bloklarını tutar.

create table if not exists public.schedule_events (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    subject text not null,
    event_type text not null default 'school', -- 'school' | 'private_lesson' | 'personal_study' | 'review' | 'exam'
    day_of_week int not null check (day_of_week between 0 and 6), -- 0=Pazartesi .. 6=Pazar
    start_time text not null, -- '08:30'
    end_time text not null, -- '09:15'
    specific_date text, -- opsiyonel tek seferlik tarih ('2026-10-15')
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

-- RLS Güvenlik Politikaları
alter table public.schedule_events enable row level security;

drop policy if exists "Kullanıcılar kendi program etkinliklerini yönetebilir" on public.schedule_events;
create policy "Kullanıcılar kendi program etkinliklerini yönetebilir"
    on public.schedule_events for all
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

drop policy if exists "Öğretmenler bağlı öğrencilerinin programlarını görüntüleyebilir" on public.schedule_events;
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
