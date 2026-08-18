import scraped from '../content/scraped-content.json';
import { decodeHtml } from '../lib/constants';
import PageHero from '../components/PageHero';
import { usePageTitle } from '../hooks/usePageTitle';

const content = scraped.pages.privacy;

export default function PrivacyPage() {
  usePageTitle('Privacy Policy');

  return (
    <>
      <PageHero title="Privacy Policy" />
      <section className="section section--cream">
        <div className="container">
          {content.paragraphs.map((p, i) => (
            <p key={i}>{decodeHtml(p)}</p>
          ))}
        </div>
      </section>
    </>
  );
}
