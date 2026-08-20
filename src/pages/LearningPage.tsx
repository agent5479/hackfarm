import scraped from '../content/scraped-content.json';
import { decodeHtml } from '../lib/constants';
import { optimizedUrl } from '../lib/images';
import PageHero from '../components/PageHero';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';

const content = scraped.pages.learning;

const LESSONS = [
  { id: 'lessons', title: 'Arena & Beach Riding Lessons', img: '/images/uploads/2021/02/20210104_145330-1.jpg' },
  { id: 'horsemanship', title: 'Horsemanship Lessons', img: '/images/uploads/2021/03/Horsemanship-Sillouette.png' },
  { id: 'vaulting', title: 'Vaulting & Ride & Fly', img: '/images/uploads/2021/02/Vaulting-Poster.jpg' },
];

export default function LearningPage() {
  usePageMeta(getPageSeo('/learning-experiences/')!);

  return (
    <>
      <PageHero title="Learning Experiences" subtitle="Horsemanship, Vaulting and Riding Lessons" />
      <section className="section section--cream">
        <div className="container">
          {content.paragraphs.slice(0, 2).map((p, i) => (
            <p key={i}>{decodeHtml(p)}</p>
          ))}
        </div>
      </section>
      {LESSONS.map((lesson, idx) => (
        <section key={lesson.id} id={lesson.id} className={`section ${idx % 2 === 0 ? 'section--white' : 'section--cream'}`}>
          <div className="container two-col">
            <img
              src={optimizedUrl(lesson.img, idx === 1 ? 'thumb' : 'content')}
              alt={lesson.title}
              style={{ borderRadius: 4 }}
              loading="lazy"
              decoding="async"
            />
            <div>
              <h2>{lesson.title}</h2>
              {content.paragraphs.slice(idx * 5 + 2, idx * 5 + 7).map((p, i) => (
                <p key={i}>{decodeHtml(p)}</p>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
