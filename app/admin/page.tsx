"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  Users,
  ShieldAlert,
  MapPinned,
  Camera,
  Smartphone,
  School,
  LogOut,
  Check,
  X,
  Shield,
  Clock,
  MapPin,
  RefreshCw,
  Save,
  BookOpen,
  Plus,
  Trash2,
  Lock,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  Search,
  TrendingUp,
  AlertTriangle,
  Printer,
  Edit,
  Megaphone,
  Sun,
  Moon,
  ShieldCheck,
  Eye,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

// Initialize Supabase Client
const supabase = createClient();

const moduleCategories = [
  {
    title: "Core Dashboard",
    items: ["Dashboard", "Notifications"]
  },
  {
    title: "Academic Management",
    items: ["Classes", "Teachers", "Subjects", "Students", "Lecture Schedule"]
  },
  {
    title: "Attendance Controls",
    items: ["Today's Attendance", "Secret Code Generator", "GPS Locations", "Photo Verification", "Device Approvals"]
  },
  {
    title: "Reports & Analytics",
    items: ["Attendance Reports", "Teacher Reports", "Student Reports", "Monthly Reports", "Attendance Analytics"]
  },
  {
    title: "System Administration",
    items: ["Security Logs", "School Information", "System Settings"]
  }
];

const mockPhotoAyan = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23eff6ff"/><circle cx="50" cy="45" r="25" fill="%23bfdbfe"/><circle cx="42" cy="42" r="3" fill="%231e3a8a"/><circle cx="58" cy="42" r="3" fill="%231e3a8a"/><path d="M42 58 Q50 64 58 58" stroke="%231e3a8a" stroke-width="3" fill="none"/><text x="18" y="85" font-family="sans-serif" font-size="8" fill="%232563eb" font-weight="bold">Verified Ayan Ali</text></svg>`;
const mockPhotoZainab = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23fdf2f8"/><circle cx="50" cy="45" r="25" fill="%23fbcfe8"/><circle cx="42" cy="42" r="3" fill="%23831843"/><circle cx="58" cy="42" r="3" fill="%23831843"/><path d="M42 56 Q50 62 58 56" stroke="%23831843" stroke-width="3" fill="none"/><text x="12" y="85" font-family="sans-serif" font-size="8" fill="%23db2777" font-weight="bold">Verified Zainab Fatima</text></svg>`;

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [collapsedCategories, setCollapsedCategories] = useState<{ [key: string]: boolean }>({});
  const [theme, setTheme] = useState("light");

  // Dynamic Database States
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [lectures, setLectures] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Security logs, devices, photos states
  const [devices, setDevices] = useState<any[]>([]);
  const [approvedDevices, setApprovedDevices] = useState<any[]>([]);
  const [deviceSubTab, setDeviceSubTab] = useState("Pending"); // "Pending" | "Approved"

  const [alerts, setAlerts] = useState<string[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);

  // Modals visibility states
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddLecture, setShowAddLecture] = useState(false);
  const [showEditLecture, setShowEditLecture] = useState<any>(null);
  const [viewLectureAttendance, setViewLectureAttendance] = useState<any>(null); // holds lecture object for presents/absents modal
  const [viewTeacherDetails, setViewTeacherDetails] = useState<any>(null);
  const [viewStudentDetails, setViewStudentDetails] = useState<any>(null);
  const [studentMonthFilter, setStudentMonthFilter] = useState(new Date().toISOString().slice(0, 7)); // "YYYY-MM"

  // Form Inputs
  const [classForm, setClassForm] = useState({ name: "", section: "" });
  const [teacherForm, setTeacherForm] = useState({ name: "", subjectId: "" });
  const [subjectForm, setSubjectForm] = useState({ name: "" });
  const [studentForm, setStudentForm] = useState({ name: "", fatherName: "", classId: "", rollNumber: "", secretCode: "" });
  const [showEditStudent, setShowEditStudent] = useState<any>(null);
  const [editStudentForm, setEditStudentForm] = useState({ name: "", fatherName: "", classId: "", rollNumber: "", secretCode: "" });

  // Helper: generate a 6-digit secret code
  const generateSecretCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  // Helper: compute next roll number for a given classId
  const generateRollNumber = (classId: string) => {
    if (!classId) return "";
    const cls = classes.find((c: any) => c.id === classId);
    if (!cls) return "";
    const prefix = `${cls.name}-${cls.section}-`;
    const existingInClass = students.filter((s: any) => s.classId === classId);
    const nextNum = (existingInClass.length + 1).toString().padStart(2, "0");
    return `${prefix}${nextNum}`;
  };

  // Helper: Format 24-hour time string (HH:MM) to 12-hour AM/PM string
  const formatTime12h = (time24: string) => {
    if (!time24) return "N/A";
    const parts = time24.split(":");
    const hours = parseInt(parts[0], 10);
    if (isNaN(hours)) return time24;
    const ampm = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    const minutes = parts[1] || "00";
    return `${hours12.toString().padStart(2, "0")}:${minutes} ${ampm}`;
  };

  const [lectureForm, setLectureForm] = useState({ number: 1, subject: "", start: "", end: "", meetLink: "" });
  const [editLectureForm, setEditLectureForm] = useState({ number: 1, subject: "", start: "", end: "", meetLink: "" });
  const [notificationForm, setNotificationForm] = useState({ title: "", message: "", targetClass: "All Classes" });

  // School Information Settings
  const [schoolInfo, setSchoolInfo] = useState({
    name: "The Spirit School",
    address: "Main Campus, Samundri",
    phone: "+92 300 0000000",
    website: "https://school.example.com",
    email: "info@school.example.com",
    welcomeMessage: "السلام علیکم!\nWelcome to The Spirit School\nPlease verify your attendance carefully.",
    themeColor: "#2783DE"
  });

  // Calendar Date Filter for Past Logs view
  const todayKey = () => new Date().toISOString().slice(0, 10);
  const [filterDate, setFilterDate] = useState(todayKey());

  // Search/Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("All");

  // Mock Reports Data
  const teacherReports = [
    { name: "Sir Ali Raza", subject: "Science", scheduled: 12, conducted: 12, attendanceRate: "94%", rating: "Excellent" },
    { name: "Miss Sarah Khan", subject: "Math", scheduled: 15, conducted: 14, attendanceRate: "89%", rating: "Good" },
    { name: "Sir Bilal Ahmed", subject: "English", scheduled: 10, conducted: 10, attendanceRate: "91%", rating: "Excellent" }
  ];

  const studentReports = [
    { name: "Ayan Ali", class: "10-A", totalLectures: 30, presentCount: 28, rate: "93%", risk: "Safe" },
    { name: "Zainab Fatima", class: "10-A", totalLectures: 30, presentCount: 29, rate: "96%", risk: "Safe" },
    { name: "Muhammad Hamza", class: "9-B", totalLectures: 25, presentCount: 22, rate: "88%", risk: "Borderline" },
    { name: "Ayesha Bibi", class: "9-B", totalLectures: 25, presentCount: 18, rate: "72%", risk: "At Risk" }
  ];

  const monthlyReports = [
    { month: "July 2026", totalPresent: "28,491", totalAbsent: "4,102", rate: "87.4%", status: "Ready" },
    { month: "June 2026", totalPresent: "31,847", totalAbsent: "3,892", rate: "89.1%", status: "Archived" },
    { month: "May 2026", totalPresent: "29,482", totalAbsent: "5,190", rate: "85.0%", status: "Archived" }
  ];

  // Guard routing / session check & theme check
  useEffect(() => {
    const session = sessionStorage.getItem("adminSession");
    if (!session) {
      window.location.href = "/admin/login";
    } else {
      setIsAuthenticated(true);
    }

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

  // Fetch initial data on mount (Supabase with LocalStorage fallback)
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      // Classes
      try {
        const { data, error } = await supabase.from("classes").select("*");
        if (error || !data || data.length === 0) throw error || new Error("empty");
        setClasses(data);
        localStorage.setItem("local_classes", JSON.stringify(data));
      } catch (e) {
        const local = localStorage.getItem("local_classes");
        const fallback = local ? JSON.parse(local) : [
          { id: "c1", name: "10", section: "A" },
          { id: "c2", name: "9", section: "B" }
        ];
        setClasses(fallback);
        localStorage.setItem("local_classes", JSON.stringify(fallback));
      }

      // Subjects
      try {
        const { data, error } = await supabase.from("subjects").select("*");
        if (error || !data || data.length === 0) throw error || new Error("empty");
        setSubjects(data);
        localStorage.setItem("local_subjects", JSON.stringify(data));
      } catch (e) {
        const local = localStorage.getItem("local_subjects");
        const fallback = local ? JSON.parse(local) : [
          { id: "sub1", name: "Science" }, { id: "sub2", name: "Math" },
          { id: "sub3", name: "English" }, { id: "sub4", name: "History" },
          { id: "sub5", name: "Computer" }, { id: "sub6", name: "Urdu" },
          { id: "sub7", name: "Islamiat" }, { id: "sub8", name: "Drawing" }
        ];
        setSubjects(fallback);
        localStorage.setItem("local_subjects", JSON.stringify(fallback));
      }

      // Teachers
      try {
        const { data, error } = await supabase.from("teachers").select("*");
        if (error || !data || data.length === 0) throw error || new Error("empty");
        setTeachers(data);
        localStorage.setItem("local_teachers", JSON.stringify(data));
      } catch (e) {
        const local = localStorage.getItem("local_teachers");
        const fallback = local ? JSON.parse(local) : [
          { id: "t1", name: "Sir Ali Raza", subjectId: "sub1" },
          { id: "t2", name: "Miss Sarah Khan", subjectId: "sub2" }
        ];
        setTeachers(fallback);
        localStorage.setItem("local_teachers", JSON.stringify(fallback));
      }

      // Students
      try {
        const { data, error } = await supabase.from("students").select("*");
        if (error || !data || data.length === 0) throw error || new Error("empty");
        setStudents(data);
        localStorage.setItem("local_students", JSON.stringify(data));
      } catch (e) {
        const local = localStorage.getItem("local_students");
        const fallback = local ? JSON.parse(local) : [
          { id: "s1", name: "Ayan Ali", classId: "c1", fatherName: "Muhammad Ali", rollNumber: "10-A-01", code: "482917", secretCode: "482917", attendance: "92%" },
          { id: "s2", name: "Zainab Fatima", classId: "c1", fatherName: "Tariq Mahmood", rollNumber: "10-A-02", code: "104928", secretCode: "104928", attendance: "95%" }
        ];
        setStudents(fallback);
        localStorage.setItem("local_students", JSON.stringify(fallback));
      }

      // Lecture Schedules
      try {
        const { data, error } = await supabase.from("lectures").select("*");
        if (error || !data || data.length === 0) throw error || new Error("empty");
        setLectures(data);
        localStorage.setItem("local_lectures", JSON.stringify(data));
      } catch (e) {
        const local = localStorage.getItem("local_lectures");
        const fallback = local ? JSON.parse(local) : [
          { id: "l1", number: 1, subject: "English", start: "08:00", end: "08:10", meetLink: "https://meet.google.com/demo-one" },
          { id: "l2", number: 2, subject: "Math", start: "08:45", end: "08:55", meetLink: "https://meet.google.com/demo-two" },
          { id: "l3", number: 3, subject: "Science", start: "09:30", end: "09:40", meetLink: "https://meet.google.com/demo-three" },
          { id: "l4", number: 4, subject: "History", start: "10:15", end: "10:25", meetLink: "https://meet.google.com/demo-four" },
          { id: "l5", number: 5, subject: "Computer", start: "11:00", end: "11:10", meetLink: "https://meet.google.com/demo-five" }
        ];
        setLectures(fallback);
        localStorage.setItem("local_lectures", JSON.stringify(fallback));
      }

      // Notifications Logs
      const localNotifs = localStorage.getItem("local_notifications");
      const initialNotifs = localNotifs ? JSON.parse(localNotifs) : [
        { id: "n1", title: "Schedule Change", message: "English lecture shifted to 08:00 AM.", targetClass: "All Classes", date: "Today, 08:10 AM" },
        { id: "n2", title: "Hardware Approvals", message: "Students with Infinix Hot 30 request device refresh.", targetClass: "10-A", date: "Yesterday" }
      ];
      setNotifications(initialNotifs);

      // School Info Loading
      const localSchool = localStorage.getItem("local_school_info");
      if (localSchool) {
        setSchoolInfo(JSON.parse(localSchool));
      }

      // Attendance logs — load from Supabase first
      try {
        const { data, error } = await supabase.from("attendance").select("*").order("created_at", { ascending: false }).limit(200);
        if (error || !data || data.length === 0) throw error || new Error("empty");
        setAttendanceLogs(data);
        localStorage.setItem("local_attendance_logs", JSON.stringify(data));
      } catch (err) {
        const localLogs = localStorage.getItem("local_attendance_logs");
        const fallbackLogs = localLogs ? JSON.parse(localLogs) : [
          { id: "att1", studentName: "Ayan Ali", student_name: "Ayan Ali", class: "10-A", class_name: "10-A", lecture_number: 3, date: todayKey(), status: "Present", trust: "96%", trust_score: "96%", device_model: "Infinix Hot 30", photo: mockPhotoAyan, isVerified: null },
          { id: "att2", studentName: "Zainab Fatima", student_name: "Zainab Fatima", class: "10-A", class_name: "10-A", lecture_number: 3, date: todayKey(), status: "Present", trust: "98%", trust_score: "98%", device_model: "Redmi Note 12", photo: mockPhotoZainab, isVerified: null }
        ];
        setAttendanceLogs(fallbackLogs);
      }

      // Device approval registries — load from Supabase
      try {
        const { data, error } = await supabase.from("devices").select("*").eq("status", "Pending");
        if (error || !data) throw error;
        setDevices(data.length > 0 ? data : [
          { id: "d1", student: "Muhammad Hamza", class: "9-B", device: "Infinix Hot 30", date: "Today, 09:12 AM" },
          { id: "d2", student: "Ayesha Bibi", class: "9-B", device: "Samsung Galaxy A32", date: "Today, 08:32 AM" }
        ]);
      } catch {
        setDevices([
          { id: "d1", student: "Muhammad Hamza", class: "9-B", device: "Infinix Hot 30", date: "Today, 09:12 AM" },
          { id: "d2", student: "Ayesha Bibi", class: "9-B", device: "Samsung Galaxy A32", date: "Today, 08:32 AM" }
        ]);
      }

      const localApprovedDevices = localStorage.getItem("local_approved_devices");
      const fallbackApproved = localApprovedDevices ? JSON.parse(localApprovedDevices) : [
        { id: "appd1", student: "Ayan Ali", class: "10-A", device: "Infinix Hot 30 (Active)", date: "July 14, 2026" },
        { id: "appd2", student: "Zainab Fatima", class: "10-A", device: "Redmi Note 12 (Active)", date: "July 13, 2026" }
      ];
      setApprovedDevices(fallbackApproved);
      localStorage.setItem("local_approved_devices", JSON.stringify(fallbackApproved));

      setAlerts([
        "Ayan Ali submitted lecture 3 with 96% trust score",
        "New device request pending for Class 9-B",
        "GPS accuracy warning for 2 submissions",
        "Admin exported monthly PDF report"
      ]);
    };

    loadData();
  }, [isAuthenticated]);

  // Group attendance records by student name -> lecture index hierarchy
  const studentPhotoGroups = useMemo(() => {
    const groups: { [name: string]: any[] } = {};
    attendanceLogs.forEach(log => {
      const name = log.studentName || log.student_name || "Unknown Student";
      if (!groups[name]) groups[name] = [];
      groups[name].push(log);
    });
    return groups;
  }, [attendanceLogs]);

  // Insert Functions
  const addClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const newClass = {
      id: "c_" + Date.now().toString().slice(-4),
      name: classForm.name,
      section: classForm.section
    };

    try {
      const { error } = await supabase.from("classes").insert([newClass]);
      if (error) throw error;
    } catch (e) {
      console.warn("Supabase insert failed, saving to local storage.");
    }

    const updated = [...classes, newClass];
    setClasses(updated);
    localStorage.setItem("local_classes", JSON.stringify(updated));
    setClassForm({ name: "", section: "" });
    setShowAddClass(false);
  };

  const addSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSubject = {
      id: "sub_" + Date.now().toString().slice(-4),
      name: subjectForm.name
    };

    try {
      const { error } = await supabase.from("subjects").insert([newSubject]);
      if (error) throw error;
    } catch (e) {
      console.warn("Supabase insert failed, saving to local storage.");
    }

    const updated = [...subjects, newSubject];
    setSubjects(updated);
    localStorage.setItem("local_subjects", JSON.stringify(updated));
    setSubjectForm({ name: "" });
    setShowAddSubject(false);
  };

  const addTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTeacher = {
      id: "t_" + Date.now().toString().slice(-4),
      name: teacherForm.name,
      subjectId: teacherForm.subjectId
    };

    try {
      const { error } = await supabase.from("teachers").insert([newTeacher]);
      if (error) throw error;
    } catch (e) {
      console.warn("Supabase insert failed, saving to local storage.");
    }

    const updated = [...teachers, newTeacher];
    setTeachers(updated);
    localStorage.setItem("local_teachers", JSON.stringify(updated));
    setTeacherForm({ name: "", subjectId: "" });
    setShowAddTeacher(false);
  };

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure roll number and code are filled (they should be auto-generated)
    const finalRoll = studentForm.rollNumber || generateRollNumber(studentForm.classId);
    const finalCode = studentForm.secretCode || generateSecretCode();
    // Generate sequential ID: s1, s2, s3, etc.
    let maxNum = 0;
    students.forEach((s: any) => {
      const match = s.id?.match(/^s(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const nextId = `s${maxNum + 1}`;

    const newStudent = {
      id: nextId,
      name: studentForm.name,
      fatherName: studentForm.fatherName,
      classId: studentForm.classId,
      rollNumber: finalRoll,
      code: finalCode,
      secretCode: finalCode,
      attendance: "100%"
    };

    try {
      const { error } = await supabase.from("students").insert([newStudent]);
      if (error) throw error;
    } catch (e) {
      console.warn("Supabase insert failed, saving to local storage.");
    }

    const updated = [...students, newStudent];
    setStudents(updated);
    localStorage.setItem("local_students", JSON.stringify(updated));
    setAlerts(prev => [`New student "${newStudent.name}" registered with Roll No: ${finalRoll} and Secret Code: ${finalCode}`, ...prev]);
    setStudentForm({ name: "", fatherName: "", classId: "", rollNumber: "", secretCode: "" });
    setShowAddStudent(false);
  };

  const handleEditStudentClick = (student: any) => {
    setShowEditStudent(student);
    setEditStudentForm({
      name: student.name,
      fatherName: student.fatherName || "",
      classId: student.classId || "",
      rollNumber: student.rollNumber || "",
      secretCode: student.code || student.secretCode || ""
    });
  };

  const updateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditStudent) return;

    const updatedStudent = {
      ...showEditStudent,
      name: editStudentForm.name,
      fatherName: editStudentForm.fatherName,
      classId: editStudentForm.classId,
      rollNumber: editStudentForm.rollNumber,
      code: editStudentForm.secretCode,
      secretCode: editStudentForm.secretCode
    };

    try {
      const { error } = await supabase.from("students").update(updatedStudent).eq("id", showEditStudent.id);
      if (error) throw error;
    } catch (err: any) {
      console.warn("Supabase student update failed:", err?.message);
    }

    const updated = students.map(s => (s.id === showEditStudent.id ? updatedStudent : s));
    setStudents(updated);
    localStorage.setItem("local_students", JSON.stringify(updated));
    setAlerts(prev => [`Student profile for "${updatedStudent.name}" updated successfully.`, ...prev]);
    setShowEditStudent(null);
  };

  const addLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    const newLecture = {
      id: "l_" + Date.now().toString().slice(-4),
      number: Number(lectureForm.number),
      subject: lectureForm.subject,
      start: lectureForm.start,
      end: lectureForm.end,
      meetLink: lectureForm.meetLink
    };

    try {
      const { error } = await supabase.from("lectures").insert([newLecture]);
      if (error) throw error;
    } catch (e) {
      console.warn("Supabase insert failed, saving to local storage.");
    }

    const updated = [...lectures, newLecture];
    setLectures(updated);
    localStorage.setItem("local_lectures", JSON.stringify(updated));
    setLectureForm({ number: 1, subject: "", start: "", end: "", meetLink: "" });
    setShowAddLecture(false);
  };

  const updateLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditLecture) return;

    const updatedLec = {
      ...showEditLecture,
      number: Number(editLectureForm.number),
      subject: editLectureForm.subject,
      start: editLectureForm.start,
      end: editLectureForm.end,
      meetLink: editLectureForm.meetLink
    };

    try {
      const { error } = await supabase.from("lectures").update(updatedLec).eq("id", showEditLecture.id);
      if (error) throw error;
    } catch (e) {
      console.warn("Supabase update failed, saving to local storage.");
    }

    const updated = lectures.map(l => (l.id === showEditLecture.id ? updatedLec : l));
    setLectures(updated);
    localStorage.setItem("local_lectures", JSON.stringify(updated));
    setShowEditLecture(null);
  };

  const addNotification = (e: React.FormEvent) => {
    e.preventDefault();
    const newNotif = {
      id: "n_" + Date.now().toString().slice(-4),
      title: notificationForm.title,
      message: notificationForm.message,
      targetClass: notificationForm.targetClass,
      date: "Just Now"
    };

    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    localStorage.setItem("local_notifications", JSON.stringify(updated));
    setNotificationForm({ title: "", message: "", targetClass: "All Classes" });
    setAlerts(prev => [`Broadcast Announcement "${newNotif.title}" sent.`, ...prev]);
  };

  const saveSchoolConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("local_school_info", JSON.stringify(schoolInfo));
    setAlerts(prev => ["Branding configurations saved successfully.", ...prev]);
    alert("✅ School Information configuration updated! Today Portal theme is synchronized.");
  };

  const deleteItem = async (table: string, id: string, setter: any, localKey: string) => {
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.warn("Supabase delete failed, updating local storage.");
    }

    setter((prev: any[]) => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem(localKey, JSON.stringify(updated));
      return updated;
    });
  };

  const toggleCategory = (title: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const downloadCSV = (data: any[], filename: string) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [Object.keys(data[0]).join(","), ...data.map(row => Object.values(row).map(val => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printRoster = (title: string, columns: string[], rows: any[][]) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>${title} - Print Layout</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #171717; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #171717; padding-bottom: 12px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
            .header p { margin: 4px 0 0 0; font-size: 13px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #e5e5e5; padding: 10px 14px; text-align: left; font-size: 13px; }
            th { background-color: #f5f5f5; font-weight: bold; text-transform: uppercase; font-size: 11px; tracking-wider: 0.05em; color: #444; }
            tr:nth-child(even) { background-color: #fafafa; }
            @media print {
              body { padding: 0; }
              @page { size: auto; margin: 20mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>${title}</h1>
              <p>${schoolInfo.name} • Sammy Campus</p>
            </div>
            <div style="text-align: right;">
              <p style="font-weight: bold;">System Roster Summary</p>
              <p>Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>${columns.map(col => `<th>${col}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${rows.map(row => `<tr>${row.map(val => `<td>${val}</td>`).join("")}</tr>`).join("")}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Compile individual student report history printout
  const printStudentHistoryLog = (sName: string) => {
    const studentLogs = attendanceLogs.filter(l => (l.studentName || l.student_name) === sName);
    const cols = ["Date Check-in", "Lecture Ref", "Device Browser Profile", "Coordinates", "Trust rating", "Status"];
    const rows = studentLogs.map(l => [
      l.date,
      l.lecture || `Lecture #${l.lecture_number}`,
      l.device || l.device_model || "Mobile Web Client",
      l.gps_coordinates || "N/A",
      l.trust || l.trust_score || "96%",
      l.status || "Present"
    ]);
    printRoster(`Attendance Registry Log: ${sName}`, cols, rows);
  };

  // Filtering for reports & check-in tables
  const filteredAttendance = attendanceLogs.filter(r => {
    const matchSearch = (r.studentName || r.student_name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (r.class || r.class_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass = classFilter === "All" || (r.class === classFilter || r.class_name === classFilter);
    return matchSearch && matchClass;
  });

  // Today/Selected Date Attendance list
  const dateAttendance = useMemo(() => {
    return filteredAttendance.filter(r => r.date === filterDate);
  }, [filteredAttendance, filterDate]);

  const verifyPhotoLog = (logId: string, verifiedStatus: boolean | string) => {
    const updated = attendanceLogs.map(l => {
      if (l.id === logId) {
        return { ...l, isVerified: verifiedStatus };
      }
      return l;
    });
    setAttendanceLogs(updated);
    localStorage.setItem("local_attendance_logs", JSON.stringify(updated));
    setAlerts(prev => [`Photo verification status updated to "${verifiedStatus}"`, ...prev]);
  };

  // Lecture presents vs absents evaluation lists
  const lectureRosterDetails = useMemo(() => {
    if (!viewLectureAttendance) return { presentList: [], absentList: [] };

    // 1. Find all students in class c1 (assume Lecture is 10-A for c1 and 9-B for c2)
    // To make it simple: matches students whose class name fits classroom
    const targetClass = classes.find(c => c.name === "10"); // matches 10-A
    const classStudents = students.filter(s => s.classId === "c1"); // default class s1,s2

    // 2. Find check-ins matching this lecture number for filterDate
    const checkedLogs = attendanceLogs.filter(
      l => l.lecture_number === viewLectureAttendance.number && l.date === filterDate
    );

    const presents = classStudents.filter(s =>
      checkedLogs.some(log => (log.student_id === s.id || (log.studentName || log.student_name) === s.name))
    );

    const absents = classStudents.filter(s =>
      !checkedLogs.some(log => (log.student_id === s.id || (log.studentName || log.student_name) === s.name))
    );

    return { presentList: presents, absentList: absents };
  }, [viewLectureAttendance, students, attendanceLogs, filterDate, classes]);

  // Handle device registration approvals list shift
  const approveDeviceRequest = (req: any) => {
    setDevices(prev => prev.filter(x => x.id !== req.id));

    const approvedObj = {
      id: "appd_" + Date.now(),
      student: req.student,
      class: req.class,
      device: req.device + " (Approved)",
      date: new Date().toLocaleDateString()
    };

    const updatedApproved = [approvedObj, ...approvedDevices];
    setApprovedDevices(updatedApproved);
    localStorage.setItem("local_approved_devices", JSON.stringify(updatedApproved));
    setAlerts(prev => [`Approved hardware registration for ${req.student}`, ...prev]);
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex text-neutral-900 dark:text-neutral-50 transition-colors duration-350">
      {/* Sidebar navigation panel */}
      <aside className="hidden lg:block w-72 border-r bg-white p-4 dark:bg-neutral-900 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-xl bg-blue-600 text-white grid place-items-center font-bold">S</div>
          <h1 className="text-xl font-bold">Smart Attendance</h1>
        </div>
        <nav className="space-y-4 max-h-[82vh] overflow-auto pr-1">
          {moduleCategories.map(cat => {
            const isCollapsed = collapsedCategories[cat.title];
            return (
              <div key={cat.title} className="space-y-1">
                <button
                  onClick={() => toggleCategory(cat.title)}
                  className="w-full flex items-center justify-between text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-2 py-1 hover:text-neutral-600 dark:hover:text-white"
                >
                  <span>{cat.title}</span>
                  {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                </button>
                {!isCollapsed && (
                  <div className="pl-1 space-y-0.5">
                    {cat.items.map(m => (
                      <button
                        key={m}
                        onClick={() => setActiveTab(m)}
                        className={`w-full text-left rounded-xl px-3 py-1.5 text-sm transition-colors ${
                          activeTab === m ? "bg-blue-600 text-white font-semibold shadow-sm" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Panel Content */}
      <section className="flex-1 p-4 md:p-8 overflow-auto max-h-screen">
        {/* Panel Header with Theme Toggler */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Control Panel</p>
            <h2 className="text-3xl font-extrabold">{activeTab}</h2>
          </div>
          <div className="flex gap-2.5 items-center">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="rounded-xl border bg-white dark:bg-neutral-900 dark:border-white/10 p-2.5 shadow-sm border-neutral-200 text-neutral-850 dark:text-neutral-200 hover:scale-105 transition-transform"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem("adminSession");
                window.location.href = "/admin/login";
              }}
              className="rounded-xl border bg-white dark:bg-neutral-900 dark:border-white/10 px-4 py-2.5 text-sm font-semibold flex gap-2 text-red-600 border-red-200 dark:border-red-950 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        {/* Dashboard View */}
        {activeTab === "Dashboard" && (
          <>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <StatsCard label="Total Students" value={students.length} icon={Users} onClick={() => setActiveTab("Students")} />
              <StatsCard label="Registered Classes" value={classes.length} icon={School} onClick={() => setActiveTab("Classes")} />
              <StatsCard label="Total Teachers" value={teachers.length} icon={Users} onClick={() => setActiveTab("Teachers")} />
              <StatsCard label="Pending Devices" value={devices.length} icon={Smartphone} onClick={() => setActiveTab("Device Approvals")} />
              <StatsCard label="Active Lecture Schedule" value={lectures.length} icon={Clock} onClick={() => setActiveTab("Lecture Schedule")} />
              <StatsCard label="Photo Verifications Review" value={Object.keys(studentPhotoGroups).length} icon={Camera} onClick={() => setActiveTab("Photo Verification")} />
            </div>

            <div className="mt-6 grid xl:grid-cols-2 gap-4">
              <div className="rounded-3xl border bg-white p-5 dark:bg-neutral-900 dark:border-white/10 shadow-sm">
                <h3 className="font-bold flex items-center justify-between">
                  <span>Live Security Feed</span>
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
                </h3>
                <div className="mt-4 space-y-3">
                  {alerts.map((alert, index) => (
                    <p key={index} className="rounded-2xl bg-neutral-50 p-3 text-sm dark:bg-neutral-800 border dark:border-neutral-700">
                      {alert}
                    </p>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border bg-white p-5 dark:bg-neutral-900 dark:border-white/10 shadow-sm">
                <h3 className="font-bold">Active Lecture Schedule</h3>
                <div className="mt-4 space-y-3">
                  {lectures.slice(0, 4).map((lec) => (
                    <div key={lec.id} className="rounded-2xl bg-neutral-50 p-3 text-sm dark:bg-neutral-800 flex justify-between border dark:border-neutral-700">
                      <span>Lecture {lec.number}: {lec.subject}</span>
                      <span className="text-neutral-500 font-mono">{lec.start} - {lec.end}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Secret Code Generator Tab (with explanation documentation) */}
        {activeTab === "Secret Code Generator" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="rounded-3xl border bg-blue-50/50 p-5 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40 text-sm leading-relaxed">
              <h4 className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 mb-1.5">
                <ShieldCheck size={18} /> Purpose of Student Secret Passcodes
              </h4>
              <p className="text-neutral-600 dark:text-white/70">
                To guarantee check-in validity and prevent proxy attendance fraud, each student is assigned a unique, cryptographic **6-digit Secret Code**. 
                During check-in on the Today Portal, students must provide this code alongside their roll number. 
                If a student forgets their PIN or suspects a compromise, you can use the listing below to copy their current code or regenerate a new passcode.
              </p>
            </div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-white/10">
              <h3 className="font-bold text-lg mb-4">Verification PIN Directory</h3>
              <div className="overflow-x-auto text-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b dark:border-neutral-700 text-neutral-500">
                      <th className="py-2.5 px-4">Student</th>
                      <th className="py-2.5 px-4">Roll Number</th>
                      <th className="py-2.5 px-4">Current Code</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s.id} className="border-b dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                        <td className="py-3 px-4 font-bold">{s.name}</td>
                        <td className="py-3 px-4 font-mono">{s.rollNumber || s.roll_number}</td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">{s.code || s.secretCode}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              const newPin = Math.floor(100000 + Math.random() * 900000).toString();
                              const updated = students.map(x => (x.id === s.id ? { ...x, code: newPin, secretCode: newPin } : x));
                              setStudents(updated);
                              localStorage.setItem("local_students", JSON.stringify(updated));
                              setAlerts(prev => [`Regenerated secret code for ${s.name}`, ...prev]);
                            }}
                            className="bg-neutral-100 hover:bg-neutral-250 dark:bg-neutral-800 text-xs font-semibold rounded-lg py-1 px-3"
                          >
                            Regenerate PIN
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* School Information Module */}
        {activeTab === "School Information" && (
          <div className="max-w-2xl rounded-3xl border bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-white/10">
            <h3 className="font-bold text-lg mb-4">School Details Configuration</h3>
            <form onSubmit={saveSchoolConfig} className="space-y-4">
              <div>
                <label className="text-sm font-semibold">School Name Banner</label>
                <input
                  required
                  type="text"
                  value={schoolInfo.name}
                  onChange={e => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                  className="w-full mt-1.5 rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 p-3 outline-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold">Contact Phone</label>
                  <input
                    required
                    type="text"
                    value={schoolInfo.phone}
                    onChange={e => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
                    className="w-full mt-1.5 rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 p-3 outline-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">Contact Email</label>
                  <input
                    required
                    type="email"
                    value={schoolInfo.email}
                    onChange={e => setSchoolInfo({ ...schoolInfo, email: e.target.value })}
                    className="w-full mt-1.5 rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 p-3 outline-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold">Campus Address</label>
                <input
                  required
                  type="text"
                  value={schoolInfo.address}
                  onChange={e => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
                  className="w-full mt-1.5 rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 p-3 outline-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Welcome Msg (Urdu/English)</label>
                <textarea
                  required
                  rows={3}
                  value={schoolInfo.welcomeMessage}
                  onChange={e => setSchoolInfo({ ...schoolInfo, welcomeMessage: e.target.value })}
                  className="w-full mt-1.5 rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 p-3 outline-blue-500"
                />
              </div>
              <button type="submit" className="w-full rounded-xl bg-blue-600 text-white font-bold py-3 flex gap-2 justify-center items-center hover:bg-blue-700 transition-colors shadow-sm">
                <Save size={18} /> Update Portal Config
              </button>
            </form>
          </div>
        )}

        {/* Notifications Module */}
        {activeTab === "Notifications" && (
          <div className="grid xl:grid-cols-[1.1fr_.9fr] gap-6">
            <div className="rounded-3xl border bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-white/10">
              <h3 className="font-bold text-lg mb-4">Broadcast New Announcement</h3>
              <form onSubmit={addNotification} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold">Message Title</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Science Class Shifted"
                    value={notificationForm.title}
                    onChange={e => setNotificationForm({ ...notificationForm, title: e.target.value })}
                    className="w-full mt-1.5 rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 p-3 outline-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">Target Classroom Grade</label>
                  <select
                    value={notificationForm.targetClass}
                    onChange={e => setNotificationForm({ ...notificationForm, targetClass: e.target.value })}
                    className="w-full mt-1.5 rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 p-3 outline-blue-500"
                  >
                    <option value="All Classes">All Classes</option>
                    {classes.map(c => <option key={c.id} value={`${c.name}-${c.section}`}>Class {c.name}-{c.section}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold">Announcement Text</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Type details for student view notifications..."
                    value={notificationForm.message}
                    onChange={e => setNotificationForm({ ...notificationForm, message: e.target.value })}
                    className="w-full mt-1.5 rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 p-3 outline-blue-500"
                  />
                </div>
                <button type="submit" className="w-full rounded-xl bg-blue-600 text-white font-bold py-3 flex gap-2 justify-center items-center hover:bg-blue-700 transition-colors shadow-sm">
                  <Megaphone size={18} /> Broadcast Notification
                </button>
              </form>
            </div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-white/10 h-fit">
              <h3 className="font-bold text-lg mb-4">Sent Announcements Log</h3>
              <div className="space-y-3">
                {notifications.map(n => (
                  <div key={n.id} className="rounded-2xl bg-neutral-50 dark:bg-neutral-950 p-4 border dark:border-neutral-800 border-neutral-200">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm">{n.title}</h4>
                      <span className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 px-2 py-0.5 rounded-full font-bold">{n.targetClass}</span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-white/70 mt-2 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-neutral-400 mt-2 font-mono">{n.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Classes View */}
        {activeTab === "Classes" && (
          <div className="rounded-3xl border bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Classrooms & Sections</h3>
              <button onClick={() => setShowAddClass(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-xs font-semibold flex gap-1 items-center">
                <Plus size={14} /> Add Class
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b dark:border-neutral-700 text-neutral-500 font-medium">
                    <th className="py-3 px-4">Class ID</th>
                    <th className="py-3 px-4">Class Name</th>
                    <th className="py-3 px-4">Section</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map(c => (
                    <tr key={c.id} className="border-b dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">{c.id}</td>
                      <td className="py-3 px-4">Class {c.name}</td>
                      <td className="py-3 px-4">{c.section}</td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => deleteItem("classes", c.id, setClasses, "local_classes")} className="text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subjects View */}
        {activeTab === "Subjects" && (
          <div className="rounded-3xl border bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Academic Courses / Subjects</h3>
              <button onClick={() => setShowAddSubject(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-xs font-semibold flex gap-1 items-center">
                <Plus size={14} /> Add Subject
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b dark:border-neutral-700 text-neutral-500 font-medium">
                    <th className="py-3 px-4">Subject ID</th>
                    <th className="py-3 px-4">Subject Title</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map(s => (
                    <tr key={s.id} className="border-b dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">{s.id}</td>
                      <td className="py-3 px-4">{s.name}</td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => deleteItem("subjects", s.id, setSubjects, "local_subjects")} className="text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Teachers View */}
        {activeTab === "Teachers" && (
          <div className="rounded-3xl border bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Staff & Instructors</h3>
              <button onClick={() => setShowAddTeacher(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-xs font-semibold flex gap-1 items-center">
                <Plus size={14} /> Add Teacher
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b dark:border-neutral-700 text-neutral-500 font-medium">
                    <th className="py-3 px-4">Teacher ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Assigned Subject</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map(t => {
                    const subject = subjects.find(sub => sub.id === t.subjectId);
                    return (
                      <tr key={t.id} className="border-b dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">{t.id}</td>
                        <td className="py-3 px-4 font-semibold">{t.name}</td>
                        <td className="py-3 px-4">{subject ? subject.name : "N/A"}</td>
                        <td className="py-3 px-4 text-right flex justify-end gap-3 items-center">
                          <button
                            title="View teacher class attendance logs"
                            onClick={() => setViewTeacherDetails(t)}
                            className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 p-1.5 rounded-lg hover:scale-105 transition-transform"
                          >
                            <BarChart3 size={14} />
                          </button>
                          <button onClick={() => deleteItem("teachers", t.id, setTeachers, "local_teachers")} className="text-red-500 hover:text-red-700">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Students View */}
        {activeTab === "Students" && (
          <div className="rounded-3xl border bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-white/10 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
              <h3 className="font-bold text-lg">Student Roster</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const cols = ["Student ID", "Full Name", "Father Name", "Class", "Roll Number", "Secret Code"];
                    const rows = students.map(s => {
                      const studentClass = classes.find(c => c.id === s.classId);
                      return [s.id, s.name, s.fatherName, studentClass ? `${studentClass.name}-${studentClass.section}` : "N/A", s.rollNumber, s.code || s.secretCode];
                    });
                    printRoster("Student Roster Directory", cols, rows);
                  }}
                  className="bg-neutral-600 dark:bg-neutral-855 hover:bg-neutral-700 text-white rounded-xl px-4 py-2 text-xs font-semibold flex gap-1 items-center"
                >
                  <Printer size={14} /> Print Names Roster
                </button>
                <button onClick={() => setShowAddStudent(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-xs font-semibold flex gap-1 items-center">
                  <Plus size={14} /> Add Student
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b dark:border-neutral-700 text-neutral-500 font-medium">
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Father's Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Roll Number</th>
                    <th className="py-3 px-4">Secret Code</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => {
                    const studentClass = classes.find(c => c.id === s.classId);
                    return (
                      <tr key={s.id} className="border-b dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">{s.id}</td>
                        <td className="py-3 px-4 font-semibold">{s.name}</td>
                        <td className="py-3 px-4">{s.fatherName}</td>
                        <td className="py-3 px-4">Class {studentClass ? `${studentClass.name}-${studentClass.section}` : "N/A"}</td>
                        <td className="py-3 px-4 font-mono">{s.rollNumber}</td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600">{s.code || s.secretCode}</td>
                        <td className="py-3 px-4 text-right flex justify-end gap-2.5">
                          <button
                            title="Print attendance history log"
                            onClick={() => printStudentHistoryLog(s.name)}
                            className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
                          >
                            <Printer size={16} />
                          </button>
                          <button
                            title="View student complete details"
                            onClick={() => setViewStudentDetails(s)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            title="Edit student profile"
                            onClick={() => handleEditStudentClick(s)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Edit size={16} />
                          </button>
                          <button onClick={() => deleteItem("students", s.id, setStudents, "local_students")} className="text-red-500 hover:text-red-700">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lecture Schedule */}
        {activeTab === "Lecture Schedule" && (
          <div className="rounded-3xl border bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Lecture Windows Schedule</h3>
              <button onClick={() => setShowAddLecture(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-xs font-semibold flex gap-1 items-center">
                <Plus size={14} /> Add Lecture Window
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b dark:border-neutral-700 text-neutral-500 font-medium">
                    <th className="py-3 px-4">Lec #</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Start Time</th>
                    <th className="py-3 px-4">End Time</th>
                    <th className="py-3 px-4">Meet URL</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lectures.map(l => (
                    <tr key={l.id} className="border-b dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                      <td className="py-3 px-4 font-bold">{l.number}</td>
                      <td className="py-3 px-4 font-semibold">{l.subject || "No Subject Assigned"}</td>
                      <td className="py-3 px-4 font-mono">{formatTime12h(l.start)}</td>
                      <td className="py-3 px-4 font-mono">{formatTime12h(l.end)}</td>
                      <td className="py-3 px-4">
                        {l.meetLink ? (
                          <a href={l.meetLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate max-w-[200px] block font-mono">
                            {l.meetLink}
                          </a>
                        ) : "N/A"}
                      </td>
                      <td className="py-3 px-4 text-right flex justify-end gap-3 items-center">
                        <button
                          title="View presents/absents roster"
                          onClick={() => setViewLectureAttendance(l)}
                          className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 p-1.5 rounded-lg hover:scale-105 transition-transform"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setEditLectureForm({ number: l.number, subject: l.subject || "", start: l.start, end: l.end, meetLink: l.meetLink || "" });
                            setShowEditLecture(l);
                          }}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit size={16} />
                        </button>
                        <button onClick={() => deleteItem("lectures", l.id, setLectures, "local_lectures")} className="text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Today's Attendance Tab (with custom date pickers) */}
        {activeTab === "Today's Attendance" && (
          <div className="rounded-3xl border bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-white/10 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
              <div>
                <h3 className="font-bold text-lg">Daily Attendance Logs</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Logs for selected date: <span className="font-mono font-semibold">{filterDate}</span></p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const cols = ["Student", "Class", "Lecture", "Check-in Time", "Device", "Trust index"];
                    const rows = dateAttendance.map(r => [r.studentName || r.student_name, r.class || r.class_name, r.lecture || `Lecture ${r.lecture_number}`, r.time || "N/A", r.device || r.device_model, r.trust || r.trust_score]);
                    printRoster(`Attendance Roster (${filterDate})`, cols, rows);
                  }}
                  className="bg-neutral-600 dark:bg-neutral-855 hover:bg-neutral-700 text-white rounded-xl px-4 py-2 text-xs font-semibold flex gap-1.5 items-center shadow-sm"
                >
                  <Printer size={14} /> Print Attendance Roster
                </button>
                <button
                  onClick={() => downloadCSV(dateAttendance, `attendance_${filterDate}.csv`)}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2 text-xs font-semibold flex gap-1.5 items-center shadow-sm"
                >
                  <Download size={14} /> Export CSV
                </button>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-neutral-400" size={18} />
                <input
                  type="text"
                  placeholder="Search student or class name..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 text-sm outline-blue-500"
                />
              </div>

              {/* Dynamic Calendar Picker for past records */}
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-neutral-400" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                  className="rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 py-2 px-3 text-sm outline-blue-500 font-mono"
                />
              </div>

              <select
                value={classFilter}
                onChange={e => setClassFilter(e.target.value)}
                className="rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 py-2 px-4 text-sm outline-blue-500"
              >
                <option value="All">All Classes</option>
                {classes.map(c => <option key={c.id} value={`${c.name}-${c.section}`}>{c.name}-{c.section}</option>)}
              </select>
            </div>

            <div className="overflow-x-auto text-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b dark:border-neutral-700 text-neutral-500 font-medium">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Lecture / Subject</th>
                    <th className="py-3 px-4">Device browser</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Trust Index</th>
                  </tr>
                </thead>
                <tbody>
                  {dateAttendance.map((r, i) => (
                    <tr key={i} className="border-b dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                      <td className="py-3 px-4 font-bold">{r.studentName || r.student_name}</td>
                      <td className="py-3 px-4">{r.class || r.class_name}</td>
                      <td className="py-3 px-4">{r.lecture || r.subject || `Lecture ${r.lecture_number}`}</td>
                      <td className="py-3 px-4 text-neutral-500">{r.device || r.device_model}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
                          {r.status || "Present"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">{r.trust || r.trust_score}</td>
                    </tr>
                  ))}
                  {dateAttendance.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400">No attendance entries recorded for this date.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GPS Locations Tab */}
        {activeTab === "GPS Locations" && (
          <div className="rounded-3xl border bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-white/10">
            <h3 className="font-bold text-lg mb-4">GPS Position Records</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b dark:border-neutral-700 text-neutral-500">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Coordinates</th>
                    <th className="py-3 px-4">Accuracy Range</th>
                    <th className="py-3 px-4">Maps Redirect</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b dark:border-neutral-800">
                    <td className="py-3 px-4 font-semibold">Ayan Ali</td>
                    <td className="py-3 px-4 font-mono text-neutral-600">31.0645° N, 72.9721° E</td>
                    <td className="py-3 px-4 text-green-600 font-bold">12 meters (High)</td>
                    <td className="py-3 px-4">
                      <a href="https://maps.google.com/?q=31.0645,72.9721" target="_blank" rel="noreferrer" className="text-blue-600 font-medium underline">Google Maps</a>
                    </td>
                  </tr>
                  <tr className="border-b dark:border-neutral-800">
                    <td className="py-3 px-4 font-semibold">Zainab Fatima</td>
                    <td className="py-3 px-4 font-mono text-neutral-600">31.0682° N, 72.9705° E</td>
                    <td className="py-3 px-4 text-green-600 font-bold">22 meters (High)</td>
                    <td className="py-3 px-4">
                      <a href="https://maps.google.com/?q=31.0682,72.9705" target="_blank" rel="noreferrer" className="text-blue-600 font-medium underline">Google Maps</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Persistent Re-reviewable Student Photo Gallery */}
        {activeTab === "Photo Verification" && (
          <div className="rounded-3xl border bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-white/10 animate-in fade-in duration-300">
            <h3 className="font-bold text-lg mb-2">Student Photo Gallery Verification</h3>
            <p className="text-xs text-neutral-500 mb-6">Grouped by Student Name. Click Verify or Flag to modify states. Records remain reviewable.</p>

            <div className="space-y-6">
              {Object.keys(studentPhotoGroups).map(studentName => {
                const logs = studentPhotoGroups[studentName];
                return (
                  <div key={studentName} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-5">
                    <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4">
                      <h4 className="font-extrabold text-base text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <Users size={18} /> {studentName}
                      </h4>
                      <span className="text-xs font-semibold bg-neutral-200 dark:bg-neutral-800 px-3 py-1 rounded-full">
                        {logs.length} check-in log{logs.length > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {logs.map((log) => (
                        <div key={log.id} className="rounded-xl border bg-white dark:bg-neutral-950 p-4 border-neutral-200 dark:border-neutral-850 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 font-bold px-2 py-0.5 rounded">
                                Lecture #{log.lecture_number}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono">{log.date}</span>
                            </div>

                            {log.photo ? (
                              <div className="relative group rounded-xl overflow-hidden border dark:border-neutral-800 mb-3 bg-neutral-100 dark:bg-neutral-900 h-44 w-full">
                                <img
                                  src={log.photo}
                                  alt={`${studentName} verification frame`}
                                  className="h-full w-full object-cover"
                                />
                                <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1.5">
                                  {log.isVerified === true && <span className="text-green-400">Approved ✔</span>}
                                  {log.isVerified === false && <span className="text-red-400">Flagged ⚠️</span>}
                                  Score: {log.trust || log.trust_score}
                                </div>
                              </div>
                            ) : (
                              <div className="h-44 rounded-xl border dark:border-neutral-800 mb-3 bg-neutral-100 dark:bg-neutral-900 grid place-items-center text-xs text-neutral-400 text-center p-4">
                                <Camera size={28} className="mx-auto mb-2 text-neutral-350" />
                                No background photo recorded for this lecture check-in.
                              </div>
                            )}

                            <p className="text-xs text-neutral-500">
                              Device: <span className="font-semibold text-neutral-700 dark:text-white">{log.device || log.device_model || "Mobile Web"}</span>
                            </p>
                          </div>

                          {/* Persistent review action controls */}
                          <div className="flex flex-col gap-2 mt-4 pt-3 border-t dark:border-neutral-800">
                            <div className="flex gap-2">
                              <button
                                onClick={() => verifyPhotoLog(log.id, true)}
                                className={`flex-1 rounded-xl py-2 text-xs font-semibold flex gap-1 items-center justify-center transition-colors ${
                                  log.isVerified === true ? "bg-green-600 text-white" : "bg-neutral-100 dark:bg-neutral-800 hover:bg-green-50 dark:hover:bg-green-950/20 text-green-600"
                                }`}
                              >
                                <Check size={14} /> {log.isVerified === true ? "Approved" : "Verify Image"}
                              </button>
                              <button
                                onClick={() => verifyPhotoLog(log.id, false)}
                                className={`flex-1 rounded-xl py-2 text-xs font-semibold flex gap-1 items-center justify-center transition-colors ${
                                  log.isVerified === false ? "bg-red-600 text-white" : "border border-red-200 dark:border-red-950 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600"
                                }`}
                              >
                                <X size={14} /> {log.isVerified === false ? "Flagged" : "Flag Event"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Device Approvals Tab (with Pending / Approved Sub-Tabs) */}
        {activeTab === "Device Approvals" && (
          <div className="rounded-3xl border bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-white/10 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Hardware Device registries</h3>
              {/* Sub-tab selection hooks */}
              <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-2xl gap-1 text-xs font-semibold">
                <button
                  onClick={() => setDeviceSubTab("Pending")}
                  className={`px-3 py-1.5 rounded-xl transition-colors ${
                    deviceSubTab === "Pending" ? "bg-blue-600 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
                  }`}
                >
                  Pending Requests ({devices.length})
                </button>
                <button
                  onClick={() => setDeviceSubTab("Approved")}
                  className={`px-3 py-1.5 rounded-xl transition-colors ${
                    deviceSubTab === "Approved" ? "bg-blue-600 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
                  }`}
                >
                  Approved History ({approvedDevices.length})
                </button>
              </div>
            </div>

            {deviceSubTab === "Pending" ? (
              devices.length === 0 ? (
                <div className="p-8 text-center text-neutral-400">All pending device registrations verified.</div>
              ) : (
                <div className="space-y-3">
                  {devices.map(d => (
                    <div key={d.id} className="rounded-2xl bg-neutral-50 dark:bg-neutral-950 p-4 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/50 text-blue-600 rounded-xl grid place-items-center"><Smartphone size={20} /></div>
                        <div>
                          <h4 className="font-bold text-sm">{d.student} ({d.class})</h4>
                          <p className="text-xs text-neutral-500">{d.device} • {d.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveDeviceRequest(d)}
                          className="rounded-xl bg-green-600 text-white px-4 py-1.5 text-xs font-semibold hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setDevices(prev => prev.filter(x => x.id !== d.id))}
                          className="rounded-xl border border-red-300 dark:border-red-950 text-red-600 px-4 py-1.5 text-xs font-semibold hover:bg-red-50"
                        >
                          Deny
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              approvedDevices.length === 0 ? (
                <div className="p-8 text-center text-neutral-400">No approved devices in history records.</div>
              ) : (
                <div className="space-y-3">
                  {approvedDevices.map(d => (
                    <div key={d.id} className="rounded-2xl bg-neutral-50 dark:bg-neutral-950 p-4 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-green-105 dark:bg-green-950/30 text-green-600 rounded-xl grid place-items-center"><Smartphone size={20} /></div>
                        <div>
                          <h4 className="font-bold text-sm">{d.student} ({d.class})</h4>
                          <p className="text-xs text-neutral-500">{d.device} • Approved on {d.date}</p>
                        </div>
                      </div>
                      <span className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 px-3 py-1 text-xs rounded-full font-bold">
                        Approved Logged
                      </span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* Security Logs Tab */}
        {activeTab === "Security Logs" && (
          <div className="rounded-3xl border bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-white/10">
            <h3 className="font-bold text-lg mb-4">Security Auditing Trail</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b dark:border-neutral-700 text-neutral-500">
                    <th className="py-3 px-4">Trigger Event</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Action Token</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b dark:border-neutral-800">
                    <td className="py-3 px-4 font-semibold text-orange-600">GPS Accuracy Violation</td>
                    <td className="py-3 px-4">Muhammad Hamza</td>
                    <td className="py-3 px-4 font-mono text-neutral-500">182.176.11.45</td>
                    <td className="py-3 px-4"><span className="bg-orange-100 text-orange-800 px-2 py-0.5 text-xs rounded-full font-bold">Flagged</span></td>
                  </tr>
                  <tr className="border-b dark:border-neutral-800">
                    <td className="py-3 px-4 font-semibold text-red-600">Device Fingerprint Conflicted</td>
                    <td className="py-3 px-4">Ayesha Bibi</td>
                    <td className="py-3 px-4 font-mono text-neutral-500">182.176.15.89</td>
                    <td className="py-3 px-4"><span className="bg-red-100 text-red-800 px-2 py-0.5 text-xs rounded-full font-bold">Blocked</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === "System Settings" && (
          <div className="max-w-2xl rounded-3xl border bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-white/10">
            <h3 className="font-bold text-lg mb-4">Portal Branding Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">School Name Banner</label>
                <input
                  type="text"
                  value={schoolInfo.name}
                  onChange={e => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                  className="w-full mt-1.5 rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 p-3 outline-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Verification Alert Messages</label>
                <textarea
                  rows={3}
                  value={schoolInfo.welcomeMessage}
                  onChange={e => setSchoolInfo({ ...schoolInfo, welcomeMessage: e.target.value })}
                  className="w-full mt-1.5 rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 p-3 outline-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Color Hex Accent</label>
                <input
                  type="text"
                  value={schoolInfo.themeColor}
                  onChange={e => setSchoolInfo({ ...schoolInfo, themeColor: e.target.value })}
                  className="w-full mt-1.5 rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 p-3 font-mono text-sm outline-blue-500"
                />
              </div>
              <button onClick={() => {
                localStorage.setItem("local_school_info", JSON.stringify(schoolInfo));
                alert("Branding saved!");
              }} className="w-full rounded-xl bg-blue-600 text-white font-bold py-3 flex gap-2 justify-center items-center hover:bg-blue-700">
                <Save size={18} /> Update Portal Config
              </button>
            </div>
          </div>
        )}

        {/* Attendance Reports Tab */}
        {activeTab === "Attendance Reports" && (
          <div className="rounded-3xl border bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <h3 className="font-bold text-lg">Detailed Check-In Reports</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const cols = ["Date", "Student", "Class", "Lecture Ref", "Device browser", "Status", "Trust Score"];
                    const rows = filteredAttendance.map(r => [r.date, r.studentName || r.student_name, r.class || r.class_name, r.lecture || `Lecture ${r.lecture_number}`, r.device || r.device_model, r.status, r.trust || r.trust_score]);
                    printRoster("Comprehensive Attendance Directory", cols, rows);
                  }}
                  className="bg-neutral-600 dark:bg-neutral-855 hover:bg-neutral-700 text-white rounded-xl px-4 py-2 text-xs font-semibold flex gap-1.5 items-center shadow-sm"
                >
                  <Printer size={14} /> Print Attendance Report
                </button>
                <button
                  onClick={() => downloadCSV(attendanceLogs, "attendance_report.csv")}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2 text-xs font-semibold flex gap-1.5 items-center shadow-sm"
                >
                  <Download size={14} /> Export CSV
                </button>
              </div>
            </div>

            {/* Filter controls with dynamic calendar dates selector */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-neutral-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by student or class..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 text-sm outline-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-neutral-400" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                  className="rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 py-2 px-3 text-sm outline-blue-500 font-mono"
                />
              </div>

              <select
                value={classFilter}
                onChange={e => setClassFilter(e.target.value)}
                className="rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 py-2 px-4 text-sm outline-blue-500"
              >
                <option value="All">All Classes</option>
                <option value="10-A">10-A</option>
                <option value="9-B">9-B</option>
              </select>
            </div>

            <div className="overflow-x-auto text-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b dark:border-neutral-700 text-neutral-500 font-medium">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Lecture Ref</th>
                    <th className="py-3 px-4">Device</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Trust Score</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map((r, i) => (
                    <tr key={i} className="border-b dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                      <td className="py-3 px-4 font-mono">{r.date}</td>
                      <td className="py-3 px-4 font-bold">{r.studentName || r.student_name}</td>
                      <td className="py-3 px-4">{r.class || r.class_name}</td>
                      <td className="py-3 px-4">{r.lecture || r.subject || `Lecture ${r.lecture_number}`}</td>
                      <td className="py-3 px-4 text-neutral-500">{r.device || r.device_model}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          r.status === "Present" ? "bg-green-100 text-green-800 dark:bg-green-950" : "bg-red-100 text-red-800 dark:bg-red-950"
                        }`}>
                          {r.status || "Present"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">{r.trust || r.trust_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Teacher Reports Tab */}
        {activeTab === "Teacher Reports" && (
          <div className="rounded-3xl border bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Instructor Lecture Coverage</h3>
              <button
                onClick={() => {
                  const cols = ["Instructor", "Subject", "Scheduled", "Conducted", "Attendance Average", "Quality Index"];
                  const rows = teacherReports.map(t => [t.name, t.subject, t.scheduled, t.conducted, t.attendanceRate, t.rating]);
                  printRoster("Teacher Lecture Coverage Metrics", cols, rows);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-xs font-semibold flex gap-1.5 items-center"
              >
                <Printer size={14} /> Print Teacher Logs
              </button>
            </div>

            <div className="overflow-x-auto text-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b dark:border-neutral-700 text-neutral-500 font-medium">
                    <th className="py-3 px-4">Instructor</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Scheduled Periods</th>
                    <th className="py-3 px-4">Conducted Periods</th>
                    <th className="py-3 px-4">Student Attendance Avg</th>
                    <th className="py-3 px-4">System Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherReports.map((t, idx) => (
                    <tr key={idx} className="border-b dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                      <td className="py-3 px-4 font-bold">{t.name}</td>
                      <td className="py-3 px-4">{t.subject}</td>
                      <td className="py-3 px-4 font-mono">{t.scheduled}</td>
                      <td className="py-3 px-4 font-mono">{t.conducted}</td>
                      <td className="py-3 px-4 font-mono text-green-600 font-bold">{t.attendanceRate}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                          {t.rating}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Student Reports Tab */}
        {activeTab === "Student Reports" && (
          <div className="rounded-3xl border bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Student Aggregated Summaries</h3>
              <button
                onClick={() => {
                  const cols = ["Student", "Class", "Total Periods", "Attended", "Attendance Rate", "Risk Level"];
                  const rows = studentReports.map(s => [s.name, s.class, s.totalLectures, s.presentCount, s.rate, s.risk]);
                  printRoster("Student Roster Statistics", cols, rows);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-xs font-semibold flex gap-1.5 items-center"
              >
                <Printer size={14} /> Print Student Metrics
              </button>
            </div>

            <div className="overflow-x-auto text-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b dark:border-neutral-700 text-neutral-500 font-medium">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Total Periods</th>
                    <th className="py-3 px-4">Attended Periods</th>
                    <th className="py-3 px-4">Attendance Rate</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {studentReports.map((s, idx) => (
                    <tr key={idx} className="border-b dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                      <td className="py-3 px-4 font-bold">{s.name}</td>
                      <td className="py-3 px-4">Class {s.class}</td>
                      <td className="py-3 px-4 font-mono">{s.totalLectures}</td>
                      <td className="py-3 px-4 font-mono">{s.presentCount}</td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">{s.rate}</td>
                      <td className="py-3 px-4 text-right flex justify-end gap-2">
                        <button
                          title="Print detailed student history summary"
                          onClick={() => printStudentHistoryLog(s.name)}
                          className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl font-bold text-xs flex gap-1 items-center hover:scale-105 transition-transform"
                        >
                          <Printer size={12} /> Print History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Monthly Reports Tab */}
        {activeTab === "Monthly Reports" && (
          <div className="rounded-3xl border bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-white/10">
            <h3 className="font-bold text-lg mb-6">Monthly Attendance Summaries</h3>
            <div className="space-y-4">
              {monthlyReports.map((rep, index) => (
                <div key={index} className="rounded-2xl border dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-lg text-blue-600 dark:text-blue-400">{rep.month}</h4>
                    <p className="text-sm text-neutral-500 mt-1 font-medium">
                      Present check-ins: <span className="font-bold text-neutral-700 dark:text-white">{rep.totalPresent}</span> • Absences logged: <span className="font-bold text-neutral-700 dark:text-white">{rep.totalAbsent}</span>
                    </p>
                    <p className="text-xs text-green-600 font-bold mt-1">Monthly Aggregate Rate: {rep.rate}</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        const cols = ["Month", "Check-ins Count", "Absence Count", "Rate Metric"];
                        const rows = [[rep.month, rep.totalPresent, rep.totalAbsent, rep.rate]];
                        printRoster(`Monthly Summary - ${rep.month}`, cols, rows);
                      }}
                      className="flex-1 sm:flex-initial rounded-xl bg-blue-600 text-white font-semibold text-xs py-2.5 px-4 flex gap-1.5 items-center justify-center hover:bg-blue-700 shadow-sm"
                    >
                      <Printer size={14} /> Print PDF Summary
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attendance Analytics Tab */}
        {activeTab === "Attendance Analytics" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-3xl border bg-white p-6 dark:bg-neutral-900 dark:border-white/10 shadow-sm">
                <h4 className="font-bold text-base mb-4 flex items-center gap-2">
                  <TrendingUp className="text-blue-600" size={18} /> Class-wise Attendance Performance
                </h4>
                <div className="space-y-4">
                  <BarChartItem label="Class 10-A" percentage={94} color="bg-blue-600" />
                  <BarChartItem label="Class 9-A" percentage={88} color="bg-indigo-600" />
                  <BarChartItem label="Class 9-B" percentage={82} color="bg-purple-600" />
                  <BarChartItem label="Class 8-A" percentage={78} color="bg-pink-600" />
                </div>
              </div>

              <div className="rounded-3xl border bg-white p-6 dark:bg-neutral-900 dark:border-white/10 shadow-sm">
                <h4 className="font-bold text-base mb-4 flex items-center gap-2">
                  <Smartphone className="text-blue-600" size={18} /> Hardware Device Distribution
                </h4>
                <div className="space-y-4">
                  <BarChartItem label="Android Phones (Mobile)" percentage={72} color="bg-green-600" />
                  <BarChartItem label="iPhones (Mobile)" percentage={18} color="bg-teal-600" />
                  <BarChartItem label="Laptops / PCs (Desktop)" percentage={10} color="bg-orange-600" />
                </div>
              </div>

              <div className="rounded-3xl border bg-white p-6 dark:bg-neutral-900 dark:border-white/10 shadow-sm">
                <h4 className="font-bold text-base mb-4 flex items-center gap-2">
                  <Shield className="text-blue-600" size={18} /> Security Verification Trust Levels
                </h4>
                <div className="space-y-4">
                  <BarChartItem label="High Trust (>90% score)" percentage={86} color="bg-emerald-600" />
                  <BarChartItem label="Medium Trust (70%-90% score)" percentage={11} color="bg-yellow-500" />
                  <BarChartItem label="Low Trust / Flagged (<70% score)" percentage={3} color="bg-red-500" />
                </div>
              </div>

              <div className="rounded-3xl border bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white shadow-lg flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-lg mb-2">Weekly Highlights</h4>
                  <p className="text-sm text-white/80 leading-relaxed font-medium">
                    Aggregate attendance is up by **2.4%** compared to last week. Security logs show 0 blocked devices and all camera capture hashes are verified.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-sm">
                  <div>
                    <p className="text-white/60 text-xs">Peak Check-In Hour</p>
                    <p className="font-bold text-lg mt-0.5">08:02 AM</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">Average Trust Index</p>
                    <p className="font-bold text-lg mt-0.5">94.8%</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">Late Rate</p>
                    <p className="font-bold text-lg mt-0.5">1.2%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* View Presents/Absents Lecture Attendance Modal */}
      {viewLectureAttendance && (
        <Modal title={`Lecture Attendance: #${viewLectureAttendance.number} (${viewLectureAttendance.subject})`} onClose={() => setViewLectureAttendance(null)}>
          <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto">
            <p className="text-xs text-neutral-500">Checking registry roster for class: <span className="font-bold text-neutral-800 dark:text-neutral-250">{filterDate}</span></p>

            <div className="space-y-2">
              <h4 className="font-bold text-green-600 flex items-center gap-1.5 border-b dark:border-neutral-800 pb-1.5">
                <CheckCircle2 size={16} /> Present Students ({lectureRosterDetails.presentList.length})
              </h4>
              {lectureRosterDetails.presentList.length === 0 ? (
                <p className="text-xs text-neutral-450 italic pl-5">No check-ins logged within time limits.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 pl-4">
                  {lectureRosterDetails.presentList.map(s => (
                    <div key={s.id} className="rounded-lg bg-green-50/50 dark:bg-green-950/20 p-2 border border-green-100 dark:border-green-900/40 text-xs font-semibold">
                      {s.name} ({s.rollNumber})
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-red-600 flex items-center gap-1.5 border-b dark:border-neutral-800 pb-1.5">
                <XCircle size={16} /> Absent Students ({lectureRosterDetails.absentList.length})
              </h4>
              {lectureRosterDetails.absentList.length === 0 ? (
                <p className="text-xs text-neutral-450 italic pl-5">All student rosters verified present.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 pl-4">
                  {lectureRosterDetails.absentList.map(s => (
                    <div key={s.id} className="rounded-lg bg-red-50/50 dark:bg-red-950/20 p-2 border border-red-100 dark:border-red-900/40 text-xs font-semibold">
                      {s.name} ({s.rollNumber})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Add Class Modal */}
      {showAddClass && (
        <Modal title="Add New Class" onClose={() => setShowAddClass(false)}>
          <form onSubmit={addClass} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400">Class name / Grade</label>
              <input required type="text" placeholder="e.g. 10" value={classForm.name} onChange={e => setClassForm({ ...classForm, name: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-500 dark:border-neutral-800" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400">Section</label>
              <input required type="text" placeholder="e.g. A" value={classForm.section} onChange={e => setClassForm({ ...classForm, section: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-500 dark:border-neutral-800" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700">Save Class Details</button>
          </form>
        </Modal>
      )}

      {/* Add Subject Modal */}
      {showAddSubject && (
        <Modal title="Add New Subject" onClose={() => setShowAddSubject(false)}>
          <form onSubmit={addSubject} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400">Subject Name / Course Title</label>
              <input required type="text" placeholder="e.g. Mathematics" value={subjectForm.name} onChange={e => setSubjectForm({ name: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-550 dark:border-neutral-800" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700">Save Subject</button>
          </form>
        </Modal>
      )}

      {/* Add Teacher Modal */}
      {showAddTeacher && (
        <Modal title="Register Instructor" onClose={() => setShowAddTeacher(false)}>
          <form onSubmit={addTeacher} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400">Teacher Full Name</label>
              <input required type="text" placeholder="e.g. Sir Ali Raza" value={teacherForm.name} onChange={e => setTeacherForm({ ...teacherForm, name: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-500 dark:border-neutral-800" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400">Assign Subject Course</label>
              <select required value={teacherForm.subjectId} onChange={e => setTeacherForm({ ...teacherForm, subjectId: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-500 dark:border-neutral-800">
                <option value="">-- Choose Subject --</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700">Save Teacher Profile</button>
          </form>
        </Modal>
      )}

      {/* Add Student Modal */}
      {showAddStudent && (
        <Modal title="Register Student" onClose={() => { setShowAddStudent(false); setStudentForm({ name: "", fatherName: "", classId: "", rollNumber: "", secretCode: "" }); }}>
          <form onSubmit={addStudent} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400">Full Name</label>
              <input required type="text" placeholder="Ayan Ali" value={studentForm.name} onChange={e => setStudentForm({ ...studentForm, name: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-500 dark:border-neutral-800" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400">Father's Name</label>
              <input required type="text" placeholder="Muhammad Ali" value={studentForm.fatherName} onChange={e => setStudentForm({ ...studentForm, fatherName: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-550 dark:border-neutral-800" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400">Classroom Grade</label>
              <select
                required
                value={studentForm.classId}
                onChange={e => {
                  const newClassId = e.target.value;
                  const autoRoll = generateRollNumber(newClassId);
                  const autoCode = studentForm.secretCode || generateSecretCode();
                  setStudentForm({ ...studentForm, classId: newClassId, rollNumber: autoRoll, secretCode: autoCode });
                }}
                className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-500 dark:border-neutral-800"
              >
                <option value="">-- Select Class --</option>
                {classes.map(c => <option key={c.id} value={c.id}>Class {c.name}-{c.section}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400 flex items-center justify-between">
                <span>Roll Number <span className="text-blue-500 normal-case font-medium">(Auto-generated)</span></span>
              </label>
              <div className="relative mt-1">
                <input
                  readOnly
                  type="text"
                  value={studentForm.rollNumber || (studentForm.classId ? generateRollNumber(studentForm.classId) : "Select a class first")}
                  className="w-full rounded-xl border bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40 p-3 font-mono text-blue-700 dark:text-blue-300 outline-none cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-blue-500 font-bold uppercase tracking-wider">Auto</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400 flex items-center justify-between">
                <span>Secret Code <span className="text-green-600 normal-case font-medium">(Auto-generated)</span></span>
                <button
                  type="button"
                  onClick={() => setStudentForm({ ...studentForm, secretCode: generateSecretCode() })}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-lg"
                >
                  ↺ Regenerate
                </button>
              </label>
              <div className="relative mt-1">
                <input
                  readOnly
                  type="text"
                  value={studentForm.secretCode || "Click Regenerate or select a class"}
                  className="w-full rounded-xl border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/40 p-3 font-mono text-lg tracking-widest text-green-700 dark:text-green-300 outline-none cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-green-600 font-bold uppercase tracking-wider">6-digit PIN</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1.5">📋 Please note this code — share it with the student. It cannot be recovered later without regenerating.</p>
            </div>
            <button
              type="submit"
              disabled={!studentForm.classId || !studentForm.name || !studentForm.fatherName}
              className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Student Profile
            </button>
          </form>
        </Modal>
      )}

      {/* Edit Student Modal */}
      {showEditStudent && (
        <Modal title="Edit Student Profile" onClose={() => { setShowEditStudent(null); setEditStudentForm({ name: "", fatherName: "", classId: "", rollNumber: "", secretCode: "" }); }}>
          <form onSubmit={updateStudent} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400">Full Name</label>
              <input required type="text" value={editStudentForm.name} onChange={e => setEditStudentForm({ ...editStudentForm, name: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-500 dark:border-neutral-800" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400">Father's Name</label>
              <input required type="text" value={editStudentForm.fatherName} onChange={e => setEditStudentForm({ ...editStudentForm, fatherName: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-550 dark:border-neutral-800" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400">Classroom Grade</label>
              <select
                required
                value={editStudentForm.classId}
                onChange={e => {
                  const newClassId = e.target.value;
                  const autoRoll = generateRollNumber(newClassId);
                  setEditStudentForm({ ...editStudentForm, classId: newClassId, rollNumber: autoRoll });
                }}
                className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-500 dark:border-neutral-800"
              >
                <option value="">-- Select Class --</option>
                {classes.map(c => <option key={c.id} value={c.id}>Class {c.name}-{c.section}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400">Roll Number</label>
              <input required type="text" value={editStudentForm.rollNumber} onChange={e => setEditStudentForm({ ...editStudentForm, rollNumber: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-500 dark:border-neutral-800" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400 flex items-center justify-between">
                <span>Secret Code</span>
                <button
                  type="button"
                  onClick={() => setEditStudentForm({ ...editStudentForm, secretCode: generateSecretCode() })}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-lg"
                >
                  ↺ Regenerate
                </button>
              </label>
              <input required type="text" maxLength={6} value={editStudentForm.secretCode} onChange={e => setEditStudentForm({ ...editStudentForm, secretCode: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 font-mono outline-blue-500 dark:border-neutral-800" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700">Save Changes</button>
          </form>
        </Modal>
      )}

      {/* Add Lecture Modal */}
      {showAddLecture && (
        <Modal title="Schedule Lecture Window" onClose={() => setShowAddLecture(false)}>
          <form onSubmit={addLecture} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-neutral-400">Lecture Number</label>
                <input required type="number" min={1} max={10} value={lectureForm.number} onChange={e => setLectureForm({ ...lectureForm, number: Number(e.target.value) })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-500 dark:border-neutral-800" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-neutral-400">Lecture Subject</label>
                <select required value={lectureForm.subject} onChange={e => setLectureForm({ ...lectureForm, subject: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-500 dark:border-neutral-800">
                  <option value="">-- Choose Subject --</option>
                  {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-neutral-400">Start Time</label>
                <input required type="time" value={lectureForm.start} onChange={e => setLectureForm({ ...lectureForm, start: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 font-mono outline-blue-500 dark:border-neutral-800" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-neutral-400">End Time</label>
                <input required type="time" value={lectureForm.end} onChange={e => setLectureForm({ ...lectureForm, end: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 font-mono outline-blue-550 dark:border-neutral-800" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400">Google Meet Link</label>
              <input required type="url" placeholder="https://meet.google.com/abc-defg-hij" value={lectureForm.meetLink} onChange={e => setLectureForm({ ...lectureForm, meetLink: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-500 dark:border-neutral-800" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700">Save Lecture Period</button>
          </form>
        </Modal>
      )}

      {/* Edit Lecture Modal */}
      {showEditLecture && (
        <Modal title={`Edit Lecture Window #${showEditLecture.number}`} onClose={() => setShowEditLecture(null)}>
          <form onSubmit={updateLecture} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-neutral-400">Lecture Number</label>
                <input required type="number" min={1} max={10} value={editLectureForm.number} onChange={e => setEditLectureForm({ ...editLectureForm, number: Number(e.target.value) })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-500 dark:border-neutral-800" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-neutral-400">Lecture Subject</label>
                <select required value={editLectureForm.subject} onChange={e => setEditLectureForm({ ...editLectureForm, subject: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-550 dark:border-neutral-800">
                  <option value="">-- Choose Subject --</option>
                  {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-neutral-400">Start Time</label>
                <input required type="time" value={editLectureForm.start} onChange={e => setEditLectureForm({ ...editLectureForm, start: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 font-mono outline-blue-550 dark:border-neutral-800" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-neutral-400">End Time</label>
                <input required type="time" value={editLectureForm.end} onChange={e => setEditLectureForm({ ...editLectureForm, end: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 font-mono outline-blue-550 dark:border-neutral-800" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400">Google Meet Link</label>
              <input required type="url" placeholder="https://meet.google.com/abc-defg-hij" value={editLectureForm.meetLink} onChange={e => setEditLectureForm({ ...editLectureForm, meetLink: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-500 dark:border-neutral-800" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700">Save Changes</button>
          </form>
        </Modal>
      )}

      {/* Teacher Attendance Logs Modal */}
      {viewTeacherDetails && (() => {
        const subject = subjects.find(sub => sub.id === viewTeacherDetails.subjectId);
        const subjectName = subject ? subject.name : "N/A";
        
        const teacherLogs = attendanceLogs.filter(log =>
          (log.subject || "").toLowerCase() === subjectName.toLowerCase()
        );
        
        const groupKey = (log: any) => `${log.date}_Lec${log.lecture_number}`;
        const groupedLogs: { [key: string]: { date: string, lec: number, presents: number } } = {};
        
        teacherLogs.forEach(log => {
          const key = groupKey(log);
          if (!groupedLogs[key]) {
            groupedLogs[key] = { date: log.date, lec: log.lecture_number, presents: 0 };
          }
          if (log.status === "Present") {
            groupedLogs[key].presents += 1;
          }
        });
        
        const logsList = Object.values(groupedLogs).sort((a, b) => b.date.localeCompare(a.date));

        return (
          <Modal title={`Attendance logs: ${viewTeacherDetails.name}`} onClose={() => setViewTeacherDetails(null)}>
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl text-xs space-y-1">
                <p>Instructor: <span className="font-bold">{viewTeacherDetails.name}</span></p>
                <p>Subject: <span className="font-bold text-blue-600 dark:text-blue-400">{subjectName}</span></p>
                <p>Total logged checks: <span className="font-bold">{teacherLogs.length}</span></p>
              </div>

              {logsList.length === 0 ? (
                <p className="text-xs text-neutral-400 italic text-center py-4">No student check-ins recorded for this instructor's classes.</p>
              ) : (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase text-neutral-400">Class Sessions History</h4>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b dark:border-neutral-800 text-neutral-500">
                        <th className="py-2">Date</th>
                        <th className="py-2">Lecture</th>
                        <th className="py-2 text-right">Presents Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logsList.map((item, idx) => (
                        <tr key={idx} className="border-b dark:border-neutral-850 py-2">
                          <td className="py-2 font-mono">{item.date}</td>
                          <td className="py-2 font-semibold">Lecture {item.lec}</td>
                          <td className="py-2 text-right font-bold text-green-600 dark:text-green-400">{item.presents} Present</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Modal>
        );
      })()}

      {/* Student Details & Analytics Modal */}
      {viewStudentDetails && (() => {
        const studentClass = classes.find(c => c.id === viewStudentDetails.classId);
        const className = studentClass ? `${studentClass.name}-${studentClass.section}` : "N/A";
        
        const studentLogs = attendanceLogs.filter(log =>
          log.student_id === viewStudentDetails.id
        );
        
        const filteredLogs = studentLogs.filter(log =>
          log.date && log.date.startsWith(studentMonthFilter)
        );

        const totalPresent = studentLogs.filter(l => l.status === "Present").length;
        const totalAbsent = studentLogs.filter(l => l.status === "Absent").length;
        const totalLectures = totalPresent + totalAbsent || 1;
        const rate = Math.round((totalPresent / totalLectures) * 100);

        return (
          <Modal title="Student Profile & Analytics" onClose={() => setViewStudentDetails(null)}>
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              
              <div className="flex gap-4 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border dark:border-neutral-800">
                {viewStudentDetails.profilePhoto || viewStudentDetails.profile_photo ? (
                  <img src={viewStudentDetails.profilePhoto || viewStudentDetails.profile_photo} alt="Profile" className="w-20 h-20 rounded-full object-cover border border-neutral-350 dark:border-neutral-700 shadow-sm shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-3xl border border-blue-200 shrink-0">
                    {viewStudentDetails.name.charAt(0)}
                  </div>
                )}
                <div className="space-y-1 text-xs">
                  <h4 className="text-sm font-extrabold text-neutral-900 dark:text-white">{viewStudentDetails.name}</h4>
                  <p>Father: <span className="font-semibold">{viewStudentDetails.fatherName || "N/A"}</span></p>
                  <p>Classroom: <span className="font-semibold">Class {className}</span></p>
                  <p>Roll No: <span className="font-mono font-semibold">{viewStudentDetails.rollNumber}</span></p>
                  <p>Secret PIN: <span className="font-mono font-bold text-indigo-600">{viewStudentDetails.code || viewStudentDetails.secretCode}</span></p>
                  {viewStudentDetails.mobile && (
                    <p>Mobile: <span className="font-mono">{viewStudentDetails.mobile}</span></p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 border dark:border-neutral-800 rounded-xl text-center bg-green-50/30 dark:bg-green-950/10">
                  <p className="text-[10px] text-neutral-500 font-medium">Logged Days</p>
                  <p className="text-lg font-black text-green-600 dark:text-green-400">{studentLogs.length}</p>
                </div>
                <div className="p-3 border dark:border-neutral-800 rounded-xl text-center bg-blue-50/30 dark:bg-blue-950/10">
                  <p className="text-[10px] text-neutral-500 font-medium">Month Checks</p>
                  <p className="text-lg font-black text-blue-600 dark:text-blue-400">{filteredLogs.length}</p>
                </div>
                <div className="p-3 border dark:border-neutral-800 rounded-xl text-center bg-indigo-50/30 dark:bg-indigo-950/10">
                  <p className="text-[10px] text-neutral-500 font-medium">Index Score</p>
                  <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{rate}%</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase text-neutral-400">Date-wise Logs</h4>
                  <input
                    type="month"
                    value={studentMonthFilter}
                    onChange={e => setStudentMonthFilter(e.target.value)}
                    className="text-xs bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-lg border outline-none font-mono"
                  />
                </div>

                {filteredLogs.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic text-center py-4">No check-ins found for the month of {studentMonthFilter}.</p>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b dark:border-neutral-800 text-neutral-500">
                        <th className="py-2">Date</th>
                        <th className="py-2">Lec</th>
                        <th className="py-2">Subject</th>
                        <th className="py-2">Time</th>
                        <th className="py-2 text-right">Trust Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log, idx) => (
                        <tr key={idx} className="border-b dark:border-neutral-850 py-2">
                          <td className="py-2 font-mono">{log.date}</td>
                          <td className="py-2 font-bold">L{log.lecture_number}</td>
                          <td className="py-2">{log.subject}</td>
                          <td className="py-2 font-mono">{log.time}</td>
                          <td className="py-2 text-right font-mono font-bold text-green-600 dark:text-green-400">{log.trust_score || log.trust || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </Modal>
        );
      })()}
    </main>
  );
}

// Stats Card Helper Component
function StatsCard({ label, value, icon: Icon, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-3xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow dark:bg-neutral-900 dark:border-white/10 block w-full outline-none hover:border-blue-300 dark:hover:border-blue-900"
    >
      <Icon className="text-blue-600" />
      <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="text-3xl font-extrabold">{value}</p>
    </button>
  );
}

// Modal Container Component
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4 text-neutral-900 dark:text-neutral-50">
      <div className="glass w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 border border-white/20 p-6 shadow-2xl animate-in scale-in duration-200">
        <div className="flex justify-between items-center border-b dark:border-neutral-800 pb-3 mb-4">
          <h3 className="font-extrabold text-lg">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Bar Chart Helper Component
function BarChartItem({ label, percentage, color }: { label: string; percentage: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm font-semibold mb-1">
        <span>{label}</span>
        <span className="font-mono">{percentage}%</span>
      </div>
      <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden border dark:border-neutral-700">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
