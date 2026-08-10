-- Sistema G30 · progresión, economía y competencia validadas por servidor
alter table public.profiles add column if not exists best_streak integer not null default 0 check (best_streak >= 0);
alter table public.profiles add column if not exists coins integer not null default 100 check (coins >= 0);
alter table public.profiles add column if not exists rank text not null default 'E' check (rank in ('E','D','C','B','A','S'));
alter table public.profiles add column if not exists avatar_frame text;
alter table public.user_missions add column if not exists skill_key text;
alter table public.user_missions add column if not exists completion_count integer not null default 0 check (completion_count >= 0);
alter table public.user_missions add column if not exists scheduled_date date;
alter table public.mission_templates add column if not exists skill_key text;
update public.mission_templates set skill_key=case
  when category in ('entrenamiento') then 'Fuerza'
  when category in ('resistencia') then 'Resistencia'
  when category in ('movilidad') then 'Movilidad'
  when category in ('nutrición','recuperación') then 'Salud física'
  when category='enfoque' then 'Productividad'
  else 'Disciplina' end
where skill_key is null;

create or replace function public.copy_mission_skill()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.skill_key is null and new.template_id is not null then
    select skill_key into new.skill_key from public.mission_templates where id=new.template_id;
  end if;
  if new.skill_key is null then
    new.skill_key:=case when new.category='entrenamiento' then 'Fuerza' when new.category='resistencia' then 'Resistencia' when new.category='movilidad' then 'Movilidad' when new.category in ('nutrición','recuperación') then 'Salud física' when new.category='enfoque' then 'Productividad' else 'Disciplina' end;
  end if;
  return new;
end;
$$;
create trigger user_mission_skill before insert or update of template_id on public.user_missions for each row execute function public.copy_mission_skill();

create table public.user_skills (
  user_id uuid not null references public.profiles(id) on delete cascade,
  skill_key text not null check (char_length(skill_key) between 1 and 80),
  xp integer not null default 0 check (xp >= 0),
  level integer not null default 1 check (level between 1 and 100),
  updated_at timestamptz not null default now(),
  primary key (user_id, skill_key)
);

create table public.achievement_unlocks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_key text not null,
  coins_awarded integer not null default 0 check (coins_awarded between 0 and 10000),
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_key)
);

create table public.economy_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null check (amount between -100000 and 100000 and amount <> 0),
  reason text not null check (char_length(reason) between 1 and 120),
  reference_key text,
  created_at timestamptz not null default now()
);
create index economy_ledger_owner_date_idx on public.economy_ledger(user_id, created_at desc);

create table public.store_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_key text not null,
  price_coins integer not null check (price_coins >= 0),
  purchased_at timestamptz not null default now(),
  unique(user_id, item_key)
);

create table public.arena_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_key text not null default 'will-duel',
  score integer not null check (score between 0 and 1000000),
  result text not null check (result in ('victory','draw','defeat')),
  verified boolean not null default false,
  played_at timestamptz not null default now()
);
create index arena_ranking_idx on public.arena_scores(game_key, score desc, played_at);

create table public.dungeon_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  run_date date not null default current_date,
  dungeon_key text not null default 'constancy-gate',
  completion_percent integer not null check (completion_percent between 0 and 100),
  coins_awarded integer not null default 0 check (coins_awarded between 0 and 1000),
  completed_at timestamptz not null default now(),
  unique(user_id, run_date, dungeon_key)
);

create table public.guilds (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text unique not null check (char_length(name) between 3 and 40),
  description text not null default '' check (char_length(description) <= 500),
  created_at timestamptz not null default now()
);

