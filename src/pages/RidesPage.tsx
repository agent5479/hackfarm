import scraped from '../content/scraped-content.json';
import { decodeHtml, withBase } from '../lib/constants';
import { openRideBooking } from '../lib/booking-events';
import PageHero from '../components/PageHero';
import ContactForm from '../components/ContactForm';
import SunriseRideCalendar from '../components/SunriseRideCalendar/SunriseRideCalendar';
import { usePageTitle } from '../hooks/usePageTitle';

const content = scraped.pages.rides;

const RIDE_SECTIONS = [
  { id: 'short-rides', title: 'Short Rides', rides: ['The Hack Track / Fairy Trail Loop', "Paton's Rock Beach Ride", 'Sunset Ride', 'Swimming with Horses'] },
  { id: 'full-day', title: 'Full Day Rides', rides: ["The Rangi Ride", 'Mussel Inn - Ale Trail', 'Collingwood Explorer'] },
  { id: 'multi-day', title: 'Multi-Day Experiences', rides: ['Flexible packages with accommodation included'] },
  { id: 'vaulting', title: 'Vaulting & Ride & Fly', rides: ['Ride & Fly', 'Arena Lesson', 'Vaulting Arena Session'] },
];

const RIDE_IMAGES: Record<string, string> = {
  'The Hack Track': '/images/uploads/2021/07/Hack-Track-Trail-Ride.jpg',
  "Paton's Rock Beach Ride": '/images/uploads/2021/07/Patons-Rock-Beach-Ride-Poster.jpg',
  'Sunset Ride': '/images/uploads/2021/07/Sunrise-Ride-Poster.jpg',
  'Swimming with Horses': '/images/uploads/2021/07/Swimming-with-Horses-Poster.jpg',
  'The Rangi Ride': '/images/uploads/2021/02/Rangi.jpg',
  'Ale Trail': '/images/uploads/2021/07/Mussel-Inn-Ale-Trail.jpg',
};

export default function RidesPage() {
  usePageTitle('Holistic Horseback Experiences');

  return (
    <>
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

      <section id="sunrise-rides" className="section section--white">
        <div className="container">
          <h2>Sunrise Beach Rides at Paton&apos;s Rock</h2>
          <p>
            Our signature east-coast experience — golden hour on the beach before the day begins.
            Sunrise rides run <strong>Wednesday, Friday & Sunday</strong>, starting one hour before sunrise,
            when the tide allows safe access (at least 3 hours before high tide or 2 hours after).
          </p>
          <p className="sunrise-cal__owner-note">
            This calendar is the shared schedule for guests and the farm — sunrise, tide state, and rideability at a glance.
          </p>
          <SunriseRideCalendar mode="browse" />
          <p style={{ marginTop: '1.25rem' }}>
            <button type="button" className="btn btn--green" onClick={openRideBooking}>
              Book a sunrise ride
            </button>
          </p>
        </div>
      </section>

      {RIDE_SECTIONS.map((section, sIdx) => (
        <section key={section.id} id={section.id} className={`section ${sIdx % 2 === 0 ? 'section--cream' : 'section--white'}`}>
          <div className="container">
            <h2>{section.title}</h2>
            <div className="card-grid">
              {section.rides.map((ride) => (
                <div key={ride} className="card">
                  <img
                    className="card__image"
                    src={withBase(Object.entries(RIDE_IMAGES).find(([k]) => ride.includes(k))?.[1] || '/images/uploads/2021/02/Hack-Track-Poster-copy.jpg')}
                    alt={ride}
                  />
                  <div className="card__body">
                    <h3>{ride}</h3>
                    <p>{decodeHtml(content.paragraphs[sIdx * 3 + 5] || 'Contact us for details and availability.')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="section section--white">
        <div className="container">
          <h2>Booking Request Form</h2>
          <p>
            Use the sunrise calendar above for tide-aware Wed/Fri/Sun slots, or book online.
            All beach rides depend on tide and weather — we will confirm the perfect time for your experience.
          </p>
          <ContactForm type="ride-request" />
        </div>
      </section>
    </>
  );
}
