import { Link } from 'react-router-dom';
import scraped from '../content/scraped-content.json';
import { decodeHtml, withBase } from '../lib/constants';
import BackgroundSlideshow from '../components/BackgroundSlideshow';
import InstagramGrid from '../components/InstagramGrid';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';
import HeroHeadline from '../components/HeroHeadline';

const content = scraped.pages.home;

const TILES = [
  { id: 'stay', title: 'Stay', img: '/images/uploads/2021/02/20210221_125542-copy.jpg', link: '/accommodation/', btn: 'View Accommodation', color: 'btn--pink' },
  { id: 'ride', title: 'Ride', img: '/images/uploads/2021/03/127142963_3918021201543032_3894975841806055644_n.jpg', link: '/holistic-horse-rides/#book-rides', btn: 'Book a Ride', color: 'btn--green' },
  { id: 'learn', title: 'Learn', img: '/images/uploads/2021/03/107601229_1530595257120739_3780438784627968956_o-1.jpg', link: '/learning-experiences/', btn: 'View Lessons', color: 'btn--orange' },
];

const FEATURES = [
  {
    title: 'Beach Horse Rides',
    subtitle: 'Holistic Horse Experiences – learn while you ride',
    images: [
      '/images/uploads/2021/02/20210104_145330.jpg',
      '/images/uploads/2021/02/IMG_6067-1.jpg',
      '/images/uploads/2021/02/IMG_1921.jpg',
    ],
    imageSide: 'left' as const,
    link: '/holistic-horse-rides/#book-rides',
    btn: 'Book a ride',
    paragraphs: [5, 6],
    backdrop: {
      img: '/images/uploads/2021/04/Horses-trekking-One-Color.jpg',
      size: '100%',
      pos: '50% 50%',
      opacity: 0.62,
    },
  },
  {
    title: 'Vaulting Experiences',
    subtitle: 'Fun and engaging vaulting sessions for all ages',
    images: ['/images/uploads/2021/02/IMG_20190120_122312-scaled.jpg'],
    imageSide: 'right' as const,
    link: '/vaulting/',
    btn: 'Learn More',
    paragraphs: [8, 9, 10],
    backdrop: {
      img: '/images/uploads/2021/02/Sillouette-Vaulting.png',
      size: '100%',
      pos: '100% 100%',
      opacity: 1,
    },
  },
  {
    title: 'campground, Back Packer & Farmstay',
    subtitle: 'Comfortable accommodation options to guarantee a good night’s sleep after your day of exploring.',
    images: [
      '/images/uploads/2021/03/20190801_Hackfarm_Panorama-rainbow.jpg',
      '/images/uploads/2021/03/20210314_153006.jpg',
      '/images/uploads/2021/02/20210220_163837.jpg',
      '/images/uploads/2021/02/20210221_125542-copy.jpg',
    ],
    imageSide: 'left' as const,
    link: '/accommodation/',
    btn: 'View Accommodation',
    paragraphs: [12, 13],
    backdrop: {
      img: '/images/uploads/2021/02/Jumping-girl-v2.png',
      size: '100%',
      pos: '100% 100%',
      opacity: 1,
    },
  },
  {
    title: "Kid's Camps",
    subtitle: 'Fun camps and riding days',
    images: [
      '/images/uploads/2021/02/20210102_1540010.jpg',
      '/images/uploads/2021/03/107601229_1530595257120739_3780438784627968956_o-1.jpg',
      '/images/uploads/2021/03/VaultingHorseClubDay.jpg',
      '/images/uploads/2021/03/received_315581099811713.jpg',
    ],
    imageSide: 'right' as const,
    link: '/special-events/',
    btn: 'Learn More',
    paragraphs: [15],
    backdrop: {
      img: '/images/uploads/2021/03/Horsemanship-Sillouette.png',
      size: '31%',
      pos: '50% 100%',
      opacity: 1,
    },
  },
  {
    title: 'Bring your Own horse!',
    subtitle: 'Bring your own horse and enjoy a holiday away',
    images: ['/images/uploads/2021/04/Horse-Stay-smaller.jpg'],
    imageSide: 'left' as const,
    link: '/accommodation/#horse-stay',
    btn: 'Book Your Horse Stay',
    paragraphs: [17],
    backdrop: {
      img: '/images/uploads/2021/03/BYO-horse.png',
      size: 'cover',
      pos: '0% 0%',
      opacity: 0.18,
    },
  },
];

