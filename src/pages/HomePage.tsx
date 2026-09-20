import { Link } from 'react-router-dom';
import { optimizedUrl } from '../lib/images';
import BackgroundSlideshow from '../components/BackgroundSlideshow';
import InstagramGrid from '../components/InstagramGrid';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';
import { isSeoPrerender } from '../seo/prerender';
import HeroHeadline from '../components/HeroHeadline';
import EditableText from '../cms/EditableText';
import { useCms } from '../cms/ContentProvider';
import type { FeatureKey, TileKey } from '../cms/types';

const TILE_LAYOUT: {
  id: TileKey;
  img: string;
  link: string;
  color: string;
}[] = [
  {
    id: 'ride',
    img: '/images/uploads/2021/03/127142963_3918021201543032_3894975841806055644_n.jpg',
    link: '/holistic-horse-rides/#book-rides',
    color: 'btn--green',
  },
  {
    id: 'stay',
    img: '/images/uploads/2021/02/20210221_125542-copy.jpg',
    link: '/accommodation/',
    color: 'btn--pink',
  },
  {
    id: 'learn',
    img: '/images/uploads/2021/03/107601229_1530595257120739_3780438784627968956_o-1.jpg',
    link: '/learning-experiences/',
    color: 'btn--orange',
  },
];

const FEATURE_LAYOUT: {
  id: FeatureKey;
  images: string[];
  imageSide: 'left' | 'right';
  link: string;
  backdrop: { img: string; size: string; pos: string; opacity: number };
}[] = [
  {
    id: 'beachRides',
    images: [
      '/images/uploads/2021/02/20210104_145330.jpg',
      '/images/uploads/2021/02/IMG_6067-1.jpg',
      '/images/uploads/2021/02/IMG_1921.jpg',
    ],
    imageSide: 'left',
    link: '/holistic-horse-rides/#book-rides',
    backdrop: {
      img: '/images/uploads/2021/04/Horses-trekking-One-Color.jpg',
      size: '100%',
      pos: '50% 50%',
      opacity: 0.38,
    },
  },
  {
    id: 'vaulting',
    images: ['/images/uploads/2021/02/IMG_20190120_122312-scaled.jpg'],
    imageSide: 'right',
    link: '/vaulting/',
    backdrop: {
      img: '/images/uploads/2021/02/Sillouette-Vaulting.png',
      size: '100%',
      pos: '100% 100%',
      opacity: 0.55,
    },
  },
  {
    id: 'stay',
    images: [
      '/images/uploads/2021/03/20190801_Hackfarm_Panorama-rainbow.jpg',
      '/images/uploads/2021/03/20210314_153006.jpg',
      '/images/uploads/2021/02/20210220_163837.jpg',
      '/images/uploads/2021/02/20210221_125542-copy.jpg',
    ],
    imageSide: 'left',
    link: '/accommodation/',
    backdrop: {
      img: '/images/uploads/2021/02/Jumping-girl-v2.png',
      size: '100%',
      pos: '100% 100%',
      opacity: 0.5,
    },
  },
  {
    id: 'kidsCamps',
    images: [
      '/images/uploads/2021/02/20210102_1540010.jpg',
      '/images/uploads/2021/03/107601229_1530595257120739_3780438784627968956_o-1.jpg',
      '/images/uploads/2021/03/VaultingHorseClubDay.jpg',
      '/images/uploads/2021/03/received_315581099811713.jpg',
    ],
    imageSide: 'right',
    link: '/special-events/',
    backdrop: {
      img: '/images/uploads/2021/03/Horsemanship-Sillouette.png',
      size: '31%',
      pos: '50% 100%',
      opacity: 0.55,
    },
  },
  {
    id: 'byoHorse',
    images: ['/images/uploads/2021/04/Horse-Stay-smaller.jpg'],
    imageSide: 'left',
    link: '/accommodation/#horse-stay',
    backdrop: {
      img: '/images/uploads/2021/03/BYO-horse.png',
      size: 'cover',
      pos: '0% 0%',
      opacity: 0.14,
    },
  },
];

export default function HomePage() {
  const seo = getPageSeo('/')!;
  usePageMeta(seo);
  const { content, isEditor } = useCms();
  const crawler = isSeoPrerender() && seo.h1;

  return (
    <>
      <section
        className="home-hero"
        style={{ backgroundImage: `url(${optimizedUrl('/images/uploads/2021/02/IMG_6067-scaled.jpg', 'hero')})` }}
      >
        <HeroHeadline />
      </section>

      <section className="section section--cream">
        <div className="container" style={{ textAlign: 'center' }}>
          {crawler ? (
            <>
              <h1>{seo.h1}</h1>
              {seo.intro ? (
                <p style={{ maxWidth: 800, margin: '1rem auto 0' }}>{seo.intro}</p>
              ) : null}
            </>
          ) : (
            <>
              <EditableText as="h1" path="hero.h1" />
              <EditableText as="p" path="intro.lead" style={{ maxWidth: 800, margin: '1rem auto 0' }} />
              <EditableText as="p" path="intro.location" style={{ maxWidth: 800, margin: '0.75rem auto 0' }} />
            </>
          )}
        </div>
      </section>

      <section className="photo-tiles">
        {TILE_LAYOUT.map((s) => (
          <Link
            key={s.id}
            to={s.link}
            className="photo-tile"
            style={{ backgroundImage: `url(${optimizedUrl(s.img, 'content')})` }}
            onClick={(e) => {
              if (isEditor && (e.target as HTMLElement).closest?.('.cms-editable')) {
                e.preventDefault();
              }
            }}
          >
            <EditableText as="h2" path={`tiles.${s.id}.title`} />
            <EditableText as="p" path={`tiles.${s.id}.body`} />
            <EditableText as="span" path={`tiles.${s.id}.cta`} className={`btn ${s.color}`} />
          </Link>
        ))}
      </section>

      {FEATURE_LAYOUT.map((f) => {
        const photo = <BackgroundSlideshow images={f.images} />;
        const paras = content.features[f.id].body;
        const copy = (
          <div className="feature-stratum__copy">
            <div
              className="feature-stratum__backdrop"
              style={{
                backgroundImage: `url(${optimizedUrl(f.backdrop.img, 'content')})`,
                backgroundSize: f.backdrop.size,
                backgroundPosition: f.backdrop.pos,
                opacity: f.backdrop.opacity,
              }}
            />
            <EditableText as="h2" path={`features.${f.id}.title`} />
            <p>
              <EditableText as="strong" path={`features.${f.id}.subtitle`} />
            </p>
            {paras.map((_, i) => (
              <EditableText key={`${f.id}-${i}`} as="p" path={`features.${f.id}.body.${i}`} />
            ))}
            <Link
              to={f.link}
              className="btn btn--green"
              onClick={(e) => {
                if (isEditor && (e.target as HTMLElement).closest?.('.cms-editable')) {
                  e.preventDefault();
                }
              }}
            >
              <EditableText as="span" path={`features.${f.id}.cta`} />
            </Link>
          </div>
        );
        return (
          <section key={f.id} className={`feature-stratum${f.imageSide === 'right' ? ' feature-stratum--flip' : ''}`}>
            {photo}
            {copy}
          </section>
        );
      })}

      <section className="section section--white">
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>What Our Guests Say</h2>
          <div className="card-grid">
            {content.testimonials.map((_, i) => (
              <blockquote key={i} className="testimonial">
                <EditableText as="span" path={`testimonials.${i}.text`} quote />
                <cite>
                  — <EditableText as="span" path={`testimonials.${i}.author`} />
                </cite>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <InstagramGrid />
    </>
  );
}
