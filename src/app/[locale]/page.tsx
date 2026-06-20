import type { Metadata } from 'next';
import HomePageClient from './_home-client';

export async function generateMetadata({ params }: { params: Promise<{locale: string}> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Dubaï Parfumerie — Parfums Orientaux Authentiques | Oud, Musc, Ambre',
    description: 'Découvrez 300+ parfums orientaux authentiques de Dubaï et du Golfe. Lattafa, Reef, Al Haramain, Armaf. Livraison offerte dès 60€.',
    keywords: 'parfum dubai, oud, musc, ambre, lattafa, reef, al haramain, parfum oriental, attar, parfumerie',
    alternates: {
      canonical: locale === 'fr' ? 'https://www.dubaiparfumerie.com' : `https://www.dubaiparfumerie.com/${locale}`,
      languages: {
        'fr': 'https://www.dubaiparfumerie.com',
        'en': 'https://www.dubaiparfumerie.com/en',
        'es': 'https://www.dubaiparfumerie.com/es',
        'de': 'https://www.dubaiparfumerie.com/de',
        'it': 'https://www.dubaiparfumerie.com/it',
        'ru': 'https://www.dubaiparfumerie.com/ru',
        'ar': 'https://www.dubaiparfumerie.com/ar',
      }
    },
    openGraph: {
      title: 'Dubaï Parfumerie — Parfums Orientaux Authentiques',
      description: 'Oud, musc, ambre, attar. 300+ références authentiques sourcées directement au Golfe.',
      url: locale === 'fr' ? 'https://www.dubaiparfumerie.com' : `https://www.dubaiparfumerie.com/${locale}`,
      siteName: 'Dubaï Parfumerie',
      images: [{ url: '/assets/hero.jpg', width: 1200, height: 630, alt: 'Dubaï Parfumerie' }],
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'ar' ? 'ar_AE' : `${locale}_${locale.toUpperCase()}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Dubaï Parfumerie — Parfums Orientaux Authentiques',
      description: 'Oud, musc, ambre, attar. 300+ références du Golfe.',
      images: ['/assets/hero.jpg'],
    },
  };
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Dubaï Parfumerie",
            "url": "https://www.dubaiparfumerie.com",
            "logo": "https://www.dubaiparfumerie.com/assets/logo.png",
            "description": "Spécialiste des parfums orientaux authentiques de Dubaï et du Golfe",
            "address": { "@type": "PostalAddress", "addressCountry": "FR" },
            "contactPoint": { "@type": "ContactPoint", "contactType": "customer service", "availableLanguage": ["French", "English", "Arabic"] },
            "sameAs": ["https://www.instagram.com/dubaiparfumerie", "https://www.tiktok.com/@dubaiparfumerie"]
          })
        }}
      />
      <HomePageClient />
    </>
  );
}
