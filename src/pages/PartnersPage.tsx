import scraped from '../content/scraped-content.json';
import { decodeHtml } from '../lib/constants';
import PageHero from '../components/PageHero';
import ContactForm from '../components/ContactForm';
import { usePageTitle } from '../hooks/usePageTitle';

const content = scraped.pages.partners;

export default function PartnersPage() {
  usePageTitle('Partners');

  return (
    <>
      <PageHero title="Partner With Us" subtitle="Earn 10% commission on referrals" />
      <section className="section section--cream">
        <div className="container">
          {content.paragraphs.slice(0, 5).map((p, i) => (
            <p key={i}>{decodeHtml(p)}</p>
          ))}
        </div>
      </section>
      <section className="section section--white">
        <div className="container two-col">
          <img src="/images/uploads/2021/07/Bijmin_Affiliate_Booking-2.png" alt="Partner booking" />
          <div>
            <h2>Booking Methods</h2>
            <p>Once approved, you'll receive a unique partner link. Any bookings made using your link earn 10% commission.</p>
            <h3>QR Poster</h3>
            <p>Display a poster with your unique QR code to earn 10% automatically.</p>
            <img src="/images/uploads/2021/09/qrcode_2572792_-1.png" alt="Partner QR code example" style={{ maxWidth: 200, marginTop: '1rem' }} />
          </div>
        </div>
      </section>
      <section className="section section--cream">
        <div className="container">
          <h2>Partner Registration</h2>
          <p>Fill out the form and we'll get back to you once your account is set up.</p>
          <ContactForm type="partner" />
        </div>
      </section>
    </>
  );
}
