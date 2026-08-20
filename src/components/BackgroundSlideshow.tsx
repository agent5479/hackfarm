import { useEffect, useRef, useState } from 'react';
import { optimizedUrl } from '../lib/images';

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
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '200px 0px', threshold: 0.01 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || images.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [images.length, intervalMs, inView]);

  const nextIndex = images.length > 1 ? (index + 1) % images.length : index;

  return (
    <div ref={rootRef} className={`photo-stratum ${className}`}>
      {images.map((src, i) => {
        const shouldLoad = inView && (i === index || i === nextIndex);
        return (
          <div
            key={src}
            className={`photo-stratum__slide${i === index ? ' photo-stratum__slide--active' : ''}`}
            style={shouldLoad ? { backgroundImage: `url(${optimizedUrl(src, 'content')})` } : undefined}
          />
        );
      })}
    </div>
  );
}
