import PageHero from '../components/PageHero';
import ContactForm from '../components/ContactForm';
import { usePageMeta } from '../hooks/usePageTitle';
import EditableText from '../cms/EditableText';

export default function VolunteerPage() {
  usePageMeta({
    title: 'Volunteer Request',
    description: 'Volunteer enquiry form for Hack n Stay Golden Bay.',
    path: '/volunteer/',
    robots: 'noindex, nofollow',
  });

  return (
    <>
      <PageHero title={<EditableText doc="volunteer" as="span" path="hero.title" />} />
      <section className="section section--white">
        <div className="container" style={{ maxWidth: 560 }}>
          <EditableText doc="volunteer" as="p" path="body" />
          <ContactForm type="volunteer" />
        </div>
      </section>
    </>
  );
}
