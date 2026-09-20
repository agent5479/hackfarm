import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { HORSE_SLUGS, WEATHER_STATION_URL } from '../lib/constants';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';

const PAGES = [
  { label: 'Home — Horse Riding & Farmstay Golden Bay', to: '/' },
  { label: 'About Hack n Stay', to: '/about/' },
  { label: 'Golden Bay Farmstay & Camping', to: '/accommodation/' },
  { label: 'Horse Riding Golden Bay', to: '/holistic-horse-rides/' },
  { label: 'Horse Trails — Bring Your Own Horse', to: '/hack-farm-trails/' },
  { label: 'Our Horses', to: '/our-horses/' },
  { label: 'Horse Riding Lessons & Horsemanship', to: '/learning-experiences/' },
  { label: 'Horse Vaulting New Zealand', to: '/vaulting/' },
  { label: 'Kids Horse Riding Camps', to: '/special-events/' },
  { label: 'Horse Riding Gift Vouchers', to: '/horse-riding-holiday-gift-vouchers/' },
  { label: 'Contact', to: '/contact/' },
  { label: 'Partners', to: '/partners/' },
  { label: 'Privacy Policy', to: '/privacy-policy/' },
  { label: 'Weather Station', to: WEATHER_STATION_URL, external: true },
];

export default function SitemapPage() {
  usePageMeta(getPageSeo('/sitemap/')!);

  return (
    <>
      <PageHero
        title="Sitemap"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Sitemap', path: '/sitemap/' },
        ]}
      />
      <section className="section section--cream">
        <div className="container">
          <ul className="sitemap-list">
            {PAGES.map((p) => (
              <li key={p.to}>
                {'external' in p && p.external ? (
                  <a href={p.to} target="_blank" rel="noopener noreferrer">
                    {p.label}
                  </a>
                ) : (
                  <Link to={p.to}>{p.label}</Link>
                )}
              </li>
            ))}
            {HORSE_SLUGS.map((slug) => (
              <li key={slug}>
                <Link to={`/horse/${slug}/`}>{slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
