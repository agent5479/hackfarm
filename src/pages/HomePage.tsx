import scraped from '../content/scraped-content.json';
import { decodeHtml, withBase } from '../lib/constants';
import PageHero from '../components/PageHero';
import InstagramGrid from '../components/InstagramGrid';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

const content = scraped.pages.home;

const SECTIONS = [
  { id: 'stay', title: 'Stay', img: '/images/uploads/2021/02/House-from-afar.jpg', link: '/accommodation/', btn: 'View Accommodation', color: 'btn--pink' },
  { id: 'ride', title: 'Ride', img: '/images/uploads/2021/02/20210104_145330-1.jpg', link: '/holistic-horse-rides/', btn: 'View Rides', color: 'btn--green' },
  { id: 'learn', title: 'Learn', img: '/images/uploads/2021/03/Horsemanship-Sillouette.png', link: '/learning-experiences/', btn: 'View Lessons', color: 'btn--orange' },
];

const FEATURES = [
  { title: 'Beach Horse Rides', subtitle: 'Holistic Horse Experiences – learn while you ride', img: '/images/uploads/2021/02/20210104_145330-1.jpg', link: '/holistic-horse-rides/', paragraphs: [4, 5, 6] },
  { title: 'Vaulting Experiences', subtitle: 'Fun and engaging vaulting sessions for all ages', img: '/images/uploads/2021/02/Vaulting-Poster.jpg', link: '/vaulting/', paragraphs: [7, 8, 9, 10] },
  { title: 'campground, Back Packer & Farmstay', subtitle: 'Comfortable accommodation options', img: '/images/uploads/2021/02/hackfarm-Campsite.jpg', link: '/accommodation/', paragraphs: [11, 12, 13] },
  { title: "Kid's Camps", subtitle: 'Fun camps and riding days', img: '/images/uploads/2021/03/VaultingHorseClubDay.jpg', link: '/special-events/', paragraphs: [14, 15] },
  { title: 'Bring your Own horse!', subtitle: 'Bring your own horse and enjoy a holiday away', img: '/images/uploads/2021/04/Horse-Stay-smaller.jpg', link: '/accommodation/#horse-stay', paragraphs: [16, 17] },
];

const TESTIMONIALS = [
  { text: "Hack and stay is a real peace of heaven. The horses are really well treated and the track to the beach is amazing. But there's so much more than trekking, there's all sorts of swings for the children, a little climbing wall and you can even try some vaulting. We'll remember our stay forever!!!", author: 'Anne-Lise, Nov 2020' },
  { text: "Hack n Stay is an amazing place to visit! The accommodation is well thought out and uniquely horse themed and the property is stunning. You will love the views and the awesome riding tracks around the farm.", author: 'Larissa Meuller' },
  { text: "My partner and me intended to stay 1 night with our Campervan, in the end we stayed 3 nights, because we enjoyed it so much.", author: 'Merel, May 2020' },
  { text: "Great trekking with Baerbel and her horses! It's way more than just a trek, she really teaches you horse riding!", author: 'Lucy Devos, July 2020' },
];

export default function HomePage() {
  usePageTitle('Home | Hack n Stay Golden Bay');

  return (
    <>
      <PageHero
        title=""
        background="/images/uploads/2021/02/20210104_145330-1.jpg"
      />
      <div style={{ textAlign: 'center', padding: '0 1.5rem', marginTop: '-2rem', position: 'relative', zIndex: 1 }}>
        <img src={withBase('/images/uploads/2021/06/TC_2021_L_TRANSPARENT_BG_RGB-01.png')} alt="TripAdvisor Travellers Choice 2021" style={{ height: 80, margin: '0 auto' }} />
      </div>

      <section className="section section--cream">
        <div className="container" style={{ textAlign: 'center' }}>
          <h1>{decodeHtml(content.h1s[0] || '')}</h1>
          <p style={{ maxWidth: 800, margin: '1rem auto 2rem' }}>{decodeHtml(content.paragraphs[0] || '')}</p>
        </div>
      </section>

      <section className="section section--white">
        <div className="container">
          <div className="card-grid">
            {SECTIONS.map((s, i) => (
              <div key={s.id} className="card">
                <img className="card__image" src={withBase(s.img)} alt={s.title} />
                <div className="card__body">
                  <h3>{s.title}</h3>
                  <p>{decodeHtml(content.paragraphs[i + 1] || '')}</p>
                  <Link to={s.link} className={`btn ${s.color}`}>{s.btn}</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {FEATURES.map((f) => (
        <section key={f.title} className="section section--cream">
          <div className="container two-col">
            <img src={withBase(f.img)} alt={f.title} style={{ borderRadius: 4 }} />
            <div>
              <h2>{f.title}</h2>
              <p><strong>{f.subtitle}</strong></p>
              {f.paragraphs.map((idx) => (
                <p key={idx}>{decodeHtml(content.paragraphs[idx] || '')}</p>
              ))}
              <Link to={f.link} className="btn btn--green">Learn More</Link>
            </div>
          </div>
        </section>
      ))}

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
