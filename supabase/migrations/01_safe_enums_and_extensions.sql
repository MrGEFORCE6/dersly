-- ==============================================================================
-- DERSLY MIGRATION 01: GÜVENLİ EXTENSION VE ENUM TANIMLAMALARI
-- ==============================================================================
-- Bu dosya sıfırdan veya mevcut canlı veritabanında güvenle çalıştırılabilir.
-- Mevcut verileri kesinlikle silmez veya bozmaz (Idempotent).

-- 1. UUID Eklentisi
create extension if not exists "uuid-ossp";

-- 2. ENUM Tipleri (Yalnızca yoksa oluşturulur)
do $$ begin
    create type user_role as enum ('teacher', 'student');
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

-- 3. Canlı veritabanında homework_status daha önce oluşturulmuşsa 'revision_requested' değerini güvenle ekle
alter type homework_status add value if not exists 'revision_requested';

do $$ begin
    create type payment_status as enum ('pending', 'partially_paid', 'completed', 'cancelled');
exception
    when duplicate_object then null;
end $$;

-- 4. Otomatik Zaman Damgası Fonksiyonu
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;
