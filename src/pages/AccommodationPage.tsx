import { Link } from 'react-router-dom';
import { optimizedUrl } from '../lib/images';
import PageHero from '../components/PageHero';
import { JsonLd, serviceJsonLd, faqPageJsonLd } from '../components/JsonLd';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';
import { isSeoPrerender } from '../seo/prerender';
import { ALL_ACCOMMODATION_FAQS } from '../content/faqs';
import EditableText from '../cms/EditableText';
import { useCms } from '../cms/ContentProvider';

const SECTIONS: { id: string; img: string }[] = [
  { id: 'homestead', img: '/images/uploads/2021/02/House-from-afar.jpg' },
  { id: 'camp-ground', img: '/images/uploads/2021/02/hackfarm-Campsite.jpg' },
  { id: 'horse-stay', img: '/images/uploads/2021/03/VaultingHorseClubDay.jpg' },
];

type AccommodationDoc = {
  intro: string[];
  sections: { id: string; title: string; body: string[]; footer?: string }[];
  faqs: {
    homestead: { question: string; answer: string }[];
    camping: { question: string; answer: string }[];
    byoHorse: {
      question: string;
      answer: string;
      link?: { to: string; label: string };
    }[];
  };
};

function FaqBlock({
  title,
  faqKey,
  items,
}: {
  title: string;
  faqKey: 'homestead' | 'camping' | 'byoHorse';
  items: { question: string; answer: string; link?: { to: string; label: string } }[];
}) {
  return (
    <section className="section section--cream">
      <div className="container">
        <h2>{title}</h2>
        {items.map((faq, i) => (
          <div key={i} style={{ marginBottom: '1.25rem' }}>
            <EditableText doc="accommodation" as="h3" path={`faqs.${faqKey}.${i}.question`} />
            <EditableText doc="accommodation" as="p" path={`faqs.${faqKey}.${i}.answer`} />
            {faq.link ? (
              <p>
                <Link to={faq.link.to}>
                  <EditableText doc="accommodation" as="span" path={`faqs.${faqKey}.${i}.link.label`} />
                </Link>
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AccommodationPage() {
  const seo = getPageSeo('/accommodation/')!;
  usePageMeta(seo);
  const { getDoc } = useCms();
  const content = getDoc<AccommodationDoc>('accommodation');
  const crawler = isSeoPrerender() && seo.h1;

  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd(
            'Golden Bay Farmstay & Camping',
            seo.description,
            '/accommodation/',
          ),
          serviceJsonLd(
            'Horse Stay — Bring Your Own Horse Accommodation',
            'Bring-your-own-horse paddocks, holding yards, and arena access at Hack n Stay in Golden Bay, New Zealand.',
            '/accommodation/',
          ),
          faqPageJsonLd(ALL_ACCOMMODATION_FAQS),
        ]}
      />
      <PageHero
        title={
          crawler ? seo.h1! : <EditableText doc="accommodation" as="span" path="hero.title" />
        }
        subtitle={
          crawler && seo.intro
            ? seo.intro
            : <EditableText doc="accommodation" as="span" path="hero.subtitle" />
        }
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Golden Bay Farmstay', path: '/accommodation/' },
        ]}
      />
      <section className="section section--cream">
        <div className="container">
          {content.intro.map((_, i) => (
            <EditableText key={i} doc="accommodation" as="p" path={`intro.${i}`} />
          ))}
        </div>
      </section>
      {SECTIONS.map((s, idx) => (
        <section key={s.id} id={s.id} className={`section ${idx % 2 === 0 ? 'section--white' : 'section--cream'}`}>
          <div className="container two-col">
            <img
              src={optimizedUrl(s.img, 'content')}
              alt={content.sections[idx]?.title ?? s.id}
              style={{ borderRadius: 4 }}
              loading="lazy"
              decoding="async"
            />
            <div>
              <EditableText doc="accommodation" as="h2" path={`sections.${idx}.title`} />
              {content.sections[idx]?.body.map((_, i) => (
                <EditableText key={i} doc="accommodation" as="p" path={`sections.${idx}.body.${i}`} />
              ))}
              {content.sections[idx]?.footer ? (
                <EditableText doc="accommodation" as="p" path={`sections.${idx}.footer`} />
              ) : null}
            </div>
          </div>
        </section>
      ))}
      <section className="section section--white">
        <div className="container">
          <h2>Facilities include:</h2>
          <EditableText doc="accommodation" as="p" path="facilities" />
        </div>
      </section>
      <FaqBlock title="Frequently asked homestead questions" faqKey="homestead" items={content.faqs.homestead} />
      <FaqBlock title="Frequently asked camping questions" faqKey="camping" items={content.faqs.camping} />
      <FaqBlock title="Frequently asked BYO horse questions" faqKey="byoHorse" items={content.faqs.byoHorse} />
    </>
  );
}
