import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageHero from '../components/PageHero';
import ContactForm from '../components/ContactForm';
import BookingIntercept from '../components/BookingIntercept/BookingIntercept';
import EditableText from '../cms/EditableText';
import { useCms } from '../cms/ContentProvider';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';
import { JsonLd, serviceJsonLd, softwareApplicationJsonLd } from '../components/JsonLd';
import './RidesPage.css';

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
  const { rides, isEditor } = useCms();
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    if (rides.categories.some((c) => c.id === id)) {
      setOpenCategory(id);
    }
    requestAnimationFrame(() => scrollToHash(hash));
  }, [hash, rides.categories]);

  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd(
            'Holistic Horse Rides',
            seo.description,
            '/holistic-horse-rides/',
          ),
          softwareApplicationJsonLd({
            name: 'Patons Rock Sunrise & Tide Ride Planner',
            description:
              'First-party booking planner for Hack n Stay sunrise beach rides at Patons Rock. Shows sunrise timing and tide clearance for Wed, Fri and Sun rides before continuing to live FareHarbor booking.',
            path: '/holistic-horse-rides/',
            applicationCategory: 'TravelApplication',
          }),
        ]}
      />
      <PageHero
        title="Holistic Horseback Experiences"
        subtitle="Beach horseback rides and horse trekking on coastal Golden Bay trails near Abel Tasman and Nelson"
        background="/images/uploads/2021/02/20210104_145330-1.jpg"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Holistic Horseback Experiences', path: '/holistic-horse-rides/' },
        ]}
      />

      <section className="section section--cream">
        <div className="container">
          {rides.intro.map((_, i) => (
            <EditableText key={i} doc="rides" as="p" path={`intro.${i}`} />
          ))}
        </div>
      </section>

      <section className="section section--white">
        <div className="container">
          <EditableText doc="rides" as="h2" path="planner.title" />
          {rides.planner.body.map((_, i) => (
            <EditableText key={i} doc="rides" as="p" path={`planner.body.${i}`} />
          ))}
        </div>
      </section>

      <section className="section section--white">
        <div className="container">
          <EditableText doc="rides" as="h2" path="chooseTitle" />
          <EditableText doc="rides" as="p" path="categoriesLead" className="rides-categories__lead" />
          <div className="rides-categories">
            {rides.categories.map((category, catIdx) => {
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
                    <EditableText
                      doc="rides"
                      as="span"
                      path={`categories.${catIdx}.title`}
                      className="rides-categories__title"
                    />
                    <span className="rides-categories__count">
                      {category.rides.length} {category.rides.length === 1 ? 'option' : 'options'}
                    </span>
                  </summary>
                  <ul className="rides-categories__list">
                    {category.rides.map((ride, rideIdx) => (
                      <li key={`${category.id}-${rideIdx}`} className="rides-categories__ride">
                        <p className="rides-categories__ride-copy">
                          <a
                            className="rides-categories__ride-name"
                            href={ride.bookingHref}
                            onClick={(e) => {
                              if (isEditor && (e.target as HTMLElement).closest?.('.cms-editable')) {
                                e.preventDefault();
                              }
                            }}
                          >
                            <EditableText
                              doc="rides"
                              as="span"
                              path={`categories.${catIdx}.rides.${rideIdx}.title`}
                            />
                          </a>
                          <span className="rides-categories__sep"> — </span>
                          <EditableText
                            doc="rides"
                            as="span"
                            path={`categories.${catIdx}.rides.${rideIdx}.description`}
                          />
                        </p>
                        <a
                          className="rides-categories__book"
                          href={ride.bookingHref}
                          onClick={(e) => {
                            if (isEditor && (e.target as HTMLElement).closest?.('.cms-editable')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <EditableText
                            doc="rides"
                            as="span"
                            path={`categories.${catIdx}.rides.${rideIdx}.bookingLabel`}
                          />
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
          <BookingIntercept />
        </div>
      </section>

      <section id="ride-request" className="section section--white">
        <div className="container">
          <EditableText doc="rides" as="p" path="request.eyebrow" className="ride-request__eyebrow" />
          <EditableText doc="rides" as="h2" path="request.title" />
          <EditableText doc="rides" as="p" path="request.body" />
          <ContactForm type="ride-request" />
        </div>
      </section>
    </>
  );
}
