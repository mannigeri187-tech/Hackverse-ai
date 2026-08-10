import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'

// Public & Auth Pages
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))

// Dedicated Role Access Logins
const OrganizerLogin = lazy(() => import('./pages/OrganizerLogin'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))

// Dedicated Layouts & Route Protection
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'))
const OrganizerLayout = lazy(() => import('./components/layout/OrganizerLayout'))
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'))

// Feature Pages
const Dashboard = lazy(() => import('./pages/Dashboard'))
const HackathonDiscovery = lazy(() => import('./pages/HackathonDiscovery'))
const HackathonDetail = lazy(() => import('./pages/HackathonDetail'))
const AIMentor = lazy(() => import('./pages/AIMentor'))
const LearningCenter = lazy(() => import('./pages/LearningCenter'))
const CourseDetail = lazy(() => import('./pages/CourseDetail'))
const MockHackathon = lazy(() => import('./pages/MockHackathon'))
const SkillGapAnalysis = lazy(() => import('./pages/SkillGapAnalysis'))
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'))
const ResumeReview = lazy(() => import('./pages/ResumeReview'))
const ProjectGenerator = lazy(() => import('./pages/ProjectGenerator'))
const ProgressAnalytics = lazy(() => import('./pages/ProgressAnalytics'))
const Community = lazy(() => import('./pages/Community'))
const TeamFinder = lazy(() => import('./pages/TeamFinder'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const InterviewPrep = lazy(() => import('./pages/InterviewPrep'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Profile = lazy(() => import('./pages/Profile'))
const OrganizerDashboard = lazy(() => import('./pages/OrganizerDashboard'))
const AdminPanel = lazy(() => import('./pages/AdminPanel'))
const TeammateMatchmaker = lazy(() => import('./pages/TeammateMatchmaker'))
const LiveOps = lazy(() => import('./pages/LiveOps'))
const JudgingHub = lazy(() => import('./pages/JudgingHub'))
const SponsorHub = lazy(() => import('./pages/SponsorHub'))

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
          <div className="relative w-16 h-16 rounded-full border-4 border-t-primary border-r-transparent border-b-primary/50 border-l-transparent animate-spin flex items-center justify-center">
            <span className="font-extrabold text-xl text-primary">H</span>
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading HackVerse AI...</p>
      </div>
    </div>
  )
}

import { ChatProvider } from './context/ChatContext'

export default function App() {
  return (
    <ChatProvider>
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public & Student Authentication Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Dedicated Separate Portal Logins */}
          <Route path="/organizer/login" element={<OrganizerLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Dedicated Organizer Portal Layout */}
          <Route element={<OrganizerLayout />}>
            <Route path="/organizer" element={<OrganizerDashboard />} />
            <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
          </Route>

          {/* Dedicated Admin Control Center Layout */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/dashboard" element={<AdminPanel />} />
          </Route>

          {/* Student & Ecosystem Application Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/hackathons" element={<HackathonDiscovery />} />
            <Route path="/hackathons/:id" element={<HackathonDetail />} />
            <Route path="/ai-mentor" element={<AIMentor />} />
            <Route path="/learning" element={<LearningCenter />} />
            <Route path="/learning/:courseId" element={<CourseDetail />} />
            <Route path="/mock-hackathon" element={<MockHackathon />} />
            <Route path="/skill-analysis" element={<SkillGapAnalysis />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
            <Route path="/resume-review" element={<ResumeReview />} />
            <Route path="/project-generator" element={<ProjectGenerator />} />
            <Route path="/analytics" element={<ProgressAnalytics />} />
            <Route path="/community" element={<Community />} />
            <Route path="/team-finder" element={<TeamFinder />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/interview-prep" element={<InterviewPrep />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/teammate-matchmaker" element={<TeammateMatchmaker />} />
            <Route path="/live-ops" element={<LiveOps />} />
            <Route path="/judging-hub" element={<JudgingHub />} />
            <Route path="/sponsor-hub" element={<SponsorHub />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="text-center space-y-4">
                <h1 className="text-8xl font-bold gradient-text">404</h1>
                <p className="text-xl text-muted-foreground">Page not found</p>
                <a href="/" className="btn-primary inline-block">Go Home</a>
              </div>
            </div>
          } />
        </Routes>
      </Suspense>
    </AnimatePresence>
    </ChatProvider>
  )
}
