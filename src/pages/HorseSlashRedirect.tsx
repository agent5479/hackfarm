import { Navigate, useParams } from 'react-router-dom';

export default function HorseSlashRedirect() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/horse/${slug}/`} replace />;
}
