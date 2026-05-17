import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useHydrateAuth } from './hooks/useHydrateAuth';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { PageLoader } from './components/layout/PageLoader';
import { useAuthStore } from './context/authStore';
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  DashboardPage,
  TripsPage,
  TripDetailsPage,
  GalleryPage,
  ProfilePage,
  WeatherPage,
  NotFoundPage,
} from './routes/lazyPages';

export default function App(): JSX.Element {
  useHydrateAuth();
  const token = useAuthStore((s) => s.token);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  if (isHydrating) {
    return <PageLoader label="ESTABLISHING UPLINK" />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <TripsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:id"
          element={
            <ProtectedRoute>
              <TripDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gallery"
          element={
            <ProtectedRoute>
              <GalleryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/weather"
          element={
            <ProtectedRoute>
              <WeatherPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
