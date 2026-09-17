import { Link } from 'react-router-dom';
import scraped from '../content/scraped-content.json';
import PageHero from '../components/PageHero';
import { horseImage } from '../lib/horse-images';
import { optimizedUrl } from '../lib/images';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';
import EditableText from '../cms/EditableText';

export default function HorsesPage() {
  usePageMeta(getPageSeo('/our-horses/')!);

  return (
    <>
      <PageHero
        title={<EditableText doc="horses" as="span" path="listHero.title" />}
        subtitle={<EditableText doc="horses" as="span" path="listHero.subtitle" />}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Our Horses', path: '/our-horses/' },
        ]}
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
                <EditableText doc="horses" as="h3" path={`bySlug.${horse.slug}.title`} />
              </Link>
            ))}
          </div>
          <blockquote className="testimonial" style={{ marginTop: '3rem', textAlign: 'center' }}>
            <EditableText doc="horses" as="span" path="quote" />
          </blockquote>
        </div>
      </section>
    </>
  );
}
