import type { ReactNode } from 'react';
import { optimizedUrl } from '../lib/images';
import Breadcrumbs, { type Crumb } from './Breadcrumbs';

interface PageHeroProps {
  title: ReactNode;
  subtitle?: ReactNode;
  background?: string;
  /** When set, shows Home → … trail and emits BreadcrumbList JSON-LD. */
  breadcrumbs?: Crumb[];
}

export default function PageHero({ title, subtitle, background, breadcrumbs }: PageHeroProps) {
  if (background) {
    const hasCopy = Boolean(title || subtitle || breadcrumbs?.length);
    return (
      <div
        className="hero-banner"
        style={{ backgroundImage: `url(${optimizedUrl(background, 'content')})` }}
      >
        {hasCopy && (
          <div className="hero-banner__copy">
            {breadcrumbs && breadcrumbs.length >= 2 ? <Breadcrumbs items={breadcrumbs} /> : null}
            {title ? <h1 className="hero-banner__title">{title}</h1> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="page-hero">
      {breadcrumbs && breadcrumbs.length >= 2 ? <Breadcrumbs items={breadcrumbs} /> : null}
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  );
}
