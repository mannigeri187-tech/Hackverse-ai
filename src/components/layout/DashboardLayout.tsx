import { Outlet, Navigate } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useAppStore } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'

export default function DashboardLayout() {
  const { sidebarOpen } = useAppStore()
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      <Navbar />
      <div className="flex flex-1 relative">
        <Sidebar />
        <main
          className={`flex-1 transition-all duration-300 p-4 md:p-6 lg:p-8 overflow-y-auto ${
            sidebarOpen ? 'lg:ml-64' : 'ml-0'
          }`}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
