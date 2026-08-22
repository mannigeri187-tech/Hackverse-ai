import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Loader2 } from 'lucide-react';

// Eagerly loaded primary public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Lazy-loaded authentication & password recovery
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const VerifyResetCodePage = lazy(() => import('./pages/VerifyResetCodePage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

// Lazy-loaded core protected dashboard & hackathon pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const HackathonsPage = lazy(() => import('./pages/HackathonsPage'));
const HackathonDetailsPage = lazy(() => import('./pages/HackathonDetailsPage'));
const WorkspacePage = lazy(() => import('./pages/WorkspacePage'));
const SavedHackathonsPage = lazy(() => import('./pages/SavedHackathonsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'));
const ResumeBuilderPage = lazy(() => import('./pages/ResumeBuilderPage'));
const TeamFinderPage = lazy(() => import('./pages/TeamFinderPage'));

// Lazy-loaded AI-heavy feature pages (Chunk split to reduce initial bundle from 814kB to <200kB)
const IdeaGeneratorPage = lazy(() => import('./pages/IdeaGeneratorPage'));
const PitchCoachPage = lazy(() => import('./pages/PitchCoachPage'));
const GitHubAnalyzerPage = lazy(() => import('./pages/GitHubAnalyzerPage'));
const WinningReadinessPage = lazy(() => import('./pages/WinningReadinessPage'));
const CertificateVaultPage = lazy(() => import('./pages/CertificateVaultPage'));
const HackathonPortfolioPage = lazy(() => import('./pages/HackathonPortfolioPage'));
const MentorPage = lazy(() => import('./pages/MentorPage'));
const SkillGapPage = lazy(() => import('./pages/SkillGapPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="text-xs font-semibold text-slate-500">Loading page...</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Layout */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />
              <Route path="verify-email" element={<VerifyEmailPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="verify-reset-code" element={<VerifyResetCodePage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="hackathons" element={<HackathonsPage />} />
                <Route path="hackathons/:id" element={<HackathonDetailsPage />} />
                <Route path="workspace/:id" element={<WorkspacePage />} />
                <Route path="idea-generator" element={<IdeaGeneratorPage />} />
                <Route path="pitch-coach" element={<PitchCoachPage />} />
                <Route path="github-analyzer" element={<GitHubAnalyzerPage />} />
                <Route path="winning-readiness" element={<WinningReadinessPage />} />
                <Route path="certificates" element={<CertificateVaultPage />} />
                <Route path="portfolio" element={<HackathonPortfolioPage />} />
                <Route path="mentor" element={<MentorPage />} />
                <Route path="skill-gap" element={<SkillGapPage />} />
                <Route path="saved" element={<SavedHackathonsPage />} />
                <Route path="team-finder" element={<TeamFinderPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="profile/:id" element={<PublicProfilePage />} />
                <Route path="resume" element={<ResumeBuilderPage />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
