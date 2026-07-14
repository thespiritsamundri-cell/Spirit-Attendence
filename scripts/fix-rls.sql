-- ============================================================
-- SPIRIT ATTENDANCE SYSTEM — SUPABASE RLS SECURITY BYPASS
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bbvbckooxqcoxkwsjjmw/sql
-- ============================================================

-- 1. DISABLE Row Level Security on all tables (recommended for internal school apps)
ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lectures DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices DISABLE ROW LEVEL SECURITY;

-- 2. CREATE permissive policies for all tables (as a double safety net if RLS remains enabled)

-- Students table policies
DROP POLICY IF EXISTS "Public Students Access" ON public.students;
CREATE POLICY "Public Students Access" ON public.students FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Classes table policies
DROP POLICY IF EXISTS "Public Classes Access" ON public.classes;
CREATE POLICY "Public Classes Access" ON public.classes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Subjects table policies
DROP POLICY IF EXISTS "Public Subjects Access" ON public.subjects;
CREATE POLICY "Public Subjects Access" ON public.subjects FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Teachers table policies
DROP POLICY IF EXISTS "Public Teachers Access" ON public.teachers;
CREATE POLICY "Public Teachers Access" ON public.teachers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Lectures table policies
DROP POLICY IF EXISTS "Public Lectures Access" ON public.lectures;
CREATE POLICY "Public Lectures Access" ON public.lectures FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Attendance table policies
DROP POLICY IF EXISTS "Public Attendance Access" ON public.attendance;
CREATE POLICY "Public Attendance Access" ON public.attendance FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Notifications table policies
DROP POLICY IF EXISTS "Public Notifications Access" ON public.notifications;
CREATE POLICY "Public Notifications Access" ON public.notifications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Devices table policies
DROP POLICY IF EXISTS "Public Devices Access" ON public.devices;
CREATE POLICY "Public Devices Access" ON public.devices FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 3. GRANT permissions to public roles (so API clients can read/write data)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres, service_role;

SELECT 'RLS Disabled & Public Permissions Enabled on all tables!' AS status;
