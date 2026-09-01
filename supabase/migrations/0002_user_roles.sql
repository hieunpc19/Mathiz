-- Replace the initial family/parent/child model with authenticated admins and students.
-- The project owner confirmed that the tables created by 0001 contain no data.

drop table if exists
  public.attempt_answers,
  public.attempts,
  public.assets,
  public.questions,
  public.exam_versions,
  public.exams,
  public.children,
  public.parent_profiles,
  public.families
cascade;

drop function if exists private.current_user_family_ids();

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phone_number text not null unique check (phone_number ~ '^\+[1-9][0-9]{7,14}$'),
  display_name text not null check (length(btrim(display_name)) between 1 and 120),
  role text not null default 'student' check (role in ('admin', 'student')),
  grade smallint check (grade between 1 and 12),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Application profile for an authenticated admin or student.';
comment on column public.profiles.phone_number is
  'E.164 login identifier. Supabase Auth receives only a deterministic HMAC-derived internal email.';
comment on column public.profiles.role is
  'Authorization role. Public registration always creates student; admins are assigned directly in the database.';

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) between 1 and 240),
  competition text,
  round text,
  school_year text,
  grade_min smallint check (grade_min between 1 and 12),
  grade_max smallint check (grade_max between 1 and 12),
  languages text[] not null default array['vi']::text[] check (cardinality(languages) > 0),
  source_url text,
  rights_note text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  current_version_id uuid,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exams_grade_range_valid check (
    grade_min is null or grade_max is null or grade_min <= grade_max
  ),
  constraint exams_id_current_version_unique unique (id, current_version_id)
);

create table public.exam_versions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  version_no integer not null check (version_no > 0),
  duration_seconds integer check (duration_seconds >= 0),
  scoring_policy jsonb not null default '{}'::jsonb check (jsonb_typeof(scoring_policy) = 'object'),
  source_format text not null default 'markdown' check (source_format in ('markdown', 'json')),
  raw_source_path text,
  compiled_hash text,
  published_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint exam_versions_exam_version_unique unique (exam_id, version_no),
  constraint exam_versions_exam_id_id_unique unique (exam_id, id)
);

