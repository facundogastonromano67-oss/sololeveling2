-- RLS: toda fila personal queda aislada por auth.uid().
alter table public.profiles enable row level security;
alter table public.evaluations enable row level security;
alter table public.plans enable row level security;
alter table public.mission_templates enable row level security;
alter table public.user_missions enable row level security;
alter table public.mission_completions enable row level security;
alter table public.penalties enable row level security;
alter table public.exercise_library enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_sets enable row level security;
alter table public.recipes enable row level security;
alter table public.meal_logs enable row level security;
alter table public.notebook_entries enable row level security;
alter table public.daily_reviews enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;

create policy "profile owner reads" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profile owner updates" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "evaluation owner" on public.evaluations for select to authenticated using ((select auth.uid()) = user_id);
create policy "plan owner" on public.plans for select to authenticated using ((select auth.uid()) = user_id);
create policy "mission catalog public" on public.mission_templates for select to anon, authenticated using (published);
create policy "mission owner" on public.user_missions for select to authenticated using ((select auth.uid()) = user_id);
create policy "completion owner" on public.mission_completions for select to authenticated using ((select auth.uid()) = user_id);
create policy "penalty owner" on public.penalties for select to authenticated using ((select auth.uid()) = user_id);

create policy "exercise catalog public" on public.exercise_library for select to anon, authenticated using (published);
create policy "recipe catalog public" on public.recipes for select to anon, authenticated using (published and not academy_exclusive);
create policy "course catalog public" on public.courses for select to anon, authenticated using (published);
create policy "lesson preview public" on public.lessons for select to anon using (published and preview);
create policy "lesson catalog authenticated" on public.lessons for select to authenticated using (published);

create policy "workout owner reads" on public.workout_sessions for select to authenticated using ((select auth.uid()) = user_id);
create policy "workout owner inserts" on public.workout_sessions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "workout owner updates" on public.workout_sessions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "workout owner deletes" on public.workout_sessions for delete to authenticated using ((select auth.uid()) = user_id);
create policy "set owner reads" on public.workout_sets for select to authenticated using ((select auth.uid()) = user_id);
create policy "set owner inserts" on public.workout_sets for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "set owner updates" on public.workout_sets for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "set owner deletes" on public.workout_sets for delete to authenticated using ((select auth.uid()) = user_id);

create policy "meal owner reads" on public.meal_logs for select to authenticated using ((select auth.uid()) = user_id);
create policy "meal owner inserts" on public.meal_logs for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "meal owner updates" on public.meal_logs for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "meal owner deletes" on public.meal_logs for delete to authenticated using ((select auth.uid()) = user_id);
create policy "note owner reads" on public.notebook_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy "note owner inserts" on public.notebook_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "note owner updates" on public.notebook_entries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "note owner deletes" on public.notebook_entries for delete to authenticated using ((select auth.uid()) = user_id);
create policy "review owner" on public.daily_reviews for select to authenticated using ((select auth.uid()) = user_id);
create policy "lesson progress owner" on public.lesson_progress for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

grant usage on schema public to anon, authenticated;
grant select on public.mission_templates, public.exercise_library, public.recipes, public.courses, public.lessons to anon, authenticated;
grant select on public.profiles, public.evaluations, public.plans, public.user_missions, public.mission_completions, public.penalties, public.daily_reviews to authenticated;
grant select, insert, update, delete on public.workout_sessions, public.workout_sets, public.meal_logs, public.notebook_entries, public.lesson_progress to authenticated;

-- El navegador sólo puede cambiar preferencias, nunca XP/Premium/nivel.
revoke update on public.profiles from authenticated;
grant update(display_name, avatar_url, locale, mode) on public.profiles to authenticated;

create or replace function public.create_user_mission(
  p_title text,
  p_description text default '',
  p_category text default 'disciplina',
  p_target_value numeric default 1,
  p_unit text default 'vez',
  p_weekdays smallint[] default array[1,2,3,4,5,6,7]::smallint[]
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_plan public.plans; v_id uuid;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  select * into v_plan from public.plans where user_id = v_user and active limit 1;
  if v_plan.id is not null and v_plan.mode = 'intensive' then raise exception 'missions are locked in intensive mode'; end if;
  if (select count(*) from public.user_missions where user_id=v_user and active and source='user') >= 15 then raise exception 'maximum 15 mandatory missions'; end if;
  if char_length(trim(p_title)) not between 1 and 80 or p_target_value <= 0 then raise exception 'invalid mission'; end if;
  insert into public.user_missions(user_id,plan_id,title,description,category,target_value,unit,source,reward_xp,weekdays,sort_order)
  values(v_user,v_plan.id,trim(p_title),left(coalesce(p_description,''),240),left(coalesce(p_category,'disciplina'),40),p_target_value,left(p_unit,30),'user',15,p_weekdays,
    (select coalesce(max(sort_order),0)+1 from public.user_missions where user_id=v_user)) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.complete_mission(p_mission_id uuid, p_value numeric default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_mission public.user_missions; v_completion public.mission_completions; v_xp integer;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text || current_date::text, 0));
  select * into v_mission from public.user_missions where id=p_mission_id and user_id=v_user and active for update;
  if not found then raise exception 'mission not found'; end if;
  select * into v_completion from public.mission_completions where mission_id=p_mission_id and completed_on=current_date for update;
  if found then
    delete from public.mission_completions where id=v_completion.id;
    update public.profiles set xp=greatest(0,xp-v_completion.xp_awarded), level=greatest(1,(greatest(0,xp-v_completion.xp_awarded)/500)+1) where id=v_user returning xp into v_xp;
    return jsonb_build_object('completed',false,'xp',v_xp,'xp_delta',-v_completion.xp_awarded);
  end if;
  insert into public.mission_completions(mission_id,user_id,value,xp_awarded) values(p_mission_id,v_user,coalesce(p_value,v_mission.target_value),v_mission.reward_xp);
  update public.profiles set xp=xp+v_mission.reward_xp, level=((xp+v_mission.reward_xp)/500)+1 where id=v_user returning xp into v_xp;
  return jsonb_build_object('completed',true,'xp',v_xp,'xp_delta',v_mission.reward_xp);
