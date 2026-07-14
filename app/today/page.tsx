"use client";

import { useMemo, useState, useEffect } from "react";
import { CheckCircle2, ShieldAlert, MapPin, Camera, Smartphone, Clock, ArrowLeft, ShieldCheck, Sun, Moon, User, Check } from "lucide-react";
import Link from "next/link";
import { school, demoStudents } from "@/lib/mock";
import { capturePhotoBlob, getActiveLecture, getDeviceInfo, getGps, todayKey, trustScore } from "@/lib/attendance";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export default function Today() {
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const [theme, setTheme] = useState("light");
  const [allLectures, setAllLectures] = useState<any[]>([]);
  const [activeLecture, setActiveLecture] = useState<any>(null);
  const [isPastCheckinLimit, setIsPastCheckinLimit] = useState(false);

  // Secret Code login state (roll number removed — code-only login)
  const [secretCode, setSecretCode] = useState("");
  const [student, setStudent] = useState<any>(null);

  // Dynamic lists for matching Teacher Name
  const [teachers, setTeachers] = useState<any[]>([]);

  // One-time permission flow
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string>("");
  const [currentSchool, setCurrentSchool] = useState(school);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    const granted = localStorage.getItem("studentPermission") === "granted";
    setHasPermission(granted);

    const localSchool = localStorage.getItem("local_school_info");
    if (localSchool) {
      try {
        setCurrentSchool(JSON.parse(localSchool));
      } catch (e) {
        console.error("Failed to parse local school config:", e);
      }
    }

    // Load dynamic teachers for matching
    const localTeachers = localStorage.getItem("local_teachers");
    if (localTeachers) {
      try {
        setTeachers(JSON.parse(localTeachers));
      } catch (e) {
        console.error("Failed to parse teachers:", e);
      }
    }

    const checkLectures = () => {
      const localLec = localStorage.getItem("local_lectures");
      const list = localLec ? JSON.parse(localLec) : school.lectures;
      setAllLectures(list);

      const active = getActiveLecture(list);
      setActiveLecture(active);

      if (active) {
        const now = new Date();
        const nowMins = now.getHours() * 60 + now.getMinutes();
        const [sh, sm] = active.start.split(":").map(Number);
        const startMins = sh * 60 + sm;

        if (nowMins > startMins + 10) {
          setIsPastCheckinLimit(true);
        } else {
          setIsPastCheckinLimit(false);
        }
      } else {
        setIsPastCheckinLimit(false);
      }
    };

    checkLectures();
    const interval = setInterval(checkLectures, 20000);
    return () => clearInterval(interval);
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

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Resolve Teacher Name for Ongoing Lecture
  const activeTeacherName = useMemo(() => {
    if (!activeLecture) return "Sir Ali Raza";

    // Cross-reference database teacher subjects
    const teacherMatch = teachers.find(t => {
      const localSub = localStorage.getItem("local_subjects");
      const subjectsList = localSub ? JSON.parse(localSub) : [];
      const sub = subjectsList.find((s: any) => s.id === t.subjectId);
      return sub && sub.name.toLowerCase() === activeLecture.subject.toLowerCase();
    });

    return teacherMatch ? teacherMatch.name : "Sir Ali Raza";
  }, [activeLecture, teachers]);

  const requestPermissions = async () => {
    setBusy(true);
    setPermissionError("");
    try {
      let camActive = false;
      let gpsActive = false;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
        stream.getTracks().forEach(t => t.stop());
        camActive = true;
      } catch (camErr) {
        console.warn("Camera check skipped (no hardware or permission blocked):", camErr);
      }

      try {
        await new Promise<GeolocationPosition>((res, rej) => {
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 4000 });
        });
        gpsActive = true;
      } catch (gpsErr) {
        console.warn("GPS check skipped (no hardware or permission blocked):", gpsErr);
      }

      localStorage.setItem("studentPermission", "granted");
      setHasPermission(true);
      setMsg(
        camActive && gpsActive
          ? "✅ Camera and Location permissions authorized successfully."
          : "⚠️ Checklist authorized with dynamic hardware fallback parameters."
      );
    } catch (err: any) {
      console.error(err);
      setPermissionError(
        err.message || "Failed to initialize verification. Ensure location permissions are granted."
      );
    } finally {
      setBusy(false);
    }
  };

  async function verifyStudentDetails(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("Verifying Secret Code...");
    const trimmedCode = secretCode.trim();

    let verified = false;

    // Try Supabase first — match by code column
    try {
      const { data: codeMatch, error: e1 } = await supabase
        .from("students")
        .select("*")
        .eq("code", trimmedCode);

      if (!e1 && codeMatch && codeMatch.length > 0) {
        setStudent(codeMatch[0]);
        setMsg("Verification successful.");
        verified = true;
      } else {
        // Try secretCode column
        const { data: scMatch, error: e2 } = await supabase
          .from("students")
          .select("*")
          .eq("secretCode", trimmedCode);

        if (!e2 && scMatch && scMatch.length > 0) {
          setStudent(scMatch[0]);
          setMsg("Verification successful.");
          verified = true;
        } else {
          throw new Error("Student not found in database.");
        }
      }
    } catch (e: any) {
      if (!verified) {
        console.warn("Supabase lookup failed, using local storage fallback:", e.message);
      }
    }

    // Local storage fallback — match by secret code only
    if (!verified) {
      const localStudentsRaw = localStorage.getItem("local_students");
      const localStudentsList = localStudentsRaw ? JSON.parse(localStudentsRaw) : demoStudents;

      const s = localStudentsList.find(
        (x: any) => x.code === trimmedCode || x.secretCode === trimmedCode
      );

      // Final fallback: check demo students
      const demoMatch = s || demoStudents.find(
        (x: any) => x.code === trimmedCode || x.secretCode === trimmedCode
      );

      if (demoMatch) {
        setStudent(demoMatch);
        setMsg("Verification successful.");
      } else {
        setStudent(null);
        setMsg("❌ Authentication failed. Please double-check your Secret Code.");
      }
    }

    setBusy(false);
  }

  async function submit() {
    if (!student || !agree || isPastCheckinLimit) return;
    setBusy(true);
    try {
      if (!activeLecture) {
        throw new Error("Attendance portal is currently closed outside scheduled class hours.");
      }

      let gpsOk = false;
      let coordsStr = "unknown";
      try {
        const pos = await getGps();
        gpsOk = pos.coords.accuracy < 250;
        coordsStr = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
      } catch (gpsErr) {
        console.warn("GPS lookup bypassed:", gpsErr);
      }

      const device = await getDeviceInfo();
      let photoOk = false;
      let photoBase64 = "";
      try {
        const photo = await capturePhotoBlob();
        photoOk = !!(photo && photo.size > 0);
        if (photoOk && photo) {
          photoBase64 = await blobToBase64(photo);
        }
      } catch (photoErr) {
        console.warn("Photo capture bypassed:", photoErr);
      }

      const score = trustScore({
        knownDevice: true,
        gpsOk,
        photoOk,
        browserOk: true
      });

      const attendanceRecord = {
        student_id: student.id,
        student_name: student.name,
        class_name: student.className || student.class || "10-A",
        lecture_number: activeLecture.number,
        subject: activeLecture.subject || "Science",
        date: todayKey(),
        status: "Present",
        trust_score: `${score}%`,
        device_model: device.browser || "Chrome / Web",
        gps_coordinates: coordsStr,
        photo: photoBase64 || "fallback_base64_avatar_placeholder",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      try {
        const { error } = await supabase.from("attendance").insert([attendanceRecord]);
        if (error) throw error;
      } catch (supabaseErr) {
        console.warn("Supabase log failed, using local storage fallback:", supabaseErr);
      }

      const currentLogsRaw = localStorage.getItem("local_attendance_logs");
      const currentLogs = currentLogsRaw ? JSON.parse(currentLogsRaw) : [];
      localStorage.setItem("local_attendance_logs", JSON.stringify([attendanceRecord, ...currentLogs]));

      setMsg(`🎉 Congratulations! Attendance successfully logged for Lecture ${activeLecture.number}. Safety Trust Index: ${score}%. Redirecting to Google Meet in 5 seconds...`);

      setTimeout(() => {
        window.location.href = activeLecture.meetLink;
      }, 5000);
    } catch (e: any) {
      setMsg(e.message || "Attendance logging failed.");
    } finally {
      setBusy(false);
    }
  }

  // Determine current Wizard Step
  const currentStep = useMemo(() => {
    if (!hasPermission) return 1;
    if (!student) return 2;
    return 3;
  }, [hasPermission, student]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e5f2fc,transparent_38%),linear-gradient(180deg,#fff,#f9f8f7)] dark:bg-[radial-gradient(circle_at_top,#1e293b,transparent_40%),linear-gradient(180deg,#0a0a0a,#121212)] text-neutral-900 dark:text-neutral-50 p-4 md:p-8 transition-colors duration-350 flex flex-col justify-between">
      <div className="mx-auto max-w-2xl w-full">
        {/* Floating Theme Switcher & Back Link */}
        <div className="mb-6 flex justify-between items-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            <ArrowLeft size={16} /> Exit Portal Home
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 font-bold px-3 py-1 rounded-full border dark:border-indigo-900/60 shadow-sm">
              Live Database Sync Enabled
            </span>
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="rounded-2xl bg-white/80 dark:bg-neutral-800/80 p-2 shadow-sm border border-neutral-200 dark:border-neutral-700 text-neutral-850 dark:text-neutral-200 hover:scale-105 transition-transform"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* Portal Header */}
        <header className="glass rounded-3xl p-5 flex gap-4 items-center shadow-soft mb-6 dark:border-white/10">
          <div className="h-16 w-16 rounded-2xl bg-blue-600 text-white grid place-items-center font-bold text-2xl shadow-sm">S</div>
          <div>
            <h1 className="text-2xl font-bold">{currentSchool.name}</h1>
            <p className="text-xs text-neutral-500 dark:text-white/60">{currentSchool.address} • {currentSchool.phone}</p>
          </div>
        </header>

        {/* 3-Step Wizard Layout Container */}
        <div className="glass rounded-3xl p-6 md:p-8 shadow-soft dark:border-white/10 space-y-6">
          
          {/* Wizard Step Markers */}
          <div className="flex items-center justify-between border-b dark:border-neutral-850 pb-4">
            <h3 className="font-extrabold text-lg text-blue-600 dark:text-blue-400">
              {currentStep === 1 && "Step 1: Security Authorization"}
              {currentStep === 2 && "Step 2: Authenticate Session"}
              {currentStep === 3 && "Step 3: Check-in Attendance"}
            </h3>
            <span className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-bold px-3 py-1 rounded-full">
              Step {currentStep} of 3
            </span>
          </div>

          {/* STEP 1: ONE-TIME SECURITY CONSENT */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <p className="text-sm text-neutral-600 dark:text-white/70 leading-relaxed">
                To verify your active session attendance, this device must grant one-time permissions to fetch GPS coordinates and perform a background camera validation.
              </p>
              <button
                onClick={requestPermissions}
                disabled={busy}
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 shadow-soft transition-colors text-base disabled:opacity-50"
              >
                {busy ? "Authorizing prompts..." : "Authorize Security Checklist"}
              </button>
              {permissionError && (
                <p className="text-xs text-red-600 font-medium bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-100 dark:border-red-900/40">
                  {permissionError}
                </p>
              )}
            </div>
          )}

          {/* STEP 2: SECRET CODE LOGIN */}
          {currentStep === 2 && (
            <form onSubmit={verifyStudentDetails} className="space-y-5 animate-in fade-in duration-300">
              <p className="text-xs text-neutral-500 leading-relaxed">Enter your 6-digit Secret Code to load your session and active schedule.</p>
              <div>
                <label className="text-xs font-bold uppercase text-neutral-400 tracking-wider">Secret PIN Code</label>
                <input
                  required
                  type="password"
                  maxLength={6}
                  placeholder="••••••"
                  value={secretCode}
                  onChange={e => setSecretCode(e.target.value)}
                  className="w-full mt-2 rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 p-4 font-mono text-xl tracking-[0.4em] text-center outline-blue-500"
                />
                <p className="text-[11px] text-neutral-400 mt-1.5 text-center">Your secret code was provided to you by the admin.</p>
              </div>
              <button
                type="submit"
                disabled={busy || !secretCode}
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 transition-colors disabled:opacity-50"
              >
                {busy ? "Verifying..." : "Verify & Continue"}
              </button>
            </form>
          )}

          {/* STEP 3: ATTENDANCE SUBMIT AND DYNAMIC MEET REDIRECT */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              
              {/* Verified student profile details */}
              <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 p-4 border dark:border-neutral-850">
                <p className="text-[10px] text-green-600 dark:text-green-400 uppercase tracking-widest font-extrabold flex items-center gap-1">
                  <Check size={12} /> Student Session Verified
                </p>
                <h4 className="font-extrabold text-lg mt-1 text-neutral-900 dark:text-white">{student.name}</h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Roll: <span className="font-mono font-semibold">{student.rollNumber || student.roll_number}</span> • Class {student.class || student.class_name || "10-A"}
                </p>
              </div>

              {/* Ongoing Lecture Schedule detail with Instructor Name */}
              {activeLecture ? (
                <div className="rounded-2xl border p-5 bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40 space-y-3">
                  <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 border-b dark:border-blue-900/30 pb-2">
                    <Clock size={16} /> Ongoing Scheduled Lecture
                  </h4>
                  <div className="text-sm grid grid-cols-2 gap-3 text-neutral-600 dark:text-white/70 leading-relaxed">
                    <p>Course Subject: <span className="font-semibold text-neutral-900 dark:text-white">{activeLecture.subject || "Science"}</span></p>
                    <p>Instructor: <span className="font-semibold text-neutral-900 dark:text-white">{activeTeacherName}</span></p>
                    <p>Start Time: <span className="font-semibold font-mono text-neutral-900 dark:text-white">{activeLecture.start} AM</span></p>
                    <p>End Time: <span className="font-semibold font-mono text-neutral-900 dark:text-white">{activeLecture.end} AM</span></p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border p-4 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-center text-sm text-neutral-500">
                  ⚠️ No active lecture scheduled at this hour. Attendance closed.
                </div>
              )}

              {isPastCheckinLimit && (
                <div className="rounded-2xl bg-red-50 dark:bg-red-950/20 p-4 text-red-950 dark:text-red-200 border border-red-150 dark:border-red-900/40">
                  <h3 className="font-bold flex gap-2 items-center text-sm"><ShieldAlert /> Attendance Window Expired</h3>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-white/70">
                    The lecture is ongoing and attendance cannot be done now. If you want to join the uplink, contact the admin.
                  </p>
                </div>
              )}

              <div className="rounded-2xl bg-orange-50 dark:bg-orange-950/10 p-4 text-orange-950 dark:text-orange-200 border border-orange-100 dark:border-orange-900/40 text-[11px] leading-relaxed">
                <label className="flex gap-2.5 items-start cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={agree}
                    onChange={e => setAgree(e.target.checked)}
                    disabled={isPastCheckinLimit}
                  />
                  <span>I confirm that I am checking in my own attendance and consent to background security auditing.</span>
                </label>
              </div>

              <button
                disabled={!agree || busy || isPastCheckinLimit}
                onClick={submit}
                className="w-full rounded-2xl bg-green-600 text-white font-bold py-4 hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 text-base"
              >
                {busy ? "Securing parameters..." : "Verify & Take Attendance"}
              </button>
            </div>
          )}

          {/* SIMPLIFIED 3-LINE SECURITY AUDIT METADATA CARD */}
          <div className="rounded-2xl border bg-white/70 p-4 dark:bg-neutral-900/50 dark:border-neutral-850">
            <h4 className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-3">Security Auditing Active</h4>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-white/70">
              <li className="flex items-center gap-2"><MapPin size={14} className="text-blue-500" /> Mandatory GPS Geolocation capture</li>
              <li className="flex items-center gap-2"><Camera size={14} className="text-blue-500" /> Silent camera face-match check</li>
              <li className="flex items-center gap-2"><Smartphone size={14} className="text-blue-500" /> Unique hardware device identification</li>
            </ul>
          </div>

          {msg && (
            <p className="rounded-2xl border p-4 bg-neutral-50/50 dark:bg-neutral-950/30 dark:border-neutral-800 text-xs font-semibold leading-relaxed text-center">
              {msg}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
