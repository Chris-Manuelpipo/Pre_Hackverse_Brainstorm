import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import { ToastProvider } from './components/ui/Toast';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import FeedPage from './pages/FeedPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import NewQuestionPage from './pages/NewQuestionPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import useThemeStore from './store/themeStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// ── Guard : redirige vers /auth/login si non connecté ─────────────────────────
function PrivateRoute({ element }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? element : <Navigate to="/auth/login" replace />;
}

function AppLayout({ children }) {
  return (
    <div className="app-shell min-h-screen flex flex-col">
      <Header />
      <div className="app-shell__backdrop" aria-hidden="true" />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="flex gap-8 items-start">{children}</div>
      </div>
      <Footer />
    </div>
  );
}

function AuthLayout({ children }) {
  return (
    <div className="app-shell app-shell--auth min-h-screen flex flex-col">
      <div className="app-shell__backdrop" aria-hidden="true" />
      {children}
    </div>
  );
}

// ── Initialisation auth au démarrage ──────────────────────────────────────────
function AuthInit() {
  const { initAuth, token } = useAuthStore();
  useEffect(() => {
    if (token) initAuth();
  }, []);
  return null;
}

function ThemeInit() {
  const { initTheme } = useThemeStore();
  useEffect(() => {
    initTheme();
  }, [initTheme]);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthInit />
          <ThemeInit />
          <Routes>
            {/* Auth Routes */}
            <Route path="/auth/login"    element={<AuthLayout><LoginPage /></AuthLayout>} />
            <Route path="/auth/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />

            {/* Main Routes */}
            <Route path="/" element={<Navigate to="/feed" replace />} />

            <Route path="/feed" element={
              <AppLayout>
                <Sidebar />
                <main className="flex-1 min-w-0"><FeedPage /></main>
              </AppLayout>
            } />

            <Route path="/questions/new" element={
              <AppLayout>
                <Sidebar />
                <main className="flex-1 min-w-0">
                  <PrivateRoute element={<NewQuestionPage />} />
                </main>
              </AppLayout>
            } />

            <Route path="/questions/:id" element={
              <AppLayout>
                <Sidebar />
                <main className="flex-1 min-w-0"><QuestionDetailPage /></main>
              </AppLayout>
            } />

            <Route path="/profile/:id" element={
              <AppLayout>
                <Sidebar />
                <main className="flex-1 min-w-0"><ProfilePage /></main>
              </AppLayout>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/feed" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;