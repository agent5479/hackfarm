import { optimizedUrl } from '../lib/images';
import PageHero from '../components/PageHero';
import ContactForm from '../components/ContactForm';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';
import EditableText from '../cms/EditableText';
import { useCms } from '../cms/ContentProvider';

type PartnersDoc = {
  intro: string[];
  sections: { title: string; body: string[] }[];
};

export default function PartnersPage() {
  usePageMeta(getPageSeo('/partners/')!);
  const { getDoc } = useCms();
  const content = getDoc<PartnersDoc>('partners');

  return (
    <>
      <PageHero
        title={<EditableText doc="partners" as="span" path="hero.title" />}
        subtitle={<EditableText doc="partners" as="span" path="hero.subtitle" />}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Partners', path: '/partners/' },
        ]}
      />
      <section className="section section--cream">
        <div className="container">
          {content.intro.map((_, i) => (
            <EditableText key={i} doc="partners" as="p" path={`intro.${i}`} />
          ))}
        </div>
      </section>
      <section className="section section--white">
        <div className="container two-col">
          <img
            src={optimizedUrl('/images/uploads/2021/07/Bijmin_Affiliate_Booking-2.png', 'content')}
            alt="Partner booking"
            loading="lazy"
            decoding="async"
          />
          <div>
            <EditableText doc="partners" as="h2" path="sections.0.title" />
            <EditableText doc="partners" as="p" path="sections.0.body.0" />
            <EditableText doc="partners" as="h3" path="sections.0.body.1" />
            <EditableText doc="partners" as="p" path="sections.0.body.2" />
            <img
              src={optimizedUrl('/images/uploads/2021/09/qrcode_2572792_-1.png', 'thumb')}
              alt="Partner QR code example"
              style={{ maxWidth: 200, marginTop: '1rem' }}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>
      <section className="section section--cream">
        <div className="container">
          <EditableText doc="partners" as="h2" path="sections.1.title" />
          {content.sections[1]?.body.map((_, i) => (
            <EditableText key={i} doc="partners" as="p" path={`sections.1.body.${i}`} />
          ))}
          <ContactForm type="partner" />
        </div>
      </section>
    </>
  );
}
