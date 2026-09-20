import { BOOKING } from '../lib/constants';
import PageHero from '../components/PageHero';
import { JsonLd, faqPageJsonLd, howToJsonLd } from '../components/JsonLd';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';
import { isSeoPrerender } from '../seo/prerender';
import { GIFT_FAQS } from '../content/faqs';
import EditableText from '../cms/EditableText';
import { useCms } from '../cms/ContentProvider';

const PATH = '/horse-riding-holiday-gift-vouchers/';

type GiftsDoc = {
  intro: string[];
  steps: { title: string; body: string }[];
  faqs: { question: string; answer: string }[];
};

export default function GiftsPage() {
  const seo = getPageSeo(PATH)!;
  usePageMeta(seo);
  const { getDoc } = useCms();
  const content = getDoc<GiftsDoc>('gifts');
  const crawler = isSeoPrerender() && seo.h1;

  return (
    <>
      <JsonLd
        data={[
          faqPageJsonLd(GIFT_FAQS),
          howToJsonLd(
            'How to purchase and redeem a Hack n Stay gift voucher',
            'Buy a gift card online, then redeem it when booking any ride, stay, or lesson at Hack n Stay in Golden Bay, New Zealand.',
            [
              {
                name: 'Purchase a gift card',
                text: 'Follow the purchase link and buy a gift card for any amount.',
              },
              {
                name: 'Redeem when booking',
                text: 'Click Book Now on any ride, room, or lesson, fill out your details, then click Apply Gift Card and enter your voucher number.',
              },
            ],
            PATH,
          ),
        ]}
      />
      <PageHero
        title={
          crawler ? seo.h1! : <EditableText doc="gifts" as="span" path="hero.title" />
        }
        subtitle={
          crawler && seo.intro
            ? seo.intro
            : <EditableText doc="gifts" as="span" path="hero.subtitle" />
        }
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Horse Riding Gift Vouchers', path: PATH },
        ]}
      />
      <section className="section section--cream">
        <div className="container">
          {content.intro.map((_, i) => (
            <EditableText key={i} doc="gifts" as="p" path={`intro.${i}`} />
          ))}
        </div>
      </section>
      <section className="section section--white">
        <div className="container two-col">
          <div>
            <EditableText doc="gifts" as="h2" path="steps.0.title" />
            <EditableText doc="gifts" as="p" path="steps.0.body" />
            <a href={BOOKING.gift} className="btn btn--green" target="_blank" rel="noopener noreferrer">Purchase Gift Card</a>
          </div>
          <div>
            <EditableText doc="gifts" as="h2" path="steps.1.title" />
            <EditableText doc="gifts" as="p" path="steps.1.body" />
          </div>
        </div>
      </section>
      <section className="section section--cream">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          {content.faqs.map((_, i) => (
            <div key={i} style={{ marginBottom: '1.25rem' }}>
              <EditableText doc="gifts" as="h3" path={`faqs.${i}.question`} />
              <EditableText doc="gifts" as="p" path={`faqs.${i}.answer`} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
