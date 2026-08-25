import scraped from '../content/scraped-content.json';
import { decodeHtml, BOOKING } from '../lib/constants';
import PageHero from '../components/PageHero';
import { JsonLd, faqPageJsonLd, howToJsonLd } from '../components/JsonLd';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';
import { GIFT_FAQS } from '../content/faqs';

const content = scraped.pages.gifts;
const PATH = '/horse-riding-holiday-gift-vouchers/';

export default function GiftsPage() {
  usePageMeta(getPageSeo(PATH)!);

  return (
    <>
      <JsonLd
        data={[
          faqPageJsonLd(GIFT_FAQS),
          howToJsonLd(
            'How to purchase and redeem a Hack n Stay gift voucher',
            'Buy a gift card online, then redeem it when booking any ride, stay, or lesson.',
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
      <PageHero title="Gift Vouchers Available" subtitle="Give them the gift of a memorable experience" />
      <section className="section section--cream">
        <div className="container">
          {content.paragraphs.slice(0, 6).map((p, i) => (
            <p key={i}>{decodeHtml(p)}</p>
          ))}
        </div>
      </section>
      <section className="section section--white">
        <div className="container two-col">
          <div>
            <h2>Step 1 — How To Purchase</h2>
            <p>Follow the link below to purchase a gift card for any amount.</p>
            <a href={BOOKING.gift} className="btn btn--green" target="_blank" rel="noopener noreferrer">Purchase Gift Card</a>
          </div>
          <div>
            <h2>Step 2 — Redeeming Your Voucher</h2>
            <p>Click "book now" on any ride/room/lesson, fill out your details, then click "Apply Gift Card" and enter your voucher number.</p>
          </div>
        </div>
      </section>
      <section className="section section--cream">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          {GIFT_FAQS.map((faq) => (
            <div key={faq.question} style={{ marginBottom: '1.25rem' }}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
