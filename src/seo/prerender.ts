/** True only when Playwright sets window.__SEO_PRERENDER__ during static HTML bake. */
export function isSeoPrerender(): boolean {
  return (
    typeof window !== 'undefined' &&
    Boolean((window as Window & { __SEO_PRERENDER__?: boolean }).__SEO_PRERENDER__)
  );
}
