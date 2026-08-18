import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { HORSE_SLUGS, withBase } from '../lib/constants';
import { usePageTitle } from '../hooks/usePageTitle';

const PAGES = [
  { label: 'Home', to: '/' },
  { label: 'Accommodation', to: '/accommodation/' },
  { label: 'Holistic Horse Rides', to: '/holistic-horse-rides/' },
  { label: 'Hack Farm Trails', to: '/hack-farm-trails/' },
  { label: 'Our Horses', to: '/our-horses/' },
  { label: 'Learning Experiences', to: '/learning-experiences/' },
  { label: 'Vaulting', to: '/vaulting/' },
  { label: 'Special Events', to: '/special-events/' },
  { label: 'Gift Vouchers', to: '/horse-riding-holiday-gift-vouchers/' },
  { label: 'Contact', to: '/contact/' },
  { label: 'Partners', to: '/partners/' },
  { label: 'Privacy Policy', to: '/privacy-policy-2/' },
  { label: 'Weather Station', to: '/FreshWDL/FreshWDL.html', external: true },
];

export default function SitemapPage() {
  usePageTitle('Sitemap');

  return (
    <>
      <PageHero title="Sitemap" />
      <section className="section section--cream">
        <div className="container">
          <ul className="sitemap-list">
            {PAGES.map((p) => (
              <li key={p.to}>
                {'external' in p && p.external ? (
                  <a href={withBase(p.to)}>{p.label}</a>
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
