import scraped from '../content/scraped-content.json';
import { decodeHtml, withBase } from '../lib/constants';
import PageHero from '../components/PageHero';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';

const home = scraped.pages.home;
const vaulting = scraped.pages.vaulting;
const seo = getPageSeo('/about/')!;

export default function AboutPage() {
  usePageMeta(seo);

  return (
    <>
      <PageHero
        title="About Hack n Stay"
        subtitle="Eco farmstay, holistic horse experiences, and community vaulting in Golden Bay"
        background="/images/uploads/2021/03/20190801_Hackfarm_Panorama-rainbow.jpg"
      />
      <section className="section section--cream">
        <div className="container">
          <h2>Hack Farm &amp; Hack n Stay Golden Bay</h2>
          <p>
            {decodeHtml(
              home.paragraphs[0] ||
                "Located in beautiful Golden Bay, Hack Farm is an eco farmstay and animal-friendly campground just a short walk or ride from Paton's Rock beach.",
            )}
          </p>
          <p>
            {decodeHtml(
              home.paragraphs[5] ||
                'We offer riders of all experience levels opportunities to learn more about the foundations of good horsemanship whilst experiencing stunning coastal scenery on horseback.',
            )}
          </p>
        </div>
      </section>
      <section className="section section--white">
        <div className="container two-col">
          <div>
            <h2>Baerbel Hack</h2>
            <p>
              {decodeHtml(
                home.paragraphs[9] ||
                  vaulting.paragraphs[0] ||
                  'Baerbel is passionate about sharing the magic of connected riding and vaulting with guests of all ages.',
              )}
            </p>
            <p>
              {decodeHtml(
                vaulting.paragraphs.find((p) => p.includes('Hack Vaulties')) ||
                  "The Hack Vaulties club first came together in 2015 under the guidance of Baerbel Hack with the aim of making horse riding accessible to riders from all walks of life.",
              )}
            </p>
          </div>
          <div>
            <img
              src={withBase('/images/uploads/2021/02/IMG_20190120_122312-scaled.jpg')}
              alt="Vaulting at Hack Farm"
              style={{ borderRadius: 4, width: '100%', height: 'auto', objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>
      <section className="section section--cream">
        <div className="container">
          <h2>What we offer</h2>
          <p>
            Guided beach and trail rides, farmstay and camping, bring-your-own-horse holidays, riding and horsemanship
            lessons, kids camps, and vaulting — all based at our property near Paton&apos;s Rock in Golden Bay,
            New Zealand.
          </p>
        </div>
      </section>
    </>
  );
}
