import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudySyncProvider, useStudySync } from './context/StudySyncContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { Toast } from './components/common/UIElements';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import MobileBottomNav from './components/common/MobileBottomNav';
import { ProtectedRoute, AdminRoute } from './components/common/RouteGuards';

// Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import NotesPage from './pages/NotesPage';
import PlannerPage from './pages/PlannerPage';
import FocusPage from './pages/FocusPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminPortalPage from './pages/AdminPortalPage';
import AuthPage from './pages/AuthPage';
import NotFoundPage from './pages/NotFoundPage';

// Modals
import TaskModal from './components/modals/TaskModal';
import NoteModal from './components/modals/NoteModal';
import SubjectModal from './components/modals/SubjectModal';
import CategoryModal from './components/modals/CategoryModal';
import ProfileModal from './components/modals/ProfileModal';
import AdminLoginModal from './components/modals/AdminLoginModal';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppShell() {
  const location = useLocation();
  const { token } = useAuth();

  useEffect(() => {
    // Silently pre-warm Render Cloud API instance
    fetch('https://studysync-api.onrender.com/api/v1/admin/verify-passcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: 'ping' }),
    }).catch(() => {});
  }, []);
  const {
    data,
    toastMessage,
    taskModal,
    setTaskModal,
    noteModal,
    setNoteModal,
    subjectModal,
    setSubjectModal,
    categoryModal,
    setCategoryModal,
    profileModalOpen,
    setProfileModalOpen,
    adminLoginModalOpen,
    setAdminLoginModalOpen,
    saveTask,
    saveNote,
    saveSubject,
    saveCategory,
  } = useStudySync();

  const isAdminPage = location.pathname === '/admin';
  const isPublicOrAuthPage = ['/', '/login', '/register', '/admin'].includes(location.pathname);
  const showSidebar = !isPublicOrAuthPage && Boolean(token);

  return (
    <div className={isAdminPage ? 'admin-shell' : (showSidebar ? 'app-shell' : 'public-shell')}>
      <ScrollToTop />

      {/* Top Navbar on public landing page */}
      {(!showSidebar && location.pathname === '/') && (
        <Navbar onOpenAdminModal={() => setAdminLoginModalOpen(true)} />
      )}

      {/* Sidebar on workspace pages */}
      {showSidebar && <Sidebar />}

      {/* Mobile Bottom Navigation on workspace pages */}
      {showSidebar && <MobileBottomNav />}

      {/* Main Content Viewport */}
      <main className={showSidebar ? 'main-content' : 'public-content'}>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage onOpenAdminModal={() => setAdminLoginModalOpen(true)} />} />

          {/* Auth Pages */}
          <Route path="/login" element={<AuthPage initialMode="login" />} />
          <Route path="/register" element={<AuthPage initialMode="register" />} />

          {/* Authenticated Workspace Pages */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <NotesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planner"
            element={
              <ProtectedRoute>
                <PlannerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/focus"
            element={
              <ProtectedRoute>
                <FocusPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />

          {/* Standalone Admin Command Hub */}
          <Route
            path="/admin"
            element={
              <AdminRoute onOpenAdminModal={() => setAdminLoginModalOpen(true)}>
                <AdminPortalPage />
              </AdminRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Global Modals */}
      {taskModal !== null && (
        <TaskModal
          task={taskModal}
          subjects={data.subjects}
          categories={data.categories}
          onClose={() => setTaskModal(null)}
          onSave={saveTask}
          onAddSubject={() => setSubjectModal({})}
          onAddCategory={() => setCategoryModal({})}
        />
      )}

      {noteModal !== null && (
        <NoteModal
          note={noteModal}
          subjects={data.subjects}
          categories={data.categories}
          onClose={() => setNoteModal(null)}
          onSave={saveNote}
          onAddSubject={() => setSubjectModal({})}
          onAddCategory={() => setCategoryModal({})}
        />
      )}

      {subjectModal !== null && (
        <SubjectModal
          subject={subjectModal}
          onClose={() => setSubjectModal(null)}
          onSave={saveSubject}
        />
      )}

      {categoryModal !== null && (
        <CategoryModal
          category={categoryModal}
          onClose={() => setCategoryModal(null)}
          onSave={saveCategory}
        />
      )}

      {profileModalOpen && (
        <ProfileModal
          onClose={() => setProfileModalOpen(false)}
        />
      )}

      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={() => setAdminLoginModalOpen(false)}
        onLoginSuccess={() => {
          window.location.href = '/admin';
        }}
      />

      {/* Global Toast Alert */}
      <Toast message={toastMessage} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <StudySyncProvider>
            <AppShell />
          </StudySyncProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
