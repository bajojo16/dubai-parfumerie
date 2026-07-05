import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  images: {
    // AVIF retiré : certaines versions de Safari iOS échouent à décoder les
    // AVIF générés par sharp pour les grandes images (fill / pleine largeur)
    // et affichent un rectangle noir/vide, alors que les mêmes fichiers en
    // petite taille (vignettes) décodent correctement. WebP est fiable
    // partout (Safari 14+) et couvre les mêmes gains de poids.
    formats: ['image/webp'] as const,
  },
};

export default withNextIntl(nextConfig);
