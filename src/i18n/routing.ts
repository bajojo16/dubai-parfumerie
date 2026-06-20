import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en', 'es', 'de', 'it', 'ru', 'ar'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed', // FR has no prefix (/), others have (/en/, /ar/, etc.)
});
