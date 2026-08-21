import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import scraped from '../content/scraped-content.json';
import { decodeHtml } from '../lib/constants';
import PageHero from '../components/PageHero';
import ContactForm from '../components/ContactForm';
import BookingIntercept from '../components/BookingIntercept/BookingIntercept';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';
import { JsonLd, serviceJsonLd } from '../components/JsonLd';
import './RidesPage.css';

const content = scraped.pages.rides;

type RideCategoryItem = {
  title: string;
  description: string;
  bookingHref: string;
  bookingLabel: string;
};

type RideCategory = {
  id: string;
  title: string;
  rides: RideCategoryItem[];
};

const RIDE_CATEGORIES: RideCategory[] = [
  {
    id: 'short-rides',
    title: 'Short Rides',
    rides: [
      {
        title: 'The Hack Track / Fairy Trail Loop',
        description:
          'The perfect introduction to balanced riding for riders of all ages — a 1 hour ride through rolling farm country, native forest, and ocean views. On-farm and bushland only.',
        bookingHref: '#hack-track',
        bookingLabel: 'Book Hack Track',
      },
      {
        title: "Paton's Rock Beach Ride",
        description:
          'Our most popular ride for all abilities. Follow the Hack Track down to the beach and explore Golden Bay\'s coastal vistas.',
        bookingHref: '#patons-rock',
        bookingLabel: "Book Paton's Rock",
      },
      {
        title: 'Sunset / Twilight Ride',
        description:
          'Ride through native forest and farm country to the beach as the sun paints the sky. Glow-worms possible on the way back when conditions allow. Wed, Fri & Sun — tide-checked.',
        bookingHref: '#twilight-rides',
        bookingLabel: 'Check twilight dates',
      },
      {
        title: 'Swimming with Horses',
        description:
          'Ride to Paton\'s Rock Beach, untack, and splash in crystal-clear water with your horse. Magical and weather dependent.',
        bookingHref: '#swimming',
        bookingLabel: 'Book swimming ride',
      },
    ],
  },
  {
    id: 'full-day',
    title: 'Full Day Rides',
    rides: [
      {
        title: 'The Rangi Ride',
        description:
          'Beach, headland, estuary and reserve — up to about 4.5 hours through changing landscape, birdlife and great beaches. Intermediate to experienced riders.',
        bookingHref: '#rangi',
        bookingLabel: 'Book Rangi Ride',
      },
      {
        title: 'Mussel Inn – Ale Trail',
        description:
          'Beach and headland ride with river crossings to the Mussel Inn hitching rail — a drink and snack on us, then ride home before the next high tide. Tide and weather dependent.',
        bookingHref: '#ride-request',
        bookingLabel: 'Request Ale Trail',
      },
      {
        title: 'Collingwood Explorer',
        description:
          'Beach ride to Collingwood village past rock formations and art displays, with time for a café stop before returning. Experienced riders only — tide and weather dependent.',
        bookingHref: '#ride-request',
        bookingLabel: 'Request Collingwood',
      },
    ],
  },
  {
    id: 'multi-day',
    title: 'Multi-Day Experiences',
    rides: [
      {
        title: 'Flexible packages with accommodation',
        description:
          'Design your own horse holiday — vaulting, riding or horsemanship with homestead accommodation included. Each night includes a full day of horseback activities tailored to your group.',
        bookingHref: '#ride-request',
        bookingLabel: 'Request multi-day package',
      },
    ],
  },
  {
    id: 'vaulting',
    title: 'Vaulting & Ride & Fly',
    rides: [
      {
        title: 'Ride & Fly',
        description:
          'Combine trail riding with the thrill of vaulting movements — find balance, confidence and connection with the horse in a unique way.',
        bookingHref: '#ride-request',
        bookingLabel: 'Request Ride & Fly',
      },
      {
        title: 'Arena Lesson',
        description:
          'On-farm arena time focused on light, balanced riding and horsemanship foundations for all experience levels.',
        bookingHref: '#ride-request',
        bookingLabel: 'Request arena lesson',
      },
      {
        title: 'Vaulting Arena Session',
        description:
          'Vaulting lessons and experiences for all ages — dancing and gymnastics on horseback, often described as the safest equestrian discipline.',
        bookingHref: '#ride-request',
        bookingLabel: 'Request vaulting session',
      },
    ],
  },
];

function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, '');
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  if (el instanceof HTMLDetailsElement) {
    el.open = true;
  }
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function RidesPage() {
  const seo = getPageSeo('/holistic-horse-rides/')!;
  usePageMeta(seo);
  const { hash } = useLocation();
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    if (RIDE_CATEGORIES.some((c) => c.id === id)) {
      setOpenCategory(id);
    }
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
          {content.paragraphs.slice(1, 5).map((p, i) => (
            <p key={i}>{decodeHtml(p)}</p>
          ))}
        </div>
      </section>

      <section className="section section--white">
        <div className="container">
          <h2>Choose your experience</h2>
          <p className="rides-categories__lead">
            Open a category to see the rides, then jump straight to booking.
          </p>
          <div className="rides-categories">
            {RIDE_CATEGORIES.map((category) => {
              const isOpen = openCategory === category.id;
              return (
                <details
                  key={category.id}
                  id={category.id}
                  className="rides-categories__item"
                  open={isOpen}
                  onToggle={(e) => {
                    const details = e.currentTarget;
                    if (details.open) {
                      setOpenCategory(category.id);
                    } else if (openCategory === category.id) {
                      setOpenCategory(null);
                    }
                  }}
                >
                  <summary className="rides-categories__summary">
                    <span className="rides-categories__title">{category.title}</span>
                    <span className="rides-categories__count">
                      {category.rides.length} {category.rides.length === 1 ? 'option' : 'options'}
                    </span>
                  </summary>
                  <ul className="rides-categories__list">
                    {category.rides.map((ride) => (
                      <li key={ride.title} className="rides-categories__ride">
                        <p className="rides-categories__ride-copy">
                          <a className="rides-categories__ride-name" href={ride.bookingHref}>
                            {ride.title}
                          </a>
                          <span className="rides-categories__sep"> — </span>
                          <span>{ride.description}</span>
                        </p>
                        <a className="rides-categories__book" href={ride.bookingHref}>
                          {ride.bookingLabel}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              );
            })}
          </div>
        </div>
      </section>

      <section id="book-rides" className="section section--cream">
        <div className="container">
          <h2>Book your ride</h2>
          <p>Use the tide calendar for sunrise &amp; twilight, or select a date for our other FareHarbor rides.</p>
          <BookingIntercept />
        </div>
      </section>

      <section id="ride-request" className="section section--white">
        <div className="container">
          <h2>Booking Request Form</h2>
          <p>
            Prefer a full-day, multi-day, vaulting or custom experience? Send a request and we will confirm
            times around tide and weather.
          </p>
          <ContactForm type="ride-request" />
        </div>
      </section>
    </>
  );
}
