import { optimizedUrl } from '../lib/images';
import PageHero from '../components/PageHero';
import { JsonLd, serviceJsonLd } from '../components/JsonLd';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';
import EditableText from '../cms/EditableText';
import { useCms } from '../cms/ContentProvider';

const LESSON_IMAGES = [
  { id: 'lessons', img: '/images/uploads/2021/02/20210104_145330-1.jpg' },
  { id: 'horsemanship', img: '/images/uploads/2021/03/Horsemanship-Sillouette.png' },
  { id: 'vaulting', img: '/images/uploads/2021/02/Vaulting-Poster.jpg' },
];

type LearningDoc = {
  intro: string[];
  lessons: { id: string; title: string; body: string[] }[];
};

export default function LearningPage() {
  const seo = getPageSeo('/learning-experiences/')!;
  usePageMeta(seo);
  const { getDoc } = useCms();
  const content = getDoc<LearningDoc>('learning');

  return (
    <>
      <JsonLd data={serviceJsonLd('Learning Experiences', seo.description, '/learning-experiences/')} />
      <PageHero
        title={<EditableText doc="learning" as="span" path="hero.title" />}
        subtitle={<EditableText doc="learning" as="span" path="hero.subtitle" />}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Learning Experiences', path: '/learning-experiences/' },
        ]}
      />
      <section className="section section--cream">
        <div className="container">
          {content.intro.map((_, i) => (
            <EditableText key={i} doc="learning" as="p" path={`intro.${i}`} />
          ))}
        </div>
      </section>
      {LESSON_IMAGES.map((lesson, idx) => (
        <section key={lesson.id} id={lesson.id} className={`section ${idx % 2 === 0 ? 'section--white' : 'section--cream'}`}>
          <div className="container two-col">
            <img
              src={optimizedUrl(lesson.img, idx === 1 ? 'thumb' : 'content')}
              alt={content.lessons[idx]?.title ?? lesson.id}
              style={{ borderRadius: 4 }}
              loading="lazy"
              decoding="async"
            />
            <div>
              <EditableText doc="learning" as="h2" path={`lessons.${idx}.title`} />
              {content.lessons[idx]?.body.map((_, i) => (
                <EditableText key={i} doc="learning" as="p" path={`lessons.${idx}.body.${i}`} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
