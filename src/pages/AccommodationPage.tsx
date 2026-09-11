import { Link } from 'react-router-dom';
import scraped from '../content/scraped-content.json';
import { decodeHtml, houseBookingUrl } from '../lib/constants';
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
const p = content.paragraphs;

/** Curated from scrape order (archive commit language), with owner trims applied. */
const SECTIONS: {
  id: string;
  title: string;
  img: string;
  paragraphs: string[];
  footer?: 'gbhh';
}[] = [
  {
    id: 'homestead',
    title: 'Farmstay',
    img: '/images/uploads/2021/02/House-from-afar.jpg',
    paragraphs: [
      p[4], // Comfortable Rooms in a historic farmhouse
      p[5], // funky horse-inspired homestead…
      p[6], // Check in…
      // omit long-term promo p[7]
      p[8].replace(/\s*Minimum stay two nights\./i, ''), // Green Foal without min stay
      p[9], // bunkroom
      p[10], // Blue / 3x single-share
    ],
    footer: 'gbhh',
  },
  {
    id: 'camp-ground',
    title: 'Camping in Golden Bay',
    img: '/images/uploads/2021/02/hackfarm-Campsite.jpg',
    paragraphs: [
      p[26], // Sleep under the stars…
      p[27], // Dog Friendly campground…
      p[28], // Check in…
      // omit long-term promo p[29]
      p[30], // Drive in…
      p[31], // Tent…
      p[32], // Powered site note
    ],
  },
  {
    id: 'horse-stay',
    title: 'Horse Stay',
    img: '/images/uploads/2021/03/VaultingHorseClubDay.jpg',
    paragraphs: [
      p[47], // Bring your own horse…
      p[48], // vision / paddocks / Patons Rock
      p[49], // Holding Yard…
      p[50], // Ride with guides…
    ],
  },
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
            {faq.link ? (
              <p>
                <Link to={faq.link.to}>{faq.link.label}</Link>
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
            near Patons Rock beach in Golden Bay.
          </p>
          {content.paragraphs.slice(0, 3).map((para, i) => (
            <p key={i}>{decodeHtml(para)}</p>
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
              {s.paragraphs.map((para, i) => (
                <p key={i}>{decodeHtml(para)}</p>
              ))}
              {s.footer === 'gbhh' ? (
                <p>
                  Book the whole house through Golden Bay Holiday Homes (
                  <a href={houseBookingUrl()} target="_blank" rel="noopener noreferrer">
                    check availability
                  </a>
                  ). Book a single room with the Book your Stay button (FareHarbor).
                </p>
              ) : null}
            </div>
          </div>
        </section>
      ))}
      <section className="section section--white">
        <div className="container">
          <h2>Facilities include:</h2>
          <p>
            Communal kitchen, showers, rope swing, lake, climbing wall, trails to the beach, fruit trees,
            vegetable garden and much, much more.
          </p>
        </div>
      </section>
      <FaqBlock title="Frequently asked homestead questions" faqs={HOMESTEAD_FAQS} />
      <FaqBlock title="Frequently asked camping questions" faqs={CAMPING_FAQS} />
      <FaqBlock title="Frequently asked BYO horse questions" faqs={BYO_HORSE_FAQS} />
    </>
  );
}
