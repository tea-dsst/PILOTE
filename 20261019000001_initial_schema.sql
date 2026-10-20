-- =====================================================================
-- PILOTE — Migration initiale
-- Schéma, contraintes, Row Level Security et stockage privé
-- Cible : Supabase (PostgreSQL 15+)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Fonctions utilitaires
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Profils
-- ---------------------------------------------------------------------
create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  display_name    text check (display_name is null or char_length(display_name) between 1 and 80),
  balance         numeric(12,2) not null default 0,          -- solde saisi manuellement
  monthly_budget  numeric(12,2) check (monthly_budget is null or monthly_budget >= 0),
  currency        text not null default 'EUR' check (currency = 'EUR'),
  locale          text not null default 'fr-FR',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Catégories (transactions, budgets, échéances, contrats, tâches)
-- ---------------------------------------------------------------------
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 60),
  kind        text not null default 'expense' check (kind in ('expense', 'income')),
  color       text not null default '#5E8C7A' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  icon        text not null default 'tag',
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (id, user_id)
);

create unique index categories_user_name_kind_uq
  on public.categories (user_id, lower(name), kind);

-- ---------------------------------------------------------------------
-- Transactions
-- ---------------------------------------------------------------------
create table public.transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  category_id  uuid,
  kind         text not null check (kind in ('income', 'expense')),
  amount       numeric(12,2) not null check (amount > 0 and amount < 100000000),
  occurred_on  date not null,
  description  text not null default '' check (char_length(description) <= 200),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (id, user_id),
  foreign key (category_id, user_id)
    references public.categories (id, user_id) on delete set null (category_id)
);

create index transactions_user_date_idx on public.transactions (user_id, occurred_on desc);
create index transactions_user_category_idx on public.transactions (user_id, category_id);

create trigger transactions_updated_at before update on public.transactions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Budgets : limite mensuelle par catégorie
-- (le budget global est profiles.monthly_budget)
-- ---------------------------------------------------------------------
create table public.budgets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  category_id   uuid not null,
  monthly_limit numeric(12,2) not null check (monthly_limit >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, category_id),
  foreign key (category_id, user_id)
    references public.categories (id, user_id) on delete cascade
);

create trigger budgets_updated_at before update on public.budgets
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Contrats et abonnements
-- ---------------------------------------------------------------------
create table public.contracts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  category_id      uuid,
  name             text not null check (char_length(name) between 1 and 120),
  price            numeric(12,2) not null check (price >= 0),
  frequency        text not null check (frequency in ('monthly', 'quarterly', 'yearly')),
  start_date       date,
  renewal_date     date,
  termination_date date,
  notes            text not null default '' check (char_length(notes) <= 2000),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (id, user_id),
  foreign key (category_id, user_id)
    references public.categories (id, user_id) on delete set null (category_id)
);

create index contracts_user_renewal_idx on public.contracts (user_id, renewal_date);

create trigger contracts_updated_at before update on public.contracts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Échéances
-- ---------------------------------------------------------------------
create table public.deadlines (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  category_id  uuid,
  contract_id  uuid,
  title        text not null check (char_length(title) between 1 and 120),
  due_date     date not null,
  amount       numeric(12,2) check (amount is null or amount >= 0),
  description  text not null default '' check (char_length(description) <= 2000),
  status       text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority     text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  recurrence   text not null default 'none' check (recurrence in ('none', 'monthly', 'quarterly', 'yearly')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (id, user_id),
  foreign key (category_id, user_id)
    references public.categories (id, user_id) on delete set null (category_id),
  foreign key (contract_id, user_id)
    references public.contracts (id, user_id) on delete set null (contract_id)
);

create index deadlines_user_due_idx on public.deadlines (user_id, due_date);

create trigger deadlines_updated_at before update on public.deadlines
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Documents (métadonnées ; le fichier est dans le bucket privé "documents")
-- ---------------------------------------------------------------------
create table public.documents (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  contract_id   uuid,
  deadline_id   uuid,
  title         text not null check (char_length(title) between 1 and 120),
  doc_category  text not null default 'other' check (doc_category in (
                  'identity', 'bank', 'insurance', 'housing', 'health',
                  'work_study', 'tax', 'vehicle', 'other')),
  expires_on    date,
  storage_path  text not null unique,
  file_name     text not null check (char_length(file_name) <= 255),
  mime_type     text not null,
  size_bytes    bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  created_at    timestamptz not null default now(),
  unique (id, user_id),
  -- le fichier doit se trouver dans le dossier de son propriétaire
  check (storage_path like user_id::text || '/%'),
  foreign key (contract_id, user_id)
    references public.contracts (id, user_id) on delete set null (contract_id),
  foreign key (deadline_id, user_id)
    references public.deadlines (id, user_id) on delete set null (deadline_id)
);

create index documents_user_idx on public.documents (user_id, doc_category);

-- ---------------------------------------------------------------------
-- Objectifs d'épargne
-- ---------------------------------------------------------------------
create table public.savings_goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 80),
  target_amount numeric(12,2) not null check (target_amount > 0),
  saved_amount  numeric(12,2) not null default 0 check (saved_amount >= 0),
  target_date   date,
  description   text not null default '' check (char_length(description) <= 1000),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger savings_goals_updated_at before update on public.savings_goals
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Tâches
-- ---------------------------------------------------------------------
create table public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  category_id  uuid,
  contract_id  uuid,
  document_id  uuid,
  deadline_id  uuid,
  title        text not null check (char_length(title) between 1 and 160),
  notes        text not null default '' check (char_length(notes) <= 2000),
  due_date     date,
  status       text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority     text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  foreign key (category_id, user_id)
    references public.categories (id, user_id) on delete set null (category_id),
  foreign key (contract_id, user_id)
    references public.contracts (id, user_id) on delete set null (contract_id),
  foreign key (document_id, user_id)
    references public.documents (id, user_id) on delete set null (document_id),
  foreign key (deadline_id, user_id)
    references public.deadlines (id, user_id) on delete set null (deadline_id)
);

