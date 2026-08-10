# 📄 PRODUCT REQUIREMENTS DOCUMENT (PRD)
## **HackVerse AI — Autonomous AI-Powered Developer & Hackathon Operating System**

---

### **DOCUMENT METADATA**
- **Product Name**: HackVerse AI Ecosystem OS
- **Version**: 2.0.0 (Production Release)
- **Author & Founder**: **Manjunath H Annigeri**
- **Target Platforms**: Web Application (React + Vite), Mobile App (Google Play Store via Capacitor Android), Supabase PostgreSQL Cloud
- **Date**: August 2026

---

## 🎯 1. EXECUTIVE SUMMARY & VISION

### **1.1 Vision Statement**
**HackVerse AI**, conceived and architected by **Manjunath H Annigeri**, is the world’s first autonomous AI-powered Hackathon Ecosystem and Career Operating System. 

Unlike legacy event platforms (Devpost, Unstop, HackerEarth) that treat hackathons as isolated weekend competitions, HackVerse AI converts every line of code written during a hackathon into a **verifiable, recruiter-matched career asset**.

### **1.2 Core Value Proposition**
1. **For Student Developers**: Instant AI project mentorship, teammate matching, voice technical interview prep, and automated recruiter-ready ATS resume conversion.
2. **For Hackathon Organizers**: Real-time event ops, AST code anti-plagiarism scanning, automated leaderboards, and paperless Expo QR rubric judging.
3. **For Tech Enterprise Sponsors**: Direct access to top 5% verified developer talent, live code repositories, and targeted recruitment funnels.

---

## 🏛️ 2. SYSTEM ARCHITECTURE & TECH STACK

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   HACKVERSE AI ECOSYSTEM OS ARCHITECTURE                 │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Vite + React  │         │  Express Auth   │         │  Supabase Cloud │
│  Frontend (Web) │ ──────> │  REST Backend   │ ──────> │   PostgreSQL    │
│ & Android App   │         │  (Port 4000)    │         │    Database     │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

- **Frontend Core**: React 19, TypeScript 5.7, Vite 6, Tailwind CSS, Framer Motion.
- **Mobile Engine**: Ionic Capacitor 8 (`com.manjunath.hackverseai`).
- **Backend Auth Server**: Node.js Express REST Server (`http://localhost:4000/api/auth`).
- **Database Engine**: Supabase Cloud PostgreSQL (`https://wivwpljbzvitoovbxhlg.supabase.co`).
- **Security Engine**: Bcrypt Salted Password Hashing (12 rounds), SHA-256 OTP Hashing, JWT Bearer Sessions, Server-Side Rate Limiting.
- **AI Engine**: Google Gemini Pro & OpenAI GPT-4o Integration.

---

## 🔐 3. ENTERPRISE AUTHENTICATION & SECURITY SPECIFICATIONS

### **3.1 Production Verification & Login Flow**
- **Strict Format & Syntax Validation**: Email addresses must conform to valid RFC syntax.
- **Zero OTP Exposure**: 6-digit verification codes are **never** returned in REST JSON, state, page text, or browser console. Delivered strictly via Nodemailer SMTP.
- **Salted Hash Storage**: Plaintext OTPs are never stored in the database. Only SHA-256 `otp_hash` is saved.
- **Attempt Limits**: Maximum 5 failed verification attempts per code before invalidation.
- **10-Minute Expiration & 60s Cooldown**: Automatic expiration after 10 minutes and a forced 60-second cooldown between resend requests.

---

## 👥 4. SEPARATED ROLE ACCESS & PORTAL ARCHITECTURE

HackVerse AI enforces strict architectural separation across three distinct user roles:

```
                  ┌─────────────────────────────────────────┐
                  │    HackVerse AI Role-Based Access       │
                  └────────────────────┬────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│ 1. Student /     │         │ 2. Organizer     │         │ 3. Admin Control │
│ Mentor Platform  │         │ Portal           │         │ Center           │
│ (/login)         │         │ (/organizer/login)│        │ (/admin/login)   │
└──────────────────┘         └──────────────────┘         └──────────────────┘
```

1. **Student / Developer Platform (`/login`)**:
   - Access to Hackathons, AI Mentor, Teammate Matchmaker, Resume Builder, and Voice Interview Prep.
   - Hidden: Organizer and Admin links are completely stripped from student sidebar menus.

2. **Dedicated Organizer Portal (`/organizer/login`)**:
   - Restricted to event hosts with `role: 'organizer'`.
   - Manage events, track live registrations, assign judges, run AST plagiarism scans, and manage sponsor prize pools.

3. **Dedicated Admin Control Center (`/admin/login`)**:
   - Multi-Factor Security: Requires **Security Passcode (`1996`)** + Admin Credentials.
   - Restricted to platform governance team (`role: 'admin'`).
   - Monitor Supabase database health, manage user roles, audit AI token consumption, and manage platform security settings.

---

## 🚀 5. COMPLETE FEATURE MODULE MATRIX

| Module Name | Route | Core Functionality & Deliverables |
| :--- | :--- | :--- |
| **Hackathon Discovery** | `/hackathons` | Browse global hybrid, online, and in-person hackathons with prize pool filtering and instant registration. |
| **AI Mentor & Studio** | `/ai-mentor` | Real-time AI project architect, code syntax debugger, and step-by-step hackathon guide. |
| **Teammate Matchmaker** | `/teammate-matchmaker` | AI skill-gap team matching algorithm to pair complementary developers. |
| **Live Event Ops** | `/live-ops` | Real-time event announcements, table numbers, check-in trackers, and broadcast channels. |
| **Expo QR Judging Hub** | `/judging-hub` | Mobile QR code scanning rubric for paperless judging and automated AST code anti-plagiarism scans. |
| **Sponsor Talent Hub** | `/sponsor-hub` | Recruiter talent dashboard to source top 5% hackathon participants and code portfolios. |
| **AI Voice Interview Prep** | `/interview-prep` | Interactive voice dictation mock technical interviews with real-time feedback scores. |
| **ATS Resume Builder** | `/resume-builder` | Auto-generates recruiter-optimized resumes based on verified hackathon project submissions. |

---

## 📱 6. GOOGLE PLAY STORE MOBILE RELEASE SPECIFICATIONS

- **App Package Name**: `com.manjunath.hackverseai`
- **Application Title**: `HackVerse AI`
- **Framework**: Ionic Capacitor 8 Android Native Bridge.
- **Build Output**: `dist/` web bundle synchronized directly into `android/app/src/main/assets/public`.
- **Target SDK**: Android API 34 (Android 14+).
- **Icon & Splash Screen Assets**: Configured under `android/app/src/main/res/`.

---

## 📈 7. SUCCESS & GROWTH ROADMAP

### **7.1 Market Viability**
With a **$15B+ Global Developer Hiring & Hackathon Market**, HackVerse AI is positioned for rapid adoption across engineering universities, developer communities, and tech enterprises.

### **7.2 Revenue Projection Model**
- **Enterprise Sponsorships**: $2,000 – $10,000 / month per company.
- **Branded Hackathons**: $5,000 – $25,000 per hosted event.
- **Campus Hackathon OS**: $1,000 – $5,000 / year per university.
- **Student Pro Subscriptions**: $9.99 / month.

---

### **AUTHOR SIGN-OFF**
**Founder, Product Architect & Lead Engineer:**  
**Manjunath H Annigeri**  
*HackVerse AI Platform — All Rights Reserved © 2026*
