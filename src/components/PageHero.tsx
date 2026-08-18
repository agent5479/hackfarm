interface PageHeroProps {
  title: string;
  subtitle?: string;
  background?: string;
}

export default function PageHero({ title, subtitle, background }: PageHeroProps) {
  if (background) {
    return (
      <div className="hero-banner" style={{ backgroundImage: `url(${background})` }}>
        <div className="hero-banner__overlay">
          <h1 className="hero-banner__title">{title}</h1>
          {subtitle && <p style={{ color: 'var(--color-secondary)', fontSize: '1.1rem' }}>{subtitle}</p>}
        </div>
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
