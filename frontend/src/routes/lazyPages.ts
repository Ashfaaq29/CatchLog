import { lazy } from 'react';

export const LandingPage = lazy(() =>
  import('../pages/Landing').then((m) => ({ default: m.LandingPage })),
);
export const LoginPage = lazy(() =>
  import('../pages/Login').then((m) => ({ default: m.LoginPage })),
);
export const RegisterPage = lazy(() =>
  import('../pages/Register').then((m) => ({ default: m.RegisterPage })),
);
export const DashboardPage = lazy(() =>
  import('../pages/Dashboard').then((m) => ({ default: m.DashboardPage })),
);
export const TripsPage = lazy(() =>
  import('../pages/Trips').then((m) => ({ default: m.TripsPage })),
);
export const TripDetailsPage = lazy(() =>
  import('../pages/TripDetails').then((m) => ({ default: m.TripDetailsPage })),
);
export const GalleryPage = lazy(() =>
  import('../pages/Gallery').then((m) => ({ default: m.GalleryPage })),
);
export const ProfilePage = lazy(() =>
  import('../pages/Profile').then((m) => ({ default: m.ProfilePage })),
);
export const WeatherPage = lazy(() =>
  import('../pages/Weather').then((m) => ({ default: m.WeatherPage })),
);
export const NotFoundPage = lazy(() =>
  import('../pages/NotFound').then((m) => ({ default: m.NotFoundPage })),
);
