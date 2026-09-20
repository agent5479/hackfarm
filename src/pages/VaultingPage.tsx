import { optimizedUrl } from '../lib/images';
import PageHero from '../components/PageHero';
import { JsonLd, serviceJsonLd } from '../components/JsonLd';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';
import { isSeoPrerender } from '../seo/prerender';
import EditableText from '../cms/EditableText';
import { useCms } from '../cms/ContentProvider';

type VaultingDoc = {
  intro: string[];
};

export default function VaultingPage() {
  const seo = getPageSeo('/vaulting/')!;
  usePageMeta(seo);
  const { getDoc } = useCms();
  const content = getDoc<VaultingDoc>('vaulting');
  const crawler = isSeoPrerender() && seo.h1;

  return (
    <>
      <JsonLd
        data={serviceJsonLd(
          'Horse Vaulting New Zealand — Hack Vaulties Golden Bay',
          seo.description,
          '/vaulting/',
        )}
      />
      <PageHero
        title={
          crawler ? seo.h1! : <EditableText doc="vaulting" as="span" path="hero.title" />
        }
        subtitle={
          crawler && seo.intro
            ? seo.intro
            : <EditableText doc="vaulting" as="span" path="hero.subtitle" />
        }
        background="/images/uploads/2021/02/Vaulting-Poster.jpg"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Horse Vaulting', path: '/vaulting/' },
        ]}
      />
      <section className="section section--cream">
        <div className="container">
          {content.intro.map((_, i) => (
            <EditableText key={i} doc="vaulting" as="p" path={`intro.${i}`} />
          ))}
        </div>
      </section>
      <section className="section section--white">
        <div className="container">
          <EditableText doc="vaulting" as="h2" path="galleryTitle" />
          <div className="card-grid">
            {Array.from({ length: 12 }, (_, i) => {
              const num = String(i + 1).padStart(2, '0');
              return (
                <img
                  key={num}
                  src={optimizedUrl(`/images/uploads/2022/06/Hack-Vaulties${num}.jpg`, 'thumb')}
                  alt={`Hack Vaulties ${num}`}
                  loading="lazy"
                  decoding="async"
                  style={{ borderRadius: 4, width: '100%', height: 200, objectFit: 'cover' }}
                />
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
