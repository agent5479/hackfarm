import { SOCIAL, withBase } from '../lib/constants';

const INSTAGRAM_POSTS = [
  { img: '701538039_27449228651328956_2737825085368841951_nlow.jpg', url: 'https://www.instagram.com/p/DYaZYLOlH34/', caption: 'Grateful My New Zealand passport arrived' },
  { img: '643562848_18451358485109112_2042575507208599498_nlow.jpg', url: 'https://www.instagram.com/p/DVPqdF5k9Qm/', caption: 'Switch your phone to the side and see our ...' },
  { img: '625060746_18446501524109112_299154765016538392_nlow.jpg', url: 'https://www.instagram.com/p/DUSjKgmivDJ/', caption: 'A beautiful sunrise ride!!☀️🌅☀️#sunrise...' },
  { img: '622674109_18444619540109112_3662860958706598435_nlow.jpg', url: 'https://www.instagram.com/p/DT_jRfFE1Ww/', caption: 'Having a closer look☀️☀️#hacknstay ...' },
  { img: '613299360_18442333249109112_2123645102158151138_nlow.jpg', url: 'https://www.instagram.com/p/DTelC4okS2k/', caption: 'Marie is now a full member of our track team and ...' },
  { img: '591152735_18437470624109112_2596279303039898162_nlow.jpg', url: 'https://www.instagram.com/p/DR_3T2TkTTL/', caption: 'Don’t make plans for Saturday, come to our ...' },
  { img: '582076970_18434701426109112_8757755488352690823_nlow.jpg', url: 'https://www.instagram.com/p/DRHLoi1EVDd/', caption: 'Our Junior and Senior Vaulting Teams at today’s ...' },
  { img: '582612897_1090808582976031_7488834955769579101_nlow.jpg', url: 'https://www.instagram.com/reel/DRB3CDBkbb-/', caption: 'Manuka having fun🤠 #havingfuninthesun☀️' },
  { img: '564979357_18428512930109112_3919236620991915233_nlow.jpg', url: 'https://www.instagram.com/p/DP0p1yREVYz/', caption: 'About to hit the trail from our new reception. ...' },
  { img: '554702250_18424840018109112_7208990187742874459_nlow.jpg', url: 'https://www.instagram.com/p/DPGUtZnkZe0/', caption: 'Always a marvellous ride along the stunning reef ...' },
  { img: '523339927_18415493086109112_1291909907033999299_nlow.jpg', url: 'https://www.instagram.com/p/DMdpUUyzGsG/', caption: 'MOE the Farm dog Born 2017 Breed: Belgian ...' },
  { img: '521431616_4193536320904973_4749747141129129244_n.heiclow.jpg', url: 'https://www.instagram.com/p/DMXPVYFxFtW/', caption: 'Name: Happy Harley Breed: Kaimanawa ...' },
  { img: '522480162_1291021942543954_9014924311264794161_n.heiclow.jpg', url: 'https://www.instagram.com/p/DMXO_x-Rm-5/', caption: 'Name: Keen Kevin Breed: Kaimanawa ...' },
  { img: '522410207_1467524017867691_113462825070426954_n.heiclow.jpg', url: 'https://www.instagram.com/p/DMXODv_xKIi/', caption: 'Name: Bright Buddy Breed: Pinto ...' },
  { img: '521073507_598115190021760_3639451889904081754_n.heiclow.jpg', url: 'https://www.instagram.com/p/DMOqo7AzrIQ/', caption: 'Name: Tommy aka Major Tom Breed: ...' },
  { img: '519675080_1082052707213829_1070037248605679060_n.heiclow.jpg', url: 'https://www.instagram.com/p/DMLo1TMT0HA/', caption: 'Name: Spirited Saffie Breed: Clydesdale ...' },
  { img: '518422907_676660382042921_3805100344819984993_n.heiclow.jpg', url: 'https://www.instagram.com/p/DMG3WERz7cf/', caption: 'Name: Priceless Prince Breed: ...' },
  { img: '518341276_761147032919177_7127384321489979415_n.heiclow.jpg', url: 'https://www.instagram.com/p/DMBcs7CTyNZ/', caption: 'Name: Trusty Rusty Breed: Quarter horse ...' },
  { img: '517235193_1300519121589641_5350407618324709065_n.heiclow.jpg', url: 'https://www.instagram.com/p/DL6k20CRsRm/', caption: 'Name: Reliable Redwing Breed: Quarter ...' },
  { img: '516941279_3071420133032192_5644013214854315426_n.heiclow.jpg', url: 'https://www.instagram.com/p/DL3T4imzlsq/', caption: 'Name: Majestic McDuff Breed: Clydesdale ...' },
];

function abridge(text: string, max = 48) {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max).trim()}...`;
}

export default function InstagramGrid() {
  return (
    <section className="section section--white">
      <div className="container">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Follow Us on Instagram</h2>
        <div className="instagram-grid">
          {INSTAGRAM_POSTS.map((post) => (
            <a key={post.url} href={post.url} target="_blank" rel="noopener noreferrer" className="instagram-grid__item">
              <img
                src={withBase(`/images/uploads/sb-instagram-feed-images/${post.img}`)}
                alt={abridge(post.caption)}
                loading="lazy"
              />
              <span className="instagram-grid__caption">{abridge(post.caption)}</span>
            </a>
          ))}
        </div>
        <p style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer">@hacknstay</a>
        </p>
      </div>
    </section>
  );
}