create table public.guild_members (
  guild_id uuid not null references public.guilds(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','officer','member')),
  joined_at timestamptz not null default now(),
  primary key (guild_id, user_id),
  unique(user_id)
);

create or replace function public.complete_mission(p_mission_id uuid, p_value numeric default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_mission public.user_missions; v_completion public.mission_completions; v_xp integer; v_level integer;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text || current_date::text, 0));
  select * into v_mission from public.user_missions where id=p_mission_id and user_id=v_user and active for update;
  if not found then raise exception 'mission not found'; end if;
  select * into v_completion from public.mission_completions where mission_id=p_mission_id and completed_on=current_date for update;
  if found then
    delete from public.mission_completions where id=v_completion.id;
    update public.profiles set xp=greatest(0,xp-v_completion.xp_awarded),level=greatest(1,(greatest(0,xp-v_completion.xp_awarded)/500)+1) where id=v_user returning xp,level into v_xp,v_level;
    if v_mission.skill_key is not null then
      update public.user_skills set xp=greatest(0,xp-ceil(v_completion.xp_awarded/2.0)::integer),level=(greatest(0,xp-ceil(v_completion.xp_awarded/2.0)::integer)/250)+1,updated_at=now() where user_id=v_user and skill_key=v_mission.skill_key;
    end if;
    return jsonb_build_object('completed',false,'xp',v_xp,'xp_delta',-v_completion.xp_awarded);
  end if;
  insert into public.mission_completions(mission_id,user_id,value,xp_awarded) values(p_mission_id,v_user,coalesce(p_value,v_mission.target_value),v_mission.reward_xp);
  update public.user_missions set completion_count=completion_count+1,
    progression_level=case when source='user' and (completion_count+1)%7=0 then least(100,progression_level+1) else progression_level end,
    reward_xp=case when source='user' and (completion_count+1)%7=0 then least(500,reward_xp+3) else reward_xp end
    where id=p_mission_id;
  if v_mission.skill_key is not null then
    insert into public.user_skills(user_id,skill_key,xp,level) values(v_user,v_mission.skill_key,ceil(v_mission.reward_xp/2.0)::integer,1)
    on conflict(user_id,skill_key) do update set xp=public.user_skills.xp+excluded.xp,level=((public.user_skills.xp+excluded.xp)/250)+1,updated_at=now();
  end if;
  update public.profiles set xp=xp+v_mission.reward_xp,level=((xp+v_mission.reward_xp)/500)+1,
    rank=case when ((xp+v_mission.reward_xp)/500)+1>=50 then 'S' when ((xp+v_mission.reward_xp)/500)+1>=35 then 'A' when ((xp+v_mission.reward_xp)/500)+1>=25 then 'B' when ((xp+v_mission.reward_xp)/500)+1>=15 then 'C' when ((xp+v_mission.reward_xp)/500)+1>=7 then 'D' else 'E' end
    where id=v_user returning xp,level into v_xp,v_level;
  return jsonb_build_object('completed',true,'xp',v_xp,'level',v_level,'xp_delta',v_mission.reward_xp);
end;
$$;

create or replace function public.close_day(p_reflection text default '')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_total integer; v_done integer; v_missed integer; v_loss integer;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text || current_date::text, 0));
  select count(*) into v_total from public.user_missions where user_id=v_user and active and source='user' and extract(isodow from current_date)::smallint=any(weekdays);
  select count(*) into v_done from public.mission_completions c join public.user_missions m on m.id=c.mission_id where c.user_id=v_user and c.completed_on=current_date and m.source='user';
  v_missed:=greatest(0,v_total-v_done); v_loss:=least(50,v_missed*5);
  insert into public.daily_reviews(user_id,review_date,completed_count,total_count,reflection) values(v_user,current_date,v_done,v_total,left(coalesce(p_reflection,''),4000))
    on conflict(user_id,review_date) do update set completed_count=excluded.completed_count,total_count=excluded.total_count,reflection=excluded.reflection;
  if v_missed>0 then
    insert into public.penalties(user_id,source_date,title,description,xp_loss) values(v_user,current_date,'Recuperación del Sistema','30 flexiones o alternativa segura + 30 sentadillas',v_loss) on conflict(user_id,source_date) do nothing;
    if found then update public.profiles set xp=greatest(0,xp-v_loss),level=greatest(1,(greatest(0,xp-v_loss)/500)+1),streak=0 where id=v_user; end if;
  else
    update public.profiles set streak=streak+1,best_streak=greatest(best_streak,streak+1) where id=v_user;
  end if;
  return jsonb_build_object('completed',v_done,'total',v_total,'missed',v_missed,'xp_loss',v_loss);
end;
$$;

alter table public.user_skills enable row level security;
alter table public.achievement_unlocks enable row level security;
alter table public.economy_ledger enable row level security;
alter table public.store_purchases enable row level security;
alter table public.arena_scores enable row level security;
alter table public.dungeon_runs enable row level security;
alter table public.guilds enable row level security;
alter table public.guild_members enable row level security;

create policy "skill owner reads" on public.user_skills for select to authenticated using ((select auth.uid()) = user_id);
create policy "achievement owner reads" on public.achievement_unlocks for select to authenticated using ((select auth.uid()) = user_id);
create policy "ledger owner reads" on public.economy_ledger for select to authenticated using ((select auth.uid()) = user_id);
create policy "purchase owner reads" on public.store_purchases for select to authenticated using ((select auth.uid()) = user_id);
create policy "arena authenticated reads" on public.arena_scores for select to authenticated using (verified or (select auth.uid()) = user_id);
create policy "dungeon owner reads" on public.dungeon_runs for select to authenticated using ((select auth.uid()) = user_id);
create policy "guild authenticated reads" on public.guilds for select to authenticated using (true);
create policy "guild members authenticated read" on public.guild_members for select to authenticated using (true);

grant select on public.user_skills, public.achievement_unlocks, public.economy_ledger, public.store_purchases, public.arena_scores, public.dungeon_runs, public.guilds, public.guild_members to authenticated;
revoke update on public.profiles from authenticated;
grant update(display_name, avatar_url, locale, mode, avatar_frame) on public.profiles to authenticated;

