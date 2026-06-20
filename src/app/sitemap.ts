import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.dubaiparfumerie.com';
const LOCALES = ['fr', 'en', 'es', 'de', 'it', 'ru', 'ar'];

function url(path: string, locale: string) {
  return locale === 'fr' ? `${BASE_URL}${path}` : `${BASE_URL}/${locale}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/marques', '/blog', '/promo-flash', '/faq'];
  const products = [
    '/produit/lattafa-oud-pour-elle',
    '/produit/al-haramain-amber-oud',
    '/produit/reef-opulent-blue',
    '/produit/armaf-club-de-nuit',
    '/produit/swiss-arabian-shaghaf',
    '/produit/ahmed-al-maghribi-lor',
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const page of pages) {
      entries.push({ url: url(page, locale), lastModified: new Date(), changeFrequency: 'weekly', priority: page === '' ? 1 : 0.8 });
    }
    for (const product of products) {
      entries.push({ url: url(product, locale), lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 });
    }
  }

  return entries;
}
