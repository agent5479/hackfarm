import { optimizedUrl } from '../lib/images';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  background?: string;
}

export default function PageHero({ title, subtitle, background }: PageHeroProps) {
  if (background) {
    const hasCopy = Boolean(title || subtitle);
    return (
      <div
        className="hero-banner"
        style={{ backgroundImage: `url(${optimizedUrl(background, 'content')})` }}
      >
        {hasCopy && (
          <div className="hero-banner__copy">
            {title && <h1 className="hero-banner__title">{title}</h1>}
            {subtitle && <p>{subtitle}</p>}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="page-hero">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
