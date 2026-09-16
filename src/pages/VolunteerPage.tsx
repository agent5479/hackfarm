import PageHero from '../components/PageHero';
import ContactForm from '../components/ContactForm';
import { usePageMeta } from '../hooks/usePageTitle';

export default function VolunteerPage() {
  usePageMeta({
    title: 'Volunteer Request',
    description: 'Volunteer enquiry form for Hack n Stay Golden Bay.',
    path: '/volunteer/',
    robots: 'noindex, nofollow',
  });

  return (
    <>
      <PageHero title="Volunteer Request" />
      <section className="section section--white">
        <div className="container" style={{ maxWidth: 560 }}>
          <p>Tell us a bit about yourself and we'll get back to you 🙂</p>
          <ContactForm type="volunteer" />
        </div>
      </section>
    </>
  );
}
