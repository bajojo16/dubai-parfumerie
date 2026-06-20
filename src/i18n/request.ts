import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

import fr from '../messages/fr.json';
import en from '../messages/en.json';
import es from '../messages/es.json';
import de from '../messages/de.json';
import it from '../messages/it.json';
import ru from '../messages/ru.json';
import ar from '../messages/ar.json';

const messages = { fr, en, es, de, it, ru, ar } as const;

type Locale = keyof typeof messages;

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: messages[locale as Locale],
  };
});
