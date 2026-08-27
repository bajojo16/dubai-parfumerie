import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getMessages } from 'next-intl/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppBubble } from '@/components/ui/WhatsAppBubble';
import { FragranceFinderButton } from '@/components/fragrance-finder/FragranceFinderButton';
import { ViewportSwitcher } from '@/components/dev/ViewportSwitcher';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = await getMessages();
  const isRTL = locale === 'ar';

  return (
    <NextIntlClientProvider messages={messages}>
      {/* `dp-viewport-frame` : cible du ViewportSwitcher (outil de maquette,
          dev only). Sans lui la classe est inerte — aucun style par défaut. */}
      <div className="dp-viewport-frame" dir={isRTL ? 'rtl' : 'ltr'} lang={locale}>
        <Header />
        <main>{children}</main>
        <Footer />
        <FragranceFinderButton locale={locale} />
        <WhatsAppBubble />
      </div>
      {/* Hors du cadre : la barre pilote la contrainte, elle ne doit pas la subir. */}
      <ViewportSwitcher />
    </NextIntlClientProvider>
  );
}
