import { CONTACT } from '../lib/constants';
import PageHero from '../components/PageHero';
import ContactForm from '../components/ContactForm';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';
import { isSeoPrerender } from '../seo/prerender';
import EditableText from '../cms/EditableText';

export default function ContactPage() {
  const seo = getPageSeo('/contact/')!;
  usePageMeta(seo);
  const crawler = isSeoPrerender() && seo.h1;

  return (
    <>
      <PageHero
        title={
          crawler ? seo.h1! : <EditableText doc="contact" as="span" path="hero.title" />
        }
        subtitle={
          crawler && seo.intro
            ? seo.intro
            : <EditableText doc="contact" as="span" path="hero.subtitle" />
        }
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact/' },
        ]}
      />
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
        <div className="container" style={{ maxWidth: 560 }}>
          <EditableText doc="contact" as="h2" path="formHeading" />
          <EditableText doc="contact" as="p" path="intro" />
          <ContactForm type="contact" />
        </div>
      </section>
    </>
  );
}
