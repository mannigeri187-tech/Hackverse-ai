const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

const doc = new jsPDF();

// Title Styling
doc.setFont('helvetica', 'bold');
doc.setFontSize(20);
doc.setTextColor(30, 41, 59); // slate-800
doc.text('PRODUCT REQUIREMENTS DOCUMENT (PRD)', 15, 20);

doc.setFontSize(14);
doc.setTextColor(79, 70, 229); // indigo-600
doc.text('HackVerse AI Platform', 15, 28);

doc.setDrawColor(203, 213, 225);
doc.line(15, 32, 195, 32);

// Metadata
doc.setFontSize(10);
doc.setFont('helvetica', 'bold');
doc.setTextColor(51, 65, 85);
doc.text('Author:', 15, 40);
doc.setFont('helvetica', 'normal');
doc.text('Manjunath H Annigeri (Founder & Lead Architect)', 40, 40);

doc.setFont('helvetica', 'bold');
doc.text('Version:', 15, 46);
doc.setFont('helvetica', 'normal');
doc.text('1.0.0 (Approved)', 40, 46);

doc.setFont('helvetica', 'bold');
doc.text('Date:', 15, 52);
doc.setFont('helvetica', 'normal');
doc.text('August 2, 2026', 40, 52);

let y = 62;

const addSection = (title, textLines) => {
  if (y > 260) {
    doc.addPage();
    y = 20;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(79, 70, 229);
  doc.text(title, 15, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);

  for (const line of textLines) {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
    const splitLines = doc.splitTextToSize(line, 175);
    for (const sLine of splitLines) {
      doc.text(sLine, 15, y);
      y += 5;
    }
  }
  y += 4;
};

addSection('1. Executive Summary & Vision', [
  'HackVerse AI is an all-in-one, AI-powered developer enablement platform designed to empower students, software engineers, and hackathon participants to learn, build, simulate, and win hackathons worldwide.',
  'The platform bridges the gap between theoretical computer science education and practical, high-stakes software engineering with AI mentorship, 100,000+ non-repeating procedural generators, and interactive courses.'
]);

addSection('2. Target Audience & User Personas', [
  '• Student Hackers & CS Students: Seeking project ideas, mentor guidance, mock interviews, and team formation.',
  '• Aspiring Software Engineers: Mastering Data Structures & Algorithms (DSA), system design, and web stack.',
  '• Hackathon Organizers & Recruiters: Searching for top-tier developer talent with verified scorecards.'
]);

addSection('3. Core Feature Specifications', [
  '• Authentication & Onboarding: Student / Organizer / Recruiter roles + Google OAuth login modal.',
  '• AI Mentor (ChatGPT Engine): Multi-intent conversational guidance, error debugging, and concept definitions.',
  '• Project Idea Generator: 100,000+ non-repeating ideas with persistent signature tracking.',
  '• AI Interview Simulator: 100,000+ non-repeating DSA, System Design, and Behavioral prompts.',
  '• Mock Hackathon Engine: Timed 24h/48h/72h competitions with non-repeating problem statements.',
  '• Cybersecurity & Web Defense: 4 interactive video lessons covering XSS, SQLi, Auth, and Rate Limiting.',
  '• Profile & Gamification: Editable student info, XP levels, streaks, and achievement badges.'
]);

addSection('4. Technical Architecture', [
  '• Core Stack: React 18 (TypeScript), Vite, TailwindCSS, Vanilla CSS, Lucide React, Framer Motion.',
  '• State Management: Zustand (authStore), persistent localStorage signature tracking.',
  '• Quality Assurance: Strict TypeScript typechecking (tsc --noEmit).'
]);

addSection('5. Non-Functional Requirements & Roadmap', [
  '• Performance: Sub-100ms page transitions with 60fps micro-animations.',
  '• Reliability: Zero repetition across 100,000+ procedural generation calls.',
  '• Phase 1 (Live): Core MVP, ChatGPT mentor, cybersecurity videos, and profile manager.',
  '• Phase 2 (Q3 2026): Peer-to-peer team matchmaking chat & live collaborative code editor.'
]);

const pdfPath = path.join(__dirname, 'HackVerse_AI_Product_Requirements_Document.pdf');
const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
fs.writeFileSync(pdfPath, pdfBuffer);

console.log('PDF Generated Successfully at:', pdfPath);
