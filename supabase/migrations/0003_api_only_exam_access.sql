-- Exam content and attempts are served only by authenticated Next.js API routes.
-- The API uses the service role after verifying the caller and never returns
-- encrypted correct_key values before submission.
revoke all on table public.exams from authenticated;
revoke all on table public.exam_versions from authenticated;
revoke all on table public.questions from authenticated;
revoke all on table public.assets from authenticated;
revoke all on table public.attempts from authenticated;
revoke all on table public.attempt_answers from authenticated;

-- Profile lookup remains available so the server can resolve the caller role
-- through the cookie-bound authenticated client.
grant select on table public.profiles to authenticated;
