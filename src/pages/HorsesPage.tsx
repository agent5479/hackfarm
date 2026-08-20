import { Link } from 'react-router-dom';
import scraped from '../content/scraped-content.json';
import PageHero from '../components/PageHero';
import { withBase } from '../lib/constants';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';

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

export default function HorsesPage() {
  usePageMeta(getPageSeo('/our-horses/')!);

  return (
    <>
      <PageHero
        title="Our Horses"
        subtitle="Our Equine Family and your partner on the trail."
      />
      <section className="section section--cream">
        <div className="container">
          <div className="horse-grid">
            {scraped.horses.map((horse) => (
              <Link key={horse.slug} to={`/horse/${horse.slug}/`} className="horse-card">
                <img
                  src={withBase(HORSE_IMAGES[horse.slug] || '/images/uploads/2021/02/Sillouette-Vaulting.png')}
                  alt={horse.title}
                />
                <h3>{horse.title}</h3>
              </Link>
            ))}
          </div>
          <blockquote className="testimonial" style={{ marginTop: '3rem', textAlign: 'center' }}>
            "No one can teach riding so well as a horse" — C.S. Lewis
          </blockquote>
        </div>
      </section>
    </>
  );
}
