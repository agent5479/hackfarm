import { useParams, Link, Navigate } from 'react-router-dom';
import scraped from '../content/scraped-content.json';
import { HORSE_SLUGS, type HorseSlug } from '../lib/constants';
import { horseImage } from '../lib/horse-images';
import { optimizedUrl } from '../lib/images';
import PageHero from '../components/PageHero';
import { usePageMeta } from '../hooks/usePageTitle';
import { horseSeo } from '../seo/routes';
import EditableText from '../cms/EditableText';
import { useCms } from '../cms/ContentProvider';

type HorseEntry = {
  title: string;
  headings: string[];
  paragraphs: string[];
};

type HorsesDoc = {
  bySlug: Record<string, HorseEntry>;
};

export default function HorseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const horse = scraped.horses.find((h) => h.slug === slug);
  const seo = horseSeo(slug || 'horse', horse?.title, horse?.h2s);
  usePageMeta({
    ...seo,
    image: slug ? horseImage(slug) : seo.image,
  });
  const { getDoc } = useCms();
  const horsesDoc = getDoc<HorsesDoc>('horses');
  const entry = slug ? horsesDoc.bySlug[slug] : undefined;

  if (!slug || !HORSE_SLUGS.includes(slug as HorseSlug) || !horse || !entry) {
    return <Navigate to="/our-horses/" replace />;
  }

  return (
    <>
      <PageHero
        title={<EditableText doc="horses" as="span" path={`bySlug.${slug}.title`} />}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Our Horses', path: '/our-horses/' },
          { name: horse.title, path: seo.path },
        ]}
      />
      <section className="section section--cream">
        <div className="container two-col">
          <img
            src={optimizedUrl(horseImage(slug), 'content')}
            alt={horse.title}
            style={{ borderRadius: 4 }}
            decoding="async"
          />
          <div>
            {entry.headings.map((_, i) => (
              <EditableText key={i} doc="horses" as="h2" path={`bySlug.${slug}.headings.${i}`} />
            ))}
            {entry.paragraphs.map((_, i) => (
              <EditableText key={i} doc="horses" as="p" path={`bySlug.${slug}.paragraphs.${i}`} />
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
                <EditableText doc="horses" as="h3" path={`bySlug.${h.slug}.title`} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
