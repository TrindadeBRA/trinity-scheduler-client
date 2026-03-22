import { useEffect } from 'react';

interface MetaTagsOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

/**
 * Hook para atualizar meta tags dinamicamente
 * Útil para SEO e compartilhamento em redes sociais
 */
export function useMetaTags(options: MetaTagsOptions) {
  useEffect(() => {
    const { title, description, image, url } = options;

    // Atualiza title
    if (title) {
      document.title = title;
    }

    // Atualiza description
    if (description) {
      updateMetaTag('name', 'description', description);
      updateMetaTag('property', 'og:description', description);
      updateMetaTag('name', 'twitter:description', description);
    }

    // Atualiza og:title e twitter:title
    if (title) {
      updateMetaTag('property', 'og:title', title);
      updateMetaTag('name', 'twitter:title', title);
    }

    // Atualiza og:image e twitter:image
    if (image) {
      updateMetaTag('property', 'og:image', image);
      updateMetaTag('name', 'twitter:image', image);
    }

    // Atualiza og:url
    if (url) {
      updateMetaTag('property', 'og:url', url);
    }
  }, [options]);
}

/**
 * Atualiza ou cria uma meta tag
 */
function updateMetaTag(attr: 'name' | 'property', attrValue: string, content: string) {
  let element = document.querySelector(`meta[${attr}="${attrValue}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, attrValue);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}
