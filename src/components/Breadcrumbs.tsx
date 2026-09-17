import { Link } from 'react-router-dom';
import { JsonLd, breadcrumbJsonLd } from './JsonLd';
import './Breadcrumbs.css';

export type Crumb = { name: string; path: string };

interface BreadcrumbsProps {
  items: Crumb[];
}

/** Visible trail + matching BreadcrumbList JSON-LD. Last item is the current page. */
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length < 2) return null;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(items)} />
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol className="breadcrumbs__list">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={`${item.path}-${item.name}`} className="breadcrumbs__item">
                {isLast ? (
                  <span aria-current="page">{item.name}</span>
                ) : (
                  <Link to={item.path}>{item.name}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
