import scraped from '../content/scraped-content.json';
import { decodeHtml, withBase } from '../lib/constants';
import PageHero from '../components/PageHero';
import { usePageTitle } from '../hooks/usePageTitle';

const content = scraped.pages.events;

export default function EventsPage() {
  usePageTitle('Special Events');

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
          <img src={withBase('/images/uploads/2021/03/VaultingHorseClubDay.jpg')} alt="Kids camp" style={{ borderRadius: 4 }} />
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
