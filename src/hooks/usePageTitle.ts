import { useEffect } from 'react';
import {
  absoluteAssetUrl,
  absoluteUrl,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
} from '../seo/site';
import { formatDocumentTitle } from '../seo/routes';

export interface PageMetaInput {
  title: string;
  description?: string;
  path: string;
  image?: string;
}

function ensureMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function ensureLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function usePageMeta({ title, description, path, image }: PageMetaInput) {
  useEffect(() => {
    const fullTitle = formatDocumentTitle(title);
    const desc = description || DEFAULT_DESCRIPTION;
    const url = absoluteUrl(path);
    const img = absoluteAssetUrl(image || DEFAULT_OG_IMAGE);

    document.title = fullTitle;
    ensureMeta('name', 'description', desc);
    ensureLink('canonical', url);

    ensureMeta('property', 'og:title', fullTitle);
    ensureMeta('property', 'og:description', desc);
    ensureMeta('property', 'og:url', url);
    ensureMeta('property', 'og:image', img);
    ensureMeta('property', 'og:type', 'website');
    ensureMeta('property', 'og:site_name', 'Hack n Stay Golden Bay');

    ensureMeta('name', 'twitter:card', 'summary_large_image');
    ensureMeta('name', 'twitter:title', fullTitle);
    ensureMeta('name', 'twitter:description', desc);
    ensureMeta('name', 'twitter:image', img);
  }, [title, description, path, image]);
}

export function useFareHarborCart(backUrl?: string) {
  useEffect(() => {
    const existing = document.getElementById('fareharbor-cart');
    if (existing) return;

    const iframe = document.createElement('iframe');
    iframe.id = 'fareharbor-cart';
    iframe.src = `https://fareharbor.com/embeds/cart/?u=ff5d693b-0d79-4cd7-83ce-d3c61d45cc32&from-ssl=yes&g4=no&cp=no&csp=no&back=${encodeURIComponent(backUrl || window.location.href)}`;
    iframe.style.cssText = 'position:fixed;bottom:0;right:0;width:0;height:0;border:none;z-index:9999;';
    document.body.appendChild(iframe);

    return () => { iframe.remove(); };
  }, [backUrl]);
}
