-- Mathiz initial schema for Supabase PostgreSQL.
-- This migration creates structure and parent-only RLS policies; it contains no seed data.

create extension if not exists pgcrypto;

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

comment on function public.set_updated_at() is
  'Shared trigger function that refreshes updated_at before a row update.';

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 120),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.families is 'A private household that owns Mathiz content and learning records.';

create table public.parent_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  display_name text not null check (length(btrim(display_name)) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.parent_profiles is 'Parent-facing profile linked one-to-one with a Supabase Auth user.';

create table public.children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  nickname text not null check (length(btrim(nickname)) between 1 and 80),
  grade smallint not null check (grade between 1 and 12),
  pin_hash text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.children is 'Child profile owned by a family; it is not an Auth identity.';
comment on column public.children.pin_hash is 'Optional server-generated PIN hash; never store a plaintext PIN.';

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
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

comment on table public.exams is 'Stable exam metadata shared by all immutable exam versions.';
comment on column public.exams.current_version_id is 'Version currently selected for delivery; constrained to the same exam after exam_versions exists.';
comment on column public.exams.rights_note is 'Provenance or usage-rights note supplied by the parent.';

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

comment on table public.exam_versions is 'Versioned exam content; published versions are treated as immutable by the application.';
comment on column public.exam_versions.scoring_policy is 'JSON object describing scoring rules for this version.';
comment on column public.exam_versions.raw_source_path is 'Future private Storage path for the normalized source file.';

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

comment on table public.questions is 'Ordered single-answer questions belonging to one exam version.';
comment on column public.questions.options is 'JSON array or object containing normalized answer options.';
comment on column public.questions.points_wrong is 'Non-negative deduction magnitude; interpretation belongs to scoring_policy.';

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

comment on table public.assets is 'Metadata for future private Storage objects used by an exam version.';

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete restrict,
  exam_version_id uuid not null references public.exam_versions(id) on delete restrict,
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted', 'graded', 'abandoned')),
  started_at timestamptz not null default now(),
  deadline_at timestamptz,
  submitted_at timestamptz,
  score numeric(10, 2) check (score >= 0),
  max_score numeric(10, 2) check (max_score >= 0),
  duration_seconds integer check (duration_seconds >= 0),
  submit_reason text check (submit_reason in ('manual', 'timeout', 'parent', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attempts_deadline_valid check (deadline_at is null or deadline_at >= started_at),
  constraint attempts_submission_valid check (submitted_at is null or submitted_at >= started_at),
  constraint attempts_score_valid check (score is null or max_score is null or score <= max_score)
);

comment on table public.attempts is 'One child attempt against a fixed exam version.';
comment on column public.attempts.submit_reason is 'Reason an attempt ended; null while the attempt remains open.';

create table public.attempt_answers (
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  selected_key text,
  answered_at timestamptz,
  is_correct boolean,
  awarded_points numeric(10, 2) check (awarded_points >= 0),
  primary key (attempt_id, question_id)
);

comment on table public.attempt_answers is 'Latest saved answer and grading result for one question in an attempt.';

create trigger families_set_updated_at
before update on public.families
for each row execute function public.set_updated_at();

create trigger parent_profiles_set_updated_at
before update on public.parent_profiles
for each row execute function public.set_updated_at();

create trigger children_set_updated_at
before update on public.children
for each row execute function public.set_updated_at();

create trigger exams_set_updated_at
before update on public.exams
for each row execute function public.set_updated_at();

create trigger attempts_set_updated_at
before update on public.attempts
for each row execute function public.set_updated_at();

create index families_created_by_idx on public.families (created_by);
create index parent_profiles_family_id_idx on public.parent_profiles (family_id);
create index children_family_id_active_idx on public.children (family_id, is_active);
create index exams_family_id_status_idx on public.exams (family_id, status);
create index exams_created_by_idx on public.exams (created_by);
create index exams_current_version_id_idx on public.exams (current_version_id);
create index exam_versions_exam_id_created_at_idx on public.exam_versions (exam_id, created_at desc);
create index exam_versions_created_by_idx on public.exam_versions (created_by);
create index questions_exam_version_id_idx on public.questions (exam_version_id);
create index assets_exam_version_id_idx on public.assets (exam_version_id);
create index attempts_child_id_started_at_idx on public.attempts (child_id, started_at desc);
create index attempts_exam_version_id_idx on public.attempts (exam_version_id);
create index attempts_status_idx on public.attempts (status);
create index attempt_answers_question_id_idx on public.attempt_answers (question_id);

-- Security-definer helpers avoid recursive parent_profiles policies. Their empty
-- search_path ensures no caller-controlled object can shadow referenced objects.
create schema if not exists private;

create or replace function private.current_user_family_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.family_id
  from public.parent_profiles as p
  where p.user_id = (select auth.uid())
  union
  select f.id
  from public.families as f
  where f.created_by = (select auth.uid());
$$;

comment on function private.current_user_family_ids() is
  'Returns families available to the authenticated parent without invoking RLS recursively.';

revoke all on function private.current_user_family_ids() from public;
grant usage on schema private to authenticated;
grant execute on function private.current_user_family_ids() to authenticated;

alter table public.families enable row level security;
alter table public.parent_profiles enable row level security;
alter table public.children enable row level security;
alter table public.exams enable row level security;
alter table public.exam_versions enable row level security;
alter table public.questions enable row level security;
alter table public.assets enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_answers enable row level security;

revoke all on table public.families from anon;
revoke all on table public.parent_profiles from anon;
revoke all on table public.children from anon;
revoke all on table public.exams from anon;
revoke all on table public.exam_versions from anon;
revoke all on table public.questions from anon;
revoke all on table public.assets from anon;
revoke all on table public.attempts from anon;
revoke all on table public.attempt_answers from anon;

grant select, insert, update, delete on table public.families to authenticated;
grant select, insert, update, delete on table public.parent_profiles to authenticated;
grant select, insert, update, delete on table public.children to authenticated;
grant select, insert, update, delete on table public.exams to authenticated;
grant select, insert, update, delete on table public.exam_versions to authenticated;
grant select, insert, update, delete on table public.questions to authenticated;
grant select, insert, update, delete on table public.assets to authenticated;
grant select, insert, update, delete on table public.attempts to authenticated;
grant select, insert, update, delete on table public.attempt_answers to authenticated;

create policy families_select
on public.families for select to authenticated
using (id in (select private.current_user_family_ids()));

create policy families_insert
on public.families for insert to authenticated
with check (created_by = (select auth.uid()));

create policy families_update
on public.families for update to authenticated
using (id in (select private.current_user_family_ids()))
with check (id in (select private.current_user_family_ids()));

create policy families_delete
on public.families for delete to authenticated
using (created_by = (select auth.uid()));

create policy parent_profiles_select
on public.parent_profiles for select to authenticated
using (
  user_id = (select auth.uid())
  and family_id in (select private.current_user_family_ids())
);

create policy parent_profiles_insert
on public.parent_profiles for insert to authenticated
with check (
  user_id = (select auth.uid())
  and family_id in (select private.current_user_family_ids())
);

create policy parent_profiles_update
on public.parent_profiles for update to authenticated
using (user_id = (select auth.uid()))
with check (
  user_id = (select auth.uid())
  and family_id in (select private.current_user_family_ids())
);

create policy parent_profiles_delete
on public.parent_profiles for delete to authenticated
using (user_id = (select auth.uid()));

create policy children_parent_access
on public.children for all to authenticated
using (family_id in (select private.current_user_family_ids()))
with check (family_id in (select private.current_user_family_ids()));

create policy exams_parent_access
on public.exams for all to authenticated
using (family_id in (select private.current_user_family_ids()))
with check (family_id in (select private.current_user_family_ids()));

create policy exam_versions_parent_access
on public.exam_versions for all to authenticated
using (
  exists (
    select 1 from public.exams as e
    where e.id = exam_versions.exam_id
      and e.family_id in (select private.current_user_family_ids())
  )
)
with check (
  exists (
    select 1 from public.exams as e
    where e.id = exam_versions.exam_id
      and e.family_id in (select private.current_user_family_ids())
  )
);

create policy questions_parent_access
on public.questions for all to authenticated
using (
  exists (
    select 1
    from public.exam_versions as v
    join public.exams as e on e.id = v.exam_id
    where v.id = questions.exam_version_id
      and e.family_id in (select private.current_user_family_ids())
  )
)
with check (
  exists (
    select 1
    from public.exam_versions as v
    join public.exams as e on e.id = v.exam_id
    where v.id = questions.exam_version_id
      and e.family_id in (select private.current_user_family_ids())
  )
);

create policy assets_parent_access
on public.assets for all to authenticated
using (
  exists (
    select 1
    from public.exam_versions as v
    join public.exams as e on e.id = v.exam_id
    where v.id = assets.exam_version_id
      and e.family_id in (select private.current_user_family_ids())
  )
)
with check (
  exists (
    select 1
    from public.exam_versions as v
    join public.exams as e on e.id = v.exam_id
    where v.id = assets.exam_version_id
      and e.family_id in (select private.current_user_family_ids())
  )
);

create policy attempts_parent_access
on public.attempts for all to authenticated
using (
  exists (
    select 1
    from public.children as c
    join public.exam_versions as v on v.id = attempts.exam_version_id
    join public.exams as e on e.id = v.exam_id
    where c.id = attempts.child_id
      and e.family_id = c.family_id
      and c.family_id in (select private.current_user_family_ids())
  )
)
with check (
  exists (
    select 1
    from public.children as c
    join public.exam_versions as v on v.id = attempts.exam_version_id
    join public.exams as e on e.id = v.exam_id
    where c.id = attempts.child_id
      and e.family_id = c.family_id
      and c.family_id in (select private.current_user_family_ids())
  )
);

create policy attempt_answers_parent_access
on public.attempt_answers for all to authenticated
using (
  exists (
    select 1
    from public.attempts as a
    join public.children as c on c.id = a.child_id
    join public.questions as q on q.id = attempt_answers.question_id
    where a.id = attempt_answers.attempt_id
      and q.exam_version_id = a.exam_version_id
      and c.family_id in (select private.current_user_family_ids())
  )
)
with check (
  exists (
    select 1
    from public.attempts as a
    join public.children as c on c.id = a.child_id
    join public.questions as q on q.id = attempt_answers.question_id
    where a.id = attempt_answers.attempt_id
      and q.exam_version_id = a.exam_version_id
      and c.family_id in (select private.current_user_family_ids())
  )
);
