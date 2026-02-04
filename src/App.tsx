import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { RequireVerified } from '@/components/auth/RequireVerified'
import {
  Landing,
  Login,
  Signup,
  ForgotPassword,
  ResetPassword,
  EmailVerification,
  NotFound,
  ServerError,
  Legal,
  Dashboard,
  SkillLibrary,
  Profile,
  WorkspaceSettings,
  Help,
  Automations,
  SkillStudio,
  RunDetails,
  WebAgentRuns,
  Checkout,
  Demo,
  AdminDashboard,
  Notifications,
  DataManagement,
  Search,
  Integrations,
} from '@/pages'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<EmailVerification />} />
          </Route>
          <Route path="/legal" element={<Legal />} />
          <Route path="/privacy" element={<Navigate to="/legal?section=privacy" replace />} />
          <Route path="/terms" element={<Navigate to="/legal?section=terms" replace />} />
          <Route path="/cookies" element={<Navigate to="/legal?section=cookies" replace />} />
          <Route path="/500" element={<ServerError />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/help" element={<Help />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/dashboard" element={<RequireVerified><DashboardLayout /></RequireVerified>}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="skills" element={<SkillLibrary />} />
            <Route path="skills/studio" element={<SkillStudio />} />
            <Route path="automations" element={<Automations />} />
            <Route path="web-agent" element={<WebAgentRuns />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<WorkspaceSettings />} />
            <Route path="data-management" element={<DataManagement />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="search" element={<Search />} />
            <Route path="runs/:id" element={<RunDetails />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgb(var(--card))',
            border: '1px solid rgb(var(--border))',
            color: 'rgb(var(--foreground))',
          },
        }}
      />
    </QueryClientProvider>
  )
}
