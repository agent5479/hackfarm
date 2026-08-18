import { useEffect, useState } from 'react';
import { withBase } from '../lib/constants';

interface BackgroundSlideshowProps {
  images: string[];
  intervalMs?: number;
  className?: string;
}

export default function BackgroundSlideshow({
  images,
  intervalMs = 6000,
  className = '',
}: BackgroundSlideshowProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [images.length, intervalMs]);

  return (
    <div className={`photo-stratum ${className}`}>
      {images.map((src, i) => (
        <div
          key={src}
          className={`photo-stratum__slide${i === index ? ' photo-stratum__slide--active' : ''}`}
          style={{ backgroundImage: `url(${withBase(src)})` }}
        />
      ))}
    </div>
  );
}
