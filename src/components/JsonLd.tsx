import { CONTACT, SOCIAL } from '../lib/constants';
import { PATONS_ROCK } from '../booking/location';
import {
  absoluteUrl,
  SITE_ALT_NAME,
  SITE_NAME,
} from '../seo/site';

interface JsonLdProps {
  data?: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLd({ data }: JsonLdProps) {
  const payload = data ?? buildDefaultGraph();
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

function buildDefaultGraph() {
  const siteUrl = absoluteUrl('/');
  const address = {
    '@type': 'PostalAddress',
    streetAddress: '22 Grant Road, Puramahoi',
    addressLocality: 'Takaka',
    postalCode: '7182',
    addressRegion: 'Golden Bay, Nelson Tasman',
    addressCountry: 'NZ',
  };
  const geo = {
    '@type': 'GeoCoordinates',
    latitude: PATONS_ROCK.lat,
    longitude: PATONS_ROCK.lon,
  };
  const sameAs = [SOCIAL.facebook, SOCIAL.instagram, SOCIAL.tripadvisor, SOCIAL.messenger];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LodgingBusiness',
        '@id': `${siteUrl}#lodging`,
        name: SITE_NAME,
        alternateName: SITE_ALT_NAME,
        url: siteUrl,
        email: CONTACT.email,
        telephone: CONTACT.phone,
        address,
        geo,
        sameAs,
        image: absoluteUrl('images/uploads/2021/02/IMG_6067-scaled.jpg'),
        description:
          'Eco farmstay, animal-friendly campground, and holistic horse experiences near Paton\'s Rock, Golden Bay, New Zealand.',
      },
      {
        '@type': 'TouristAttraction',
        '@id': `${siteUrl}#attraction`,
        name: SITE_NAME,
        alternateName: SITE_ALT_NAME,
        url: siteUrl,
        telephone: CONTACT.phone,
        address,
        geo,
        sameAs,
        touristType: ['Horse riding', 'Farmstay', 'Family'],
        description:
          'Beach and trail horse rides, vaulting, and farmstay accommodation at Hack Farm near Paton\'s Rock.',
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}#website`,
        url: siteUrl,
        name: SITE_NAME,
        publisher: { '@id': `${siteUrl}#lodging` },
        inLanguage: 'en-NZ',
      },
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function serviceJsonLd(name: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'LodgingBusiness',
      name: SITE_NAME,
      url: absoluteUrl('/'),
    },
    areaServed: {
      '@type': 'Place',
      name: PATONS_ROCK.label,
    },
    url: absoluteUrl(path),
  };
}
