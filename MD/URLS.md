# URLs des pages — Dubaï Parfumerie

Généré le 29/08/2026 · 39 pages.

Le serveur écoute sur **toutes** les interfaces : `localhost` depuis le Mac,
`192.168.1.1` depuis un téléphone du même réseau. Remplacer l'hôte suffit.

- Mac : `http://localhost:3003`
- Téléphone : `http://192.168.1.1:3003`

Les routes entre crochets sont dynamiques ; l'URL donnée utilise un exemple réel.
Les sept langues sont servies par la même route : `/en/...`, `/ar/...`, etc.
Le français n'a pas de préfixe (`localePrefix: 'as-needed'`).

## Pages du site (16)

| Page | Route | URL |
|------|-------|-----|
| À propos | `/a-propos` | [http://localhost:3003/a-propos](http://localhost:3003/a-propos) |
| Article de journal | `/blog/[slug]` | [http://localhost:3003/blog/lattafa-khamrah](http://localhost:3003/blog/lattafa-khamrah) *(exemple)* |
| Journal | `/blog` | [http://localhost:3003/blog](http://localhost:3003/blog) |
| Commande à la demande | `/commande-a-la-demande` | [http://localhost:3003/commande-a-la-demande](http://localhost:3003/commande-a-la-demande) |
| FAQ | `/faq` | [http://localhost:3003/faq](http://localhost:3003/faq) |
| Huiles de parfum | `/huile-de-parfum` | [http://localhost:3003/huile-de-parfum](http://localhost:3003/huile-de-parfum) |
| Livraison & retours | `/livraison` | [http://localhost:3003/livraison](http://localhost:3003/livraison) |
| Les maisons | `/marques` | [http://localhost:3003/marques](http://localhost:3003/marques) |
| Maison Reef | `/marques/reef` | [http://localhost:3003/marques/reef](http://localhost:3003/marques/reef) |
| Offre 3 pour 2 | `/offres/lot-3-pour-2` | [http://localhost:3003/offres/lot-3-pour-2](http://localhost:3003/offres/lot-3-pour-2) |
| Accueil | `/` | [http://localhost:3003/](http://localhost:3003/) |
| Parfums femme | `/parfums-femme` | [http://localhost:3003/parfums-femme](http://localhost:3003/parfums-femme) |
| Parfums homme | `/parfums-homme` | [http://localhost:3003/parfums-homme](http://localhost:3003/parfums-homme) |
| Fiche produit | `/produit/[slug]` | [http://localhost:3003/produit/lattafa-khamrah](http://localhost:3003/produit/lattafa-khamrah) *(exemple)* |
| Bons plans | `/promo-flash` | [http://localhost:3003/promo-flash](http://localhost:3003/promo-flash) |
| Suivi de commande | `/suivi-commande` | [http://localhost:3003/suivi-commande](http://localhost:3003/suivi-commande) |

## Pages d'aperçu (23)

Maquettes de travail, hors navigation.

| Page | Route | URL |
|------|-------|-----|
| [handle] | `/preview/selecteur-echantillons/[handle]` | [http://localhost:3003/preview/selecteur-echantillons/lattafa-khamrah](http://localhost:3003/preview/selecteur-echantillons/lattafa-khamrah) *(exemple)* |
| Selecteur echantillons | `/preview/selecteur-echantillons` | [http://localhost:3003/preview/selecteur-echantillons](http://localhost:3003/preview/selecteur-echantillons) |
| Authenticite textes | `/preview-authenticite-textes` | [http://localhost:3003/preview-authenticite-textes](http://localhost:3003/preview-authenticite-textes) |
| Bestsellers | `/preview-bestsellers` | [http://localhost:3003/preview-bestsellers](http://localhost:3003/preview-bestsellers) |
| Bestsellers right | `/preview-bestsellers-right` | [http://localhost:3003/preview-bestsellers-right](http://localhost:3003/preview-bestsellers-right) |
| Brand | `/preview-brand` | [http://localhost:3003/preview-brand](http://localhost:3003/preview-brand) |
| Card | `/preview-card` | [http://localhost:3003/preview-card](http://localhost:3003/preview-card) |
| Category rail | `/preview-category-rail` | [http://localhost:3003/preview-category-rail](http://localhost:3003/preview-category-rail) |
| Faq | `/preview-faq` | [http://localhost:3003/preview-faq](http://localhost:3003/preview-faq) |
| Fragrance finder | `/preview-fragrance-finder` | [http://localhost:3003/preview-fragrance-finder](http://localhost:3003/preview-fragrance-finder) |
| Journal | `/preview-journal` | [http://localhost:3003/preview-journal](http://localhost:3003/preview-journal) |
| Newsletter | `/preview-newsletter` | [http://localhost:3003/preview-newsletter](http://localhost:3003/preview-newsletter) |
| Oils | `/preview-oils` | [http://localhost:3003/preview-oils](http://localhost:3003/preview-oils) |
| Packs | `/preview-packs` | [http://localhost:3003/preview-packs](http://localhost:3003/preview-packs) |
| Roue | `/preview-roue` | [http://localhost:3003/preview-roue](http://localhost:3003/preview-roue) |
| Roue2 | `/preview-roue2` | [http://localhost:3003/preview-roue2](http://localhost:3003/preview-roue2) |
| Shipping | `/preview-shipping` | [http://localhost:3003/preview-shipping](http://localhost:3003/preview-shipping) |
| Shoppable | `/preview-shoppable` | [http://localhost:3003/preview-shoppable](http://localhost:3003/preview-shoppable) |
| Stories | `/preview-stories` | [http://localhost:3003/preview-stories](http://localhost:3003/preview-stories) |
| Trends | `/preview-trends` | [http://localhost:3003/preview-trends](http://localhost:3003/preview-trends) |
| Twin | `/preview-twin` | [http://localhost:3003/preview-twin](http://localhost:3003/preview-twin) |
| Twin compact | `/preview-twin-compact` | [http://localhost:3003/preview-twin-compact](http://localhost:3003/preview-twin-compact) |
| Welcome | `/preview-welcome` | [http://localhost:3003/preview-welcome](http://localhost:3003/preview-welcome) |

## API

| Route | Usage |
|-------|-------|
| `/api/quiz` | Quiz signature — recommandation |
| `/api/chat` | Assistant conversationnel |
| `/api/search-audio` | Recherche vocale |
| `/api/search-image` | Recherche par image |
