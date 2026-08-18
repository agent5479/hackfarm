import { withBase } from '../lib/constants';

const INSTAGRAM_POSTS = [
  { img: '/images/uploads/sb-instagram-feed-images/701538039_27449228651328956_2737825085368841951_nlow.jpg', url: 'https://www.instagram.com/p/DYaZYLOlH34/' },
  { img: '/images/uploads/sb-instagram-feed-images/643562848_18451358485109112_2042575507208599498_nlow.jpg', url: 'https://www.instagram.com/p/DVPqdF5k9Qm/' },
  { img: '/images/uploads/sb-instagram-feed-images/625060746_18446501524109112_299154765016538392_nlow.jpg', url: 'https://www.instagram.com/p/DUSjKgmivDJ/' },
  { img: '/images/uploads/sb-instagram-feed-images/622674109_18444619540109112_3662860958706598435_nlow.jpg', url: 'https://www.instagram.com/p/DT_jRfFE1Ww/' },
  { img: '/images/uploads/sb-instagram-feed-images/613299360_18442333249109112_2123645102158151138_nlow.jpg', url: 'https://www.instagram.com/p/DTelC4okS2k/' },
  { img: '/images/uploads/sb-instagram-feed-images/591152735_18437470624109112_2596279303039898162_nlow.jpg', url: 'https://www.instagram.com/p/DR_3T2TkTTL/' },
  { img: '/images/uploads/sb-instagram-feed-images/582076970_18434701426109112_8757755488352690823_nlow.jpg', url: 'https://www.instagram.com/p/DRHLoi1EVDd/' },
  { img: '/images/uploads/sb-instagram-feed-images/582612897_1090808582976031_7488834955769579101_nlow.jpg', url: 'https://www.instagram.com/reel/DRB3CDBkbb-/' },
  { img: '/images/uploads/sb-instagram-feed-images/564979357_18428512930109112_3919236620991915233_nlow.jpg', url: 'https://www.instagram.com/p/DP0p1yREVYz/' },
  { img: '/images/uploads/sb-instagram-feed-images/554702250_18424840018109112_7208990187742874459_nlow.jpg', url: 'https://www.instagram.com/p/DPGUtZnkZe0/' },
  { img: '/images/uploads/sb-instagram-feed-images/523339927_18415493086109112_1291909907033999299_nlow.jpg', url: 'https://www.instagram.com/p/DMdpUUyzGsG/' },
  { img: '/images/uploads/sb-instagram-feed-images/521431616_4193536320904973_4749747141129129244_nlow.jpg', url: 'https://www.instagram.com/p/DMXO_x-Rm-5/' },
];

export default function InstagramGrid() {
  return (
    <section className="section section--white">
      <div className="container">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Follow Us on Instagram</h2>
        <div className="instagram-grid">
          {INSTAGRAM_POSTS.map((post) => (
            <a key={post.url} href={post.url} target="_blank" rel="noopener noreferrer">
              <img src={withBase(post.img)} alt="Hack Farm on Instagram" loading="lazy" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
