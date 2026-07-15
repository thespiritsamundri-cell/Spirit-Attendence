-- ============================================================
-- SPIRIT ATTENDANCE SYSTEM — SUPABASE DATABASE MIGRATION
-- Run this entire script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bbvbckooxqcoxkwsjjmw/sql
-- ============================================================

-- 1. CLASSES
CREATE TABLE IF NOT EXISTS classes (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  section     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SUBJECTS
CREATE TABLE IF NOT EXISTS subjects (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TEACHERS
CREATE TABLE IF NOT EXISTS teachers (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  "subjectId"  TEXT REFERENCES subjects(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STUDENTS
CREATE TABLE IF NOT EXISTS students (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  "fatherName"          TEXT,
  "classId"             TEXT REFERENCES classes(id) ON DELETE SET NULL,
  "rollNumber"          TEXT,
  code                  TEXT NOT NULL,
  "secretCode"          TEXT NOT NULL,
  attendance            TEXT DEFAULT '100%',
  "profilePhoto"        TEXT,
  mobile                TEXT,
  "registeredDeviceId"  TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LECTURES
CREATE TABLE IF NOT EXISTS lectures (
  id           TEXT PRIMARY KEY,
  number       INTEGER NOT NULL,
  subject      TEXT,
  start        TEXT NOT NULL,
  "end"        TEXT NOT NULL,
  "meetLink"   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ATTENDANCE RECORDS
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
  photo            TEXT,
  time             TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id             TEXT PRIMARY KEY,
  title          TEXT NOT NULL,
  message        TEXT NOT NULL,
  "targetClass"  TEXT DEFAULT 'All Classes',
  date           TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DEVICES
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

-- DISABLE ROW LEVEL SECURITY (school-internal use)
ALTER TABLE classes       DISABLE ROW LEVEL SECURITY;
ALTER TABLE subjects      DISABLE ROW LEVEL SECURITY;
ALTER TABLE teachers      DISABLE ROW LEVEL SECURITY;
ALTER TABLE students      DISABLE ROW LEVEL SECURITY;
ALTER TABLE lectures      DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance    DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE devices       DISABLE ROW LEVEL SECURITY;

-- GRANT access to anon role (frontend reads/writes without auth)
GRANT ALL ON classes       TO anon, authenticated;
GRANT ALL ON subjects      TO anon, authenticated;
GRANT ALL ON teachers      TO anon, authenticated;
GRANT ALL ON students      TO anon, authenticated;
GRANT ALL ON lectures      TO anon, authenticated;
GRANT ALL ON attendance    TO anon, authenticated;
GRANT ALL ON notifications TO anon, authenticated;
GRANT ALL ON devices       TO anon, authenticated;

-- SEED DEMO DATA
INSERT INTO classes (id, name, section) VALUES
  ('c1', '10', 'A'), ('c2', '9', 'B')
ON CONFLICT (id) DO NOTHING;

INSERT INTO subjects (id, name) VALUES
  ('sub1','Science'),('sub2','Math'),('sub3','English'),
  ('sub4','History'),('sub5','Computer'),('sub6','Urdu'),
  ('sub7','Islamiat'),('sub8','Drawing')
ON CONFLICT (id) DO NOTHING;

INSERT INTO teachers (id, name, "subjectId") VALUES
  ('t1','Sir Ali Raza','sub1'),('t2','Miss Sarah Khan','sub2'),('t3','Sir Bilal Ahmed','sub3')
ON CONFLICT (id) DO NOTHING;

INSERT INTO students (id, name, "fatherName", "classId", "rollNumber", code, "secretCode") VALUES
  ('s1','Ayan Ali','Muhammad Ali','c1','10-A-01','482917','482917'),
  ('s2','Zainab Fatima','Tariq Mahmood','c1','10-A-02','104928','104928')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lectures (id, number, subject, start, "end", "meetLink") VALUES
  ('l1',1,'English','08:00','08:10','https://meet.google.com/demo-one'),
  ('l2',2,'Math','08:45','08:55','https://meet.google.com/demo-two'),
  ('l3',3,'Science','09:30','09:40','https://meet.google.com/demo-three'),
  ('l4',4,'History','10:15','10:25','https://meet.google.com/demo-four'),
  ('l5',5,'Computer','11:00','11:10','https://meet.google.com/demo-five')
ON CONFLICT (id) DO NOTHING;

-- 9. ADMIN CREDENTIALS
CREATE TABLE IF NOT EXISTS admin_credentials (
  username  TEXT PRIMARY KEY,
  password  TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_credentials DISABLE ROW LEVEL SECURITY;
GRANT ALL ON admin_credentials TO anon, authenticated;

INSERT INTO admin_credentials (username, password) VALUES
  ('admin', 'spirit533')
ON CONFLICT (username) DO NOTHING;

SELECT 'Spirit Attendance DB ready! 9 tables created.' AS status;
