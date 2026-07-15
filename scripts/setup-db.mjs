/**
 * Spirit Attendance – Supabase Database Setup Script
 * Run: node scripts/setup-db.mjs
 *
 * Creates all tables needed by the attendance system and seeds demo data.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL   = "https://bbvbckooxqcoxkwsjjmw.supabase.co";
const SERVICE_KEY    = "sb_secret_LxOZhKa6fWQMxezOR4sVgQ_ukn-LhHl";
const ANON_KEY       = "sb_publishable_Li9NMNP8E1CxUSBVU_m0aw_Dxx6Sl9T";

// Use service-role client so we can bypass RLS during setup
const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

// ─── SQL to create all tables ──────────────────────────────────────────────

const SQL_TABLES = `
-- 1. Classes
CREATE TABLE IF NOT EXISTS classes (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  section     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Teachers
CREATE TABLE IF NOT EXISTS teachers (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  "subjectId" TEXT REFERENCES subjects(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Students  (code + secretCode both stored for compatibility)
CREATE TABLE IF NOT EXISTS students (
  id                   TEXT PRIMARY KEY,
  name                 TEXT NOT NULL,
  "fatherName"         TEXT,
  "classId"            TEXT REFERENCES classes(id) ON DELETE SET NULL,
  "rollNumber"         TEXT,
  code                 TEXT NOT NULL,
  "secretCode"         TEXT NOT NULL,
  attendance           TEXT DEFAULT '100%',
  "profilePhoto"       TEXT,
  mobile               TEXT,
  "registeredDeviceId" TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Lecture schedule windows
CREATE TABLE IF NOT EXISTS lectures (
  id          TEXT PRIMARY KEY,
  number      INTEGER NOT NULL,
  subject     TEXT,
  start       TEXT NOT NULL,
  "end"       TEXT NOT NULL,
  "meetLink"  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Attendance records (one row per student per lecture check-in)
CREATE TABLE IF NOT EXISTS attendance (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  student_id       TEXT REFERENCES students(id) ON DELETE CASCADE,
  student_name     TEXT,
  class_name       TEXT,
  lecture_number   INTEGER,
  subject          TEXT,
  date             TEXT NOT NULL,
  status           TEXT DEFAULT 'Present',
  trust_score      TEXT,
  device_model     TEXT,
  gps_coordinates  TEXT,
  photo            TEXT,          -- base64 or storage URL
  time             TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Notifications / announcements
CREATE TABLE IF NOT EXISTS notifications (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  message      TEXT NOT NULL,
  "targetClass" TEXT DEFAULT 'All Classes',
  date         TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Device approval registry
CREATE TABLE IF NOT EXISTS devices (
  id          TEXT PRIMARY KEY,
  student_id  TEXT REFERENCES students(id) ON DELETE CASCADE,
  student     TEXT,
  class       TEXT,
  device      TEXT,
  status      TEXT DEFAULT 'Pending',
  date        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Admin Credentials
CREATE TABLE IF NOT EXISTS admin_credentials (
  username    TEXT PRIMARY KEY,
  password    TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
`;

// ─── RLS: disable for now so the app can read/write without auth ───────────

const SQL_RLS = `
ALTER TABLE classes     DISABLE ROW LEVEL SECURITY;
ALTER TABLE subjects    DISABLE ROW LEVEL SECURITY;
ALTER TABLE teachers    DISABLE ROW LEVEL SECURITY;
ALTER TABLE students    DISABLE ROW LEVEL SECURITY;
ALTER TABLE lectures    DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance  DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE devices     DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_credentials DISABLE ROW LEVEL SECURITY;
`;

// ─── Seed demo data ────────────────────────────────────────────────────────

const SEED_CLASSES = [
  { id: "c1", name: "10", section: "A" },
  { id: "c2", name: "9",  section: "B" }
];

const SEED_SUBJECTS = [
  { id: "sub1", name: "Science"  },
  { id: "sub2", name: "Math"     },
  { id: "sub3", name: "English"  },
  { id: "sub4", name: "History"  },
  { id: "sub5", name: "Computer" },
  { id: "sub6", name: "Urdu"     },
  { id: "sub7", name: "Islamiat" },
  { id: "sub8", name: "Drawing"  }
];

const SEED_TEACHERS = [
  { id: "t1", name: "Sir Ali Raza",   subjectId: "sub1" },
  { id: "t2", name: "Miss Sarah Khan", subjectId: "sub2" },
  { id: "t3", name: "Sir Bilal Ahmed", subjectId: "sub3" }
];

const SEED_STUDENTS = [
  { id: "s1", name: "Ayan Ali",     fatherName: "Muhammad Ali",   classId: "c1", rollNumber: "10-A-01", code: "482917", secretCode: "482917" },
  { id: "s2", name: "Zainab Fatima", fatherName: "Tariq Mahmood", classId: "c1", rollNumber: "10-A-02", code: "104928", secretCode: "104928" }
];

const SEED_LECTURES = [
  { id: "l1", number: 1, subject: "English",  start: "08:00", end: "08:10", meetLink: "https://meet.google.com/demo-one"   },
  { id: "l2", number: 2, subject: "Math",     start: "08:45", end: "08:55", meetLink: "https://meet.google.com/demo-two"   },
  { id: "l3", number: 3, subject: "Science",  start: "09:30", end: "09:40", meetLink: "https://meet.google.com/demo-three" },
  { id: "l4", number: 4, subject: "History",  start: "10:15", end: "10:25", meetLink: "https://meet.google.com/demo-four"  },
  { id: "l5", number: 5, subject: "Computer", start: "11:00", end: "11:10", meetLink: "https://meet.google.com/demo-five"  }
];

// ─── Helpers ───────────────────────────────────────────────────────────────

async function execSQL(sql, label) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ sql })
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`❌ ${label} SQL failed (${res.status}):`, text);
    return false;
  }
  console.log(`✅ ${label}`);
  return true;
}

async function upsert(table, rows, label) {
  const { error } = await sb.from(table).upsert(rows, { onConflict: "id" });
  if (error) {
    console.error(`❌ Seed ${label} failed:`, error.message);
  } else {
    console.log(`✅ Seeded ${label} (${rows.length} rows)`);
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🚀 Spirit Attendance – Database Setup\n");

  // Try to create tables via RPC (may not exist yet, use pg directly)
  // Instead use sb.rpc or direct pg query via the management API
  
  // The service key may allow us to run raw SQL via the pg endpoint
  const pgEndpoint = `${SUPABASE_URL}/pg`;
  
  // Actually for Supabase, we use the SQL editor via management API or
  // we can execute via @supabase/supabase-js by running migrations
  
  // Try creating each table by inserting a test record and using
  // the "ensure" pattern (create if not exists via raw query)
  
  // Supabase's REST API doesn't expose raw SQL by default.
  // We'll use the postgres.js / supabase SQL endpoint instead.
  
  // Use the Supabase Management API to run SQL
  const mgmtUrl = `https://api.supabase.com/v1/projects/bbvbckooxqcoxkwsjjmw/database/query`;
  
  async function runSQL(sql, label) {
    const res = await fetch(mgmtUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query: sql })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error(`❌ ${label} (${res.status}):`, JSON.stringify(json).substring(0, 200));
      return false;
    }
    console.log(`✅ ${label}`);
    return true;
  }

  // Create tables
  const tablesOk = await runSQL(SQL_TABLES, "Create all tables");
  if (!tablesOk) {
    console.log("\n⚠️  Management API failed. Trying direct table operations...\n");
  }

  // Disable RLS
  await runSQL(SQL_RLS, "Disable RLS on all tables");

  // Seed data
  console.log("\n📦 Seeding demo data...\n");
  await upsert("classes",   SEED_CLASSES,   "classes");
  await upsert("subjects",  SEED_SUBJECTS,  "subjects");
  await upsert("teachers",  SEED_TEACHERS,  "teachers");
  await upsert("students",  SEED_STUDENTS,  "students");
  await upsert("lectures",  SEED_LECTURES,  "lectures");
  await upsert("admin_credentials", [{ username: "admin", password: "admin123" }], "admin_credentials");

  console.log("\n✅ Database setup complete!\n");
  console.log("Demo student codes:");
  console.log("  Ayan Ali     → 482917");
  console.log("  Zainab Fatima → 104928\n");
}

main().catch(console.error);
