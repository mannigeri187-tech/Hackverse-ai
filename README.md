# HackVerse AI - Enterprise AI Hackathon Preparation & Hiring Super Platform

[![Next.js 15](https://img.shields.io/badge/Next.js-15.1-black)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-blue)](https://react.dev/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.2-indigo)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)

**HackVerse AI** is an enterprise-grade AI-powered Hackathon Preparation, Portfolio Building, ATS Resume Optimization, and Developer Recruitment Platform.

It unifies the powerhouse features of **Devpost**, **Unstop**, **MLH**, **GitHub**, **LinkedIn**, **Coursera**, **ChatGPT**, **Resume Builder**, **Portfolio Generator**, and **Recruiter Sourcing** into one seamless SaaS application.

---

## 🌟 Core Super Features

1. **Global Hackathon Discovery Matchmaker**: Search, filter, bookmark, and view AI Match Scores & winning probability indicators across top global events.
2. **AI Autonomous Mock Hackathon Engine**: Practice with realistic 12h/24h/48h AI-generated problem statements. Submit GitHub repos & demo links to receive instant rubric evaluations across Architecture, Security, UI/UX, Testing, and Performance.
3. **ATS Resume Builder & Scanner**: Interactive wizard with instant keyword density analysis, format scoring against Lever/Greenhouse parsers, and PDF exports.
4. **One-Click Developer Portfolio Generator**: Auto-sync GitHub repositories and hackathon trophies to deploy responsive developer websites on custom subdomains.
5. **AI Career & Mentor Chatbot**: 24/7 real-time AI mentor trained on hackathon pitch strategies, code optimizations, and career growth.
6. **Recruiter Talent Hub**: Enables tech recruiters to discover verified hackathon winners, inspect automated code evaluation metrics, and schedule direct interviews.
7. **Admin Governance & System SLA**: System health monitoring (latency, DB pool), AI token consumption tracking, user RBAC management, and live audit logging streams.

---

## 🗄️ Normalized Enterprise Database Architecture (30+ Prisma Models)

- **Auth & Core**: `User`, `Profile`, `Skill`, `UserSkill`, `AuditLog`
- **Hackathons**: `Hackathon`, `Bookmark`, `Team`, `TeamMember`
- **AI Simulator**: `MockHackathon`, `MockSubmission`, `Evaluation`
- **Career & Portfolio**: `Resume`, `ResumeScore`, `Portfolio`, `Project`
- **AI Engine & Learning**: `LearningPlan`, `Task`, `Course`, `AIConversation`, `AIMessage`, `StartupIdea`
- **Enterprise Hiring**: `Company`, `Recruiter`, `JobApplication`, `Mentor`, `InterviewSession`
- **Gamification & Social**: `Achievement`, `UserAchievement`, `XPLog`, `Notification`, `CommunityPost`, `Comment`, `Message`

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js `20.x` or higher
- Docker & Docker Compose (optional for local PostgreSQL + Redis containerization)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your database and AI API keys:
```bash
cp .env.example .env
```

### 3. Database Migration & Production Seeding
Generate Prisma Client and populate the database with seed data:
```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

---

## 🐳 Docker Production Deployment

To run the complete production stack (Next.js 15, PostgreSQL 16, Redis 7) via Docker Compose:

```bash
docker-compose up --build -d
```

---

## 🏛️ Project Architecture Map

```
hackverse-ai/
├── src/
│   ├── app/
│   │   ├── (auth)/             # Sign In, Sign Up, Password Reset
│   │   ├── (dashboard)/        # Student Dashboard with Streak & Skill Radar
│   │   ├── hackathons/         # Hackathon Discovery Engine
│   │   ├── mock-hackathon/     # AI Mock Simulator & Code Audit Evaluator
│   │   ├── resume-builder/     # ATS Resume Builder & Keyword Scanner
│   │   ├── portfolio-builder/  # Instant Developer Portfolio Engine
│   │   ├── recruiter/          # Recruiter Talent Matcher Portal
│   │   ├── admin/              # Admin Governance & System SLA Control
│   │   ├── api/                # REST API Endpoints (Auth, AI, Hackathons)
│   │   ├── globals.css         # Glassmorphism Design Tokens & Cyber Gradients
│   │   └── page.tsx            # Premium SaaS Landing Page
│   ├── components/
│   │   ├── layout/             # Navbar & Footer
│   │   └── landing/            # Hero, Features, Pricing, FAQ
│   ├── lib/
│   │   ├── auth.ts             # JWT, Password Hashing, RBAC
│   │   ├── prisma.ts           # Prisma ORM Instance Singleton
│   │   ├── ai-engine.ts        # Modular AI Engine (OpenAI / Gemini Adapters)
│   │   └── utils.ts            # Formatting & Class Merging Helpers
│   └── store/
│       └── useStore.ts         # Zustand Global Application State Store
├── prisma/
│   ├── schema.prisma           # 30+ Normalized Database Models
│   └── seed.ts                 # Production Seeding Script
├── docker-compose.yml          # Docker Infrastructure
├── Dockerfile                  # Multi-Stage Containerization Build
├── next.config.js              # Next.js 15 Configuration
├── tailwind.config.js          # Glassmorphism & Cyber Colors
└── package.json                # Project Dependencies
```
