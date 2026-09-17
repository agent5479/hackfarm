import scraped from '../content/scraped-content.json';
import { decodeHtml } from '../lib/constants';
import PageHero from '../components/PageHero';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';

const content = scraped.pages.privacy;

export default function PrivacyPage() {
  usePageMeta(getPageSeo('/privacy-policy/')!);

  return (
    <>
      <PageHero
        title="Privacy Policy"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Privacy Policy', path: '/privacy-policy/' },
        ]}
      />
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