create or replace function public.purchase_store_item(p_item_key text, p_price_coins integer, p_required_level integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_profile public.profiles;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  if p_item_key not in ('recipe-pack-1','skill-chest-1','frame-cyan','academy-focus') then raise exception 'unknown item'; end if;
  if p_price_coins < 0 or p_price_coins > 10000 or p_required_level < 1 then raise exception 'invalid item configuration'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text || ':economy', 0));
  select * into v_profile from public.profiles where id=v_user for update;
  if v_profile.level < p_required_level then raise exception 'level requirement not met'; end if;
  if v_profile.coins < p_price_coins then raise exception 'not enough coins'; end if;
  insert into public.store_purchases(user_id,item_key,price_coins) values(v_user,p_item_key,p_price_coins);
  update public.profiles set coins=coins-p_price_coins,avatar_frame=case when p_item_key='frame-cyan' then 'cyan' else avatar_frame end where id=v_user;
  insert into public.economy_ledger(user_id,amount,reason,reference_key) values(v_user,-p_price_coins,'Compra en tienda',p_item_key);
  return jsonb_build_object('item',p_item_key,'coins',v_profile.coins-p_price_coins);
end;
$$;

create or replace function public.refresh_daily_system_missions()
returns integer language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_plan public.plans; v_count integer;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  select * into v_plan from public.plans where user_id=v_user and active limit 1;
  if v_plan.id is null then return 0; end if;
  update public.user_missions set active=false
    where user_id=v_user and source='system' and active and scheduled_date is distinct from current_date;
  if exists(select 1 from public.user_missions where user_id=v_user and source='system' and active and scheduled_date=current_date) then
    return (select count(*) from public.user_missions where user_id=v_user and source='system' and active and scheduled_date=current_date);
  end if;
  insert into public.user_missions(user_id,plan_id,template_id,title,description,category,target_value,unit,source,difficulty,reward_xp,weekdays,locked,sort_order,scheduled_date)
    select v_user,v_plan.id,t.id,t.title,t.description,t.category,t.target_value,t.unit,'system',t.difficulty,t.base_xp,
      array[extract(isodow from current_date)::smallint]::smallint[],true,100+row_number() over(order by md5(t.slug||current_date::text))::integer,current_date
    from public.mission_templates t where t.template_type='system' and t.published
    order by md5(t.slug||current_date::text) limit 3;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.complete_daily_dungeon()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_total integer; v_done integer; v_percent integer;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text || current_date::text || ':dungeon', 0));
  select count(*) into v_total from public.user_missions where user_id=v_user and active and extract(isodow from current_date)::smallint=any(weekdays);
  select count(*) into v_done from public.mission_completions c join public.user_missions m on m.id=c.mission_id where c.user_id=v_user and c.completed_on=current_date and m.active;
  v_percent := case when v_total=0 then 0 else floor(v_done*100.0/v_total) end;
  if v_percent < 80 then raise exception 'complete at least 80 percent of daily missions'; end if;
  insert into public.dungeon_runs(user_id,completion_percent,coins_awarded) values(v_user,v_percent,30);
  update public.profiles set coins=coins+30 where id=v_user;
  insert into public.economy_ledger(user_id,amount,reason,reference_key) values(v_user,30,'Mazmorra diaria',current_date::text);
  return jsonb_build_object('completion_percent',v_percent,'coins_awarded',30);
end;
$$;

create or replace function public.play_arena_duel(p_power integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user uuid:=auth.uid(); v_system integer; v_user_score integer; v_result text; v_streak integer;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  if p_power not between 1 and 10 then raise exception 'power must be between 1 and 10'; end if;
  select streak into v_streak from public.profiles where id=v_user;
  v_system:=3+floor(random()*8)::integer;
  v_user_score:=p_power+least(3,floor(v_streak/3.0)::integer);
  v_result:=case when v_user_score>v_system then 'victory' when v_user_score=v_system then 'draw' else 'defeat' end;
  insert into public.arena_scores(user_id,score,result,verified) values(v_user,v_user_score,v_result,true);
  if v_result='victory' then
    update public.profiles set coins=coins+12 where id=v_user;
    insert into public.economy_ledger(user_id,amount,reason,reference_key) values(v_user,12,'Victoria en Arena',current_date::text);
  end if;
  return jsonb_build_object('user',v_user_score,'system',v_system,'result',v_result,'coins_awarded',case when v_result='victory' then 12 else 0 end);
end;
$$;

revoke all on function public.purchase_store_item(text,integer,integer) from public, anon;
revoke all on function public.refresh_daily_system_missions() from public, anon;
revoke all on function public.complete_daily_dungeon() from public, anon;
revoke all on function public.play_arena_duel(integer) from public, anon;
grant execute on function public.purchase_store_item(text,integer,integer) to authenticated;
grant execute on function public.refresh_daily_system_missions() to authenticated;
grant execute on function public.complete_daily_dungeon() to authenticated;
grant execute on function public.play_arena_duel(integer) to authenticated;
