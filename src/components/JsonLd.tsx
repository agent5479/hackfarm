import { CONTACT, SOCIAL } from '../lib/constants';
import { PATONS_ROCK } from '../booking/location';
import {
  absoluteAssetUrl,
  absoluteUrl,
  DEFAULT_OG_IMAGE,
  SITE_ALT_NAME,
  SITE_NAME,
} from '../seo/site';

interface JsonLdProps {
  data?: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLd({ data }: JsonLdProps) {
  const payloads = data == null ? [buildDefaultGraph()] : Array.isArray(data) ? data : [data];
  return (
    <>
      {payloads.map((payload, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
        />
      ))}
    </>
  );
}

function buildDefaultGraph() {
  const siteUrl = absoluteUrl('/');
  const logo = absoluteAssetUrl('/images/uploads/2021/02/HackFarm-Logo-Light.png');
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
        '@type': 'Organization',
        '@id': `${siteUrl}#organization`,
        name: SITE_NAME,
        alternateName: SITE_ALT_NAME,
        legalName: 'Hack n Stay Golden Bay',
        url: siteUrl,
        logo,
        image: absoluteAssetUrl(DEFAULT_OG_IMAGE),
        email: CONTACT.email,
        telephone: CONTACT.phone,
        address,
        sameAs,
      },
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
        image: absoluteAssetUrl(DEFAULT_OG_IMAGE),
        logo,
        parentOrganization: { '@id': `${siteUrl}#organization` },
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
        publisher: { '@id': `${siteUrl}#organization` },
        inLanguage: 'en-NZ',
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${siteUrl}#freshwdl`,
        name: 'Hack Farm FreshWDL Weather Station',
        applicationCategory: 'WeatherApplication',
        operatingSystem: 'Web',
        url: absoluteUrl('/FreshWDL/FreshWDL.html'),
        description:
          'On-site FreshWDL weather station readings from Hack Farm near Paton\'s Rock, Golden Bay.',
        provider: { '@id': `${siteUrl}#organization` },
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

export function faqPageJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function howToJsonLd(
  name: string,
  description: string,
  steps: { name: string; text: string }[],
  path?: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    ...(path ? { url: absoluteUrl(path) } : {}),
    step: steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function personJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  jobTitle?: string;
  image?: string;
}) {
  const siteUrl = absoluteUrl('/');
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: opts.name,
    description: opts.description,
    jobTitle: opts.jobTitle || 'Founder',
    url: absoluteUrl(opts.path),
    worksFor: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: siteUrl,
    },
    ...(opts.image ? { image: absoluteAssetUrl(opts.image) } : {}),
  };
}

export function softwareApplicationJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  applicationCategory?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: opts.name,
    description: opts.description,
    applicationCategory: opts.applicationCategory || 'TravelApplication',
    operatingSystem: 'Web',
    url: absoluteUrl(opts.path),
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: absoluteUrl('/'),
    },
  };
}
