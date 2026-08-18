import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { withBase } from '../lib/constants';
import './Header.css';

const NAV = [
  {
    label: 'Stay',
    to: '/accommodation/',
    children: [
      { label: 'Farmstay', to: '/accommodation/#homestead' },
      { label: 'Camping', to: '/accommodation/#camp-ground' },
      { label: 'Horse Stay', to: '/accommodation/#horse-stay' },
    ],
  },
  {
    label: 'Ride',
    to: '/holistic-horse-rides/',
    children: [
      { label: 'Short Rides', to: '/holistic-horse-rides/#short-rides' },
      { label: 'Full Day Rides', to: '/holistic-horse-rides/#full-day' },
      { label: 'Multiday Experiences', to: '/holistic-horse-rides/#multi-day' },
      { label: 'Interactive Trail Map', to: '/hack-farm-trails/' },
      { label: 'Gift Voucher', to: '/horse-riding-holiday-gift-vouchers/' },
    ],
  },
  { label: 'Our Horses', to: '/our-horses/' },
  {
    label: 'Learn',
    to: '/learning-experiences/',
    children: [
      { label: 'Riding Lessons', to: '/learning-experiences/#lessons' },
      { label: 'Horsemanship', to: '/learning-experiences/#horsemanship' },
      { label: 'Vaulting', to: '/learning-experiences/#vaulting' },
      { label: 'Kids Camps', to: '/special-events/' },
    ],
  },
  { label: 'Vaulting Team', to: '/vaulting/' },
  { label: 'Gift Voucher', to: '/horse-riding-holiday-gift-vouchers/' },
  { label: 'Weather Station', to: '/FreshWDL/FreshWDL.html' },
  { label: 'Contact', to: '/contact/' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const woodNav = scrolled || !isHome;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const wood = { ['--header-wood' as string]: `url(${withBase('/images/uploads/2021/03/Wooden-Header-small.jpg')})` };

  return (
    <header className={`header${woodNav ? ' header--wood-nav' : ''}`} style={wood}>
      <div className="header__brand">
        <Link to="/" className="header__logo">
          <img src={withBase('/images/uploads/2021/02/HackFarm-Logo-Light.png')} alt="Hack Farm" />
        </Link>
      </div>
      <nav className={`header__nav${open ? ' header__nav--open' : ''}`}>
        <button className="header__toggle" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
          ☰
        </button>
        <div className="header__links">
          {NAV.map((item) =>
            item.children ? (
              <div key={item.label} className="header__nav-item">
                <Link to={item.to} onClick={() => setOpen(false)}>{item.label}</Link>
                <div className="header__dropdown">
                  {item.children.map((child) => (
                    <Link key={child.label} to={child.to} onClick={() => setOpen(false)}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              item.to.startsWith('/FreshWDL') ? (
                <a key={item.label} href={withBase(item.to)}>{item.label}</a>
              ) : (
                <Link key={item.label} to={item.to} onClick={() => setOpen(false)}>{item.label}</Link>
              )
            )
          )}
        </div>
      </nav>
    </header>
  );
}
