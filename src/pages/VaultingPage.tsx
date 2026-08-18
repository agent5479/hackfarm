import scraped from '../content/scraped-content.json';
import { decodeHtml, withBase } from '../lib/constants';
import PageHero from '../components/PageHero';
import { usePageTitle } from '../hooks/usePageTitle';

const content = scraped.pages.vaulting;

export default function VaultingPage() {
  usePageTitle('Vaulting');

  return (
    <>
      <PageHero
        title="Vaulting"
        subtitle="Fun and engaging vaulting sessions for all ages"
        background="/images/uploads/2021/02/Vaulting-Poster.jpg"
      />
      <section className="section section--cream">
        <div className="container">
          {content.paragraphs.slice(0, 8).map((p, i) => (
            <p key={i}>{decodeHtml(p)}</p>
          ))}
        </div>
      </section>
      <section className="section section--white">
        <div className="container">
          <h2>Hack Vaulties</h2>
          <div className="card-grid">
            {Array.from({ length: 12 }, (_, i) => {
              const num = String(i + 1).padStart(2, '0');
              return (
                <img
                  key={num}
                  src={withBase(`/images/uploads/2022/06/Hack-Vaulties${num}.jpg`)}
                  alt={`Hack Vaulties ${num}`}
                  style={{ borderRadius: 4, width: '100%', height: 200, objectFit: 'cover' }}
                />
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
