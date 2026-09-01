import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
}

async function main() {
  loadEnv();
  const { importBundledExam } = await import("../src/lib/exams/import-package");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Thiếu cấu hình Supabase trong .env.");
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: admin, error } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("role", "admin")
    .order("created_at")
    .limit(1)
    .single();
  if (error || !admin) throw error ?? new Error("Không tìm thấy admin.");
  const result = await importBundledExam(admin.user_id, {
    durationMinutes: 90,
    gradeMin: 1,
    gradeMax: 5,
  });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
