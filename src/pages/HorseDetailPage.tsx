import { useParams, Link, Navigate } from 'react-router-dom';
import scraped from '../content/scraped-content.json';
import { decodeHtml, HORSE_SLUGS, type HorseSlug } from '../lib/constants';
import { horseImage } from '../lib/horse-images';
import { optimizedUrl } from '../lib/images';
import PageHero from '../components/PageHero';
import { JsonLd, breadcrumbJsonLd } from '../components/JsonLd';
import { usePageMeta } from '../hooks/usePageTitle';
import { horseSeo } from '../seo/routes';

export default function HorseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const horse = scraped.horses.find((h) => h.slug === slug);
  const seo = horseSeo(slug || 'horse', horse?.title);
  usePageMeta({
    ...seo,
    image: slug ? horseImage(slug) : seo.image,
  });

  if (!slug || !HORSE_SLUGS.includes(slug as HorseSlug) || !horse) {
    return <Navigate to="/our-horses/" replace />;
  }

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Our Horses', path: '/our-horses/' },
          { name: horse.title, path: seo.path },
        ])}
      />
      <PageHero title={horse.title} />
      <section className="section section--cream">
        <div className="container two-col">
          <img
            src={optimizedUrl(horseImage(slug), 'content')}
            alt={horse.title}
            style={{ borderRadius: 4 }}
            decoding="async"
          />
          <div>
            {horse.h2s.map((h) => (
              <h2 key={h}>{decodeHtml(h)}</h2>
            ))}
            {horse.paragraphs.slice(0, 8).map((p, i) => (
              <p key={i}>{decodeHtml(p)}</p>
            ))}
          </div>
        </div>
      </section>
      <section className="section section--white">
        <div className="container">
          <h2>Check out some of my other workmates</h2>
          <div className="horse-grid">
            {scraped.horses.filter((h) => h.slug !== slug).slice(0, 6).map((h) => (
              <Link key={h.slug} to={`/horse/${h.slug}/`} className="horse-card">
                <img
                  src={optimizedUrl(horseImage(h.slug), 'thumb')}
                  alt={h.title}
                  loading="lazy"
                  decoding="async"
                />
                <h3>{h.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
