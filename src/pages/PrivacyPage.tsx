import PageHero from '../components/PageHero';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';
import EditableText from '../cms/EditableText';
import { useCms } from '../cms/ContentProvider';

type PrivacyDoc = {
  paragraphs: string[];
};

export default function PrivacyPage() {
  usePageMeta(getPageSeo('/privacy-policy/')!);
  const { getDoc } = useCms();
  const content = getDoc<PrivacyDoc>('privacy');

  return (
    <>
      <PageHero
        title={<EditableText doc="privacy" as="span" path="hero.title" />}
        subtitle={<EditableText doc="privacy" as="span" path="hero.subtitle" />}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Privacy Policy', path: '/privacy-policy/' },
        ]}
      />
      <section className="section section--cream">
        <div className="container">
          {content.paragraphs.map((_, i) => (
            <EditableText key={i} doc="privacy" as="p" path={`paragraphs.${i}`} />
          ))}
        </div>
      </section>
    </>
  );
}
