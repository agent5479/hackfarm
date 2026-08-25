import scraped from '../content/scraped-content.json';
import { decodeHtml } from '../lib/constants';
import { optimizedUrl } from '../lib/images';
import PageHero from '../components/PageHero';
import { JsonLd, serviceJsonLd, faqPageJsonLd } from '../components/JsonLd';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';
import {
  ALL_ACCOMMODATION_FAQS,
  BYO_HORSE_FAQS,
  CAMPING_FAQS,
  HOMESTEAD_FAQS,
  type FaqItem,
} from '../content/faqs';

const content = scraped.pages.accommodation;

const SECTIONS = [
  { id: 'homestead', title: 'Farmstay', img: '/images/uploads/2021/02/House-from-afar.jpg' },
  { id: 'camp-ground', title: 'Camping in Golden Bay', img: '/images/uploads/2021/02/hackfarm-Campsite.jpg' },
  { id: 'horse-stay', title: 'Horse Stay', img: '/images/uploads/2021/04/Horse-Stay-smaller.jpg' },
];

function FaqBlock({ title, faqs }: { title: string; faqs: FaqItem[] }) {
  return (
    <section className="section section--cream">
      <div className="container">
        <h2>{title}</h2>
        {faqs.map((faq) => (
          <div key={faq.question} style={{ marginBottom: '1.25rem' }}>
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AccommodationPage() {
  const seo = getPageSeo('/accommodation/')!;
  usePageMeta(seo);

  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd('Accommodation', seo.description, '/accommodation/'),
          faqPageJsonLd(ALL_ACCOMMODATION_FAQS),
        ]}
      />
      <PageHero title={decodeHtml(content.h1s[0] || 'Accommodation')} subtitle={content.ogDesc} />
      <section className="section section--cream">
        <div className="container">
          <p>
            Hack n Stay offers farmstay rooms, a dog-friendly campground, and bring-your-own-horse stays
            near Paton&apos;s Rock beach in Golden Bay.
          </p>
          {content.paragraphs.slice(0, 3).map((p, i) => (
            <p key={i}>{decodeHtml(p)}</p>
          ))}
        </div>
      </section>
      {SECTIONS.map((s, idx) => (
        <section key={s.id} id={s.id} className={`section ${idx % 2 === 0 ? 'section--white' : 'section--cream'}`}>
          <div className="container two-col">
            <img
              src={optimizedUrl(s.img, 'content')}
              alt={s.title}
              style={{ borderRadius: 4 }}
              loading="lazy"
              decoding="async"
            />
            <div>
              <h2>{s.title}</h2>
              {content.paragraphs.slice(idx * 4 + 3, idx * 4 + 7).map((p, i) => (
                <p key={i}>{decodeHtml(p)}</p>
              ))}
            </div>
          </div>
        </section>
      ))}
      <section className="section section--white">
        <div className="container">
          <h2>Facilities include:</h2>
          <p>Pizza oven, communal kitchen, showers, rope swing, climbing wall, fruit trees, vegetable garden and much, much more.</p>
        </div>
      </section>
      <FaqBlock title="Frequently asked homestead questions" faqs={HOMESTEAD_FAQS} />
      <FaqBlock title="Frequently asked camping questions" faqs={CAMPING_FAQS} />
      <FaqBlock title="Frequently asked BYO horse questions" faqs={BYO_HORSE_FAQS} />
    </>
  );
}
