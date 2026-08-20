import scraped from '../content/scraped-content.json';
import { decodeHtml, BOOKING } from '../lib/constants';
import PageHero from '../components/PageHero';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';

const content = scraped.pages.gifts;

export default function GiftsPage() {
  usePageMeta(getPageSeo('/horse-riding-holiday-gift-vouchers/')!);

  return (
    <>
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
          <h3>Do I need to Book a Specific Date?</h3>
          <p>No — the gift voucher is credit toward a future ride. It is redeemed when you complete a booking.</p>
          <h3>What can I use the gift voucher for?</h3>
          <p>Any riding, learning or accommodation option on the website.</p>
          <h3>Can I exchange my voucher for cash?</h3>
          <p>Gift cards are non-refundable and cannot be exchanged for cash.</p>
        </div>
      </section>
    </>
  );
}
