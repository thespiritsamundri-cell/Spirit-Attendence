import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bbvbckooxqcoxkwsjjmw.supabase.co";
const SERVICE_KEY = "sb_secret_LxOZhKa6fWQMxezOR4sVgQ_ukn-LhHl";

async function main() {
  const sqlStatements = [
    `ALTER TABLE lectures ADD COLUMN IF NOT EXISTS "teacher" TEXT;`,
    `ALTER TABLE lectures ADD COLUMN IF NOT EXISTS "subjectSecondary" TEXT;`,
    `ALTER TABLE lectures ADD COLUMN IF NOT EXISTS "teacherSecondary" TEXT;`,
    `ALTER TABLE lectures ADD COLUMN IF NOT EXISTS "meetLinkSecondary" TEXT;`
  ];

  for (const sql of sqlStatements) {
    console.log(`Running: ${sql}`);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query: sql, sql: sql })
    });
    const text = await res.text();
    console.log(`Response status: ${res.status}`);
    console.log(`Response text: ${text}`);
  }
}

main().catch(console.error);
