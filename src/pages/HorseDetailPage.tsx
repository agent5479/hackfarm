import { useParams, Link, Navigate } from 'react-router-dom';
import scraped from '../content/scraped-content.json';
import { decodeHtml, HORSE_SLUGS, type HorseSlug } from '../lib/constants';
import PageHero from '../components/PageHero';
import { usePageTitle } from '../hooks/usePageTitle';

const HORSE_IMAGES: Record<string, string> = {
  donnie: '/images/uploads/2021/02/IMG_6067-scaled.jpg',
  buddy: '/images/uploads/2021/02/IMG_1921.jpg',
  safran: '/images/uploads/2022/04/Manuka.jpg',
  manuka: '/images/uploads/2022/04/Manuka.jpg',
  rusty: '/images/uploads/2021/02/IMG_7730.jpg',
  mcduff: '/images/uploads/2021/02/IMG_6067-scaled.jpg',
  redwing: '/images/uploads/2021/02/IMG_20200709_113754.jpg',
  brunner: '/images/uploads/2021/02/IMG_4295-scaled.jpg',
  ice: '/images/uploads/2021/02/IMG_20190120_122312-scaled.jpg',
  leonard: '/images/uploads/2021/02/IMG_20190120_122837-scaled.jpg',
  chloe: '/images/uploads/2021/02/IMG_20190120_121744_1-scaled.jpg',
  arnie: '/images/uploads/2021/02/IMG_20190402_161433.jpg',
  jasper: '/images/uploads/2021/02/IMG_20190328_082617.jpg',
  'brown-acre': '/images/uploads/2021/02/20190818_124033-scaled.jpg',
};

export default function HorseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const horse = scraped.horses.find((h) => h.slug === slug);
  usePageTitle(horse?.title || 'Horse');

  if (!slug || !HORSE_SLUGS.includes(slug as HorseSlug) || !horse) {
    return <Navigate to="/our-horses/" replace />;
  }

  return (
    <>
      <PageHero title={horse.title} />
      <section className="section section--cream">
        <div className="container two-col">
          <img
            src={HORSE_IMAGES[slug] || '/images/uploads/2021/02/Sillouette-Vaulting.png'}
            alt={horse.title}
            style={{ borderRadius: 4 }}
          />
          <div>
            {horse.h2s.map((h) => (
              <h2 key={h}>{decodeHtml(h)}</h2>
            ))}
            {horse.paragraphs.slice(0, 8).map((p, i) => (
              <p key={i}>{decodeHtml(p)}</p>
            ))}
          </div>
        </div>
      </section>
      <section className="section section--white">
        <div className="container">
          <h2>Check out some of my other workmates</h2>
          <div className="horse-grid">
            {scraped.horses.filter((h) => h.slug !== slug).slice(0, 6).map((h) => (
              <Link key={h.slug} to={`/horse/${h.slug}/`} className="horse-card">
                <img src={HORSE_IMAGES[h.slug] || '/images/uploads/2021/02/Sillouette-Vaulting.png'} alt={h.title} />
                <h3>{h.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
