import { Navigate, useParams } from 'react-router-dom';

/** Legacy route — master-detail logbook lives at /trips?trip=id */
export function TripDetailsPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to="/trips" replace />;
  return <Navigate to={`/trips?trip=${encodeURIComponent(id)}`} replace />;
}
