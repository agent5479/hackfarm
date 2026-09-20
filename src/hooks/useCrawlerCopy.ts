import { useMemo } from 'react';
import { getPageSeo, type SeoRoute } from '../seo/routes';
import { isSeoPrerender } from '../seo/prerender';

/**
 * During Playwright prerender, return crawler h1/intro from routes.json.
 * For real visitors (and Googlebot with JS), return the guest brand copy.
 */
export function useCrawlerCopy(
  path: string,
  guest: { title: string; subtitle?: string },
): { title: string; subtitle?: string; seo: SeoRoute | undefined; isPrerender: boolean } {
  const seo = getPageSeo(path);
  const isPrerender = isSeoPrerender();

  return useMemo(() => {
    if (isPrerender && seo?.h1) {
      return {
        title: seo.h1,
        subtitle: seo.intro ?? guest.subtitle,
        seo,
        isPrerender: true,
      };
    }
    return {
      title: guest.title,
      subtitle: guest.subtitle,
      seo,
      isPrerender: false,
    };
  }, [isPrerender, seo, guest.title, guest.subtitle]);
}
