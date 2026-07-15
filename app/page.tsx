"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sun, Moon } from "lucide-react";

export default function Home() {
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

  return (
    <main className="min-h-screen grid place-items-center p-6 bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_35%),radial-gradient(circle_at_bottom_right,#dcfce7,transparent_30%)] dark:from-neutral-950 dark:to-neutral-900 transition-colors duration-350">
      {/* Floating Theme Switcher */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="rounded-2xl bg-white/80 dark:bg-neutral-800/80 p-3 shadow-soft border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:scale-105 transition-transform backdrop-blur-md"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <section className="glass max-w-3xl rounded-3xl p-8 shadow-soft dark:border-white/10">
        <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
          The Spirit School Sammy Campus Portal
        </p>
        <h1 className="mt-3 text-4xl md:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
          Smart Attendance Check-in
        </h1>
        <p className="mt-4 text-lg text-neutral-600 dark:text-white/70 leading-relaxed">
          Dynamic Google Meet scheduling, live lecture auto-transitions, GPS location check, silent background photo audits, hardware verification, and admin reports.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-2xl bg-blue-600 px-6 py-3.5 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm"
            href="/today"
          >
            Open Today Link
          </Link>
        </div>
        <div className="mt-8 pt-6 border-t dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-450 dark:text-neutral-500">
          <span>Version 1.0</span>
          <span>Developed by Mian Mudassar</span>
        </div>
      </section>
    </main>
  );
}