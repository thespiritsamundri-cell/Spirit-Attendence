# Smart Online Class Attendance Management System

Production-ready Next.js + TypeScript + Tailwind + Firebase starter for Google Meet based school attendance.

## Features
- One daily attendance URL: `/today`
- Automatic active lecture detection from schedule windows
- Secret-code-only student verification
- Mandatory GPS + hidden camera capture workflow
- Device fingerprinting and same-day device enforcement
- Duplicate attendance protection per lecture
- Trust score, IP logging, security/audit logs
- Admin dashboard modules, analytics cards, reports, Excel import/export, PDF export scaffold
- Mobile-first PWA-ready UI with light/dark mode

## Setup
1. Copy `.env.example` to `.env.local` and add Firebase + Google Maps keys.
2. Run `npm install`.
3. Run `npm run dev`.
4. Create Firestore indexes as Firebase suggests.

## Firestore collections
`schools`, `classes`, `teachers`, `students`, `subjects`, `lecture_schedule`, `attendance`, `attendance_photos`, `devices`, `device_approvals`, `security_logs`, `notifications`, `reports`, `settings`.

> Important: Browser camera/GPS require HTTPS in production.
