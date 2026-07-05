import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Wrappers de navigation localisés — à utiliser pour TOUT lien interne
 * à la place de next/link et next/navigation, sinon le préfixe de locale
 * est perdu (localePrefix 'as-needed' : fr = /, autres = /en/, /ar/…).
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
