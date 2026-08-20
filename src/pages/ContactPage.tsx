import scraped from '../content/scraped-content.json';
import { decodeHtml, CONTACT } from '../lib/constants';
import PageHero from '../components/PageHero';
import ContactForm from '../components/ContactForm';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';

const content = scraped.pages.contact;

export default function ContactPage() {
  usePageMeta(getPageSeo('/contact/')!);

  return (
    <>
      <PageHero title="Contact Us" />
      <section className="section section--cream">
        <div className="container">
          <ul style={{ listStyle: 'none', marginBottom: '2rem' }}>
            <li><a href={CONTACT.phoneHref}>{CONTACT.phone}</a></li>
            <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
            <li>{CONTACT.address}</li>
          </ul>
        </div>
      </section>
      <section className="section section--white">
        <div className="container two-col">
          <div>
            <h2>Have a question? Say hello!</h2>
            <p>{decodeHtml(content.paragraphs[0] || 'We look forward to hearing from you.')}</p>
            <ContactForm type="contact" />
          </div>
          <div>
            <h2>Volunteer Request</h2>
            <p>Tell us a bit about yourself and we'll get back to you 🙂</p>
            <ContactForm type="volunteer" />
          </div>
        </div>
      </section>
    </>
  );
}
