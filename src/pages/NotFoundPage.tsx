import { Link, useLocation } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { usePageMeta } from '../hooks/usePageTitle';

export default function NotFoundPage() {
  const { pathname } = useLocation();
  const path = pathname.endsWith('/') || pathname === '/' ? pathname : `${pathname}/`;

  usePageMeta({
    title: 'Page not found',
    description: 'This page could not be found on Hack n Stay Golden Bay. Browse our rides, stays, and experiences instead.',
    path,
    robots: 'noindex, follow',
  });

  return (
    <>
      <PageHero title="Page not found" />
      <section className="section section--cream">
        <div className="container" style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
          <p>Sorry — that URL isn’t on this site. It may have moved, or the link might be out of date.</p>
          <p style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/" className="btn btn--green">
              Home
            </Link>
            <Link to="/sitemap/" className="btn btn--orange">
              Sitemap
            </Link>
            <Link to="/contact/" className="btn btn--pink">
              Contact
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
