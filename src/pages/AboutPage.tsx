import { optimizedUrl } from '../lib/images';
import PageHero from '../components/PageHero';
import { JsonLd, personJsonLd } from '../components/JsonLd';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';
import { isSeoPrerender } from '../seo/prerender';
import EditableText from '../cms/EditableText';
import { useCms } from '../cms/ContentProvider';

const seo = getPageSeo('/about/')!;

type AboutDoc = {
  sections: { body: string[] }[];
};

export default function AboutPage() {
  usePageMeta(seo);
  const { getDoc } = useCms();
  const about = getDoc<AboutDoc>('about');
  const crawler = isSeoPrerender() && seo.h1;

  return (
    <>
      <JsonLd
        data={personJsonLd({
          name: 'Baerbel Hack',
          jobTitle: 'Founder, Hack n Stay Golden Bay',
          path: '/about/',
          description:
            'Baerbel Hack founded Hack Farm / Hack n Stay Golden Bay and the Hack Vaulties club, sharing connected riding and vaulting in Golden Bay, Nelson Tasman, at the top of New Zealand\'s South Island near Abel Tasman National Park.',
          image: '/images/uploads/2021/02/IMG_20190120_122312-scaled.jpg',
        })}
      />
      <PageHero
        title={
          crawler ? seo.h1! : <EditableText doc="about" as="span" path="hero.title" />
        }
        subtitle={
          crawler && seo.intro
            ? seo.intro
            : <EditableText doc="about" as="span" path="hero.subtitle" />
        }
        background="/images/uploads/2021/03/20190801_Hackfarm_Panorama-rainbow.jpg"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'About Hack n Stay', path: '/about/' },
        ]}
      />
      <section className="section section--cream">
        <div className="container">
          <EditableText doc="about" as="h2" path="sections.0.title" />
          {about.sections[0]?.body.map((_, i) => (
            <EditableText key={i} doc="about" as="p" path={`sections.0.body.${i}`} />
          ))}
        </div>
      </section>
      <section className="section section--white">
        <div className="container two-col">
          <div>
            <EditableText doc="about" as="h2" path="sections.1.title" />
            {about.sections[1]?.body.map((_, i) => (
              <EditableText key={i} doc="about" as="p" path={`sections.1.body.${i}`} />
            ))}
          </div>
          <div>
            <img
              src={optimizedUrl('/images/uploads/2021/02/IMG_20190120_122312-scaled.jpg', 'content')}
              alt="Vaulting at Hack Farm"
              style={{ borderRadius: 4, width: '100%', height: 'auto', objectFit: 'cover' }}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>
      <section className="section section--cream">
        <div className="container">
          <EditableText doc="about" as="h2" path="sections.2.title" />
          {about.sections[2]?.body.map((_, i) => (
            <EditableText key={i} doc="about" as="p" path={`sections.2.body.${i}`} />
          ))}
        </div>
      </section>
    </>
  );
}
