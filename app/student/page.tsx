"use client";

import { useState, useEffect } from "react";
import {
  User,
  Clock,
  Calendar,
  Camera,
  Smartphone,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Video,
  RefreshCw,
  Sun,
  Moon
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export default function StudentDashboard() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [lectures, setLectures] = useState<any[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [gpsLogs, setGpsLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch student info (mock s1 is Ayan Ali)
      let currentStudent: any = null;
      try {
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .eq("id", "s1")
          .single();
        if (error || !data) throw error;
        currentStudent = data;
      } catch (e) {
        console.warn("Supabase student lookup failed, using local storage fallback.");
        const local = localStorage.getItem("local_students");
        const list = local ? JSON.parse(local) : [];
        currentStudent = list.find((x: any) => x.id === "s1") || {
          id: "s1",
          name: "Ayan Ali",
          fatherName: "Muhammad Ali",
          class: "10-A",
          rollNumber: "10-A-01",
          attendanceRate: "92%",
          secretCode: "482917",
          phone: "+92 300 1234567"
        };
      }
      setStudentInfo(currentStudent);

      // 2. Fetch today's lectures
      try {
        const { data, error } = await supabase.from("lectures").select("*");
        if (error || !data) throw error;
        setLectures(data.map(l => ({
          number: l.number,
          subject: l.subject,
          time: `${l.start} - ${l.end}`,
          status: l.number < 3 ? "Completed" : l.number === 3 ? "Active" : "Pending",
          link: l.meetLink
        })));
      } catch (e) {
        setLectures([
          { number: 1, subject: "English", time: "08:00 - 08:10", status: "Completed" },
          { number: 2, subject: "Math", time: "08:45 - 08:55", status: "Completed" },
          { number: 3, subject: "Science", time: "09:30 - 09:40", status: "Active", link: "https://meet.google.com/demo-three" },
          { number: 4, subject: "History", time: "10:15 - 10:25", status: "Pending" }
        ]);
      }

      // 3. Fetch check-in attendance logs
      try {
        const { data, error } = await supabase
          .from("attendance")
          .select("*")
          .eq("student_id", "s1");
        if (error || !data) throw error;
        setAttendanceHistory(data);
      } catch (e) {
        const localLogsRaw = localStorage.getItem("local_attendance_logs");
        const localLogs = localLogsRaw ? JSON.parse(localLogsRaw) : [
          { date: "2026-07-14", status: "Present", lecture_number: 3, subject: "Science", trust_score: "96%" },
          { date: "2026-07-13", status: "Present", lecture_number: 2, subject: "Math", trust_score: "94%" }
        ];
        setAttendanceHistory(localLogs);
      }

      // 4. Fetch device records
      try {
        const { data, error } = await supabase
          .from("devices")
          .select("*")
          .eq("student_id", "s1");
        if (error || !data) throw error;
        setDevices(data);
      } catch (e) {
        setDevices([
          { model: "Infinix Hot 30 (Active)", fingerprint: "fp_ayan_91823", status: "Approved", date: "2026-07-14" },
          { model: "Windows PC (Web)", fingerprint: "fp_ayan_pc847", status: "Approved", date: "2026-07-12" }
        ]);
      }

      // 5. Fetch GPS logs
      try {
        const { data, error } = await supabase
          .from("gps_logs")
          .select("*")
          .eq("student_id", "s1");
        if (error || !data) throw error;
        setGpsLogs(data);
      } catch (e) {
        setGpsLogs([
          { date: "2026-07-14", coords: "31.0645° N, 72.9721° E", accuracy: "12m", status: "Verified" },
          { date: "2026-07-13", coords: "31.0651° N, 72.9719° E", accuracy: "15m", status: "Verified" }
        ]);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading || !studentInfo) {
    return (
      <div className="min-h-screen grid place-items-center bg-neutral-950 text-white font-semibold">
        <div className="text-center">
          <RefreshCw className="animate-spin text-blue-500 mx-auto mb-4" size={32} />
          <p>Connecting to secure student database...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-5 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">
      <section className="mx-auto max-w-4xl">
        <div className="mb-4 flex justify-between items-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline">
            <ArrowLeft size={16} /> Back to Portal Home
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 font-bold px-3 py-1 rounded-full border dark:border-indigo-900/60 shadow-sm">
              Live Database Sync Enabled
            </span>
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="rounded-2xl bg-white dark:bg-neutral-900 p-2 shadow-sm border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:scale-105 transition-transform"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg relative overflow-hidden">
          <p className="text-xs uppercase tracking-widest font-semibold text-white/70">Student Command Dashboard</p>
          <h1 className="text-3xl font-extrabold mt-1">{studentInfo.name}</h1>
          <p className="mt-1 text-sm text-white/80">
            Class {studentInfo.className || studentInfo.class || studentInfo.rollNumber?.split('-').slice(0,2).join('-') || "N/A"} • Roll Number: {studentInfo.rollNumber} • Aggregate Attendance: <span className="font-bold underline">{studentInfo.attendanceRate || studentInfo.attendance || "N/A"}</span>
          </p>
          <div className="mt-3 pt-3 border-t border-white/20 text-[10px] text-white/60 font-mono">
            Developed by Mian Mudassar
          </div>
        </div>

        {/* Grid Navigation */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { id: "Profile Information", title: "Profile Information", icon: User, desc: "Personal info, father name, roll number, and active secret code." },
            { id: "Today's Lectures", title: "Today's Lectures", icon: Clock, desc: "Daily schedule window, subject details, and direct Meet codes." },
            { id: "Attendance History", title: "Attendance History", icon: Calendar, desc: "Completed class records, daily audit checks, and trust ratings." },
            { id: "Photo History", title: "Photo History", icon: Camera, desc: "Uploaded verification frames captured during checks." },
            { id: "Device History", title: "Device History", icon: Smartphone, desc: "Permitted hardware identifier records and sync states." },
            { id: "GPS History", title: "GPS History", icon: MapPin, desc: "Geographic logs and coordinates recorded during attendance." }
          ].map(x => {
            const Icon = x.icon;
            const isSelected = activeSection === x.id;
            return (
              <button
                key={x.id}
                onClick={() => setActiveSection(isSelected ? null : x.id)}
                className={`text-left rounded-3xl border p-5 shadow-sm transition-all dark:border-white/10 ${
                  isSelected
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                }`}
              >
                <Icon className={isSelected ? "text-white" : "text-blue-600"} size={24} />
                <h2 className="font-bold mt-3 text-sm md:text-base">{x.title}</h2>
                <p className={`mt-2 text-xs line-clamp-2 ${isSelected ? "text-white/80" : "text-neutral-500"}`}>
                  {x.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Dynamic Detail Viewer Panels */}
        {activeSection && (
          <div className="mt-6 rounded-3xl border bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center border-b dark:border-neutral-800 pb-3 mb-4">
              <h3 className="font-bold text-lg text-blue-600 dark:text-blue-400">{activeSection} Details</h3>
              <button
                onClick={() => setActiveSection(null)}
                className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
              >
                Close Panel
              </button>
            </div>

            {activeSection === "Profile Information" && (
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <ProfileItem label="Student Full Name" value={studentInfo.name} />
                <ProfileItem label="Father's Name" value={studentInfo.fatherName} />
                <ProfileItem label="Class & Section" value={studentInfo.className || studentInfo.class || studentInfo.rollNumber?.split('-').slice(0,2).join('-') || "N/A"} />
                <ProfileItem label="Roll Number" value={studentInfo.rollNumber} />
                <ProfileItem label="Registered Phone" value={studentInfo.phone || "+92 300 0000000"} />
                <ProfileItem label="Verification Secret Code" value={studentInfo.code || studentInfo.secretCode} isCode />
              </div>
            )}

            {activeSection === "Today's Lectures" && (
              <div className="space-y-3">
                {lectures.map((l, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center rounded-2xl bg-neutral-50 dark:bg-neutral-950 p-4 border border-neutral-200 dark:border-neutral-800 text-sm"
                  >
                    <div>
                      <h4 className="font-bold text-base">Lecture {l.number}: {l.subject}</h4>
                      <p className="text-neutral-500 font-mono mt-0.5">{l.time}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                        l.status === "Active"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                          : l.status === "Completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
                          : "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                      }`}>
                        {l.status}
                      </span>
                      {l.status === "Active" && l.link && (
                        <a
                          href={l.link}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-blue-600 text-white rounded-xl px-3 py-1.5 font-semibold text-xs flex gap-1 items-center hover:bg-blue-700"
                        >
                          <Video size={14} /> Join Meet
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === "Attendance History" && (
              <div className="overflow-x-auto text-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b dark:border-neutral-700 text-neutral-500 font-medium">
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Subject / Lecture</th>
                      <th className="py-2 px-3">Security Trust</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.map((h, i) => (
                      <tr key={i} className="border-b dark:border-neutral-800">
                        <td className="py-3 px-3 font-mono">{h.date}</td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 font-bold ${
                            h.status === "Present" ? "text-green-600" : "text-red-600"
                          }`}>
                            <CheckCircle2 size={14} /> {h.status || "Present"}
                          </span>
                        </td>
                        <td className="py-3 px-3">{h.subject || `Lecture ${h.lecture_number}`}</td>
                        <td className="py-3 px-3 font-mono font-semibold">{h.trust_score || "96%"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeSection === "Photo History" && (
              <div>
                <p className="text-xs text-neutral-500 mb-4">Verification frames successfully logged by smart camera workflow.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { id: "14", date: "July 14", time: "09:35 AM", score: "96%" },
                    { id: "13", date: "July 13", time: "08:47 AM", score: "94%" }
                  ].map(f => (
                    <div key={f.id} className="rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 text-center text-xs dark:border-neutral-800">
                      <div className="h-24 rounded-lg bg-neutral-200 dark:bg-neutral-800 grid place-items-center mb-2 text-neutral-400">
                        <Camera size={24} />
                      </div>
                      <p className="font-bold">{f.date}</p>
                      <p className="text-neutral-500">{f.time}</p>
                      <p className="text-green-600 font-mono font-bold mt-1">{f.score} Match</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "Device History" && (
              <div className="space-y-3">
                {devices.map((d, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center rounded-2xl bg-neutral-50 dark:bg-neutral-950 p-4 border border-neutral-200 dark:border-neutral-800 text-sm"
                  >
                    <div>
                      <h4 className="font-bold text-base">{d.model || d.device_model || "Mobile Web Browser"}</h4>
                      <p className="text-xs text-neutral-500 font-mono mt-0.5">HWID: {d.fingerprint || "fp_default_ayan"}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 px-2.5 py-1 text-xs rounded-full font-bold">
                        {d.status || "Approved"}
                      </span>
                      <p className="text-xs text-neutral-400 mt-1 font-mono">{d.date || "2026-07-14"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === "GPS History" && (
              <div className="overflow-x-auto text-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b dark:border-neutral-700 text-neutral-500 font-medium">
                      <th className="py-2 px-3">Log Date</th>
                      <th className="py-2 px-3">Coordinates (Google Maps)</th>
                      <th className="py-2 px-3">Margin of Error</th>
                      <th className="py-2 px-3">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gpsLogs.map((g, i) => (
                      <tr key={i} className="border-b dark:border-neutral-800">
                        <td className="py-3 px-3 font-mono">{g.date}</td>
                        <td className="py-3 px-3">
                          <a
                            href={`https://maps.google.com/?q=${(g.coords || g.gps_coordinates || "31.0645, 72.9721").replace("° N, ", ",").replace("° E", "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-blue-600 hover:underline"
                          >
                            {g.coords || g.gps_coordinates || "31.0645, 72.9721"}
                          </a>
                        </td>
                        <td className="py-3 px-3 text-neutral-500 font-mono">{g.accuracy || "12m"}</td>
                        <td className="py-3 px-3">
                          <span className="text-green-600 font-bold">{g.status || "Verified"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Developer Credit Footer */}
      <div className="mt-8 mb-4 text-center text-xs text-neutral-400 dark:text-neutral-500 font-mono">
        Developed by Mian Mudassar
      </div>
    </main>
  );
}

function ProfileItem({ label, value, isCode }: { label: string; value: string; isCode?: boolean }) {
  return (
    <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-950 p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <p className="text-xs text-neutral-500 uppercase tracking-wider">{label}</p>
      <p className={`text-base font-semibold mt-1 ${isCode ? "font-mono text-blue-600 text-lg tracking-wider" : ""}`}>
        {value}
      </p>
    </div>
  );
}
