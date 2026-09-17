import { optimizedUrl } from '../lib/images';
import PageHero from '../components/PageHero';
import { JsonLd, serviceJsonLd } from '../components/JsonLd';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';
import EditableText from '../cms/EditableText';
import { useCms } from '../cms/ContentProvider';

type EventsDoc = {
  body: string[];
  secondaryBody: string[];
};

export default function EventsPage() {
  const seo = getPageSeo('/special-events/')!;
  usePageMeta(seo);
  const { getDoc } = useCms();
  const content = getDoc<EventsDoc>('events');

  return (
    <>
      <JsonLd data={serviceJsonLd('Special Events & Kids Camps', seo.description, '/special-events/')} />
      <PageHero
        title={<EditableText doc="events" as="span" path="hero.title" />}
        subtitle={<EditableText doc="events" as="span" path="hero.subtitle" />}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Special Events', path: '/special-events/' },
        ]}
      />
      <section className="section section--cream">
        <div className="container">
          {content.body.map((_, i) => (
            <EditableText key={i} doc="events" as="p" path={`body.${i}`} />
          ))}
        </div>
      </section>
      <section className="section section--white">
        <div className="container two-col">
          <img
            src={optimizedUrl('/images/uploads/2021/03/VaultingHorseClubDay.jpg', 'content')}
            alt="Kids camp"
            style={{ borderRadius: 4 }}
            loading="lazy"
            decoding="async"
          />
          <div>
            <EditableText doc="events" as="h2" path="secondaryTitle" />
            {content.secondaryBody.map((_, i) => (
              <EditableText key={i} doc="events" as="p" path={`secondaryBody.${i}`} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