create index tasks_user_due_idx on public.tasks (user_id, due_date);

create trigger tasks_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Création automatique du profil et des catégories par défaut
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''));

  insert into public.categories (user_id, name, kind, color, icon, is_default) values
    (new.id, 'Logement',      'expense', '#2F5D4B', 'home',          true),
    (new.id, 'Alimentation',  'expense', '#7FA38F', 'shopping-basket', true),
    (new.id, 'Transport',     'expense', '#C08A4B', 'train-front',   true),
    (new.id, 'Voiture',       'expense', '#8C6F56', 'car',           true),
    (new.id, 'Santé',         'expense', '#B4655A', 'heart-pulse',   true),
    (new.id, 'Abonnements',   'expense', '#5B7F95', 'repeat',        true),
    (new.id, 'Loisirs',       'expense', '#A68BB0', 'ticket',        true),
    (new.id, 'Shopping',      'expense', '#D1A24C', 'shopping-bag',  true),
    (new.id, 'Assurances',    'expense', '#4F7A6B', 'shield-check',  true),
    (new.id, 'Études',        'expense', '#6C84B0', 'graduation-cap', true),
    (new.id, 'Autres',        'expense', '#9AA39E', 'ellipsis',      true),
    (new.id, 'Salaire',       'income',  '#2F5D4B', 'wallet',        true),
    (new.id, 'Autres revenus','income',  '#7FA38F', 'plus-circle',   true);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Row Level Security
-- Toute table contenant des données personnelles est protégée.
-- Chaque utilisateur ne voit et ne modifie que ses propres lignes.
-- =====================================================================
alter table public.profiles       enable row level security;
alter table public.categories     enable row level security;
alter table public.transactions   enable row level security;
alter table public.budgets        enable row level security;
alter table public.contracts      enable row level security;
alter table public.deadlines      enable row level security;
alter table public.documents      enable row level security;
alter table public.savings_goals  enable row level security;
alter table public.tasks          enable row level security;

-- Profils : lecture et mise à jour de son propre profil uniquement.
-- Pas d'insertion directe (créé par le trigger) ni de suppression directe
-- (la suppression du compte passe par le serveur, voir docs/ARCHITECTURE.md).
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Tables « classiques » : mêmes quatre politiques pour chacune.
do $$
declare
  t text;
begin
  foreach t in array array[
    'categories', 'transactions', 'budgets', 'contracts',
    'deadlines', 'documents', 'savings_goals', 'tasks'
  ]
  loop
    execute format(
      'create policy %I on public.%I for select to authenticated using (user_id = (select auth.uid()))',
      t || '_select_own', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (user_id = (select auth.uid()))',
      t || '_insert_own', t);
    execute format(
      'create policy %I on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',
      t || '_update_own', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (user_id = (select auth.uid()))',
      t || '_delete_own', t);
  end loop;
end;
$$;

-- Aucun accès pour les visiteurs non connectés.
revoke all on all tables in schema public from anon;

-- =====================================================================
-- Stockage privé des documents
-- Bucket non public ; chaque fichier est rangé dans <user_id>/<fichier>.
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents', 'documents', false, 10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy documents_bucket_select_own on storage.objects
  for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy documents_bucket_insert_own on storage.objects
  for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy documents_bucket_update_own on storage.objects
  for update to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy documents_bucket_delete_own on storage.objects
  for delete to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
