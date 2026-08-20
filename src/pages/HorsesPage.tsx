import { Link } from 'react-router-dom';
import scraped from '../content/scraped-content.json';
import PageHero from '../components/PageHero';
import { horseImage } from '../lib/horse-images';
import { optimizedUrl } from '../lib/images';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';

export default function HorsesPage() {
  usePageMeta(getPageSeo('/our-horses/')!);

  return (
    <>
      <PageHero
        title="Our Horses"
        subtitle="Our Equine Family and your partner on the trail."
      />
      <section className="section section--cream">
        <div className="container">
          <div className="horse-grid">
            {scraped.horses.map((horse) => (
              <Link key={horse.slug} to={`/horse/${horse.slug}/`} className="horse-card">
                <img
                  src={optimizedUrl(horseImage(horse.slug), 'thumb')}
                  alt={horse.title}
                  loading="lazy"
                  decoding="async"
                />
                <h3>{horse.title}</h3>
              </Link>
            ))}
          </div>
          <blockquote className="testimonial" style={{ marginTop: '3rem', textAlign: 'center' }}>
            "No one can teach riding so well as a horse" — C.S. Lewis
          </blockquote>
        </div>
      </section>
    </>
  );
}
