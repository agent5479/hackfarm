import scraped from '../content/scraped-content.json';
import { decodeHtml } from '../lib/constants';
import { optimizedUrl } from '../lib/images';
import PageHero from '../components/PageHero';
import { JsonLd, serviceJsonLd } from '../components/JsonLd';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';

const content = scraped.pages.accommodation;

const SECTIONS = [
  { id: 'homestead', title: 'Farmstay', img: '/images/uploads/2021/02/House-from-afar.jpg' },
  { id: 'camp-ground', title: 'Camping in Golden Bay', img: '/images/uploads/2021/02/hackfarm-Campsite.jpg' },
  { id: 'horse-stay', title: 'Horse Stay', img: '/images/uploads/2021/04/Horse-Stay-smaller.jpg' },
];

export default function AccommodationPage() {
  const seo = getPageSeo('/accommodation/')!;
  usePageMeta(seo);

  return (
    <>
      <JsonLd data={serviceJsonLd('Accommodation', seo.description, '/accommodation/')} />
      <PageHero title={decodeHtml(content.h1s[0] || 'Accommodation')} subtitle={content.ogDesc} />
      <section className="section section--cream">
        <div className="container">
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
          <p>Pizza Oven, Communal Kitchen, Showers, Rope Swing, Climbing Wall, Fruit Trees, Vegetable Garden and much much more.</p>
        </div>
      </section>
    </>
  );
}
