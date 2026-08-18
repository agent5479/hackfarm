import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title.includes('Hack n Stay') ? title : `${title} | Hack n Stay Golden Bay`;
  }, [title]);
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
