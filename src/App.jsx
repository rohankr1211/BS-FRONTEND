import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Layout } from './components/layout/Layout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import SignupPage from './pages/public/SignupPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';
import { PendingVerificationPage } from './pages/public/PendingVerificationPage';
import { UnauthorizedPage } from './pages/public/UnauthorizedPage';

// Dashboards & Admin
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { AuditLogs } from './pages/admin/AuditLogs';
import { PMDashboard } from './pages/dashboard/PMDashboard';

// Reports & Analytics Module
import { ReportsLayout } from './components/layout/ReportsLayout';
import { DashboardOverview } from './pages/reports/DashboardOverview';
import { ReportGeneration } from './pages/reports/ReportGeneration';
import { ProjectAnalytics } from './pages/reports/ProjectAnalytics';
import { VendorAnalytics } from './pages/reports/VendorAnalytics';
import { SiteEngineerAnalytics } from './pages/reports/SiteEngineerAnalytics';
import { SafetyAnalytics } from './pages/reports/SafetyAnalytics';
import { ResourceAnalytics } from './pages/reports/ResourceAnalytics';
import { UserAnalytics } from './pages/reports/UserAnalytics';

// Project Manager Module
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { ProjectDetailPage } from './pages/projects/ProjectDetailPage';
import { MyTasksPage } from './pages/projects/MyTasksPage';
import { TemplatesPage } from './pages/projects/TemplatesPage';
import { ResourcesPage } from './pages/projects/ResourcesPage';
import { AllocationsPage } from './pages/projects/AllocationsPage';
import { ApprovalsPage } from './pages/approvals/ApprovalsPage';

// Safety Officer Module
import { SafetyDashboard } from './pages/safety/SafetyDashboard';
import { IncidentsPage } from './pages/safety/IncidentsPage';
import { InspectionsPage } from './pages/safety/InspectionsPage';
import { SafetyTasksPage } from './pages/safety/SafetyTasksPage';

// Vendor Module
import { VendorDashboard } from './pages/vendors/VendorDashboard';
import { ContractsPage } from './pages/vendors/ContractsPage';
import { DocumentsPage } from './pages/vendors/DocumentsPage';
import { InvoicesPage } from './pages/vendors/InvoicesPage';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/pending-verification" element={<PendingVerificationPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* All authenticated routes share Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* ── Admin & IAM ── */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/iam">
            <Route path="users" element={<UserManagement />} />
            <Route path="audit-logs" element={<AuditLogs />} />
          </Route>

          {/* ── Reports & Analytics (ADMIN + PM) ── */}
          <Route path="/reports" element={<ReportsLayout />}>
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="generate" element={<ReportGeneration />} />
            <Route path="projects" element={<ProjectAnalytics />} />
            <Route path="vendors" element={<VendorAnalytics />} />
            <Route path="site-engineers" element={<SiteEngineerAnalytics />} />
            <Route path="safety" element={<SafetyAnalytics />} />
            <Route path="resources" element={<ResourceAnalytics />} />
            <Route path="users" element={<UserAnalytics />} />
          </Route>

          {/* ── Project Manager Module ── */}
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="/tasks/my" element={<MyTasksPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/approvals" element={<ApprovalsPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/allocations" element={<AllocationsPage />} />

          {/* ── Role Dashboards ── */}
          <Route path="/pm/dashboard" element={<PMDashboard />} />

          {/* ── Safety Officer Module ── */}
          <Route path="/safety/dashboard" element={<SafetyDashboard />} />
          <Route path="/safety/incidents" element={<IncidentsPage />} />
          <Route path="/safety/inspections" element={<InspectionsPage />} />
          <Route path="/safety/tasks" element={<SafetyTasksPage />} />

          {/* ── Vendor Module ── */}
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/contracts" element={<ContractsPage />} />
          <Route path="/vendor/documents" element={<DocumentsPage />} />
          <Route path="/vendor/invoices" element={<InvoicesPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