const TESTIMONIALS = [
  { text: "Hack and stay is a real peace of heaven. The horses are really well treated and the track to the beach is amazing. But there's so much more than trekking, there's all sorts of swings for the children, a little climbing wall and you can even try some vaulting. We'll remember our stay forever!!!", author: 'Anne-Lise, Nov 2020' },
  { text: "Hack n Stay is an amazing place to visit! The accommodation is well thought out and uniquely horse themed and the property is stunning. You will love the views and the awesome riding tracks around the farm.", author: 'Larissa Meuller' },
  { text: "My partner and me intended to stay 1 night with our Campervan, in the end we stayed 3 nights, because we enjoyed it so much.", author: 'Merel, May 2020' },
  { text: "Great trekking with Baerbel and her horses! It's way more than just a trek, she really teaches you horse riding!", author: 'Lucy Devos, July 2020' },
];

export default function HomePage() {
  usePageMeta(getPageSeo('/')!);

  return (
    <>
      <section
        className="home-hero"
        style={{ backgroundImage: `url(${withBase('/images/uploads/2021/02/IMG_6067-scaled.jpg')})` }}
      >
        <HeroHeadline />
      </section>

      <section className="section section--cream">
        <div className="container" style={{ textAlign: 'center' }}>
          <h1>{decodeHtml(content.h1s[0] || '')}</h1>
          <p style={{ maxWidth: 800, margin: '1rem auto 0' }}>{decodeHtml(content.paragraphs[0] || '')}</p>
        </div>
      </section>

      <section className="photo-tiles">
        {TILES.map((s, i) => (
          <div
            key={s.id}
            className="photo-tile"
            style={{ backgroundImage: `url(${withBase(s.img)})` }}
          >
            <h2>{s.title}</h2>
            <p>{decodeHtml(content.paragraphs[i + 1] || '')}</p>
            <Link to={s.link} className={`btn ${s.color}`}>{s.btn}</Link>
          </div>
        ))}
      </section>

      {FEATURES.map((f) => {
        const photo = <BackgroundSlideshow images={f.images} />;
        const copy = (
          <div className="feature-stratum__copy">
            {f.backdrop && (
              <div
                className="feature-stratum__backdrop"
                style={{
                  backgroundImage: `url(${withBase(f.backdrop.img)})`,
                  backgroundSize: f.backdrop.size,
                  backgroundPosition: f.backdrop.pos,
                  opacity: f.backdrop.opacity,
                }}
              />
            )}
            <h2>{f.title}</h2>
            <p><strong>{f.subtitle}</strong></p>
            {f.paragraphs.map((idx) => (
              <p key={idx}>{decodeHtml(content.paragraphs[idx] || '')}</p>
            ))}
            <Link to={f.link} className="btn btn--green">{f.btn}</Link>
          </div>
        );
        return (
          <section key={f.title} className={`feature-stratum${f.imageSide === 'right' ? ' feature-stratum--flip' : ''}`}>
            {photo}
            {copy}
          </section>
        );
      })}

      <section className="section section--white">
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>What Our Guests Say</h2>
          <div className="card-grid">
            {TESTIMONIALS.map((t) => (
              <blockquote key={t.author} className="testimonial">
                "{t.text}"
                <cite>— {t.author}</cite>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <InstagramGrid />
    </>
  );
}
