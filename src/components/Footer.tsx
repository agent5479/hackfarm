import { Link } from 'react-router-dom';
import { CONTACT, SOCIAL, withBase } from '../lib/constants';
import './Footer.css';

const LINK_GROUPS = [
  {
    title: 'Accommodation',
    links: [
      { label: 'Campground', to: '/accommodation/#camp-ground' },
      { label: 'Farmstay', to: '/accommodation/#homestead' },
      { label: 'Horse Stay', to: '/accommodation/#horse-stay' },
    ],
  },
  {
    title: 'Short Rides',
    links: [
      { label: 'Book a ride', to: '/holistic-horse-rides/#book-rides' },
      { label: 'The Hack Track', to: '/holistic-horse-rides/#short-rides' },
      { label: "Paton's Rock Beach Ride", to: '/holistic-horse-rides/#short-rides' },
      { label: 'Sunset Ride', to: '/holistic-horse-rides/#twilight-rides' },
      { label: 'Swimming with Horses', to: '/holistic-horse-rides/#other-rides' },
    ],
  },
  {
    title: 'Full Day Rides',
    links: [
      { label: 'Book a ride', to: '/holistic-horse-rides/#book-rides' },
      { label: 'The Rangi Ride', to: '/holistic-horse-rides/#full-day' },
      { label: 'Ale Trail - Mussel Inn', to: '/holistic-horse-rides/#full-day' },
      { label: 'Collingwood Explorer', to: '/holistic-horse-rides/#full-day' },
    ],
  },
  {
    title: 'Lessons',
    links: [
      { label: 'Horsemanship Lessons', to: '/learning-experiences/#horsemanship' },
      { label: 'Riding Lessons', to: '/learning-experiences/#lessons' },
      { label: 'Vaulting Lessons', to: '/learning-experiences/#vaulting' },
      { label: 'Kids Camps', to: '/special-events/' },
    ],
  },
  {
    title: 'Other',
    links: [
      { label: 'About', to: '/about/' },
      { label: 'Partner With Us', to: '/partners/' },
      { label: 'Privacy Policy', to: '/privacy-policy-2/' },
      { label: 'Sitemap', to: '/sitemap/' },
      { label: 'The Weather Now', to: '/FreshWDL/FreshWDL.html', external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link to="/">
              <img src={withBase('/images/uploads/2021/03/Hack-Farm-Logo-White.png')} alt="Hack Farm" />
            </Link>
            <p>Hack n Stay is dedicated to those who want to enjoy the simple things in life. Bring your own horse or enjoy time with one of ours in Beautiful Golden Bay.</p>
            <div className="footer__social">
              <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href={SOCIAL.tripadvisor} target="_blank" rel="noopener noreferrer">Tripadvisor</a>
              <a href={SOCIAL.messenger} target="_blank" rel="noopener noreferrer">Messenger</a>
              <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
            </div>
          </div>
          <div className="footer__links">
            {LINK_GROUPS.map((group) => (
              <div key={group.title}>
                <h4>{group.title}</h4>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.label}>
                      {'external' in link && link.external ? (
                        <a href={withBase(link.to)}>{link.label}</a>
                      ) : (
                        <Link to={link.to}>{link.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <ul className="footer__contact" style={{ listStyle: 'none', marginBottom: '1.5rem' }}>
          <li><a href={CONTACT.phoneHref}>{CONTACT.phone}</a></li>
          <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
          <li>{CONTACT.address}</li>
        </ul>
        <div className="footer__bottom">
          Copyright HackFarm 2021 | Website made by Human &amp; Horse Creative
        </div>
      </div>
    </footer>
  );
}
