import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import scraped from '../content/scraped-content.json';
import { decodeHtml } from '../lib/constants';
import PageHero from '../components/PageHero';
import ContactForm from '../components/ContactForm';
import BookingIntercept from '../components/BookingIntercept/BookingIntercept';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';
import { JsonLd, serviceJsonLd } from '../components/JsonLd';

const content = scraped.pages.rides;

function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, '');
  if (!id) return;
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const RIDE_SECTIONS = [
  { id: 'short-rides', title: 'Short Rides', rides: ['The Hack Track / Fairy Trail Loop', "Paton's Rock Beach Ride", 'Sunset Ride', 'Swimming with Horses'] },
  { id: 'full-day', title: 'Full Day Rides', rides: ["The Rangi Ride", 'Mussel Inn - Ale Trail', 'Collingwood Explorer'] },
  { id: 'multi-day', title: 'Multi-Day Experiences', rides: ['Flexible packages with accommodation included'] },
  { id: 'vaulting', title: 'Vaulting & Ride & Fly', rides: ['Ride & Fly', 'Arena Lesson', 'Vaulting Arena Session'] },
];

export default function RidesPage() {
  const seo = getPageSeo('/holistic-horse-rides/')!;
  usePageMeta(seo);
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    requestAnimationFrame(() => scrollToHash(hash));
  }, [hash]);

  return (
    <>
      <JsonLd
        data={serviceJsonLd(
          'Holistic Horse Rides',
          seo.description,
          '/holistic-horse-rides/',
        )}
      />
      <PageHero
        title="Holistic Horseback Experiences"
        subtitle="Learn while you ride on stunning coastal trails"
        background="/images/uploads/2021/02/20210104_145330-1.jpg"
      />
      <section className="section section--cream">
        <div className="container">
          {content.paragraphs.slice(0, 5).map((p, i) => (
            <p key={i}>{decodeHtml(p)}</p>
          ))}
        </div>
      </section>

      <section id="book-rides" className="section section--white">
        <div className="container">
          <h2>Book your ride</h2>
          <p>Choose a ride type below, then pick a date that suits.</p>
          <BookingIntercept />
        </div>
      </section>

      {RIDE_SECTIONS.map((section, sIdx) => (
        <section key={section.id} id={section.id} className={`section ${sIdx % 2 === 0 ? 'section--cream' : 'section--white'}`}>
          <div className="container">
            <h2>{section.title}</h2>
            <ul>
              {section.rides.map((ride) => (
                <li key={ride}>
                  <strong>{ride}</strong>
                  {' — '}
                  {decodeHtml(content.paragraphs[sIdx * 3 + 5] || 'Contact us for details and availability.')}
                </li>
              ))}
            </ul>
            <p>
              <a href="#book-rides">See booking options above</a>
            </p>
          </div>
        </section>
      ))}

      <section className="section section--white">
        <div className="container">
          <h2>Booking Request Form</h2>
          <p>
            Use the sunrise &amp; twilight calendar above for tide-aware Wed/Fri/Sun slots, or book online.
            All beach rides depend on tide and weather — we will confirm the perfect time for your experience.
          </p>
          <ContactForm type="ride-request" />
        </div>
      </section>
    </>
  );
}