end;
$$;

create or replace function public.close_day(p_reflection text default '')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_total integer; v_done integer; v_missed integer; v_loss integer;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text || current_date::text, 0));
  select count(*) into v_total from public.user_missions
    where user_id=v_user and active and source='user' and extract(isodow from current_date)::smallint = any(weekdays);
  select count(*) into v_done from public.mission_completions c join public.user_missions m on m.id=c.mission_id
    where c.user_id=v_user and c.completed_on=current_date and m.source='user';
  v_missed := greatest(0,v_total-v_done); v_loss := least(50,v_missed*5);
  insert into public.daily_reviews(user_id,review_date,completed_count,total_count,reflection)
    values(v_user,current_date,v_done,v_total,left(coalesce(p_reflection,''),4000))
    on conflict(user_id,review_date) do update set completed_count=excluded.completed_count,total_count=excluded.total_count,reflection=excluded.reflection;
  if v_missed > 0 then
    insert into public.penalties(user_id,source_date,title,description,xp_loss)
      values(v_user,current_date,'Recuperación del Sistema','30 flexiones o alternativa + 30 sentadillas',v_loss)
      on conflict(user_id,source_date) do nothing;
    if found then update public.profiles set xp=greatest(0,xp-v_loss),level=greatest(1,(greatest(0,xp-v_loss)/500)+1) where id=v_user; end if;
  end if;
  return jsonb_build_object('completed',v_done,'total',v_total,'missed',v_missed,'xp_loss',v_loss);
end;
$$;

-- Sólo la Edge Function (service_role) puede reemplazar un plan completo.
create or replace function public.generate_plan_for_user(
  p_user_id uuid,
  p_answers jsonb,
  p_training_plan jsonb,
  p_nutrition_plan jsonb,
  p_mission_titles jsonb
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_evaluation uuid; v_plan uuid; v_mode text; v_count integer;
begin
  if p_user_id is null or not exists(select 1 from public.profiles where id=p_user_id) then raise exception 'invalid user'; end if;
  v_mode := case when p_answers->>'mode'='intensive' then 'intensive' else 'flexible' end;
  select count(*) into v_count from jsonb_array_elements_text(p_mission_titles);
  if v_count < 4 or v_count > 15 then raise exception 'select between 4 and 15 missions'; end if;
  insert into public.evaluations(user_id,answers) values(p_user_id,p_answers) returning id into v_evaluation;
  update public.plans set active=false where user_id=p_user_id and active;
  update public.user_missions set active=false where user_id=p_user_id and active;
  insert into public.plans(user_id,evaluation_id,mode,training_plan,nutrition_plan)
    values(p_user_id,v_evaluation,v_mode,p_training_plan,p_nutrition_plan) returning id into v_plan;
  insert into public.user_missions(user_id,plan_id,template_id,title,description,category,target_value,unit,source,difficulty,reward_xp,weekdays,locked,sort_order)
    select p_user_id,v_plan,t.id,t.title,t.description,t.category,t.target_value,t.unit,'user',t.difficulty,t.base_xp,array[1,2,3,4,5,6,7]::smallint[],v_mode='intensive',row_number() over(order by t.sort_order)::integer
    from public.mission_templates t where t.template_type='user' and t.published and t.title in (select jsonb_array_elements_text(p_mission_titles)) order by t.sort_order limit 15;
  get diagnostics v_count = row_count;
  if v_count < 4 then raise exception 'at least 4 valid missions are required'; end if;
  insert into public.user_missions(user_id,plan_id,template_id,title,description,category,target_value,unit,source,difficulty,reward_xp,weekdays,locked,sort_order)
    select p_user_id,v_plan,t.id,t.title,t.description,t.category,t.target_value,t.unit,'system',t.difficulty,t.base_xp,array[1,2,3,4,5,6,7]::smallint[],true,100+row_number() over(order by t.sort_order)::integer
    from public.mission_templates t where t.template_type='system' and t.published order by t.sort_order limit 3;
  update public.profiles set mode=v_mode where id=p_user_id;
  return v_plan;
end;
$$;

revoke all on function public.create_user_mission(text,text,text,numeric,text,smallint[]) from public, anon;
revoke all on function public.complete_mission(uuid,numeric) from public, anon;
revoke all on function public.close_day(text) from public, anon;
revoke all on function public.generate_plan_for_user(uuid,jsonb,jsonb,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.create_user_mission(text,text,text,numeric,text,smallint[]) to authenticated;
grant execute on function public.complete_mission(uuid,numeric) to authenticated;
grant execute on function public.close_day(text) to authenticated;
grant execute on function public.generate_plan_for_user(uuid,jsonb,jsonb,jsonb,jsonb) to service_role;
