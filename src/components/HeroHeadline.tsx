import { useEffect, useMemo, useState } from 'react';
import { withBase } from '../lib/constants';

const KEY_PHRASES = ['Stay', 'Play', 'Vault', 'Horsemanship', 'Holiday'] as const;

export default function HeroHeadline() {
  const [idx, setIdx] = useState(0);

  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    // Elementor starts animation after a delay and then rotates.
    const startDelayMs = 2000;
    const intervalMs = 2500;

    const timeoutId = window.setTimeout(() => {
      const id = window.setInterval(() => {
        setIdx((i) => (i + 1) % KEY_PHRASES.length);
      }, intervalMs);

      // eslint-disable-next-line consistent-return
      return () => window.clearInterval(id);
    }, startDelayMs);

    return () => window.clearTimeout(timeoutId);
  }, [reducedMotion]);

  const activeWord = KEY_PHRASES[idx] ?? KEY_PHRASES[0];

  return (
    <div className="home-hero__content">
      <div className="hero-rotator" aria-label="Hack 'n Stay animated headline">
        <span className="hero-rotator__static">Hack 'n</span>
        <span key={activeWord} className="hero-rotator__word hero-rotator__word--animate">
          {activeWord}
        </span>
      </div>

      <a
        className="hero-travelers"
        href="https://www.tripadvisor.co.nz/Hotel_Review-g675007-d6914762-Reviews-Hack_and_Stay_Horse_Backpacker_and_Farm_Stay-Takaka_Golden_Bay_Nelson_Tasman_Region_South_Island.html?m=19905"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          className="home-hero__badge"
          src={withBase('/images/uploads/2021/06/TC_2021_L_TRANSPARENT_BG_RGB-01.png')}
          alt="TripAdvisor Travellers Choice 2021"
        />
      </a>
    </div>
  );
}

