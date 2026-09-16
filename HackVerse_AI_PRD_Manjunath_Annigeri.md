# HackVerse AI — Product Requirements Document (PRD)

**Author / Lead Engineer:** Manjunath H Annigeri  
**Version:** 1.0.0 (Production Release)  
**Date:** August 16, 2026  

---

## 1. Executive Summary
HackVerse AI is an intelligent, end-to-end hackathon operating platform designed for student developers and competitive tech teams. It unifies hackathon discovery, squad formation, sprint workspace management, AI pitch coaching, GitHub code health auditing, and deterministic winning readiness calculation.

---

## 2. Target Audience
* **Student Hackers & Beginners**: Seeking curated India & Karnataka hackathons, automated project ideas, and daily learning plans.
* **Competitive Squads**: Requiring structured sprint workspaces, automatic milestone tracking, pitch coaching, and judging score optimization.
* **Graduating Developers**: Managing verified hackathon portfolios and certificate vaults with public shareable URLs.

---

## 3. Core Modules & Specifications

### 🔍 1. Real Hackathon Discovery & Search
* **Location-Aware**: First-class filters for Karnataka, Bengaluru, India, Online, and Global events.
* **Zero-AI Database Search**: Sub-10ms queries powered by PostgreSQL indexes and 2-Tier caching (RAM + Redis).
* **Live Ingestion Pipeline**: Ingests real public feeds from Unstop, Devfolio, and HackerEarth with automatic deduplication.
* **Link Health Verification**: 5-hop redirect following, login-required page detection, and dead link removal.

### 🤖 2. AI Hackathon Mentor (`/mentor`)
* Real-time technical, code, and judging guidance grounded in active workspace tasks, skills, and hackathon rules.
* Cascading multi-model fallback across Gemini 3.7 Flash, 3.6 Flash, and 3.5 Flash-Lite.

### 💡 3. AI Idea Generator (`/idea-generator`)
* Generates 3–5 realistic, buildable 24–48h MVP ideas tailored to the target hackathon's theme and team skills.
* In-memory caching and 10s timeout safeguards.

### 🎙️ 4. AI Pitch Coach (`/pitch-coach`)
* Generates 3 pitch versions: 30-second elevator pitch, 60-second demo pitch, and 2-minute final judging pitch.
* Provides pitch breakdown, strength/weakness evaluations, and interactive Judge Q&A practice.

### 🏆 5. Deterministic Winning Readiness (`/winning-readiness`)
* **0–100 Objective Metric**: Evaluated across 8 pillars (Hackathon Alignment, Completeness, Tech Depth, Team, Skills, GitHub, Pitch, and Submission Checklist).
* **Non-Blocking**: Score computes instantly in <35ms; optional AI strategic explanation on-demand.

### 📊 6. Additional Core Features
* **GitHub Analyzer (`/github-analyzer`)**: Public repository health, structure, and judging criteria audit.
* **Workspace Sprint (`/workspace/:id`)**: Task board with automated progress calculation and skill gap plans.
* **Team Finder (`/team-finder`)**: Skill-based squad matching and teammate requests.
* **Certificate Vault & Portfolio (`/certificates`, `/portfolio`)**: Verified hackathon credential storage with public shareable links.

---

## 4. Technical Stack
* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
* **Database & Auth**: Supabase (PostgreSQL 15 + RLS + JWT)
* **Serverless API**: Node.js on Vercel (`/api/*`)
* **AI Engine**: Google Gemini Generative AI (Flash models)
* **Caching**: 2-Tier (In-Memory RAM + Upstash Redis L2)
* **Scheduling**: Vercel Cron (8-hour ingestion, 24-hour link audit)

---

## 5. Performance & Security
* **Bundle Size**: Route-level code-splitting (134 kB gzipped main chunk).
* **Search Latency**: < 1ms cached / ~18ms direct database queries.
* **Security**: Zero secrets in frontend; server-only keys protected by serverless functions and Row Level Security.
