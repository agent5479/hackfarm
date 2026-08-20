import scraped from '../content/scraped-content.json';
import { decodeHtml } from '../lib/constants';
import { optimizedUrl } from '../lib/images';
import PageHero from '../components/PageHero';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';

const content = scraped.pages.events;

export default function EventsPage() {
  usePageMeta(getPageSeo('/special-events/')!);

  return (
    <>
      <PageHero title="Special Events & Kids Camps" subtitle="Fun camps and riding days" />
      <section className="section section--cream">
        <div className="container">
          {content.paragraphs.slice(0, 10).map((p, i) => (
            <p key={i}>{decodeHtml(p)}</p>
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
            <h2>Vaulting Sessions</h2>
            {content.paragraphs.slice(10, 15).map((p, i) => (
              <p key={i}>{decodeHtml(p)}</p>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