alter table public.exams
  add constraint exams_current_version_same_exam_fk
  foreign key (id, current_version_id)
  references public.exam_versions (exam_id, id)
  on delete set null (current_version_id);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  exam_version_id uuid not null references public.exam_versions(id) on delete cascade,
  position integer not null check (position > 0),
  code text,
  category text,
  body_md text not null check (length(btrim(body_md)) > 0),
  options jsonb not null check (jsonb_typeof(options) in ('array', 'object')),
  correct_key text not null check (length(btrim(correct_key)) > 0),
  points_correct numeric(10, 2) not null default 1 check (points_correct >= 0),
  points_wrong numeric(10, 2) not null default 0 check (points_wrong >= 0),
  image_paths jsonb not null default '[]'::jsonb check (jsonb_typeof(image_paths) = 'array'),
  tags text[] not null default '{}'::text[],
  explanation_md text,
  created_at timestamptz not null default now(),
  constraint questions_version_position_unique unique (exam_version_id, position)
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  exam_version_id uuid not null references public.exam_versions(id) on delete cascade,
  storage_path text not null check (length(btrim(storage_path)) > 0),
  original_name text not null check (length(btrim(original_name)) > 0),
  mime_type text not null check (length(btrim(mime_type)) > 0),
  sha256 text not null check (sha256 ~ '^[0-9a-fA-F]{64}$'),
  created_at timestamptz not null default now(),
  constraint assets_storage_path_unique unique (storage_path)
);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete restrict,
  exam_version_id uuid not null references public.exam_versions(id) on delete restrict,
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted', 'graded', 'abandoned')),
  started_at timestamptz not null default now(),
  deadline_at timestamptz,
  submitted_at timestamptz,
  score numeric(10, 2) check (score >= 0),
  max_score numeric(10, 2) check (max_score >= 0),
  duration_seconds integer check (duration_seconds >= 0),
  submit_reason text check (submit_reason in ('manual', 'timeout', 'admin', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attempts_deadline_valid check (deadline_at is null or deadline_at >= started_at),
  constraint attempts_submission_valid check (submitted_at is null or submitted_at >= started_at),
  constraint attempts_score_valid check (score is null or max_score is null or score <= max_score)
);

create table public.attempt_answers (
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  selected_key text,
  answered_at timestamptz,
  is_correct boolean,
  awarded_points numeric(10, 2) check (awarded_points >= 0),
  primary key (attempt_id, question_id)
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger exams_set_updated_at
before update on public.exams
for each row execute function public.set_updated_at();

create trigger attempts_set_updated_at
before update on public.attempts
for each row execute function public.set_updated_at();

create index profiles_role_idx on public.profiles (role);
create index profiles_grade_idx on public.profiles (grade) where grade is not null;
create index exams_status_idx on public.exams (status);
create index exams_created_by_idx on public.exams (created_by);
create index exams_current_version_id_idx on public.exams (current_version_id);
create index exam_versions_exam_id_created_at_idx on public.exam_versions (exam_id, created_at desc);
create index exam_versions_created_by_idx on public.exam_versions (created_by);
create index questions_exam_version_id_idx on public.questions (exam_version_id);
create index assets_exam_version_id_idx on public.assets (exam_version_id);
create index attempts_student_id_started_at_idx on public.attempts (student_id, started_at desc);
create index attempts_exam_version_id_idx on public.attempts (exam_version_id);
create index attempts_status_idx on public.attempts (status);
create index attempt_answers_question_id_idx on public.attempt_answers (question_id);

create or replace function private.current_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles as p
  where p.user_id = (select auth.uid());
$$;

revoke all on function private.current_user_role() from public;
grant usage on schema private to authenticated;
grant execute on function private.current_user_role() to authenticated;

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_phone text;
  requested_name text;
  requested_grade text;
  parsed_grade smallint;
begin
  requested_phone := nullif(btrim(new.raw_user_meta_data ->> 'phone_number'), '');
  requested_name := nullif(btrim(new.raw_user_meta_data ->> 'display_name'), '');
  requested_grade := new.raw_user_meta_data ->> 'grade';

  if requested_phone is null
    or requested_phone !~ '^\+[1-9][0-9]{7,14}$' then
    raise exception 'A valid E.164 phone_number is required';
  end if;

  if requested_grade ~ '^[0-9]+$'
    and requested_grade::integer between 1 and 12 then
    parsed_grade := requested_grade::smallint;
  end if;

  insert into public.profiles (user_id, phone_number, display_name, role, grade)
  values (
    new.id,
    requested_phone,
    left(coalesce(requested_name, requested_phone), 120),
    'student',
    parsed_grade
  );

  return new;
end;
$$;

revoke all on function private.handle_new_auth_user() from public;

create or replace function private.protect_student_attempt_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.current_user_role() = 'student' then
    if tg_op = 'INSERT' then
      if new.status <> 'in_progress'
        or new.score is not null
        or new.max_score is not null
        or new.duration_seconds is not null
        or new.submitted_at is not null
        or new.submit_reason is not null then
        raise exception 'Students cannot set grading or submission fields when creating an attempt';
      end if;
    elsif new.student_id is distinct from old.student_id
      or new.exam_version_id is distinct from old.exam_version_id
      or new.started_at is distinct from old.started_at
      or new.deadline_at is distinct from old.deadline_at
      or new.score is distinct from old.score
      or new.max_score is distinct from old.max_score
      or new.duration_seconds is distinct from old.duration_seconds
      or old.status <> 'in_progress'
      or new.status not in ('in_progress', 'submitted', 'abandoned') then
      raise exception 'Students cannot change protected attempt fields';
    end if;
  end if;

  return new;
end;
$$;

create or replace function private.protect_student_answer_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.current_user_role() = 'student' then
    if new.is_correct is not null or new.awarded_points is not null then
      raise exception 'Students cannot set answer grading fields';
    end if;

    if tg_op = 'UPDATE'
      and (
        new.attempt_id is distinct from old.attempt_id
        or new.question_id is distinct from old.question_id
      ) then
      raise exception 'Students cannot move answers between attempts or questions';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.protect_student_attempt_write() from public;
revoke all on function private.protect_student_answer_write() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_auth_user();

create trigger attempts_protect_student_write
before insert or update on public.attempts
for each row execute function private.protect_student_attempt_write();

create trigger attempt_answers_protect_student_write
before insert or update on public.attempt_answers
for each row execute function private.protect_student_answer_write();

alter table public.profiles enable row level security;
alter table public.exams enable row level security;
alter table public.exam_versions enable row level security;
alter table public.questions enable row level security;
alter table public.assets enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_answers enable row level security;

revoke all on table public.profiles, public.exams, public.exam_versions,
  public.questions, public.assets, public.attempts, public.attempt_answers from anon;

grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.exams to authenticated;
grant select, insert, update, delete on table public.exam_versions to authenticated;
grant select, insert, update, delete on table public.questions to authenticated;
grant select, insert, update, delete on table public.assets to authenticated;
grant select, insert, update, delete on table public.attempts to authenticated;
grant select, insert, update, delete on table public.attempt_answers to authenticated;

create policy profiles_select
on public.profiles for select to authenticated
using (
  user_id = (select auth.uid())
  or (select private.current_user_role()) = 'admin'
);

create policy profiles_admin_update
on public.profiles for update to authenticated
using ((select private.current_user_role()) = 'admin')
with check ((select private.current_user_role()) = 'admin');

create policy exams_select
on public.exams for select to authenticated
using (status = 'published' or (select private.current_user_role()) = 'admin');

create policy exams_admin_insert
on public.exams for insert to authenticated
with check (
  (select private.current_user_role()) = 'admin'
  and created_by = (select auth.uid())
);

create policy exams_admin_update
on public.exams for update to authenticated
using ((select private.current_user_role()) = 'admin')
with check ((select private.current_user_role()) = 'admin');

create policy exams_admin_delete
on public.exams for delete to authenticated
using ((select private.current_user_role()) = 'admin');

create policy exam_versions_select
on public.exam_versions for select to authenticated
using (
  (select private.current_user_role()) = 'admin'
  or exists (
    select 1 from public.exams as e
    where e.id = exam_versions.exam_id and e.status = 'published'
  )
);

create policy exam_versions_admin_all
on public.exam_versions for all to authenticated
using ((select private.current_user_role()) = 'admin')
with check ((select private.current_user_role()) = 'admin');

create policy questions_select
on public.questions for select to authenticated
using (
  (select private.current_user_role()) = 'admin'
  or exists (
    select 1
    from public.exam_versions as v
    join public.exams as e on e.id = v.exam_id
    where v.id = questions.exam_version_id and e.status = 'published'
  )
);

create policy questions_admin_all
on public.questions for all to authenticated
using ((select private.current_user_role()) = 'admin')
with check ((select private.current_user_role()) = 'admin');

create policy assets_select
on public.assets for select to authenticated
using (
  (select private.current_user_role()) = 'admin'
  or exists (
    select 1
    from public.exam_versions as v
    join public.exams as e on e.id = v.exam_id
    where v.id = assets.exam_version_id and e.status = 'published'
  )
);

create policy assets_admin_all
on public.assets for all to authenticated
using ((select private.current_user_role()) = 'admin')
with check ((select private.current_user_role()) = 'admin');

create policy attempts_select
on public.attempts for select to authenticated
using (
  student_id = (select auth.uid())
  or (select private.current_user_role()) = 'admin'
);

create policy attempts_student_insert
on public.attempts for insert to authenticated
with check (
  (select private.current_user_role()) = 'student'
  and student_id = (select auth.uid())
  and exists (
    select 1
    from public.exam_versions as v
    join public.exams as e on e.id = v.exam_id
    where v.id = attempts.exam_version_id and e.status = 'published'
  )
);

create policy attempts_student_update
on public.attempts for update to authenticated
using (student_id = (select auth.uid()))
with check (student_id = (select auth.uid()));

create policy attempts_admin_all
on public.attempts for all to authenticated
using ((select private.current_user_role()) = 'admin')
with check ((select private.current_user_role()) = 'admin');

create policy attempt_answers_select
on public.attempt_answers for select to authenticated
using (
  (select private.current_user_role()) = 'admin'
  or exists (
    select 1 from public.attempts as a
    where a.id = attempt_answers.attempt_id
      and a.student_id = (select auth.uid())
  )
);

create policy attempt_answers_student_insert
on public.attempt_answers for insert to authenticated
with check (
  (select private.current_user_role()) = 'student'
  and exists (
    select 1
    from public.attempts as a
    join public.questions as q on q.id = attempt_answers.question_id
    where a.id = attempt_answers.attempt_id
      and a.student_id = (select auth.uid())
      and a.status = 'in_progress'
      and q.exam_version_id = a.exam_version_id
  )
);

create policy attempt_answers_student_update
on public.attempt_answers for update to authenticated
using (
  exists (
    select 1 from public.attempts as a
    where a.id = attempt_answers.attempt_id
      and a.student_id = (select auth.uid())
      and a.status = 'in_progress'
  )
)
with check (
  exists (
    select 1
    from public.attempts as a
    join public.questions as q on q.id = attempt_answers.question_id
    where a.id = attempt_answers.attempt_id
      and a.student_id = (select auth.uid())
      and a.status = 'in_progress'
      and q.exam_version_id = a.exam_version_id
  )
);

create policy attempt_answers_admin_all
on public.attempt_answers for all to authenticated
using ((select private.current_user_role()) = 'admin')
with check ((select private.current_user_role()) = 'admin');
