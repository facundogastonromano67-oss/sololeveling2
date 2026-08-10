-- Sistema G30 · esquema inicial
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Usuario' check (char_length(display_name) between 1 and 60),
  avatar_url text,
  locale text not null default 'es-AR',
  mode text not null default 'flexible' check (mode in ('flexible','intensive')),
  xp integer not null default 0 check (xp >= 0),
  level integer not null default 1 check (level >= 1),
  streak integer not null default 0 check (streak >= 0),
  is_premium boolean not null default false,
  premium_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.evaluations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  evaluation_id uuid references public.evaluations(id) on delete set null,
  name text not null default 'Plan G30',
  mode text not null default 'flexible' check (mode in ('flexible','intensive')),
  started_on date not null default current_date,
  ends_on date not null default (current_date + 29),
  active boolean not null default true,
  training_plan jsonb not null default '{"days":[]}'::jsonb,
  nutrition_plan jsonb not null default '{"meal_ids":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index one_active_plan_per_user on public.plans(user_id) where active;

create table public.mission_templates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  template_type text not null check (template_type in ('user','system')),
  title text not null,
  description text not null default '',
  category text not null,
  target_value numeric(10,2) not null check (target_value > 0),
  unit text not null,
  base_xp integer not null check (base_xp between 0 and 500),
  difficulty smallint not null default 1 check (difficulty between 1 and 10),
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.user_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete cascade,
  template_id uuid references public.mission_templates(id) on delete set null,
  title text not null check (char_length(title) between 1 and 80),
  description text not null default '' check (char_length(description) <= 240),
  category text not null,
  target_value numeric(10,2) not null check (target_value > 0),
  unit text not null check (char_length(unit) between 1 and 30),
  source text not null check (source in ('user','system','penalty')),
  difficulty smallint not null default 1 check (difficulty between 1 and 10),
  reward_xp integer not null default 0 check (reward_xp between 0 and 500),
  progression_level integer not null default 1 check (progression_level between 1 and 100),
  weekdays smallint[] not null default array[1,2,3,4,5,6,7]::smallint[],
  locked boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_weekdays check (weekdays <@ array[1,2,3,4,5,6,7]::smallint[] and cardinality(weekdays) > 0)
);
create index user_missions_owner_active_idx on public.user_missions(user_id, active, sort_order);

create table public.mission_completions (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.user_missions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  completed_on date not null default current_date,
  value numeric(10,2),
  xp_awarded integer not null default 0 check (xp_awarded between 0 and 500),
  completed_at timestamptz not null default now(),
  unique(mission_id, completed_on)
);
create index mission_completions_owner_date_idx on public.mission_completions(user_id, completed_on);

create table public.penalties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source_date date not null,
  title text not null,
  description text not null,
  xp_loss integer not null default 0 check (xp_loss between 0 and 100),
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, source_date)
);

create table public.exercise_library (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  muscle_group text not null,
  equipment text not null,
  instructions jsonb not null default '[]'::jsonb,
  coaching_cues jsonb not null default '[]'::jsonb,
  alternatives text[] not null default '{}',
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  title text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_minutes integer check (duration_minutes between 0 and 600),
  notes text not null default '' check (char_length(notes) <= 4000),
  created_at timestamptz not null default now()
);

create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_session_id uuid not null references public.workout_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  exercise_slug text not null,
  set_number integer not null check (set_number between 1 and 30),
  reps integer check (reps between 0 and 1000),
  weight_kg numeric(7,2) check (weight_kg between 0 and 2000),
  duration_seconds integer check (duration_seconds between 0 and 86400),
  distance_meters integer check (distance_meters between 0 and 1000000),
  rir smallint check (rir between 0 and 10),
  notes text not null default '',
  created_at timestamptz not null default now()
);
create index workout_sets_session_idx on public.workout_sets(workout_session_id, set_number);

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  meal_type text not null,
  ingredients jsonb not null default '[]'::jsonb,
  instructions jsonb not null default '[]'::jsonb,
  calories integer check (calories between 0 and 5000),
  protein_g numeric(6,1) check (protein_g between 0 and 500),
  carbs_g numeric(6,1) check (carbs_g between 0 and 1000),
  fat_g numeric(6,1) check (fat_g between 0 and 500),
  academy_exclusive boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  recipe_slug text,
  meal_name text not null,
  portion numeric(6,2) not null default 1 check (portion > 0 and portion <= 20),
  notes text not null default '' check (char_length(notes) <= 1000),
  logged_at timestamptz not null default now()
);

create table public.notebook_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Sin título' check (char_length(title) between 1 and 120),
  body text not null default '' check (char_length(body) <= 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.daily_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  review_date date not null default current_date,
  completed_count integer not null default 0,
  total_count integer not null default 0,
  reflection text not null default '' check (char_length(reflection) <= 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, review_date)
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  price_cents integer not null default 0 check (price_cents >= 0),
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  position integer not null check (position > 0),
  title text not null,
  duration_minutes integer not null check (duration_minutes between 1 and 240),
  content text not null,
  action_step text not null default '',
  preview boolean not null default false,
  published boolean not null default true,
  unique(course_id, position)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz,
  notes text not null default '',
  unique(user_id, lesson_id)
);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger plans_updated_at before update on public.plans for each row execute function public.set_updated_at();
create trigger missions_updated_at before update on public.user_missions for each row execute function public.set_updated_at();
create trigger notebook_updated_at before update on public.notebook_entries for each row execute function public.set_updated_at();
create trigger reviews_updated_at before update on public.daily_reviews for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, display_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'display_name',''), split_part(new.email,'@',1), 'Usuario'));
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
