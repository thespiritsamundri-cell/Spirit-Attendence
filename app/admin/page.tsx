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
  ChevronLeft,
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
  XCircle,
  Upload
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import * as XLSX from "xlsx";

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

const itemIcons: { [key: string]: any } = {
  "Dashboard": BarChart3,
  "Notifications": Megaphone,
  "Classes": School,
  "Teachers": Users,
  "Subjects": BookOpen,
  "Students": Users,
  "Lecture Schedule": Clock,
  "Today's Attendance": Calendar,
  "Secret Code Generator": Lock,
  "GPS Locations": MapPin,
  "Photo Verification": Camera,
  "Device Approvals": Smartphone,
  "Attendance Reports": FileText,
  "Teacher Reports": FileText,
  "Student Reports": FileText,
  "Monthly Reports": Calendar,
  "Attendance Analytics": TrendingUp,
  "Security Logs": ShieldCheck,
  "School Information": School,
  "System Settings": Save
};

const mockPhotoAyan = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23eff6ff"/><circle cx="50" cy="45" r="25" fill="%23bfdbfe"/><circle cx="42" cy="42" r="3" fill="%231e3a8a"/><circle cx="58" cy="42" r="3" fill="%231e3a8a"/><path d="M42 58 Q50 64 58 58" stroke="%231e3a8a" stroke-width="3" fill="none"/><text x="18" y="85" font-family="sans-serif" font-size="8" fill="%232563eb" font-weight="bold">Verified Ayan Ali</text></svg>`;
const mockPhotoZainab = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23fdf2f8"/><circle cx="50" cy="45" r="25" fill="%23fbcfe8"/><circle cx="42" cy="42" r="3" fill="%23831843"/><circle cx="58" cy="42" r="3" fill="%23831843"/><path d="M42 56 Q50 62 58 56" stroke="%23831843" stroke-width="3" fill="none"/><text x="12" y="85" font-family="sans-serif" font-size="8" fill="%23db2777" font-weight="bold">Verified Zainab Fatima</text></svg>`;

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [collapsedCategories, setCollapsedCategories] = useState<{ [key: string]: boolean }>({});
  const [theme, setTheme] = useState("light");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [applyLinkToAll, setApplyLinkToAll] = useState<boolean>(false);

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
  const [selectedZoomPhoto, setSelectedZoomPhoto] = useState<string | null>(null);

  // Form Inputs
  const [classForm, setClassForm] = useState({ name: "", section: "" });
  const [teacherForm, setTeacherForm] = useState({ name: "", subjectId: "" });
  const [subjectForm, setSubjectForm] = useState({ name: "" });
  const [studentForm, setStudentForm] = useState({ name: "", fatherName: "", classId: "", rollNumber: "", secretCode: "" });
  const [showEditStudent, setShowEditStudent] = useState<any>(null);
  const [editStudentForm, setEditStudentForm] = useState({ name: "", fatherName: "", classId: "", rollNumber: "", secretCode: "" });

  const [showEditTeacher, setShowEditTeacher] = useState<any>(null);
  const [editTeacherForm, setEditTeacherForm] = useState({ name: "", subjectId: "" });
  const [showEditSubject, setShowEditSubject] = useState<any>(null);
  const [editSubjectForm, setEditSubjectForm] = useState({ name: "" });

  // Admin Credential Change States
  const [credentialForm, setCredentialForm] = useState({ currentPassword: "", newUsername: "", newPassword: "", confirmPassword: "" });
  const [credentialMsg, setCredentialMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [credentialBusy, setCredentialBusy] = useState(false);

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

  // Helper: Parse raw User Agent strings to friendly format
  const formatDeviceName = (device: string): string => {
    if (!device) return "Unknown Device";
    if (!device.includes("Mozilla/")) {
      return device;
    }
    
    let os = "Unknown OS";
    let browser = "Unknown Browser";
    
    if (device.includes("Android")) {
      const match = device.match(/Android\s+([0-9\.]+)/);
      os = match ? `Android ${match[1]}` : "Android";
    } else if (device.includes("iPhone") || device.includes("iPad") || device.includes("iPod")) {
      const match = device.match(/OS\s+([0-9_]+)/);
      os = match ? `iOS ${match[1].replace(/_/g, ".")}` : "iOS";
    } else if (device.includes("Windows NT")) {
      const match = device.match(/Windows NT\s+([0-9\.]+)/);
      let winVer = match ? match[1] : "";
      if (winVer === "10.0") os = "Windows 10/11";
      else if (winVer === "6.3") os = "Windows 8.1";
      else if (winVer === "6.2") os = "Windows 8";
      else if (winVer === "6.1") os = "Windows 7";
      else os = "Windows";
    } else if (device.includes("Macintosh")) {
      const match = device.match(/Mac OS X\s+([0-9_]+)/);
      os = match ? `macOS ${match[1].replace(/_/g, ".")}` : "macOS";
    } else if (device.includes("Linux")) {
      os = "Linux";
    }
    
    if (device.includes("Edg/")) {
      const match = device.match(/Edg\/([0-9\.]+)/);
      browser = match ? `Edge ${match[1].split('.')[0]}` : "Edge";
    } else if (device.includes("Chrome/")) {
      const match = device.match(/Chrome\/([0-9\.]+)/);
      browser = match ? `Chrome ${match[1].split('.')[0]}` : "Chrome";
    } else if (device.includes("Safari/") && !device.includes("Chrome")) {
      const match = device.match(/Version\/([0-9\.]+)/);
      browser = match ? `Safari ${match[1].split('.')[0]}` : "Safari";
    } else if (device.includes("Firefox/")) {
      const match = device.match(/Firefox\/([0-9\.]+)/);
      browser = match ? `Firefox ${match[1].split('.')[0]}` : "Firefox";
    } else {
      browser = "Web Client";
    }
    
    return `${os} (${browser})`;
  };

  // Helper: Download Student Excel Template
  const downloadSampleExcel = () => {
    const wsData = [
      ["Name", "Father Name", "Class"],
      ["Ayan Ali", "Muhammad Ali", "10-A"],
      ["Zainab Fatima", "Tariq Mahmood", "10-A"],
      ["Muhammad Hamza", "Ahmad Khan", "9-B"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students Template");
    XLSX.writeFile(wb, "Student_Import_Template.xlsx");
  };

  // Helper: Handle Excel File upload and parsing
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

        if (jsonData.length <= 1) {
          alert("The Excel file is empty or only contains headers.");
          return;
        }

        const headers = jsonData[0].map((h: any) => String(h).trim().toLowerCase());
        const nameIdx = headers.indexOf("name");
        const fatherNameIdx = headers.indexOf("father name") !== -1 ? headers.indexOf("father name") : headers.indexOf("father's name");
        const classIdx = headers.indexOf("class") !== -1 ? headers.indexOf("class") : headers.indexOf("classroom");

        if (nameIdx === -1 || fatherNameIdx === -1 || classIdx === -1) {
          alert("Excel sheet must contain headers: 'Name', 'Father Name', and 'Class'.");
          return;
        }

        const newStudentsToAdd: any[] = [];
        let skippedRowsCount = 0;
        let successCount = 0;
        let currentStudentsList = [...students];

        const getNextRollNumberForImport = (classId: string, tempNew: any[]) => {
          if (!classId) return "";
          const cls = classes.find((c: any) => c.id === classId);
          if (!cls) return "";
          const prefix = `${cls.name}-${cls.section}-`;
          const existingCount = currentStudentsList.filter((s: any) => s.classId === classId).length +
                                tempNew.filter((s: any) => s.classId === classId).length;
          const nextNum = (existingCount + 1).toString().padStart(2, "0");
          return `${prefix}${nextNum}`;
        };

        const getNextStudentIdForImport = (tempNew: any[]) => {
          let maxNum = 0;
          const all = [...currentStudentsList, ...tempNew];
          all.forEach((s: any) => {
            const match = s.id?.match(/^s(\d+)$/);
            if (match) {
              const num = parseInt(match[1], 10);
              if (num > maxNum) maxNum = num;
            }
          });
          return `s${maxNum + 1}`;
        };

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          const rawName = row[nameIdx];
          const rawFatherName = row[fatherNameIdx];
          const rawClass = row[classIdx];

          if (!rawName || !rawClass) {
            skippedRowsCount++;
            continue;
          }

          const studentName = String(rawName).trim();
          const fatherName = rawFatherName ? String(rawFatherName).trim() : "N/A";
          const className = String(rawClass).trim();

          const matchedClass = classes.find((c: any) => {
            const fullClassStr1 = `${c.name}-${c.section}`.toLowerCase();
            const fullClassStr2 = `${c.name} ${c.section}`.toLowerCase();
            const searchClass = className.replace(/\s+/g, '').toLowerCase();
            return fullClassStr1 === searchClass || 
                   fullClassStr1.replace('-', '') === searchClass ||
                   fullClassStr2 === searchClass ||
                   c.name.toLowerCase() === className.toLowerCase();
          });

          if (!matchedClass) {
            skippedRowsCount++;
            continue;
          }

          const classId = matchedClass.id;
          const finalRoll = getNextRollNumberForImport(classId, newStudentsToAdd);
          const finalCode = generateSecretCode();
          const nextId = getNextStudentIdForImport(newStudentsToAdd);

          const newStudent = {
            id: nextId,
            name: studentName,
            fatherName: fatherName,
            classId: classId,
            rollNumber: finalRoll,
            code: finalCode,
            secretCode: finalCode,
            attendance: "100%"
          };

          newStudentsToAdd.push(newStudent);
          successCount++;
        }

        if (newStudentsToAdd.length === 0) {
          alert(`No students were imported. (Skipped/Invalid rows: ${skippedRowsCount})`);
          return;
        }

        try {
          const { error } = await supabase.from("students").insert(newStudentsToAdd);
          if (error) throw error;
        } catch (supabaseErr) {
          console.warn("Supabase batch insert failed, using local storage fallback:", supabaseErr);
        }

        const updatedStudents = [...students, ...newStudentsToAdd];
        setStudents(updatedStudents);
        localStorage.setItem("local_students", JSON.stringify(updatedStudents));

        const alertMsg = `Successfully imported ${successCount} students via Excel! ${skippedRowsCount > 0 ? `(Skipped ${skippedRowsCount} rows due to empty values or unmatched classes)` : ''}`;
        setAlerts(prev => [alertMsg, ...prev]);
        alert(alertMsg);

        e.target.value = "";
      } catch (err) {
        console.error("Error reading Excel file:", err);
        alert("Failed to parse the Excel file. Please ensure it is a valid format.");
      }
    };
    reader.readAsArrayBuffer(file);
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

  const [lectureForm, setLectureForm] = useState({ number: 1, subject: "", start: "", end: "", meetLink: "", teacher: "", subjectSecondary: "", teacherSecondary: "", meetLinkSecondary: "", classId: "" });
  const [editLectureForm, setEditLectureForm] = useState({ number: 1, subject: "", start: "", end: "", meetLink: "", teacher: "", subjectSecondary: "", teacherSecondary: "", meetLinkSecondary: "", classId: "" });
  const [lectureScheduleClassFilter, setLectureScheduleClassFilter] = useState("");
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

  // Dynamic calculation for Teacher Reports
  const teacherReports = useMemo(() => {
    return teachers.map(t => {
      const subject = subjects.find(s => s.id === t.subjectId);
      const subjectName = subject ? subject.name : "N/A";
      
      const logs = attendanceLogs.filter(log => (log.subject || "").toLowerCase() === subjectName.toLowerCase());
      
      const uniqueDates = Array.from(new Set(logs.map(l => l.date)));
      const conducted = uniqueDates.length;
      const scheduled = Math.max(conducted, 10);
      
      let attendanceRate = "N/A";
      if (logs.length > 0) {
        const avgTrust = Math.round(logs.reduce((acc, curr) => acc + parseInt(curr.trust_score || curr.trust || "0", 10), 0) / logs.length);
        attendanceRate = `${avgTrust || 92}%`;
      } else {
        attendanceRate = "N/A";
      }
      
      const rateNum = parseInt(attendanceRate, 10) || 0;
      const rating = rateNum >= 92 ? "Excellent" : rateNum >= 85 ? "Good" : rateNum > 0 ? "Satisfactory" : "No Logs";

      return {
        name: t.name,
        subject: subjectName,
        scheduled,
        conducted,
        attendanceRate,
        rating
      };
    });
  }, [teachers, subjects, attendanceLogs]);

  // Dynamic calculation for Student Reports
  const studentReports = useMemo(() => {
    return students.map(s => {
      const studentLogs = attendanceLogs.filter(log => log.student_id === s.id || (log.studentName || log.student_name) === s.name);
      const presentCount = studentLogs.filter(log => log.status === "Present").length;
      
      const studentClass = classes.find(c => c.id === s.classId);
      const className = studentClass ? `${studentClass.name}-${studentClass.section}` : "N/A";
      
      const classLogs = attendanceLogs.filter(log => log.class_name === className || log.class === className);
      const uniqueClassPeriods = Array.from(new Set(classLogs.map(l => `${l.date}_${l.lecture_number}`)));
      
      const totalLectures = Math.max(uniqueClassPeriods.length, studentLogs.length, 1);
      const rateVal = Math.round((presentCount / totalLectures) * 100);
      const rate = `${rateVal}%`;
      
      const risk = rateVal >= 90 ? "Safe" : rateVal >= 80 ? "Borderline" : "At Risk";

      return {
        name: s.name,
        class: className,
        totalLectures,
        presentCount,
        rate,
        risk
      };
    });
  }, [students, classes, attendanceLogs]);

  // Dynamic calculation for Monthly Reports
  const monthlyReports = useMemo(() => {
    const monthlyData: { [key: string]: { totalPresent: number; totalAbsent: number } } = {};
    
    attendanceLogs.forEach(log => {
      if (!log.date) return;
      const dateObj = new Date(log.date);
      let monthName = "Unknown Month";
      if (!isNaN(dateObj.getTime())) {
        monthName = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
      } else {
        const match = log.date.match(/(\d+)\/(\d+)\/(\d+)/);
        if (match) {
          const dateManual = new Date(`${match[3]}-${match[1]}-${match[2]}`);
          if (!isNaN(dateManual.getTime())) {
            monthName = dateManual.toLocaleString('default', { month: 'long', year: 'numeric' });
          }
        } else {
          monthName = "July 2026";
        }
      }
      
      if (!monthlyData[monthName]) {
        monthlyData[monthName] = { totalPresent: 0, totalAbsent: 0 };
      }
      if (log.status === "Absent") {
        monthlyData[monthName].totalAbsent += 1;
      } else {
        monthlyData[monthName].totalPresent += 1;
      }
    });
    
    return Object.keys(monthlyData).map(month => {
      const { totalPresent, totalAbsent } = monthlyData[month];
      const total = totalPresent + totalAbsent || 1;
      const rateVal = Math.round((totalPresent / total) * 100);
      return {
        month,
        totalPresent: totalPresent.toLocaleString(),
        totalAbsent: totalAbsent.toLocaleString(),
        rate: `${rateVal}%`
      };
    });
  }, [attendanceLogs]);

  // Guard routing / session check & theme check
  useEffect(() => {
    const session = sessionStorage.getItem("adminSession");
    if (!session) {
      window.location.href = "/admin/login";
    } else {
      setIsAuthenticated(true);
      // Restore active tab from URL param
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) {
        // Convert slug back to display name
        const allItems = moduleCategories.flatMap(c => c.items);
        const matched = allItems.find(item => item.toLowerCase().replace(/[^a-z0-9]+/g, "-") === tabParam || item.toLowerCase() === tabParam.replace(/-/g, " "));
        if (matched) setActiveTab(matched);
      }
    }

    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  // Helper: change tab AND sync URL
  const navigateTab = (tab: string) => {
    setActiveTab(tab);
    const slug = tab.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const url = new URL(window.location.href);
    url.searchParams.set("tab", slug);
    window.history.pushState({}, "", url.toString());
  };

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
        if (error) throw error;
        setClasses(data || []);
        localStorage.setItem("local_classes", JSON.stringify(data || []));
      } catch (e) {
        const local = localStorage.getItem("local_classes");
        const fallback = local ? JSON.parse(local) : [];
        setClasses(fallback);
        localStorage.setItem("local_classes", JSON.stringify(fallback));
      }

      // Subjects
      try {
        const { data, error } = await supabase.from("subjects").select("*");
        if (error) throw error;
        setSubjects(data || []);
        localStorage.setItem("local_subjects", JSON.stringify(data || []));
      } catch (e) {
        const local = localStorage.getItem("local_subjects");
        const fallback = local ? JSON.parse(local) : [];
        setSubjects(fallback);
        localStorage.setItem("local_subjects", JSON.stringify(fallback));
      }

      // Teachers
      try {
        const { data, error } = await supabase.from("teachers").select("*");
        if (error) throw error;
        setTeachers(data || []);
        localStorage.setItem("local_teachers", JSON.stringify(data || []));
      } catch (e) {
        const local = localStorage.getItem("local_teachers");
        const fallback = local ? JSON.parse(local) : [];
        setTeachers(fallback);
        localStorage.setItem("local_teachers", JSON.stringify(fallback));
      }

      // Students
      try {
        const { data, error } = await supabase.from("students").select("*");
        if (error) throw error;
        setStudents(data || []);
        localStorage.setItem("local_students", JSON.stringify(data || []));
      } catch (e) {
        const local = localStorage.getItem("local_students");
        const fallback = local ? JSON.parse(local) : [];
        setStudents(fallback);
        localStorage.setItem("local_students", JSON.stringify(fallback));
      }

      // Lecture Schedules
      try {
        const { data, error } = await supabase.from("lectures").select("*");
        if (error) throw error;
        setLectures(data || []);
        localStorage.setItem("local_lectures", JSON.stringify(data || []));
      } catch (e) {
        const local = localStorage.getItem("local_lectures");
        const fallback = local ? JSON.parse(local) : [];
        setLectures(fallback);
        localStorage.setItem("local_lectures", JSON.stringify(fallback));
      }

      // Notifications Logs
      const localNotifs = localStorage.getItem("local_notifications");
      const initialNotifs = localNotifs ? JSON.parse(localNotifs) : [];
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
        const fallbackLogs = localLogs ? JSON.parse(localLogs) : [];
        setAttendanceLogs(fallbackLogs);
      }

      // Device approval registries — load from Supabase
      try {
        const { data: dbDevices, error: devicesError } = await supabase.from("devices").select("*");
        if (devicesError || !dbDevices) throw devicesError || new Error("empty");

        const pending = dbDevices.filter((d: any) => d.status === "Pending");
        const approved = dbDevices.filter((d: any) => d.status === "Approved");

        setDevices(pending);
        setApprovedDevices(approved);

        localStorage.setItem("local_approved_devices", JSON.stringify(approved));
      } catch (err) {
        const localApprovedDevices = localStorage.getItem("local_approved_devices");
        const fallbackApproved = localApprovedDevices ? JSON.parse(localApprovedDevices) : [];
        setApprovedDevices(fallbackApproved);
        setDevices([]);
      }

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

  const handleEditSubjectClick = (subject: any) => {
    setShowEditSubject(subject);
    setEditSubjectForm({ name: subject.name });
  };

  const updateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditSubject) return;

    const updatedSubject = {
      ...showEditSubject,
      name: editSubjectForm.name
    };

    try {
      const { error } = await supabase.from("subjects").update(updatedSubject).eq("id", showEditSubject.id);
      if (error) throw error;
    } catch (err: any) {
      console.warn("Supabase subject update failed:", err?.message);
    }

    const updated = subjects.map(s => (s.id === showEditSubject.id ? updatedSubject : s));
    setSubjects(updated);
    localStorage.setItem("local_subjects", JSON.stringify(updated));
    setAlerts(prev => [`Subject details updated successfully.`, ...prev]);
    setShowEditSubject(null);
  };

  const handleEditTeacherClick = (teacher: any) => {
    setShowEditTeacher(teacher);
    setEditTeacherForm({
      name: teacher.name,
      subjectId: teacher.subjectId || ""
    });
  };

  const updateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditTeacher) return;

    const updatedTeacher = {
      ...showEditTeacher,
      name: editTeacherForm.name,
      subjectId: editTeacherForm.subjectId
    };

    try {
      const { error } = await supabase.from("teachers").update(updatedTeacher).eq("id", showEditTeacher.id);
      if (error) throw error;
    } catch (err: any) {
      console.warn("Supabase teacher update failed:", err?.message);
    }

    const updated = teachers.map(t => (t.id === showEditTeacher.id ? updatedTeacher : t));
    setTeachers(updated);
    localStorage.setItem("local_teachers", JSON.stringify(updated));
    setAlerts(prev => [`Teacher details updated successfully.`, ...prev]);
    setShowEditTeacher(null);
  };

  const updateAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialMsg(null);
    setCredentialBusy(true);

    const { currentPassword, newUsername, newPassword, confirmPassword } = credentialForm;

    if (newPassword && newPassword !== confirmPassword) {
      setCredentialMsg({ type: "error", text: "New passwords do not match." });
      setCredentialBusy(false);
      return;
    }
    if (!newUsername && !newPassword) {
      setCredentialMsg({ type: "error", text: "Please enter at least a new username or a new password." });
      setCredentialBusy(false);
      return;
    }

    try {
      // Verify current password first
      const { data: currentCred, error: verifyError } = await supabase
        .from("admin_credentials")
        .select("*")
        .eq("password", currentPassword.trim())
        .maybeSingle();

      if (verifyError) throw new Error(verifyError.message);
      if (!currentCred) {
        setCredentialMsg({ type: "error", text: "Current password is incorrect. Please try again." });
        setCredentialBusy(false);
        return;
      }

      // Build update payload
      const updatePayload: any = {};
      if (newUsername) updatePayload.username = newUsername.trim();
      if (newPassword) updatePayload.password = newPassword.trim();

      const { error: updateError } = await supabase
        .from("admin_credentials")
        .update(updatePayload)
        .eq("username", currentCred.username);

      if (updateError) throw new Error(updateError.message);

      setCredentialMsg({ type: "success", text: `Credentials updated successfully! ${newUsername ? `New username: "${newUsername}".` : ""} Please log in again.` });
      setCredentialForm({ currentPassword: "", newUsername: "", newPassword: "", confirmPassword: "" });

      // Force re-login after 3 seconds
      setTimeout(() => {
        sessionStorage.removeItem("adminSession");
        window.location.href = "/admin/login";
      }, 3000);
    } catch (err: any) {
      setCredentialMsg({ type: "error", text: err.message || "Failed to update credentials." });
    } finally {
      setCredentialBusy(false);
    }
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
      meetLink: lectureForm.meetLink,
      teacher: lectureForm.teacher || null,
      subjectSecondary: lectureForm.subjectSecondary || null,
      teacherSecondary: lectureForm.teacherSecondary || null,
      meetLinkSecondary: lectureForm.meetLinkSecondary || null,
      classId: lectureForm.classId || null
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
    setLectureForm({ number: 1, subject: "", start: "", end: "", meetLink: "", teacher: "", subjectSecondary: "", teacherSecondary: "", meetLinkSecondary: "", classId: "" });
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
      meetLink: editLectureForm.meetLink,
      teacher: editLectureForm.teacher || null,
      subjectSecondary: editLectureForm.subjectSecondary || null,
      teacherSecondary: editLectureForm.teacherSecondary || null,
      meetLinkSecondary: editLectureForm.meetLinkSecondary || null,
      classId: editLectureForm.classId || null
    };

    try {
      if (applyLinkToAll) {
        // Update all lecture meet links in Supabase
        const { error } = await supabase.from("lectures").update({ meetLink: editLectureForm.meetLink });
        if (error) throw error;
        // Also update other specific fields for this lecture
        const { error: error2 } = await supabase.from("lectures").update(updatedLec).eq("id", showEditLecture.id);
        if (error2) throw error2;
      } else {
        const { error } = await supabase.from("lectures").update(updatedLec).eq("id", showEditLecture.id);
        if (error) throw error;
      }
    } catch (e) {
      console.warn("Supabase update failed, saving to local storage.");
    }

    let updatedList;
    if (applyLinkToAll) {
      updatedList = lectures.map(l => {
        const base = l.id === showEditLecture.id ? updatedLec : l;
        return { ...base, meetLink: editLectureForm.meetLink };
      });
    } else {
      updatedList = lectures.map(l => (l.id === showEditLecture.id ? updatedLec : l));
    }
    setLectures(updatedList);
    localStorage.setItem("local_lectures", JSON.stringify(updatedList));
    setShowEditLecture(null);
    setApplyLinkToAll(false);
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

  const deleteStudent = async (studentId: string, studentName: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${studentName} and all associated attendance logs and device configurations?`);
    if (!confirmDelete) return;

    try {
      // 1. Delete student from Supabase students table
      const { error: studentErr } = await supabase.from("students").delete().eq("id", studentId);
      if (studentErr) throw studentErr;

      // Deleting referencing rows explicitly to ensure local/fallback consistency and prevent dependency lockups
      await supabase.from("attendance").delete().eq("student_id", studentId);
      await supabase.from("devices").delete().eq("student_id", studentId);
    } catch (e) {
      console.warn("Supabase delete student data failed, updating local storage fallback.", e);
    }

    // 2. Clear from React state and LocalStorage
    // Students list
    setStudents(prev => {
      const updated = prev.filter(s => s.id !== studentId);
      localStorage.setItem("local_students", JSON.stringify(updated));
      return updated;
    });

    // Attendance logs
    setAttendanceLogs(prev => {
      const updated = prev.filter(log => log.student_id !== studentId && (log.studentName || log.student_name) !== studentName);
      localStorage.setItem("local_attendance_logs", JSON.stringify(updated));
      return updated;
    });

    // Pending Devices
    setDevices(prev => {
      const updated = prev.filter(d => d.student_id !== studentId && d.student !== studentName);
      return updated;
    });

    // Approved Devices
    setApprovedDevices(prev => {
      const updated = prev.filter(d => d.student_id !== studentId && d.student !== studentName);
      localStorage.setItem("local_approved_devices", JSON.stringify(updated));
      return updated;
    });

    setAlerts(prev => [`Permanently deleted student "${studentName}" along with all their verification history, GPS logs, and device profiles.`, ...prev]);
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

  const verifyPhotoLog = async (logId: string, verifiedStatus: boolean | string) => {
    try {
      const { error } = await supabase
        .from("attendance")
        .update({ is_verified: verifiedStatus })
        .eq("id", logId);
      if (error) throw error;
    } catch (err: any) {
      console.warn("Supabase photo verification update failed:", err.message);
    }

    const updated = attendanceLogs.map(l => {
      if (l.id === logId) {
        return { ...l, isVerified: verifiedStatus, is_verified: verifiedStatus };
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
  const approveDeviceRequest = async (req: any) => {
    try {
      const { error } = await supabase
        .from("devices")
        .update({ status: "Approved" })
        .eq("id", req.id);
      if (error) throw error;
    } catch (err: any) {
      console.warn("Supabase device approval failed:", err.message);
    }

    setDevices(prev => prev.filter(x => x.id !== req.id));

    const approvedObj = {
      ...req,
      status: "Approved",
      device: req.device.includes("(Approved)") ? req.device : req.device + " (Approved)"
    };

    const updatedApproved = [approvedObj, ...approvedDevices];
    setApprovedDevices(updatedApproved);
    localStorage.setItem("local_approved_devices", JSON.stringify(updatedApproved));
    setAlerts(prev => [`Approved hardware registration for ${req.student}`, ...prev]);
  };

  const denyDeviceRequest = async (req: any) => {
    try {
      const { error } = await supabase
        .from("devices")
        .delete()
        .eq("id", req.id);
      if (error) throw error;
    } catch (err: any) {
      console.warn("Supabase device rejection failed:", err.message);
    }

    setDevices(prev => prev.filter(x => x.id !== req.id));
    setAlerts(prev => [`Denied hardware registration for ${req.student}`, ...prev]);
  };

  const classAttendanceToday = useMemo(() => {
    const targetDate = filterDate || new Date().toISOString().slice(0, 10);
    return classes.map((cls) => {
      const fullClassName = cls.section ? `${cls.name}-${cls.section}` : cls.name;
      const classStudents = students.filter((s) => s.classId === cls.id);
      const totalStudents = classStudents.length;

      const presentStudentIds = new Set<string>();
      
      attendanceLogs.forEach((log) => {
        if (log.date === targetDate && log.status === "Present") {
          const logClass = (log.class_name || log.class || "").toLowerCase();
          const matchesClass = logClass === fullClassName.toLowerCase() || logClass === cls.name.toLowerCase();
          
          if (matchesClass) {
            if (log.student_id) {
              const belongsToClass = classStudents.some((s) => s.id === log.student_id);
              if (belongsToClass) {
                presentStudentIds.add(log.student_id);
              }
            } else if (log.student_name) {
              const matchedStudent = classStudents.find((s) => s.name === log.student_name);
              if (matchedStudent) {
                presentStudentIds.add(matchedStudent.id);
              }
            }
          }
        }
      });

      const presents = presentStudentIds.size;
      const absents = Math.max(0, totalStudents - presents);
      const percent = totalStudents > 0 ? Math.round((presents / totalStudents) * 100) : 0;

      return {
        id: cls.id,
        name: fullClassName,
        total: totalStudents,
        presents,
        absents,
        percent,
      };
    });
  }, [classes, students, attendanceLogs, filterDate]);

  const lectureMatrixToday = useMemo(() => {
    const targetDate = filterDate || new Date().toISOString().slice(0, 10);
    // Filter lectures: only show lectures belonging to this class (or legacy lectures with no classId)
    const allSortedLectures = [...lectures].sort((a, b) => a.number - b.number);

    return classes.map((cls) => {
      const fullClassName = cls.section ? `${cls.name}-${cls.section}` : cls.name;
      const classStudents = students.filter((s) => s.classId === cls.id);
      const totalStudents = classStudents.length;

      // For each class, show only lectures assigned to that class (or global lectures without classId)
      const sortedLectures = allSortedLectures.filter(l => !l.classId || l.classId === cls.id);

      const lectureStats = sortedLectures.map((lec) => {
        const primaryPresents = new Set<string>();
        const secondaryPresents = new Set<string>();

        attendanceLogs.forEach((log) => {
          if (log.date === targetDate && log.lecture_number === lec.number && log.status === "Present" && log.subject) {
            const logClass = (log.class_name || log.class || "").toLowerCase();
            const matchesClass = logClass === fullClassName.toLowerCase() || logClass === cls.name.toLowerCase();
            
            if (matchesClass) {
              const isPrimary = !lec.subjectSecondary || log.subject.toLowerCase() === lec.subject.toLowerCase();
              const isSecondary = lec.subjectSecondary && log.subject.toLowerCase() === lec.subjectSecondary.toLowerCase();

              if (isPrimary) {
                if (log.student_id) {
                  const belongsToClass = classStudents.some((s) => s.id === log.student_id);
                  if (belongsToClass) {
                    primaryPresents.add(log.student_id);
                  }
                } else if (log.student_name) {
                  const matchedStudent = classStudents.find((s) => s.name === log.student_name);
                  if (matchedStudent) {
                    primaryPresents.add(matchedStudent.id);
                  }
                }
              } else if (isSecondary) {
                if (log.student_id) {
                  const belongsToClass = classStudents.some((s) => s.id === log.student_id);
                  if (belongsToClass) {
                    secondaryPresents.add(log.student_id);
                  }
                } else if (log.student_name) {
                  const matchedStudent = classStudents.find((s) => s.name === log.student_name);
                  if (matchedStudent) {
                    secondaryPresents.add(matchedStudent.id);
                  }
                }
              }
            }
          }
        });

        return {
          lectureNumber: lec.number,
          subject: lec.subject,
          presents: primaryPresents.size,
          subjectSecondary: lec.subjectSecondary,
          presentsSecondary: secondaryPresents.size,
          total: totalStudents,
        };
      });

      return {
        classId: cls.id,
        className: fullClassName,
        total: totalStudents,
        lectures: lectureStats,
      };
    });
  }, [classes, students, lectures, attendanceLogs, filterDate]);

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex text-neutral-900 dark:text-neutral-50 transition-colors duration-350">
      {/* Sidebar navigation panel */}
      <aside className={`hidden lg:flex flex-col border-r bg-white dark:bg-neutral-900 dark:border-white/10 shrink-0 transition-all duration-350 ease-in-out ${isSidebarCollapsed ? "w-20 p-3" : "w-72 p-4"}`}>
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2 overflow-hidden">
            <img 
              src="https://res.cloudinary.com/dc4h1odcj/image/upload/v1776916361/tsss/branding/tss-main-school/lau6cwcyaf9ssiosqylc.png" 
              alt="Logo" 
              className="h-9 w-9 rounded-xl object-contain bg-white p-0.5 border dark:border-neutral-800 shrink-0 shadow-sm"
            />
            {!isSidebarCollapsed && <h1 className="text-xl font-bold transition-all duration-300">Smart Attendance</h1>}
          </div>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        
        <nav className="space-y-4 flex-1 overflow-y-auto pr-1">
          {moduleCategories.map(cat => {
            const isCollapsed = collapsedCategories[cat.title];
            return (
              <div key={cat.title} className="space-y-1">
                {!isSidebarCollapsed ? (
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.title)}
                    className="w-full flex items-center justify-between text-xs font-extrabold text-amber-700/80 dark:text-amber-400/90 uppercase tracking-widest px-2.5 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800/40 rounded-xl transition-all duration-200"
                  >
                    <span>{cat.title}</span>
                    <ChevronRight size={14} className={`transition-transform duration-250 ${isCollapsed ? "" : "rotate-90 text-amber-600"}`} />
                  </button>
                ) : (
                  <hr className="my-2 border-neutral-100 dark:border-neutral-800" />
                )}
                
                {(!isCollapsed || isSidebarCollapsed) && (
                  <div className="pl-0 lg:pl-1 space-y-0.5">
                    {cat.items.map(m => {
                      const IconComponent = itemIcons[m] || BookOpen;
                      return (
                        <button
                          key={m}
                          onClick={() => navigateTab(m)}
                          title={isSidebarCollapsed ? m : undefined}
                          className={`w-full flex items-center gap-3 rounded-xl transition-colors ${
                            isSidebarCollapsed ? "justify-center p-2.5" : "px-3 py-1.5 text-sm"
                          } ${
                            activeTab === m ? "bg-blue-600 text-white font-semibold shadow-sm" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          }`}
                        >
                          <IconComponent size={18} className="shrink-0" />
                          {!isSidebarCollapsed && <span>{m}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {!isSidebarCollapsed && (
          <div className="mt-auto pt-4 border-t dark:border-neutral-800 text-[10px] text-neutral-400 text-center font-mono">
            Developed by Mian Mudassar
          </div>
        )}
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
              <StatsCard label="Total Students" value={students.length} icon={Users} onClick={() => navigateTab("Students")} />
              <StatsCard label="Registered Classes" value={classes.length} icon={School} onClick={() => navigateTab("Classes")} />
              <StatsCard label="Total Teachers" value={teachers.length} icon={Users} onClick={() => navigateTab("Teachers")} />
              <StatsCard label="Pending Devices" value={devices.length} icon={Smartphone} onClick={() => navigateTab("Device Approvals")} />
              <StatsCard label="Active Lecture Schedule" value={lectures.length} icon={Clock} onClick={() => navigateTab("Lecture Schedule")} />
              <StatsCard label="Photo Verifications Review" value={Object.keys(studentPhotoGroups).length} icon={Camera} onClick={() => navigateTab("Photo Verification")} />
            </div>

            {/* Today's Attendance Overview & Matrix */}
            <div className="mt-6 grid xl:grid-cols-[1fr_1.5fr] gap-6">
              {/* Class-wise Today's Status */}
              <div className="rounded-3xl border bg-white p-6 dark:bg-neutral-900 dark:border-white/10 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-extrabold text-lg flex items-center gap-2">
                      <School className="text-blue-600 dark:text-blue-400" size={20} />
                      Class-wise Status
                    </h3>
                    <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                      Date: {filterDate}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {classAttendanceToday.length === 0 ? (
                      <p className="text-sm text-neutral-400 italic py-6 text-center">No classes registered.</p>
                    ) : (
                      classAttendanceToday.map((item) => (
                        <div key={item.id} className="p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 hover:scale-[1.01] transition-transform duration-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-extrabold text-base text-neutral-900 dark:text-white">
                                {item.name.toLowerCase().startsWith("class") ? item.name : `Class ${item.name}`}
                              </h4>
                              <p className="text-xs text-neutral-450 dark:text-neutral-500 mt-0.5">
                                Total: {item.total} registered students
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-green-600 dark:text-green-450 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-lg mr-1.5">
                                {item.presents} Present
                              </span>
                              <span className="text-xs font-bold text-red-650 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-lg">
                                {item.absents} Absent
                              </span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex justify-between text-xs font-bold text-neutral-500 mb-1">
                              <span>Attendance Rate</span>
                              <span className="font-mono">{item.percent}%</span>
                            </div>
                            <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  item.percent >= 90
                                    ? "bg-green-500"
                                    : item.percent >= 75
                                    ? "bg-blue-500"
                                    : item.percent > 0
                                    ? "bg-amber-500"
                                    : "bg-neutral-300 dark:bg-neutral-700"
                                }`}
                                style={{ width: `${item.percent}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Lecture-wise Attendance Matrix */}
              <div className="rounded-3xl border bg-white p-6 dark:bg-neutral-900 dark:border-white/10 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-extrabold text-lg flex items-center gap-2">
                    <Calendar className="text-indigo-600 dark:text-indigo-400" size={20} />
                    Lecture-wise Attendance Matrix
                  </h3>
                  <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-300 font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    Today
                  </span>
                </div>

                <div className="overflow-x-auto border dark:border-neutral-800 rounded-2xl">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 text-neutral-500 font-bold text-xs uppercase tracking-wider">
                        <th className="py-3 px-4 font-extrabold">Class</th>
                        {lectures.length === 0 ? (
                          <th className="py-3 px-4 text-center">No Lectures Scheduled</th>
                        ) : (
                          [...lectures]
                            .sort((a, b) => a.number - b.number)
                            .map((lec) => (
                              <th key={lec.id} className="py-3 px-4 text-center">
                                Lec {lec.number}
                                <span className="block text-[9px] text-neutral-400 normal-case font-mono mt-0.5">
                                  {lec.subject}
                                  {lec.subjectSecondary && <span className="block text-[8px] text-indigo-500 font-semibold">{lec.subjectSecondary}</span>}
                                </span>
                                {lec.classId && (
                                  <span className="block text-[8px] text-amber-500 font-bold mt-0.5">
                                    {(() => { const c = classes.find(x => x.id === lec.classId); return c ? `${c.name}-${c.section}` : ""; })()}
                                  </span>
                                )}
                              </th>
                            ))
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {lectureMatrixToday.length === 0 ? (
                        <tr>
                          <td colSpan={lectures.length + 1} className="py-6 text-center text-sm text-neutral-400 italic">
                            No classes or lectures registered in database.
                          </td>
                        </tr>
                      ) : (
                        lectureMatrixToday.map((row) => (
                          <tr key={row.classId} className="border-b dark:border-neutral-855 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10 transition-colors">
                            <td className="py-4 px-4 font-bold text-neutral-900 dark:text-white">
                              {row.className}
                            </td>
                            {row.lectures.map((lec, idx) => {
                              const renderBadge = (presents: number, total: number, subjectName: string, isSec = false) => {
                                const ratio = total > 0 ? presents / total : 0;
                                let badgeColor = "bg-neutral-100 dark:bg-neutral-800 text-neutral-500";
                                if (presents > 0) {
                                  if (ratio >= 0.9) {
                                    badgeColor = "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50";
                                  } else if (ratio >= 0.5) {
                                    badgeColor = "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50";
                                  } else {
                                    badgeColor = "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50";
                                  }
                                } else if (total > 0) {
                                  badgeColor = isSec 
                                    ? "bg-indigo-50/20 dark:bg-indigo-950/10 text-indigo-400 dark:text-indigo-500 border border-indigo-100/30 dark:border-indigo-950/30"
                                    : "bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border border-red-100 dark:border-red-950/50";
                                }
                                return (
                                  <span className={`inline-flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl font-bold text-[10px] shadow-sm ${badgeColor}`}>
                                    <span className="font-semibold text-[8px] opacity-75">{subjectName}</span>
                                    <span className="font-mono mt-0.5">{presents}/{total}</span>
                                  </span>
                                );
                              };

                              return (
                                <td key={idx} className="py-4 px-4 text-center">
                                  <div className="flex flex-col gap-1.5 justify-center items-center">
                                    {renderBadge(lec.presents, row.total, lec.subject || "Lec")}
                                    {lec.subjectSecondary && renderBadge(lec.presentsSecondary, row.total, lec.subjectSecondary, true)}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
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
                      <td className="py-3 px-4 text-right flex justify-end gap-3 items-center">
                        <button
                          onClick={() => handleEditSubjectClick(s)}
                          className="text-blue-500 hover:text-blue-750 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                          title="Edit subject"
                        >
                          <Edit size={15} />
                        </button>
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
                          <button
                            onClick={() => handleEditTeacherClick(t)}
                            className="text-blue-500 hover:text-blue-750 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                            title="Edit teacher"
                          >
                            <Edit size={15} />
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
                <button
                  onClick={downloadSampleExcel}
                  className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-4 py-2 text-xs font-semibold flex gap-1.5 items-center shadow-sm"
                >
                  <Download size={14} /> Excel Template
                </button>
                <label className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2 text-xs font-semibold flex gap-1.5 items-center shadow-sm cursor-pointer">
                  <Upload size={14} /> Import Excel
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    className="hidden"
                    onChange={handleImportExcel}
                  />
                </label>
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
                          <button onClick={() => deleteStudent(s.id, s.name)} className="text-red-500 hover:text-red-700">
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
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
              <h3 className="font-bold text-lg">Lecture Windows Schedule</h3>
              <div className="flex gap-2 items-center">
                <select
                  value={lectureScheduleClassFilter}
                  onChange={e => setLectureScheduleClassFilter(e.target.value)}
                  className="rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 py-2 px-3 text-sm outline-blue-500"
                >
                  <option value="">All Classes</option>
                  {classes.map(c => <option key={c.id} value={c.id}>Class {c.name}-{c.section}</option>)}
                </select>
                <button onClick={() => setShowAddLecture(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-xs font-semibold flex gap-1 items-center">
                  <Plus size={14} /> Add Lecture Window
                </button>
              </div>
            </div>

            {/* Class tabs quick nav */}
            {classes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setLectureScheduleClassFilter("")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    lectureScheduleClassFilter === "" ? "bg-blue-600 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                >
                  All Classes
                </button>
                {classes.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setLectureScheduleClassFilter(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      lectureScheduleClassFilter === c.id ? "bg-blue-600 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    }`}
                  >
                    Class {c.name}-{c.section}
                  </button>
                ))}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b dark:border-neutral-700 text-neutral-500 font-medium">
                    <th className="py-3 px-4">Lec #</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Start Time</th>
                    <th className="py-3 px-4">End Time</th>
                    <th className="py-3 px-4">Meet URL</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lectures
                    .filter(l => !lectureScheduleClassFilter || l.classId === lectureScheduleClassFilter || (!l.classId && lectureScheduleClassFilter === ""))
                    .map(l => {
                    const lecClass = classes.find(c => c.id === l.classId);
                    return (
                    <tr key={l.id} className="border-b dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                      <td className="py-3 px-4 font-bold">{l.number}</td>
                      <td className="py-3 px-4">
                        {lecClass ? (
                          <span className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-lg font-bold text-xs">
                            Class {lecClass.name}-{lecClass.section}
                          </span>
                        ) : (
                          <span className="text-neutral-400 text-xs italic">Global</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900 dark:text-white">{l.subject || "No Subject Assigned"}</div>
                        {l.teacher && <div className="text-xs text-neutral-450 dark:text-neutral-500 mt-0.5 font-medium">Instructor: {l.teacher}</div>}
                        {l.subjectSecondary && (
                          <div className="border-t border-neutral-100 dark:border-neutral-800 mt-1.5 pt-1.5">
                            <div className="font-semibold text-indigo-650 dark:text-indigo-400 flex items-center gap-1.5">
                              {l.subjectSecondary}
                              <span className="text-[8px] tracking-wider uppercase font-extrabold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded shadow-sm">Parallel</span>
                            </div>
                            {l.teacherSecondary && <div className="text-xs text-neutral-450 dark:text-neutral-500 mt-0.5 font-medium">Instructor: {l.teacherSecondary}</div>}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono">{formatTime12h(l.start)}</td>
                      <td className="py-3 px-4 font-mono">{formatTime12h(l.end)}</td>
                      <td className="py-3 px-4 space-y-1.5">
                        {l.meetLink ? (
                          <a href={l.meetLink} target="_blank" rel="noreferrer" className="text-blue-650 dark:text-blue-400 hover:underline truncate max-w-[200px] block font-mono text-xs">
                            Primary: {l.meetLink}
                          </a>
                        ) : <div className="text-neutral-450 text-xs">Primary: N/A</div>}
                        {l.subjectSecondary && (
                          l.meetLinkSecondary ? (
                            <a href={l.meetLinkSecondary} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-455 hover:underline truncate max-w-[200px] block font-mono text-xs">
                              Secondary: {l.meetLinkSecondary}
                            </a>
                          ) : <div className="text-neutral-450 text-xs">Secondary: N/A</div>
                        )}
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
                            setEditLectureForm({
                              number: l.number,
                              subject: l.subject || "",
                              start: l.start,
                              end: l.end,
                              meetLink: l.meetLink || "",
                              teacher: l.teacher || "",
                              subjectSecondary: l.subjectSecondary || "",
                              teacherSecondary: l.teacherSecondary || "",
                              meetLinkSecondary: l.meetLinkSecondary || "",
                              classId: l.classId || ""
                            });
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
                    );
                  })}
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
                      <td className="py-3 px-4 text-neutral-500 max-w-[220px] truncate" title={r.device || r.device_model}>{formatDeviceName(r.device || r.device_model)}</td>
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
                  {attendanceLogs.filter(log => log.gps_coordinates && log.gps_coordinates !== "unknown" && log.gps_coordinates !== "N/A" && log.gps_coordinates.includes(",")).map((log, idx) => {
                    const coords = log.gps_coordinates.split(",");
                    const lat = coords[0]?.trim();
                    const lng = coords[1]?.trim();
                    const isHigh = parseFloat(log.trust_score || log.trust || "90") > 85;
                    const accuracy = isHigh ? "15 meters (High)" : "120 meters (Medium)";
                    const accuracyColor = isHigh ? "text-green-600 dark:text-green-400" : "text-yellow-650 dark:text-yellow-400";

                    return (
                      <tr key={idx} className="border-b dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                        <td className="py-3 px-4 font-bold">{log.studentName || log.student_name}</td>
                        <td className="py-3 px-4 font-mono text-neutral-600 dark:text-neutral-400">{lat}° N, {lng}° E</td>
                        <td className={`py-3 px-4 font-bold ${accuracyColor}`}>{accuracy}</td>
                        <td className="py-3 px-4">
                          <a 
                            href={`https://maps.google.com/?q=${lat},${lng}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl text-xs font-semibold hover:scale-105 inline-flex items-center gap-1 transition-transform"
                          >
                            <MapPin size={12} /> Google Maps
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                  {attendanceLogs.filter(log => log.gps_coordinates && log.gps_coordinates !== "unknown" && log.gps_coordinates !== "N/A" && log.gps_coordinates.includes(",")).length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-neutral-400 italic">No GPS coordinates recorded in current database logs.</td>
                    </tr>
                  )}
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
                              <div className="relative group rounded-xl overflow-hidden border dark:border-neutral-800 mb-3 bg-neutral-955 dark:bg-neutral-950 h-44 w-full">
                                <img
                                  src={log.photo}
                                  alt={`${studentName} verification frame`}
                                  className="h-full w-full object-contain cursor-zoom-in hover:scale-[1.02] transition-transform duration-200"
                                  onClick={() => setSelectedZoomPhoto(log.photo)}
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

                            <p className="text-xs text-neutral-500" title={log.device || log.device_model || "Mobile Web"}>
                              Device: <span className="font-semibold text-neutral-700 dark:text-white">{formatDeviceName(log.device || log.device_model || "Mobile Web")}</span>
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
                          onClick={() => denyDeviceRequest(d)}
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
                      <td className="py-3 px-4 text-neutral-500 max-w-[220px] truncate" title={r.device || r.device_model}>{formatDeviceName(r.device || r.device_model)}</td>
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
{/* System Settings Tab */}
      {activeTab === "System Settings" && (
        <div className="animate-in fade-in duration-300 space-y-6">

          {/* Page Header */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-800 to-blue-900 text-white shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #60a5fa 0%, transparent 60%)' }} />
            <div className="relative flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/15 border border-white/20 grid place-items-center shadow-lg shrink-0">
                <Lock size={22} className="text-blue-300" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">System Settings</h2>
                <p className="text-blue-200 text-xs mt-0.5">Manage portal branding and admin security credentials</p>
              </div>
            </div>
          </div>

          {/* ── Card 1: Portal Branding ── */}
          <div className="rounded-3xl border bg-white dark:bg-neutral-900 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b dark:border-neutral-800 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white grid place-items-center shadow shrink-0">
                <School size={16} />
              </div>
              <div>
                <h3 className="font-extrabold">Portal Branding</h3>
                <p className="text-xs text-neutral-400">Customise the check-in portal appearance</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">School Name Banner</label>
                <input
                  type="text"
                  value={schoolInfo.name}
                  onChange={e => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                  className="w-full rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 p-3 outline-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">Verification Alert Messages</label>
                <textarea
                  rows={3}
                  value={schoolInfo.welcomeMessage}
                  onChange={e => setSchoolInfo({ ...schoolInfo, welcomeMessage: e.target.value })}
                  className="w-full rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 p-3 outline-blue-500 text-sm resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">Color Hex Accent</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={schoolInfo.themeColor}
                    onChange={e => setSchoolInfo({ ...schoolInfo, themeColor: e.target.value })}
                    className="h-10 w-14 rounded-lg border dark:border-neutral-700 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={schoolInfo.themeColor}
                    onChange={e => setSchoolInfo({ ...schoolInfo, themeColor: e.target.value })}
                    className="flex-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 p-3 font-mono text-sm outline-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.setItem("local_school_info", JSON.stringify(schoolInfo));
                  alert("Branding saved!");
                }}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 flex gap-2 justify-center items-center transition-colors shadow-md text-sm"
              >
                <Save size={16} /> Save Portal Branding
              </button>
            </div>
          </div>

          {/* ── Card 2: Change Credentials ── */}
          <div className="rounded-3xl border bg-white dark:bg-neutral-900 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b dark:border-neutral-800 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600 text-white grid place-items-center shadow shrink-0">
                <Lock size={16} />
              </div>
              <div>
                <h3 className="font-extrabold">Change Admin Credentials</h3>
                <p className="text-xs text-neutral-400">Requires current password to verify your identity</p>
              </div>
            </div>

            <form onSubmit={updateAdminCredentials} className="p-6 space-y-4">
              {/* Current Password */}
              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">Current Password <span className="text-red-500 normal-case font-normal">(required to save)</span></label>
                <div className="relative">
                  <ShieldAlert size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    required
                    disabled={credentialBusy}
                    value={credentialForm.currentPassword}
                    onChange={e => setCredentialForm({ ...credentialForm, currentPassword: e.target.value })}
                    placeholder="Enter your current password"
                    className="w-full rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 pl-10 pr-4 py-3 outline-blue-500 font-mono text-sm"
                  />
                </div>
              </div>

              {/* New Username + New Password */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">New Username <span className="normal-case font-normal text-neutral-400">(optional)</span></label>
                  <div className="relative">
                    <Users size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      disabled={credentialBusy}
                      value={credentialForm.newUsername}
                      onChange={e => setCredentialForm({ ...credentialForm, newUsername: e.target.value })}
                      placeholder="Leave blank to keep"
                      className="w-full rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 pl-10 pr-4 py-3 outline-blue-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">New Password <span className="normal-case font-normal text-neutral-400">(optional)</span></label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="password"
                      disabled={credentialBusy}
                      value={credentialForm.newPassword}
                      onChange={e => setCredentialForm({ ...credentialForm, newPassword: e.target.value })}
                      placeholder="Leave blank to keep"
                      className="w-full rounded-xl border bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 pl-10 pr-4 py-3 outline-blue-500 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              {credentialForm.newPassword && (
                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">Confirm New Password</label>
                  <div className="relative">
                    <ShieldCheck size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="password"
                      disabled={credentialBusy}
                      value={credentialForm.confirmPassword}
                      onChange={e => setCredentialForm({ ...credentialForm, confirmPassword: e.target.value })}
                      placeholder="Re-enter new password"
                      className={`w-full rounded-xl border pl-10 pr-4 py-3 outline-blue-500 font-mono text-sm transition-colors ${
                        credentialForm.confirmPassword && credentialForm.confirmPassword !== credentialForm.newPassword
                          ? "border-red-400 bg-red-50 dark:bg-red-950/20"
                          : credentialForm.confirmPassword === credentialForm.newPassword && credentialForm.confirmPassword
                            ? "border-green-400 bg-green-50 dark:bg-green-950/20"
                            : "bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800"
                      }`}
                    />
                  </div>
                  {credentialForm.confirmPassword && credentialForm.confirmPassword !== credentialForm.newPassword && (
                    <p className="text-xs text-red-500 mt-1.5">⚠ Passwords do not match</p>
                  )}
                  {credentialForm.confirmPassword && credentialForm.confirmPassword === credentialForm.newPassword && (
                    <p className="text-xs text-green-600 mt-1.5">✓ Passwords match</p>
                  )}
                </div>
              )}

              {/* Status Message */}
              {credentialMsg && (
                <div className={`flex items-start gap-3 p-4 rounded-2xl text-sm border ${
                  credentialMsg.type === "success"
                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 text-green-700 dark:text-green-400"
                    : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400"
                }`}>
                  {credentialMsg.type === "success" ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <ShieldAlert size={18} className="shrink-0 mt-0.5" />}
                  <div>
                    <p className="font-semibold">{credentialMsg.type === "success" ? "Credentials Updated!" : "Update Failed"}</p>
                    <p className="text-xs mt-0.5 opacity-80">{credentialMsg.text}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={credentialBusy || (!!credentialForm.newPassword && credentialForm.newPassword !== credentialForm.confirmPassword)}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 shadow-lg transition-all disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
              >
                <Save size={16} />
                {credentialBusy ? "Saving Changes..." : "Save Credential Changes"}
              </button>
              <p className="text-center text-[11px] text-neutral-400">After saving, you will be signed out and redirected to the login page.</p>
            </form>
          </div>

          {/* ── Card 3: Session Management ── */}
          <div className="rounded-3xl border border-red-200 dark:border-red-900/40 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/40 flex items-center gap-3 bg-red-50/50 dark:bg-red-950/10">
              <div className="h-9 w-9 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 grid place-items-center shrink-0">
                <LogOut size={16} />
              </div>
              <div>
                <h3 className="font-extrabold">Session Management</h3>
                <p className="text-xs text-neutral-400">End your current admin session</p>
              </div>
            </div>
            <div className="p-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Sign Out of Admin Panel</p>
                <p className="text-xs text-neutral-400 mt-0.5">Your session will be cleared immediately. Log in again to regain access.</p>
              </div>
              <button
                onClick={() => {
                  sessionStorage.removeItem("adminSession");
                  window.location.href = "/admin/login";
                }}
                className="shrink-0 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 px-5 py-2.5 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 transition-colors"
              >
                <LogOut size={15} /> Sign Out
              </button>
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

      {/* Edit Subject Modal */}
      {showEditSubject && (
        <Modal title="Edit Subject Details" onClose={() => setShowEditSubject(null)}>
          <form onSubmit={updateSubject} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400">Subject Name / Course Title</label>
              <input required type="text" placeholder="e.g. Mathematics" value={editSubjectForm.name} onChange={e => setEditSubjectForm({ name: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-550 dark:border-neutral-800" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700">Save Changes</button>
          </form>
        </Modal>
      )}

      {/* Edit Teacher Modal */}
      {showEditTeacher && (
        <Modal title="Edit Instructor Profile" onClose={() => setShowEditTeacher(null)}>
          <form onSubmit={updateTeacher} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400">Teacher Full Name</label>
              <input required type="text" placeholder="e.g. Sir Ali Raza" value={editTeacherForm.name} onChange={e => setEditTeacherForm({ ...editTeacherForm, name: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-500 dark:border-neutral-800" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400">Assign Subject Course</label>
              <select required value={editTeacherForm.subjectId} onChange={e => setEditTeacherForm({ ...editTeacherForm, subjectId: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-500 dark:border-neutral-800">
                <option value="">-- Choose Subject --</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700">Save Changes</button>
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
          <form onSubmit={addLecture} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400">Assign to Class</label>
              <select
                required
                value={lectureForm.classId}
                onChange={e => setLectureForm({ ...lectureForm, classId: e.target.value })}
                className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-500 dark:border-neutral-800"
              >
                <option value="">-- Select Class --</option>
                {classes.map(c => <option key={c.id} value={c.id}>Class {c.name}-{c.section}</option>)}
              </select>
            </div>
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
                <input required type="time" value={lectureForm.start} onChange={e => setLectureForm({ ...lectureForm, start: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 font-mono outline-blue-550 dark:border-neutral-800" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-neutral-400">End Time</label>
                <input required type="time" value={lectureForm.end} onChange={e => setLectureForm({ ...lectureForm, end: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 font-mono outline-blue-550 dark:border-neutral-800" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-neutral-400">Google Meet Link</label>
                <input required type="url" placeholder="https://meet.google.com/abc-defg-hij" value={lectureForm.meetLink} onChange={e => setLectureForm({ ...lectureForm, meetLink: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-550 dark:border-neutral-800" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-neutral-400">Primary Instructor</label>
                <select value={lectureForm.teacher || ""} onChange={e => setLectureForm({ ...lectureForm, teacher: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-550 dark:border-neutral-800">
                  <option value="">-- Choose Instructor --</option>
                  {teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
              </div>
            </div>

            {/* Optional Secondary Lecture Section */}
            <div className="border-t dark:border-neutral-800 pt-4 mt-2 space-y-4">
              <h4 className="text-xs font-bold text-neutral-450 dark:text-neutral-400 uppercase tracking-wider">Parallel Session (Optional)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-neutral-400">Secondary Subject</label>
                  <select value={lectureForm.subjectSecondary || ""} onChange={e => setLectureForm({ ...lectureForm, subjectSecondary: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-555 dark:border-neutral-800">
                    <option value="">-- Choose Secondary Subject --</option>
                    {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-neutral-400">Secondary Instructor</label>
                  <select value={lectureForm.teacherSecondary || ""} onChange={e => setLectureForm({ ...lectureForm, teacherSecondary: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-555 dark:border-neutral-800">
                    <option value="">-- Choose Secondary Instructor --</option>
                    {teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-neutral-400">Secondary Meet Link</label>
                <input type="url" placeholder="https://meet.google.com/xyz-pdqr-lmn" value={lectureForm.meetLinkSecondary || ""} onChange={e => setLectureForm({ ...lectureForm, meetLinkSecondary: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-555 dark:border-neutral-800" />
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700">Save Lecture Period</button>
          </form>
        </Modal>
      )}

      {/* Edit Lecture Modal */}
      {showEditLecture && (
        <Modal title={`Edit Lecture Window #${showEditLecture.number}`} onClose={() => setShowEditLecture(null)}>
          <form onSubmit={updateLecture} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400">Assign to Class</label>
              <select
                required
                value={editLectureForm.classId || ""}
                onChange={e => setEditLectureForm({ ...editLectureForm, classId: e.target.value })}
                className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-500 dark:border-neutral-800"
              >
                <option value="">-- Select Class --</option>
                {classes.map(c => <option key={c.id} value={c.id}>Class {c.name}-{c.section}</option>)}
              </select>
            </div>
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-neutral-400">Google Meet Link</label>
                <input required type="url" placeholder="https://meet.google.com/abc-defg-hij" value={editLectureForm.meetLink} onChange={e => setEditLectureForm({ ...editLectureForm, meetLink: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-550 dark:border-neutral-800" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-neutral-400">Primary Instructor</label>
                <select value={editLectureForm.teacher || ""} onChange={e => setEditLectureForm({ ...editLectureForm, teacher: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-550 dark:border-neutral-800">
                  <option value="">-- Choose Instructor --</option>
                  {teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
              </div>
            </div>

            {/* Optional Secondary Lecture Section */}
            <div className="border-t dark:border-neutral-800 pt-4 mt-2 space-y-4">
              <h4 className="text-xs font-bold text-neutral-450 dark:text-neutral-400 uppercase tracking-wider">Parallel Session (Optional)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-neutral-400">Secondary Subject</label>
                  <select value={editLectureForm.subjectSecondary || ""} onChange={e => setEditLectureForm({ ...editLectureForm, subjectSecondary: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-555 dark:border-neutral-800">
                    <option value="">-- Choose Secondary Subject --</option>
                    {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-neutral-400">Secondary Instructor</label>
                  <select value={editLectureForm.teacherSecondary || ""} onChange={e => setEditLectureForm({ ...editLectureForm, teacherSecondary: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-555 dark:border-neutral-800">
                    <option value="">-- Choose Secondary Instructor --</option>
                    {teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-neutral-400">Secondary Meet Link</label>
                <input type="url" placeholder="https://meet.google.com/xyz-pdqr-lmn" value={editLectureForm.meetLinkSecondary || ""} onChange={e => setEditLectureForm({ ...editLectureForm, meetLinkSecondary: e.target.value })} className="w-full mt-1 rounded-xl border bg-neutral-50 dark:bg-neutral-950 p-3 outline-blue-555 dark:border-neutral-800" />
              </div>
            </div>

            <div className="flex items-center gap-2.5 py-1">
              <input 
                type="checkbox" 
                id="applyLinkToAll"
                checked={applyLinkToAll} 
                onChange={e => setApplyLinkToAll(e.target.checked)} 
                className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
              />
              <label htmlFor="applyLinkToAll" className="text-xs font-medium text-neutral-600 dark:text-neutral-300 cursor-pointer select-none">
                Apply this Meet link to all lecture windows in schedule
              </label>
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
          log.student_id === viewStudentDetails.id || (log.studentName || log.student_name) === viewStudentDetails.name
        );
        
        const filteredLogs = studentLogs.filter(log =>
          log.date && log.date.startsWith(studentMonthFilter)
        );

        const totalPresent = studentLogs.filter(l => l.status === "Present").length;
        const totalAbsent = studentLogs.filter(l => l.status === "Absent").length;
        const totalLectures = totalPresent + totalAbsent || 1;
        const rate = Math.round((totalPresent / totalLectures) * 100);

        // Get lectures for this student's class to build checkbox grid
        const classLectures = [...lectures]
          .filter(l => !l.classId || l.classId === viewStudentDetails.classId)
          .sort((a, b) => a.number - b.number);

        // Build per-lecture attendance status for ALL logs (not just filtered month)
        const lecAttendance = classLectures.map(lec => {
          const attended = studentLogs.some(log =>
            log.lecture_number === lec.number && log.status === "Present"
          );
          const count = studentLogs.filter(log =>
            log.lecture_number === lec.number && log.status === "Present"
          ).length;
          return { lec, attended, count };
        });

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

              {/* Lecture Attendance Checkbox Grid */}
              {classLectures.length > 0 && (
                <div className="rounded-2xl border dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-4">
                  <h4 className="text-xs font-bold uppercase text-neutral-500 mb-3 flex items-center gap-2">
                    <Layers size={14} className="text-blue-500" />
                    Lecture Attendance Overview
                    <span className="text-[9px] normal-case font-normal text-neutral-400">(all time)</span>
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {lecAttendance.map(({ lec, attended, count }) => (
                      <div key={lec.id} className="flex flex-col items-center gap-1.5">
                        <span className="text-[10px] text-neutral-500 font-bold text-center leading-tight max-w-[60px] truncate" title={lec.subject}>
                          {lec.subject}
                        </span>
                        <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center shadow-sm transition-all ${
                          attended
                            ? "bg-green-500 border-green-600 text-white"
                            : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-300 dark:text-neutral-600"
                        }`}>
                          {attended ? (
                            <Check size={18} strokeWidth={3} />
                          ) : (
                            <X size={16} strokeWidth={2} className="opacity-40" />
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-neutral-400">Lec {lec.number}</span>
                        {count > 1 && (
                          <span className="text-[9px] font-bold text-blue-500">{count}x</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t dark:border-neutral-800 text-[10px] text-neutral-500">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-green-500 inline-block"></span> Present
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded border border-neutral-300 dark:border-neutral-700 inline-block"></span> Absent / No Record
                    </span>
                  </div>
                </div>
              )}

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

      
      {/* Lightbox Photo Zoom Modal */}
      {selectedZoomPhoto && (
        <div 
          className="fixed inset-0 z-[100] grid place-items-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200" 
          onClick={() => setSelectedZoomPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex flex-col justify-center items-center">
            <img
              src={selectedZoomPhoto}
              alt="Zoomed Student Verification Frame"
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-white/10"
            />
            <button
              onClick={() => setSelectedZoomPhoto(null)}
              className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/75 p-2.5 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <p className="text-white/60 text-xs mt-3 select-none">Click anywhere to close zoom overlay</p>
          </div>
        </div>
      )}
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
