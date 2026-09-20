import PageHero from '../components/PageHero';
import { MAPS } from '../lib/constants';
import InstagramGrid from '../components/InstagramGrid';
import { JsonLd, serviceJsonLd } from '../components/JsonLd';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';
import { isSeoPrerender } from '../seo/prerender';
import EditableText from '../cms/EditableText';
import { useCms } from '../cms/ContentProvider';

type TrailsDoc = {
  intro: string[];
};

export default function TrailsPage() {
  const seo = getPageSeo('/hack-farm-trails/')!;
  usePageMeta(seo);
  const { getDoc } = useCms();
  const content = getDoc<TrailsDoc>('trails');
  const crawler = isSeoPrerender() && seo.h1;

  return (
    <>
      <JsonLd
        data={serviceJsonLd(
          'Horse Trails Golden Bay — Bring Your Own Horse',
          seo.description,
          '/hack-farm-trails/',
        )}
      />
      <PageHero
        title={
          crawler ? seo.h1! : <EditableText doc="trails" as="span" path="hero.title" />
        }
        subtitle={
          crawler && seo.intro
            ? seo.intro
            : <EditableText doc="trails" as="span" path="hero.subtitle" />
        }
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Horse Trails Golden Bay', path: '/hack-farm-trails/' },
        ]}
      />
      <section className="section section--cream">
        <div className="container">
          {content.intro.map((_, i) => (
            <EditableText key={i} doc="trails" as="p" path={`intro.${i}`} />
          ))}
          <p style={{ marginTop: '1rem' }}>
            <a href={MAPS.trailView} target="_blank" rel="noopener noreferrer" className="btn btn--green">View Map</a>
          </p>
        </div>
      </section>
      <section className="section section--white">
        <div className="container">
          <iframe
            className="map-embed"
            src={MAPS.trailMap}
            title="Hack Farm Trail Map"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
      <InstagramGrid />
    </>
  );
}
