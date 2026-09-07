# Audit complet du site — Dubaï Parfumerie (maquette Next.js 16)

**Date** : 7 septembre 2026 · **Périmètre** : dépôt `app/` (Next.js 16.2.9, React 19.2, next-intl 4.13), serveur de développement `http://localhost:3003` · **Mode** : audit seul, aucun fichier de code modifié (livrables dans `MD/` uniquement).

**Méthode** : lecture du code source (fichier:ligne cités), HTML rendu de 30 routes (`curl`), 28 mesures Playwright/Chromium (14 routes × 2 viewports : 1280 px et 390 px), scripts d'analyse des jeux de données (`dp-catalogue.json`, `dp-boutique.json`, `dp-dupes.json`, `dp-fiches-site.json`, `dp-corrections-prix.json`), exécution de `search-catalog.ts` via `tsx`, `tsc --noEmit`.

**Convention de lecture** : chaque constat est suivi de sa preuve. Les recommandations sont classées **[M]** « à corriger dans la maquette » (visible en démo, ou structurant) et **[P]** « à prévoir pour la mise en production ». Priorité = impact × effort : **P1** (fort impact, effort faible/moyen), **P2** (fort impact, effort élevé, ou impact moyen, effort faible), **P3** (le reste).

**Limites** : le serveur audité tourne en mode développement (Turbopack) sur la machine locale — poids JavaScript et temps de chargement sont surévalués d'un facteur 5 à 10 par rapport à un build de production et ne sont donnés qu'à titre d'ordre de grandeur. Aucune mesure de trafic réel (pas d'analytics), aucun test utilisateur, aucun accès à dubaiparfumerie.com en production pour comparer les contenus.

---

## Sommaire

1. Résumé exécutif
2. SEO technique
3. SEO contenu
4. GEO — Generative Engine Optimization
5. CRO — parcours d'achat et conversion
6. Confiance & juridique e-commerce (France/UE)
7. Accessibilité
8. Internationalisation
9. Analytics & mesure
10. Données produit
11. Feuille de route 30 / 60 / 90 jours
12. Annexes (mesures brutes, tableau des routes)

---

## 1. Résumé exécutif

Le site est une maquette de direction artistique très avancée : 448 fiches produit servies, un moteur de recherche client, un module « jumeau olfactif » adossé à une table de 105 correspondances sourcées, un sélecteur d'échantillons, une commande à la demande branchée sur WhatsApp. En revanche, **rien n'est vendable en l'état** et plusieurs choix de maquette produiraient, en production, des signaux trompeurs pour Google et pour la DGCCRF.

Les cinq chantiers qui comptent :

1. **Données structurées mensongères sur 448 pages** — `availability: InStock` codé en dur (`src/app/[locale]/produit/[slug]/page.tsx:173`) alors que 114 produits (25 %) sont indisponibles ; `AggregateRating` calculé à partir d'un score de popularité (`src/data/product-resolve.ts:47-52`) : 312 pages affichent « 4,4 · 132 avis » et 96 pages « 4,5 · 160 avis » sans aucun avis réel ; les 3 mêmes témoignages clients sont répétés sur toutes les fiches (`page.tsx:49-74`). En production : pénalité rich results + pratique commerciale trompeuse.
2. **Parcours d'achat factice et incohérent** — le bouton « Ajouter au panier » de la fiche n'écrit rien dans le panier (`AddToCart.tsx:15-18`) alors que les cartes catalogue/promo y écrivent ; « Passer commande » n'a aucun gestionnaire (`Header.tsx:476-492`) ; `/panier` et `/checkout` renvoient 404 ; codes promo acceptés par préfixe (`PromoChecker.tsx:30`) ; suivi de commande à dates codées en dur. 18 des 27 liens du pied de page mènent à un 404, dont les 5 pages légales.
3. **SEO technique non prêt** — `<html>` sans attribut `lang` (`src/app/layout.tsx:34`), sitemap limité à 6 produits sur 448 (1,3 %, `src/app/sitemap.ts:12-19`), 154 URL de prévisualisation indexables (22 routes `preview-*` × 7 locales, aucun `noindex`), canonical/hreflang présents sur 2 pages sur 16, titres dédoublés « | Dubaï Parfumerie | Dubaï Parfumerie » sur toutes les fiches, 3 pages clés sans `<h1>` (accueil, FAQ, promo-flash).
4. **Contenu dupliqué de la boutique actuelle** — 408 des 448 fiches (91 %) reprennent mot pour mot la description publiée sur dubaiparfumerie.com (`boutique-to-search.ts:81`, `catalogue-to-search.ts:175`) ; 317 fiches (71 %) n'ont aucune note olfactive ; 12 paires « X » / « X 50ml » forment des pages quasi identiques. Tant que l'ancien site est en ligne, la nouvelle version part perdante sur son propre contenu.
5. **Accessibilité et contraste** — la couleur d'accent `--gold-500 #C8901E` affiche 2,72:1 à 2,81:1 sur les fonds clairs (seuil AA : 4,5:1) et sert aux prix, CTA et liens « Bons Plans » ; 179 nœuds de texte sous le seuil AA sur la page d'accueil, 196 cibles cliquables de moins de 44 px sur mobile, 8 liens sociaux sans nom accessible sur chaque page, 7 à 11 champs de formulaire sans étiquette.

Ce qui est solide et à préserver : l'architecture des données en trois couches avec règle « rien n'est déduit » (`dp-catalogue.ts:10-14`), la table des dupes sourcée (actif GEO majeur), la FAQ en `FAQPage` JSON-LD, `focus-visible` global, `prefers-reduced-motion` respecté dans 10 composants, images WebP via `next/image` (40 usages), aucun débordement horizontal à 390 px, la commande à la demande qui compose un vrai message WhatsApp.

---

## 2. SEO technique

### 2.1 Métadonnées par page

Relevé sur le HTML rendu (`curl`), 16 pages publiques + 3 variantes de locale.

| Page | `<title>` | Description propre | Canonical | hreflang (7) | OG | `<h1>` |
|---|---|---|---|---|---|---|
| `/` | « Dubaï Parfumerie — Parfums Orientaux Authentiques \| Oud, Musc, Ambre \| Dubaï Parfumerie » (dédoublé) | oui | oui | oui | 10 balises | **0** |
| `/catalogue` | « Tous les parfums \| Dubaï Parfumerie » | oui | non | non | 0 | 1 |
| `/produit/lattafa-khamrah` | « Khamrah — Lattafa \| Dubaï Parfumerie \| Dubaï Parfumerie » (dédoublé) | tronquée à 150 car. au milieu d'un mot | non | non | 4 | 1 |
| `/produit/ne-emah-laya` | idem, dédoublé | idem | non | non | 4 | 1 |
| `/marques` | titre par défaut du layout | description par défaut | non | non | 0 | 1 |
| `/promo-flash` | par défaut | par défaut | non | non | 0 | **0** |
| `/offres/lot-3-pour-2` | par défaut | par défaut | non | non | 0 | 1 |
| `/commande-a-la-demande` | propre | propre | oui | oui | 5 | 1 |
| `/huile-de-parfum` | propre | propre | non | non | 0 | 1 |
| `/parfums-femme` | propre | propre | non | non | 0 | 1 |
| `/preview/selecteur-echantillons` | par défaut | par défaut | non | non | 0 | 1 |
| `/blog` | par défaut | par défaut | non | non | 0 | 1 |
| `/faq` | par défaut | par défaut | non | non | 0 | **0** |
| `/livraison`, `/a-propos`, `/mur-des-eloges` | propres | propres | non | non | 0 | 1 |
| `/lots`, `/suivi-commande` | par défaut | par défaut | non | non | 0 | 1 |

Constats :

- **8 pages sur 16 retombent sur le titre/description par défaut** de `src/app/layout.tsx:21-22` (« Dubaï Parfumerie — Parfums Orientaux Authentiques » / « …300+ références authentiques »). Pour Google, 8 pages avec le même titre = 8 candidates à la cannibalisation.
- **Titre dédoublé** : le template `%s | Dubaï Parfumerie` (`layout.tsx:21`) s'applique à des titres qui contiennent déjà le suffixe (`page.tsx:7` accueil, `produit/[slug]/page.tsx:37`). Résultat visible dans l'onglet : « … | Dubaï Parfumerie | Dubaï Parfumerie ».
- **Canonical et hreflang : 2 pages sur 16** (`page.tsx:10-21` et `commande-a-la-demande/page.tsx:51-59`). Les 446 autres fiches produit et 13 pages n'en ont pas ; en 7 locales cela fait ~3 200 URL sans déclaration d'équivalence linguistique — Google devra deviner, et choisira souvent la version FR.
- **`<html lang>` absent** : `src/app/layout.tsx:34` rend `<html className=…>` sans `lang` ; la langue n'est posée que sur un `<div lang=… dir=…>` interne (`[locale]/layout.tsx:28`). Les moteurs et lecteurs d'écran lisent l'attribut de `<html>`.
- **Description produit** : `Achetez ${name} de ${brand}. ${description.slice(0,150)}` (`produit/[slug]/page.tsx:38`) coupe au milieu d'un mot (« …a fait basculer Lattafa » sur Khamrah). Pas de longueur cible, pas de prix ni de contenance dans la description.
- **OG image** : correcte — `metadataBase` (`layout.tsx:23`) résout l'URL, le HTML rendu porte `og:image="https://www.dubaiparfumerie.com/assets/products/khamrah/khamrah-hf-05.jpg"`. En revanche `og:type: website` sur une fiche (`page.tsx:42`) au lieu de `product`, et le JSON-LD garde l'URL relative (§ 2.3).
- **`keywords`** meta encore émise (`page.tsx:9`) — sans effet, à retirer.

### 2.2 Sitemap et robots

- `src/app/sitemap.ts:11-19` : 5 pages + **6 produits codés en dur**, × 7 locales = **77 URL**. Le site sert **448 fiches** (`allProductSlugs()`, mesuré via `tsx`) : **1,3 % du catalogue est déclaré**. Les 6 slugs codés en dur pointent tous sur des fiches existantes (vérifié : 200), mais aucune des 442 autres.
- Pages absentes du sitemap alors qu'elles existent : `/catalogue`, `/parfums-femme`, `/parfums-homme`, `/huile-de-parfum`, `/offres/lot-3-pour-2`, `/commande-a-la-demande`, `/livraison`, `/a-propos`, `/marques/reef`, `/lots`, `/mur-des-eloges`, `/blog/[slug]` (4 articles).
- `lastModified: new Date()` sur toutes les entrées (`sitemap.ts:25,28`) : la date change à chaque requête, ce qui neutralise le signal de fraîcheur.
- `src/app/robots.ts:5` : `allow: '/'`, `disallow: ['/api/', '/_next/']`. **Aucune règle pour les 22 routes `preview-*`** (`ls src/app/[locale] | grep -c preview` = 22) ; aucun composant n'émet `robots: noindex` (grep vide). **154 URL de maquette indexables** (22 × 7 locales), dont `/preview-welcome`, `/preview-card` (vérifiés 200).
- `/en/` (slash final) redirige en 308 vers `/en` — correct.

### 2.3 Données structurées

| Type | Où | État | Problème |
|---|---|---|---|
| `Organization` + `PostalAddress` + `ContactPoint` | `/` uniquement (`page.tsx:43-58`) | valide | `logo: /assets/logo.png` non vérifié ; `sameAs` pointe vers des comptes Instagram/TikTok dont l'existence n'est pas confirmée ; absent des autres pages |
| `Product` + `Brand` + `Offer` + `AggregateRating` | 448 fiches (`produit/[slug]/page.tsx:149-181`) | syntaxiquement valide, **sémantiquement faux** | voir ci-dessous |
| `FAQPage` (9 questions) | `/faq` (`FaqJsonLd.tsx`) | valide | la page n'a pas de `<h1>` ; réponses en texte brut : bien |
| `BreadcrumbList` | — | **absent** | le fil d'Ariane HTML existe mais dit « Parfums Femme » pour tous les produits (`page.tsx:241-243`), y compris Khamrah |
| `Review` | — | absent | 3 avis codés en dur sans balisage |
| `WebSite` + `SearchAction` | — | absent | la recherche existe pourtant |
| `ItemList` sur catégories | — | absent | |

Incohérences `Product` mesurées sur le HTML rendu :

- **`availability` toujours `InStock`** (`page.tsx:173`). Fiche `/produit/ne-emah-laya` : JSON-LD `price: 499, availability: InStock` ; la même page affiche le badge « Sur commande » et la source dit `available: false` (`dp-catalogue.json`, `dispo: false`). 114 fiches sur 448 sont dans ce cas (25 %).
- **`aggregateRating` synthétique** : `rating = 4.3 + popularité × 0.006`, `reviewCount = 60 + popularité × 4` (`product-resolve.ts:47-52`). Distribution mesurée : 312 fiches « 4,4 / 132 avis », 96 fiches « 4,5 / 160 avis », 40 fiches entre 4,6 et 4,9 avec 252 à 891 avis (fiches rédigées, `product-details.ts:106-107` etc.). Aucun avis réel n'existe dans le projet. Google exige que la note reflète des avis « réellement collectés » ; c'est un motif d'action manuelle « données structurées trompeuses ».
- **`image` relative** (`page.tsx:154`) : schema.org demande une URL absolue.
- **Pas de `sku`, `gtin`, `mpn`** alors que `dp-boutique.json` porte un `sku` pour 349 produits (`DP-LAT-135958`…).
- **Pas de `priceValidUntil`, `shippingDetails`, `hasMerchantReturnPolicy`** — nécessaires aux « Merchant listings » depuis 2024.
- **Prix identiques page/JSON-LD** : vérifié sur Khamrah (29 €) et Laya (499 €) — cohérent.

### 2.4 Images

- `public/` : 106 Mo dont `public/assets` 101 Mo — 778 WebP, 393 JPG, 12 PNG, 46 MP4 (20,6 Mo). 23 fichiers > 500 Ko ; les plus lourds sont des PNG de catégorie : `categories/bestsellers.png` 1,75 Mo, `categories/format-50ml.png` 1,70 Mo, `oils/tanasuk.png` 1,14 Mo.
- `next/image` : 40 imports contre 13 `<img>` bruts. `next.config.ts:12` force `formats: ['image/webp']` (AVIF retiré pour Safari iOS — décision documentée).
- **`alt`** : aucune image sans attribut `alt` (0 sur 28 mesures). En revanche **`alt=""`** sur 25 des 34 images de la fiche Khamrah, 51/54 sur la commande à la demande, 33/36 sur le sélecteur d'échantillons : les packshots produit sont déclarés décoratifs, donc invisibles pour Google Images et les lecteurs d'écran.
- Accueil : 41 images chargées (2,6 Mo) + 13 `<video>` (194 Ko au chargement initial, 2 en autoplay). 105 des 109 `<img>` sont en `loading="lazy"`, y compris l'image LCP : Next signale en console sur la fiche Khamrah « Image … was detected as the LCP. Please add `loading="eager"` / `priority` ».
- 3 images sans dimensions déclarées sur la fiche produit (risque de CLS).

### 2.5 Maillage interne et URL

- 43 à 55 liens internes uniques par page ; le pied de page en fournit 27 dont **18 en 404** (voir § 6). Le méga-menu du header (`Header.tsx:103-175`) fait pointer 22 entrées vers seulement 6 destinations (`/parfums-femme` reçoit 9 libellés différents : « Nouveautés », « Floral · Rose », « Oud · Boisé »…) : aucune page de facette n'existe, le maillage thématique est fictif.
- Fiches produit : « Vous aimerez aussi » = les 4 premiers slugs du catalogue (`page.tsx:126-128`), identiques sur les 448 fiches, sans lien avec la famille olfactive.
- **Slugs** : `/produit/<marque>-<nom>` pour le catalogue vérifié, slug boutique repris tel quel pour les 349 autres. **42 slugs contiennent une contenance** (`-50ml`, `-15ml`, `-10ml`) et **12 paires « X » / « X-50ml »** coexistent comme deux pages distinctes (ex. `asdaaf-ameerat-al-arab` + `asdaaf-ameerat-al-arab-50ml`, `ard-al-zaafaran-oud-24-hours` + `…-50ml`) : contenu quasi dupliqué, sans canonical ni variantes `Offer`.
- Doublons avant fusion : 6 slugs en double à l'intérieur du catalogue vérifié (dont `paris-corner-taskeen-caramel-cascade` présent deux fois dans `dp-catalogue.json`), 23 à l'intérieur du relevé boutique, 4 communs aux deux couches — `mergeBySlug()` (`search-catalog.ts:307-342`) les fusionne silencieusement en gardant la première occurrence.
- Catalogue : 12 produits rendus côté serveur (`PER_PAGE = 12`, `CatalogueClient.tsx:49`), les 448 lignes sont dans la charge RSC mais **seuls 12 liens `/produit/` sont dans le HTML initial** ; la pagination est client-side sans URL (`?page=`), donc **436 fiches ne sont accessibles par aucun lien crawlable** hors recherche.

### 2.6 Performance et Core Web Vitals (mesures en mode dev, locales — ordres de grandeur)

| Route (desktop 1280) | Transféré | JS | Requêtes JS | Images | DOM | FCP | LCP | CLS |
|---|---|---|---|---|---|---|---|---|
| `/` | 11,2 Mo | 7,5 Mo | 49 | 2,6 Mo / 41 | 2 686 nœuds | 708 ms | 708 ms | 0 |
| `/catalogue` | 6,1 Mo | 5,4 Mo | 26 | 140 Ko / 12 | 1 313 | 192 ms | 192 ms | 0,034 |
| `/produit/lattafa-khamrah` | 6,9 Mo | 5,5 Mo | 26 | 937 Ko / 37 | 1 006 | 320 ms | 332 ms | 0 |
| `/commande-a-la-demande` | 7,8 Mo | 6,8 Mo | 29 | 576 Ko / 57 | 1 054 | 252 ms | 252 ms | 0 |
| `/preview/selecteur-echantillons` | 8,8 Mo | 5,4 Mo | 26 | 3,1 Mo / 22 | 1 029 | 208 ms | 208 ms | 0,007 |
| `/parfums-femme` | 5,7 Mo | 5,2 Mo | 26 | 128 Ko / 7 | 648 | 172 ms | 228 ms | **0,192** |
| `/huile-de-parfum` | 5,7 Mo | 5,2 Mo | 26 | 199 Ko / 8 | 660 | 268 ms | 732 ms | 0,047 |

- Le JS mesuré est celui de Turbopack en dev (non minifié, non fusionné) : en production attendre 300–600 Ko gzip pour l'accueil — **à mesurer sur un `next build`**, ce que cet audit n'a pas pu faire sans modifier l'environnement. 104 fichiers portent `"use client"` sur 198 ; l'accueil est un unique composant client de 1 394 lignes (`_home-client.tsx`) avec 15 `dynamic()`.
- **CLS 0,192 sur `/parfums-femme`** (desktop) : au-dessus du seuil « à améliorer » (0,1). Cause probable : grille de produits sans dimensions réservées.
- **Erreur console sur l'accueil** (les 4 mesures `/` et `/en`) : `404 /_next/static/chunks/src_data_olfactive-match_ts_….js` — chunk périmé du module jumeau olfactif ; symptôme connu du projet (mémoire « CSS compilé figé » → `rm -rf .next`). À vérifier après rebuild : si le module jumeau ne charge pas, l'actif GEO n° 1 est invisible.
- Polices : `next/font/google` Cormorant Garamond (5 graisses × 2 styles) + Jost (5 graisses), `display: swap` (`layout.tsx:5-18`) — 20 fichiers de fonte potentiels. Réduire à 3-4 graisses.
- Pas de scroll horizontal à 390 px (`scrollWidth` = 390 sur les 14 routes).

### 2.7 Recommandations SEO technique

| # | Recommandation | Type | Priorité | Effort |
|---|---|---|---|---|
| S1 | Retirer le suffixe des titres de page (laisser le template le poser) ; écrire titre + description uniques pour les 8 pages en défaut | M | P1 | 1 j |
| S2 | Ajouter `lang` (et `dir`) sur `<html>` via le layout racine (lire la locale depuis les params ou déplacer `<html>` dans `[locale]/layout.tsx`) | M | P1 | 0,5 j |
| S3 | `generateMetadata` générique : `alternates.canonical` + `languages` (7) sur toutes les pages, à partir d'un helper unique | M | P1 | 1 j |
| S4 | Sitemap dynamique : `allProductSlugs()` × 7 locales + pages catégories + blog ; `lastModified` stable ; index de sitemaps si > 50 000 URL | M | P1 | 0,5 j |
| S5 | `noindex` sur toutes les routes `preview*` (metadata `robots`) + `disallow` dans `robots.ts` ; à terme les sortir du build de production | M | P1 | 0,5 j |
| S6 | JSON-LD `Product` : `availability` depuis `product.available`, `image` absolue, `sku`, retirer `aggregateRating` tant qu'il n'y a pas d'avis réels, ajouter `shippingDetails` + `hasMerchantReturnPolicy` | M | P1 | 1 j |
| S7 | `BreadcrumbList` + fil d'Ariane réel (catégorie déduite du genre/famille, pas « Parfums Femme » codé) | M | P2 | 1 j |
| S8 | Variantes de contenance : une fiche par produit, plusieurs `Offer` ; rediriger (301) les slugs `-50ml` vers la fiche mère | P | P2 | 3 j |
| S9 | Catalogue : pagination adressable (`?page=n`) rendue côté serveur, ou liens « voir tout » vers pages marque/famille pour rendre les 448 fiches crawlables | M | P1 | 2 j |
| S10 | `priority` sur l'image LCP des fiches et du hero ; `alt` descriptif sur les packshots (« Flacon Khamrah 100 ml, Lattafa ») | M | P1 | 0,5 j |
| S11 | Convertir les 12 PNG (5,3 Mo cumulés) en WebP ; compresser les 23 fichiers > 500 Ko ; poster les vidéos avec `preload="none"` + poster | M | P2 | 1 j |
| S12 | Mesurer les CWV sur un build de production (Lighthouse CI) et fixer un budget : LCP < 2,5 s, CLS < 0,1, INP < 200 ms | P | P2 | 1 j |
| S13 | Nettoyer le chunk `olfactive-match` 404 (`rm -rf .next`), corriger les 4 erreurs `tsc` (`next.config.ts` formats readonly ; `_home-client.tsx:1094,1100`) | M | P1 | 0,5 j |

---

## 3. SEO contenu

### 3.1 Trois couches de fiches, trois niveaux de qualité

Mesuré via `tsx` sur `SEARCH_PRODUCTS` (448 entrées après fusion) :

| Couche | Fiches | Description | Pyramide olfactive | Photo | Prix comparé | Popularité (rang) |
|---|---|---|---|---|---|---|
| Fiches rédigées (`product-details.ts`) + rails | 37 (25 rédigées) | rédigée, 60–120 mots, vocabulaire éditorial | complète (tête/cœur/fond) | galerie 8–12 visuels | oui (7 arbitrages) | 55–95 |
| Catalogue vérifié (`dp-catalogue.json`) | 96 | **copiée de dubaiparfumerie.com** (`dp-fiches-site.json`) | sourcée sur le site de la maison (`notes_source`) — 4 vides | 1 visuel boutique | oui (`marche`, 37 non mesurés) | 25 |
| Relevé boutique (`dp-boutique.json`) | 312 | **copiée de dubaiparfumerie.com** | **aucune** (`notes: []`, `boutique-to-search.ts:86`) | 1 visuel boutique | non | 18 |
| Autre (huiles, etc.) | 3 | | | | | |

- **317 fiches sur 448 (71 %) n'ont aucune note olfactive** ; pour elles, la fiche masque le bloc pyramide et le module « constellation ». Ce sont des pages « nom + marque + description boutique + prix » : contenu mince par définition.
- **408 fiches (91 %) publient la description déjà en ligne sur dubaiparfumerie.com**, mot pour mot (`catalogue-to-search.ts:175`, `boutique-to-search.ts:81`). Longueur médiane 358 caractères, 5 descriptions < 150 caractères, 0 doublon interne. Tant que les deux sites coexistent, Google attribuera la paternité à la page la plus ancienne (l'actuelle) ; la nouvelle version sera classée comme copie. À la bascule de domaine (même domaine, nouvelles URL), des redirections 301 URL par URL sont indispensables (`dp-boutique.json` porte l'`url` d'origine pour chaque produit : `https://dubaiparfumerie.com/produits/<id>/`).
- **9 fiches sans description** retombent sur un texte généré : « X porte la signature de Y. [texte de famille]. Fabriqué à Dubaï, garanti authentique. » (`product-resolve.ts:54-69`) — 9 textes quasi identiques.
- Les 25 fiches rédigées sont de bonne facture (Khamrah : description, `viralNote` encadrée, parfumeur quand documenté, galerie). C'est le niveau à généraliser.

### 3.2 Pages catégories minces

- `/parfums-femme`, `/parfums-homme`, `/huile-de-parfum` : 7 à 10 images, un `<h1>`, un chapeau d'une phrase, pas de texte de catégorie, pas de FAQ, pas de maillage vers les fiches par famille. 128–199 Ko d'images pour 7–8 produits affichés.
- `/marques` : `<h1>` « 10 Maisons du Golfe » alors que le catalogue en compte **36** (`SEARCH_BRANDS.length`) ; chaque maison renvoie vers `/catalogue?marque=…` — aucune page marque dédiée (sauf `/marques/reef`).
- `/promo-flash` : 12 produits **codés en dur** avec prix inventés (`promo-flash/page.tsx:10-21` — Oud Pour Elle 18,90 € barré 84,90 €, −77 %) et images génériques `prod-1.jpg`… ; sans `<h1>`.
- `/blog` : **2 articles réellement rédigés** dans `blog/[slug]/page.tsx` (`ARTICLES`), 4 entrées dans `journal-articles.ts`, **7 liens** affichés sur l'accueil et le blog. Tout slug inconnu retombe sur l'article « oud » (`blog/[slug]/page.tsx:62 : ARTICLES[slug] ?? ARTICLES["l-oud-l-or-noir…"]`) : `/blog/slug-inexistant-xyz` renvoie **200** avec le même contenu — soft 404 et contenu dupliqué sur au moins 5 URL (`bakhour-encens-tradition`, `erreurs-parfums-orientaux`, `interview-maitre-parfumeur-lattafa`, `musc-blanc-vs-musc-noir`, `top-10-parfums-ete`). Aucune date, aucun auteur, pas de `Article` JSON-LD.

### 3.3 Cohérence des chiffres publics

- « 300+ références » (`layout.tsx:22`, `page.tsx:8,24,34`, `a-propos:6`) alors que le site sert 448 fiches et la boutique en compte 456–497 (`MD/TOP-20-HYPE-2026.md` : « 497 produits, sitemap complet »).
- « 10 Maisons du Golfe » (`/marques`) vs 36 marques indexées.
- « Depuis 2016 » (`AnimatedHero.tsx:28`, `a-propos`, `_home-client.tsx:1381`) et « 4,8/5 » (`AnimatedHero.tsx:626`, `Footer.tsx:305`, `a-propos:48`) : aucune source dans le projet.

### 3.4 Recommandations SEO contenu

| # | Recommandation | Type | Priorité | Effort |
|---|---|---|---|---|
| C1 | Rédiger (ou faire rédiger) les 96 fiches du catalogue vérifié en priorité — elles ont déjà pyramide sourcée et prix comparé ; gabarit : 120–180 mots, tête/cœur/fond en tableau, « pour qui / quand », 1 phrase « inspiré de » encadrée | P | P1 | 96 × 20 min ≈ 5 j |
| C2 | Pour les 312 fiches boutique : au minimum réécrire le premier paragraphe (60 mots) et ajouter les notes depuis le site de la maison (même méthode que la vague du 06/09) — vague 2 du catalogue vérifié | P | P2 | 3 vagues |
| C3 | Plan de redirection 301 : `dubaiparfumerie.com/produits/<id>/` → `/produit/<slug>` pour les 456 URL (la clé `url` existe dans les deux JSON) | P | P1 | 1 j |
| C4 | Pages catégories : 200–300 mots éditoriaux, 3–5 questions FAQ (`FAQPage`), maillage vers 8–12 fiches de la famille | M | P2 | 0,5 j / page |
| C5 | `/marques` : une page par maison (36) avec histoire, ville, année, produits, dupes connus — `brands.ts` a déjà ville et année | M | P2 | 2 j |
| C6 | Blog : `notFound()` sur slug inconnu au lieu du repli sur l'article oud, retirer les 5 liens vers des articles non écrits (ou les écrire), ajouter date, auteur, `Article` JSON-LD ; calendrier 2 articles/mois orientés requêtes (« Khamrah avis », « alternative Baccarat Rouge 540 pas cher ») | M/P | P2 | continu |
| C7 | Aligner les chiffres publics (nombre de références, de maisons, note moyenne) sur les données réelles ou les sourcer | M | P1 | 0,5 j |
| C8 | `/promo-flash` : brancher sur les 36 produits qui ont un `compareAtPrice` réel au lieu des 12 lignes inventées | M | P1 | 1 j |

---

## 4. GEO — Generative Engine Optimization

Ce qu'un moteur génératif (Google AI Overviews, ChatGPT Search, Perplexity, Claude) peut extraire du site aujourd'hui, et ce qui le rendrait citable.

### 4.1 Actifs existants

| Actif | Preuve | Valeur GEO |
|---|---|---|
| **Table des dupes** `dp-dupes.json` : 105 entrées, confiance forte 34 / moyenne 16 / faible 8 / aucune 47 ; 58 avec original nommé ; 14 avec alternatives ; source URL par ligne | `dp-dupes.ts:40-65` — seules « forte » + « moyenne » sont servies (**50 correspondances**) | **Majeure** : répond littéralement à « alternative à Dior Sauvage », « dupe Angels' Share pas cher ». Maisons citées : Xerjoff 5, Kilian 5, Kayali 5, Louis Vuitton 4, YSL 3, Amouage 3, JPG 3, Dior 3, Armani 3, Creed 2, PdM 2, Tom Ford 2… |
| Module « jumeau olfactif » sur l'accueil | `OlfactiveTwin.tsx`, amorcé sur « Dior · Sauvage » (`olfactive-twins.ts:223`), mention légale « inspirés, jamais des copies : aucune affiliation… » présente dans le HTML | Forte, mais **côté client** : le contenu n'est pas dans le HTML initial (chunk 404 constaté) — invisible pour un crawler qui n'exécute pas le JS |
| Base de 3 991 parfums de référence | `reference-perfumes.ts` (4 434 lignes) | Entités nommées prêtes pour des pages « X vs Y » |
| Pyramides sourcées (`notes_source` = URL du site officiel) | `dp-catalogue.json`, 107/111 | Citations vérifiables — exactement ce que les LLM privilégient |
| Relevé de prix marché (3 sources par produit, médiane) | `dp-catalogue.json.marche`, `dp-corrections-prix.json` (45 lignes) | Contenu « prix comparé » unique, non publié |
| FAQ en `FAQPage` (9 Q/R) | `FaqJsonLd.tsx` | Bonne, mais générique (commande, paiement, livraison) — aucune question produit |
| `viralNote` encadrée (« inspiré de », jamais « copie ») | `product-details.ts:57-73` | Bon cadrage rédactionnel |

### 4.2 Ce qui manque

- **Aucune page « X vs Y »** ni « alternatives à X » indexable : la correspondance dupe → original n'apparaît que dans le module client de l'accueil et, sur 50 fiches, dans une phrase. Un LLM ne peut pas citer une URL qui n'existe pas.
- **Pas de `llms.txt`**, pas de flux produit (Google Merchant / Shopping) exportable.
- **Pas de contenu structuré par entité** : pas de page note (« oud », « safran »), pas de page famille olfactive (`scent-families.ts` existe, la roue des senteurs est un composant, pas une page — `/familles-olfactives` et `/roue-des-senteurs` sont en 404).
- **Pas de tableau HTML** de notes sur les fiches (la pyramide est rendue en `<span>` stylés) : les extracteurs privilégient `<table>`/`<dl>`.
- **Données structurées fausses** (§ 2.3) : un moteur génératif qui lit « 4,4/5 sur 132 avis » et « en stock » sur un produit indisponible propagera l'erreur, et la boutique en portera la responsabilité.
- Auteur/expertise : aucune page « qui écrit », aucune signature, aucun `Person`/`author`.

### 4.3 Recommandations GEO

| # | Recommandation | Type | Priorité | Effort |
|---|---|---|---|---|
| G1 | Générer **50 pages statiques « Alternative à [Original] »** depuis `DUPES_BY_REFERENCE` : original (texte seul, pas de logo), 1–3 dupes du catalogue avec notes en `<table>`, écart de prix, source citée, disclaimer légal, `ItemList` JSON-LD. Slug : `/alternative/dior-sauvage` | M | **P1** | 2 j (template) |
| G2 | Rendre le module jumeau olfactif **côté serveur** pour les 50 paires servies (le sélecteur reste client) | M | P1 | 1 j |
| G3 | Pages entités : 36 maisons, ~30 notes majeures, 4 familles (`FAMILIES` dans `search-catalog.ts:123-144`), chacune avec définition 100 mots, produits, FAQ 3 questions | M | P2 | 3 j |
| G4 | FAQ produit sur chaque fiche rédigée : « Combien de temps tient Khamrah ? », « Khamrah est-il un dupe d'Angels' Share ? », « Pour quelle saison ? » — en `FAQPage` imbriqué | P | P2 | inclus C1 |
| G5 | `public/llms.txt` : présentation, périmètre (maisons du Golfe, prix France), liens vers `/alternative/*`, `/marques/*`, `/faq`, politique d'exactitude | M | P1 | 0,25 j |
| G6 | Citer les sources dans le HTML : `notes_source` (site officiel) sous chaque pyramide, prix marché « relevé le … sur 3 marchands » | M | P2 | 0,5 j |
| G7 | Supprimer les faux `aggregateRating` ; à la production, brancher un tiers de confiance (Avis Vérifiés, Trustpilot) et n'exposer que des notes réelles | M/P | P1 | 0,25 j / 2 j |
| G8 | Page « À propos » avec entité `Organization` complète (SIREN, adresse, équipe) répétée sur toutes les pages via le layout ; `Person` pour les rédacteurs | P | P2 | 0,5 j |

---

## 5. CRO — parcours d'achat et conversion

### 5.1 Parcours de bout en bout : ce qui existe, ce qui est factice

| Étape | État | Preuve |
|---|---|---|
| Accueil → fiche | réel | 144 liens internes sur l'accueil, rails, recherche |
| Recherche | réelle (client, agrégation de 448 produits, notes, marques) ; recherche image/audio via 4 routes API Claude sans authentification ni limitation de débit | `SearchOverlay.tsx`, `src/app/api/*/route.ts` (`model: claude-sonnet-4-6`) |
| Fiche → panier (bouton principal) | **factice** : `handleAddToCart` passe un état à `true` pendant 2 s, n'appelle pas `addItem` | `AddToCart.tsx:15-18` |
| Carte catalogue / promo → panier | réel (`addItem` → `localStorage["dp_cart"]`, tiroir panier) | `CatalogueClient.tsx:8`, `promo-flash/page.tsx:7,291`, `lib/cart.ts` |
| Tiroir panier → « Passer commande » | **inerte** : `<button>` sans `onClick` ni `href` | `Header.tsx:476-492` |
| `/panier`, `/checkout` | **404** | mesuré |
| Code promo | accepte tout code commençant par `DUBAI` ou `BIENVENUE` | `PromoChecker.tsx:25-31` |
| Suivi de commande | scénario codé en dur (« DP-100482 », « 20 juin, 09:14 ») | `suivi-commande/page.tsx:5-13` |
| Newsletter (footer + section) | `setSubscribed(true)` sans envoi | `Footer.tsx:237-242`, `NewsletterSection.tsx:74` |
| Formulaire B2B | état `loading` sans requête | `B2BLeadForm.tsx` (aucun `fetch`) |
| Commande à la demande | **réel** : compose un message WhatsApp (`wa.me/966583728407?text=…`) borné à 1 800 caractères | `_on-demand-client.tsx:59-63,673-675` |
| Compte / connexion | modale visuelle (Facebook/Google), aucune authentification | `Header.tsx` `AuthModal` |

Conséquence : sur la fiche produit, le seul bouton que l'utilisateur cherche ne fait rien ; sur le catalogue, il fait quelque chose. **L'incohérence est plus dommageable qu'un panier absent** : un testeur en démo croira à un bug.

### 5.2 Prix, prix barrés et cohérence

- **Même produit, trois prix** : Oud Pour Elle 54,90 € barré 74,90 € sur la fiche (`product-details.ts:104-105`), **18,90 € barré 84,90 € (−77 %)** sur `/promo-flash` (`promo-flash/page.tsx:10`). Amber Oud 29,90 € barré 85,90 € (−65 %). Ces remises ne correspondent à aucun relevé.
- **Lot 3 pour 2** : `was` ≈ 2 × `price` sur les 7 produits (75 € barré 129,90 €, 54,90 € barré 109,90 €, `bundle-products.ts:43-117`) alors que l'offre est déjà « 3 pour 2 ». Double remise affichée.
- **Réalignement marché** : 45 corrections mesurées, dont 30 « trop cher » et 15 « agressif » (`verdict_prix`), 37 produits sans comparateur (`marche.n = 0`), écarts de −60 % à +290 %. La règle des 15 % (`prixRetenu`, `dp-corrections-prix.ts:177-181`) modifie le prix affiché **sans afficher de prix barré** : le catalogue vérifié ne porte que 4 `prix_dp_barre`. Bien — mais les fiches réalignées ne l'annoncent pas non plus (« prix ajusté au marché » serait un argument).
- **Directive Omnibus** (art. L.112-1-1 Code de la consommation, depuis 05/2022) : tout prix barré doit être le **prix le plus bas pratiqué dans les 30 jours précédents**. Les prix barrés de `promo-flash`, `bundle-products`, `packs.ts` et des 25 fiches rédigées (`oldPrice`) ne s'appuient sur aucun historique : à la production, supprimer ou justifier.
- Prix « TTC » : la mention n'apparaît que dans `sample-pricing.ts:30`, jamais sur les fiches ni dans le panier.
- Paiement en 4× : « 4× sans frais » avec mensualité calculée (`page.tsx:112,420-428`) sans nom d'opérateur (Alma ? PayPal ?) ; logos de paiement du footer : Mastercard, PayPal, Visa, Amex, Discover, iDEAL, SOFORT, Bancontact — **Discover et SOFORT** (arrêté en 2024) sont peu crédibles pour une boutique française.

### 5.3 Stock, rupture, échantillons, urgences

- 114 produits sur 448 indisponibles (25 %) ; catalogue vérifié : 36/111 en rupture, dont Laya à 499 €, Marwa, Khamrah Qahwa (viral, `MD/hype-reseaux-accueil.md`). Le badge « Sur commande » (`product-resolve.ts:109`) est le seul signal : pas de « prévenez-moi », pas de date, pas de lien vers la commande à la demande.
- **Fausse rareté** : « Plus que 2 exemplaires ! » calculé par hachage du slug (`catalogue/page.tsx:69-80`, valeurs mesurées 2 et 8) — déterministe, mais **inventé**. En droit français c'est une pratique commerciale trompeuse (L.121-2 C. conso, et « fausse urgence » listée par la DGCCRF / dark patterns DSA). À retirer avant production, ou brancher sur un stock réel.
- **Échantillons** : trois offres contradictoires — « Ajouter un échantillon 2 ml (+1,90 €) » sur la fiche (`AddToCart.tsx:74-75`), sélecteur à 3,50 € le flacon (3 pour 10,50 €, `sample-pricing.ts:18-20`), « Échantillon offert dès 80 € » dans la barre d'annonces. Dans le sélecteur, **seule la maison Reef est disponible** (`SAMPLE_BRANDS_AVAILABLE = {"Reef"}`, `sample-selector-products.ts:162`) ; les autres sont « bientôt » et non sélectionnables — 33 vignettes sur 36 en `alt=""`. Sur mobile, le sélecteur charge 3,1 Mo d'images pour un service à 1 maison.
- **Lot 3 pour 2** : 7 produits seulement (`bundle-products.ts`), tous avec prix barré artificiel ; la page renvoie vers `/promo-flash` (12 lignes inventées) via le méga-menu « Coffrets ».
- **Livraison** : « offerte dès 60 € », « sinon 4,90 € », « 48 h », « 14 jours » (`/livraison`) ; la barre « Il vous manque 60,00 € pour en bénéficier » (`FreeShippingBar.tsx`) fonctionne sur le panier réel — bon levier, mais inutile depuis la fiche puisque le bouton n'ajoute rien.

### 5.4 Mobile et vitesse perçue

- Capture 390 × 844 de la fiche Khamrah : au-dessus de la ligne de flottaison on voit top-bar, header, barre livraison offerte, image plein cadre (≈ 1 100 px de haut) puis 8 vignettes ; **ni le nom, ni le prix, ni le bouton d'achat**. Les bulles flottantes WhatsApp (gauche) et « quiz signature » (droite) recouvrent la première et la dernière vignette.
- Top-bar : le message « Livraison dans le monde, DOM-TOM compris » est tronqué par les sélecteurs FR / EUR (capture).
- Modale de bienvenue (`WelcomeModal`, clé `dp_welcome_shown_v3`) au premier chargement : ses boutons « Créer un compte » (89 × 19 px), « Se connecter » (69 × 19), « Non merci » (56 × 19) et « Fermer » (22 × 22) sont tous sous la cible tactile de 44 px (mesuré). Le CTA « Se connecter » blanc sur or affiche 2,81:1.
- 196 cibles < 44 px sur l'accueil mobile, 125 sur le catalogue, 54 sur la fiche.

### 5.5 Réassurance, avis, CTA

- Réassurance présente et répétée (5 piliers, top-bar défilante, badges) — mais non sourcée : « Authenticité certifiée » (par qui ?), « 4,8/5 » (où ?), « Depuis 2016 ».
- **Avis** : 3 témoignages identiques sur 448 fiches (`page.tsx:49-74` : Yasmine B., Mohammed K., Isabelle D.), tous 5 étoiles, tous datés 2025 ; `review-media.ts` porte 5+ avis « `verified: true` » avec photos dont la provenance/consentement n'est pas documentée. Le « mur des éloges » (4 vidéos autoplay) est une vitrine sans texte ni lien vers l'avis.
- CTA : « Ajouter au panier » (inerte), « Acheter en 1 clic » (inerte), « Passer commande » (inerte). Le seul CTA qui aboutit est WhatsApp.
- Formulaires : recherche (2 champs sans `<label>` mais avec `aria-label`), newsletter (champ e-mail sans label visible), 7 à 11 champs non étiquetés par page (mesuré).

### 5.6 Recommandations CRO

| # | Recommandation | Type | Priorité | Effort |
|---|---|---|---|---|
| R1 | Brancher `AddToCart` sur `addItem()` (même contrat que les cartes), ouvrir le tiroir, puis une page `/panier` récapitulative — en maquette un checkout « démo » suffit, mais le bouton doit faire quelque chose | M | **P1** | 1 j |
| R2 | Unifier les prix : une seule source par slug (`resolveProduct`), supprimer les 12 lignes de `promo-flash`, alimenter promo/lots depuis `compareAtPrice` réel | M | P1 | 1 j |
| R3 | Retirer les prix barrés sans historique ; à la production, tracer le prix le plus bas 30 jours (Omnibus) et n'afficher un barré que s'il est justifié | M/P | P1 | 0,5 j + process |
| R4 | Supprimer « Plus que n exemplaires » ou le brancher sur un stock réel | M | P1 | 0,25 j |
| R5 | Mobile : remonter nom + prix + CTA sous l'image (ou sticky bottom bar « 29 € · Ajouter »), réduire la galerie mobile à 4 vignettes + « voir plus », déplacer les bulles flottantes hors de la zone galerie | M | P1 | 1 j |
| R6 | Rupture : bouton « Me prévenir » + lien « Commander à la demande » sur les 114 fiches indisponibles | M | P2 | 0,5 j |
| R7 | Échantillons : une seule politique (prix, seuil offert, disponibilité) reprise partout ; retirer les 35 fiches « bientôt » du sélecteur ou les griser clairement | M | P1 | 0,5 j |
| R8 | Avis : retirer les 3 témoignages génériques ; en maquette, afficher « Pas encore d'avis — soyez le premier » ; à la production, collecte post-achat via tiers de confiance | M/P | P1 | 0,25 j |
| R9 | Formulaires : `label` explicite, `autocomplete`, `inputmode`, message d'erreur ; newsletter et B2B → endpoint réel (ou `mailto:` en maquette) | M | P2 | 0,5 j |
| R10 | Panier abandonné (production) : capture e-mail dès l'étape 1 du checkout, relance J+1/J+3, code livraison offerte | P | P3 | 2 j |
| R11 | Sécuriser les 4 routes `/api/*` (rate limit par IP, taille max, origine) avant toute mise en ligne — facture Anthropic exposée | P | P1 | 0,5 j |

---

## 6. Confiance & juridique e-commerce (France/UE)

### 6.1 Pages obligatoires

| Obligation | Page | État | Preuve |
|---|---|---|---|
| Mentions légales (LCEN art. 6-III) | `/mentions-legales` | **404** | lien `Footer.tsx:82` |
| CGV (L.111-1, L.221-5 C. conso) | `/cgv` | **404** | `Footer.tsx:83` |
| Politique de confidentialité (RGPD art. 13) | `/confidentialite` | **404** | `Footer.tsx:84` |
| Politique cookies | `/cookies` | **404** | `Footer.tsx:85` |
| Droit de rétractation 14 jours (L.221-18) | `/livraison` (200) | mentionné, **contradiction** : « 14 jours » (`_home-client.tsx:76,155,1310`, `/livraison`) vs « remboursons intégralement sous 30 jours, sans question » (`_home-client.tsx:806`) et « 30 jours pour changer d'avis » (`preview-authenticite-textes:81`) | |
| Formulaire type de rétractation | — | absent | |
| Médiateur de la consommation (L.612-1) | — | absent | |
| Prix TTC, frais de livraison avant commande | partiel : « TTC » absent des fiches ; frais sur `/livraison` uniquement | `sample-pricing.ts:30` seule occurrence | |
| Plan du site | `/sitemap` | 404 (le `sitemap.xml` existe) | `Footer.tsx:86` |

Au total **18 des 27 liens du pied de page renvoient un 404** : `/nouveautes`, `/notre-histoire`, `/familles-olfactives`, `/roue-des-senteurs`, `/quiz`, `/livraison-retours` (la page existe sous `/livraison`), `/suivi` (existe sous `/suivi-commande`), `/b2b`, `/compte`, `/commandes`, `/favoris`, `/fidelite`, `/parrainage`, `/mentions-legales`, `/cgv`, `/confidentialite`, `/cookies`, `/sitemap`.

### 6.2 Cookies et données personnelles

- Aucun bandeau de consentement, aucun script tiers, aucun traceur (grep `gtag|matomo|plausible|fbq|hotjar|clarity` : 0). Le stockage local se limite à `dp_cart`, `dp_currency`, `dp_welcome_shown_v3`, `dp-perpage-catalogue` — traceurs « strictement nécessaires », exemptés de consentement (délibération CNIL 2020-091). **Situation saine aujourd'hui** ; elle bascule dès l'ajout d'un outil d'analytics ou d'un pixel social.
- Formulaires collectant des données (newsletter, B2B, commande à la demande avec prénom/téléphone/e-mail) : aucune mention d'information RGPD ni case d'acceptation ; la commande à la demande envoie ces données vers WhatsApp (Meta) — à mentionner.
- Routes `/api/chat`, `/api/quiz`, `/api/search-image`, `/api/search-audio` transmettent des contenus utilisateur (texte, image, audio) à Anthropic : à déclarer dans la politique de confidentialité (sous-traitant, transfert hors UE).

### 6.3 Marques citées — jumeau olfactif et dupes

- Le module nomme **Dior · Sauvage, Creed · Aventus, Kilian · Angels' Share, Louis Vuitton, YSL, Amouage, Xerjoff, Kayali…** (`dp-dupes.json`, `olfactive-twins.ts:127,223,229`). Le cadrage rédactionnel est bon : vocabulaire « inspiré de » / « jumeau olfactif », interdiction de « clone/copie/dupe » (`olfactive-twins.ts:3-4`, `product-details.ts:66-73`), mention « aucune affiliation avec les marques citées » présente dans le HTML de l'accueil et des fiches, texte seul, aucun logo.
- Cadre : l'usage nominatif d'une marque tierce pour désigner la destination du produit est toléré (art. L.713-6 CPI) et la publicité comparative est licite si objective et non dénigrante (L.122-1 C. conso). La jurisprudence française sur les « tableaux de concordance » de parfums (Cass. com. 2006–2011) reste toutefois défavorable aux **listes systématiques** qui associent un produit à une marque de luxe pour profiter de sa notoriété. Le risque est réel dès que les correspondances deviennent des pages indexables (recommandation G1) : les faire relire par un conseil en PI, garder la source publique pour chaque paire, limiter aux confiances « forte », et ne jamais placer le nom de l'original dans `<title>`, meta description ou JSON-LD `Product`.
- La `viralNote` de Khamrah dans le HTML : « inspiré de Kilian · Angels' Share, dont il rappelle l'accord cognac… » — conforme au vocabulaire imposé.

### 6.4 Authenticité, contact, SAV

- « Authenticité certifiée » / « garantie » : aucune preuve (numéro de lot, facture fournisseur, procédure de vérification). À adosser à une page « Comment nous garantissons l'authenticité » avec la chaîne d'approvisionnement.
- Contact : WhatsApp **+966 58 372 84 07** (Arabie saoudite, `lib/contact.ts:5`, numéro officiel confirmé par le client) vs « expédition sous 24 h depuis notre entrepôt en France » (`_home-client.tsx:1381`) et `addressCountry: FR` (`page.tsx:53`). L'incongruité géographique nourrit le doute sur l'authenticité ; l'expliquer (« équipe conseil à Djeddah, logistique en France ») ou afficher aussi un numéro français.
- E-mails `contact@` et `retour@dubaiparfumerie.com` (footer, `/livraison`) : non vérifiables ici.
- « Remboursement sous 5 jours ouvrés » (`/livraison`) : la loi impose 14 jours maximum après retour — engagement plus favorable, acceptable.
- Éco-participation DEEE : sans objet (parfums). Contribution emballages (Citeo) et Triman : logo Triman + info-tri obligatoires sur les emballages, pas sur le site — sans objet ici.

### 6.5 Recommandations confiance & juridique

| # | Recommandation | Type | Priorité | Effort |
|---|---|---|---|---|
| L1 | Créer les 4 pages légales (mentions, CGV, confidentialité, cookies) — en maquette, gabarits avec champs à compléter ; supprimer ou corriger les 14 autres liens morts du footer | M | **P1** | 1 j |
| L2 | Choisir **une** durée de rétractation (14 jours légaux, ou 30 jours commerciaux) et l'écrire partout ; ajouter le formulaire type et le médiateur | M | P1 | 0,5 j |
| L3 | Mention « TTC » sur tous les prix ; frais de port rappelés dans le tiroir panier | M | P1 | 0,25 j |
| L4 | Retirer Discover/SOFORT des logos, nommer l'opérateur du 4× | M | P2 | 0,25 j |
| L5 | Relecture PI des correspondances marques avant publication de pages indexables ; charte : source publique, confiance forte, texte seul, disclaimer, jamais dans les métadonnées | P | P1 | conseil externe |
| L6 | Bandeau de consentement (tarteaucitron / Axeptio) **au moment** d'ajouter l'analytics, pas avant | P | P2 | 0,5 j |
| L7 | Page « Authenticité » factuelle + explication du numéro +966 / logistique France | M | P2 | 0,5 j |
| L8 | Mentions RGPD sous chaque formulaire ; déclarer Anthropic et Meta (WhatsApp) comme destinataires | P | P2 | 0,25 j |

---

## 7. Accessibilité

Mesures Playwright (14 routes × 2 viewports) + lecture de `globals.css`.

### 7.1 Ce qui est en place

- `:focus-visible { outline: none; box-shadow: var(--focus-ring) }` global (`globals.css:269`) — anneau or 3 px visible.
- `prefers-reduced-motion` respecté dans 10 composants (`globals.css`, `ProductGallery`, `DeliveryEstimate`, `ShippingChecker`, `ScentWheelInteractive`, `PackCard`, `JournalCard`, `WhatsAppBubble`, `_on-demand-client`, `ProductVideoStrip`) + hook `useReducedMotion` du fragrance finder.
- Landmarks : 1 `<header>`, 1 `<main>`, 1 `<footer>`, 2–4 `<nav>` par page. Sur les fiches produit, **4 `<header>`** (galerie/sections) : le landmark bannière est ambigu.
- Boutons d'action nommés (`aria-label` sur quantité, fermer, rechercher).
- Aucune image sans attribut `alt`.
- Vidéos autoplay : toutes `muted`, sans `controls` (2 sur l'accueil, 4 sur le mur des éloges).
- Aucun défilement horizontal à 390 px.

### 7.2 Ce qui échoue

| Critère (WCAG 2.2) | Mesure | Preuve |
|---|---|---|
| 1.4.3 Contraste texte (4,5:1) | **`--gold-500 #C8901E`** : 2,81:1 sur blanc, 2,72:1 sur `--surface-page`, 2,52:1 sur crème ; utilisé pour prix (`--price-sale`), lien « Bons Plans », eyebrow marque, CTA (blanc sur or 2,81:1). `--ink-400 #8C8073` 3,46–3,85:1 (placeholders, fil d'Ariane, « (n avis) »). `--price-was #9A9286` 3,07:1. `--star #D4A02C` 2,37:1. **179 nœuds de texte sous AA sur l'accueil**, 58–87 sur les autres pages | `globals.css:46-47,62-65,87-89` ; échantillons mesurés : « Bons Plans » 13 px 2,72:1, « Se connecter » 14 px 2,81:1, « Offre de bienvenue » 9,6 px 2,81:1, « Rechercher… » 3,46:1 |
| 2.5.8 Taille des cibles (24 px min) / bonne pratique 44 px | 220 cibles < 44 px (accueil desktop), 196 (mobile) ; **< 24 px** : 4 icônes sociales 16 × 16, sélecteurs langue/devise 37 × 18 et 48 × 18, boutons de la modale de bienvenue 19 px de haut | mesuré ; `Footer.tsx` icônes 15 px |
| 1.1.1 / 4.1.2 Nom accessible | **8 liens sans nom** (icônes sociales `IconX/Instagram/TikTok/YouTube` sans `aria-label`, `Footer.tsx:173-203`) + 1 bouton sans nom, sur chaque page ; **25 images produit en `alt=""`** sur la fiche Khamrah (`ProductGallery`) | mesuré 28/28 |
| 3.3.2 Étiquettes | 7 à 11 champs sans `<label>`/`aria-label`/`aria-labelledby` par page (recherche mobile, newsletter, sélecteurs, filtres catalogue) | mesuré |
| 3.1.1 Langue de la page | `<html>` sans `lang` ; `lang`/`dir` sur un `<div>` interne | `layout.tsx:34`, `[locale]/layout.tsx:28` |
| 1.3.1 Structure | `<h1>` absent sur `/`, `/faq`, `/promo-flash` (l'accueil enchaîne 24 `<h2>`) ; fiche : `H2 H1 H2…` (le H2 du header précède le H1) | mesuré |
| 2.1.1 Clavier | case « échantillon » implémentée en `<span role="checkbox" tabIndex=0>` avec `onKeyDown` (`AddToCart.tsx:37-60`) — fonctionnel mais un `<input type=checkbox>` natif serait plus robuste ; méga-menu au survol, ouverture clavier non vérifiée | code |
| 1.4.2 / 2.2.2 Média | 2 vidéos autoplay sur l'accueil et 4 sur le mur des éloges sans bouton pause ; marquee top-bar et « maisons » défilent en continu (pause au `focus-within` seulement, `globals.css:556`) | mesuré |
| 1.3.5 / 1.3.4 | `maximumScale: 5` (`layout.tsx:29`) — bien, le zoom n'est pas bloqué | |

### 7.3 Recommandations accessibilité

| # | Recommandation | Type | Priorité | Effort |
|---|---|---|---|---|
| A1 | Texte or : basculer sur `--gold-700 #9C6A1A` (4,68:1) pour tout texte < 24 px ; garder `gold-500` pour filets, fonds, icônes décoratives ; CTA : texte `--ink-900` sur or (6,37:1) ou fond `gold-700` | M | **P1** | 0,5 j |
| A2 | `--ink-400` → `--ink-500 #6B5D4E` (6,36:1) pour tout texte informatif ; `--price-was` idem | M | P1 | 0,25 j |
| A3 | `aria-label` sur les 4 liens sociaux, le bouton sans nom ; `alt` descriptif sur les packshots (nom + marque + vue) | M | P1 | 0,25 j |
| A4 | Cibles : icônes sociales 44 × 44 (padding), sélecteurs langue/devise ≥ 32 px de haut, boutons de la modale ≥ 44 px | M | P2 | 0,5 j |
| A5 | `<label>` sur chaque champ (visible ou `sr-only`) | M | P2 | 0,5 j |
| A6 | `lang` + `dir` sur `<html>` (déjà S2) ; un seul `<h1>` par page, `<header>` unique | M | P1 | inclus S2 |
| A7 | Bouton pause global pour vidéos/marquees ; `controls` ou bouton « ⏸ » sur les autoplay | M | P2 | 0,5 j |
| A8 | Audit axe-core automatisé dans la CI (`@axe-core/playwright`) + test clavier manuel du méga-menu, du tiroir panier et de la recherche | P | P2 | 1 j |

---

## 8. Internationalisation

### 8.1 État réel des 7 locales

- Déclaration : `fr, en, es, de, it, ru, ar` (`i18n/routing.ts:4`), FR sans préfixe, middleware `next-intl` (`middleware.ts`), `dir="rtl"` pour `ar` (sur le `<div>` interne).
- Fichiers de messages : **65 clés par locale**, toutes traduites (1 à 4 clés identiques au FR — des noms propres). FR : 1 929 caractères ; AR : 1 383.
- **Consommation** : `useTranslations`/`getTranslations` dans **7 fichiers sur 198** ; **15 des 16 pages** n'appellent aucune traduction (`a-propos`, `blog`, `faq`, `huile-de-parfum`, `catalogue`, `marques`, `commande-a-la-demande`, `lots`, `mur-des-eloges`, `parfums-homme`, `livraison`, `parfums-femme`, `promo-flash`, `suivi-commande`, `page.tsx` accueil).
- **Rendu `/en`** : 33 % des chaînes de texte extraites contiennent du français (top-bar « Paiement en 4× sans frais », « Livraison offerte dès 60 € », réassurance, footer) — `Header.tsx:59-62` et `Footer.tsx:34-89` sont codés en français. `/ar` : 32 %, `/de/faq` : 39 %. Titres, descriptions, JSON-LD : **français pour les 7 locales** (`generateMetadata` ne lit pas la locale sauf pour l'URL).
- Fiches produit : descriptions FR (copiées de la boutique) et notes traduites en FR via `NOTES_FR` (`catalogue-to-search.ts:37-107`) pour toutes les locales.
- Bilan : **une seule locale a du contenu réel (FR)** ; les 6 autres sont une couche de 65 libellés (menu, hero, bannières) sur un site français.

### 8.2 Devises

- Sélecteur 7 devises `EUR, AED, SAR, QAR, USD, GBP, MAD` (`Header.tsx:67`, `Footer.tsx:9`), stocké dans `localStorage["dp_currency"]`, synchronisé header/footer.
- **Aucune conversion** : grep `RATES|convert|Intl.NumberFormat` vide ; les prix restent « xx,xx € » quelle que soit la devise choisie. Choisir « AED » n'a aucun effet visible — un testeur le remarquera.
- Paiement : aucun ; la question « devise affichée vs devise de paiement » ne se pose pas encore, mais la matrice locales × devises (7 × 7) est irréaliste à opérer.

### 8.3 Marchés cibles réalistes

- Les données sont françaises : prix comparés à 3 marchands **français** (`notino.fr`, `parfumsmoinschers.com`, `idealo.fr`), zones de livraison `shipping-countries.ts` (France, Belgique, Luxembourg, Suisse, DOM-TOM, monde), retours 14 jours, 4× sans frais.
- Marché 1 : **France** (FR). Marché 2 plausible : **Belgique/Suisse/Luxembourg** (FR, DE pour la Suisse alémanique). Marché 3 : **Maghreb / diaspora** (FR + AR). EN/ES/IT/RU n'ont ni offre, ni logistique, ni prix : à retirer du sitemap et du sélecteur tant qu'ils n'ont pas de contenu, ou à conserver comme « démo RTL/i18n » clairement non indexée.

### 8.4 Recommandations i18n

| # | Recommandation | Type | Priorité | Effort |
|---|---|---|---|---|
| I1 | Réduire les locales servies à **FR + AR** (démo RTL) et, si besoin, EN ; `noindex` + retrait du sitemap pour les locales sans contenu | M | **P1** | 0,5 j |
| I2 | Externaliser les chaînes du header/footer/top-bar/réassurance (≈ 60 libellés) dans `messages/*.json` — ce sont les plus visibles en démo | M | P1 | 1 j |
| I3 | `generateMetadata` localisé (titre/description par locale, au moins FR/EN/AR) | M | P2 | 0,5 j |
| I4 | Devise : soit retirer le sélecteur, soit convertir avec taux figés (`formatPrice(amount, currency)` via `Intl.NumberFormat`) et l'indiquer « indicatif » | M | P2 | 0,5 j |
| I5 | RTL : porter `dir` sur `<html>`, vérifier tiroirs/menus (propriétés physiques `left/right` signalées dans `RESPONSIVE_AUDIT.md`) | M | P2 | 1 j |
| I6 | Production : traduction professionnelle des 25 fiches rédigées + catégories pour chaque locale conservée ; pas de traduction automatique non relue | P | P3 | par locale |

---

## 9. Analytics & mesure

### 9.1 Existant

- **Rien.** Aucun tag (grep `gtag|googletagmanager|matomo|plausible|dataLayer|fbq|hotjar|clarity|posthog|umami` = 0 occurrence dans `src/`), aucun événement, aucune Search Console reliée (non vérifiable ici), aucun test A/B. Le panier local n'émet aucun événement mesurable.
- Positif : pas de dette de consentement à rattraper.

### 9.2 Plan minimal

| Étape | Outil | Détail | Quand |
|---|---|---|---|
| 1 | **Google Search Console** + Bing Webmaster | propriété domaine, envoi du sitemap dynamique (S4), suivi des rich results `Product`/`FAQ`, Core Web Vitals réels | dès le déploiement d'une préprod publique |
| 2 | **Analytics respectueux** (Matomo auto-hébergé ou Plausible) | exempté de consentement si configuré CNIL (Matomo sans cookies, IP tronquée) — permet de mesurer sans bandeau | J+0 production |
| 3 | Événements e-commerce standard (GA4 ou Matomo Ecommerce) | `view_item`, `add_to_cart`, `view_cart`, `begin_checkout`, `purchase`, `search`, `select_promotion` ; hook dans `lib/cart.ts` (`addItem`, `removeItem`) et `SearchOverlay` | avec le vrai panier |
| 4 | Événements maquette spécifiques | ouverture jumeau olfactif + original choisi, clic « commande à la demande » → WhatsApp, quiz signature terminé, filtre catalogue utilisé, lecture vidéo shoppable | J+30 |
| 5 | Consentement | uniquement si GA4/pixels : bandeau CMP (tarteaucitron) + mode consentement ; sinon rester en Matomo exempté | conditionnel |
| 6 | Tableau de bord hebdo | sessions, taux d'ajout panier, taux de conversion, top recherches sans résultat, pages 404 (18 liens footer !), CWV | J+30 |
| 7 | Suivi GEO | Search Console « AI Overviews » quand disponible, requêtes de marque « dubai parfumerie + dupe/alternative », mentions dans Perplexity/ChatGPT (recherche manuelle mensuelle) | J+60 |

---

## 10. Données produit

### 10.1 Les trois couches et leur fusion

```
product-details.ts   25 fiches rédigées  ─┐
best-sellers*, trend, oils, bundles, twins ─┤  collect() → dedupe() → mergeBySlug()  →  SEARCH_PRODUCTS (448)
dp-catalogue.json   111 (110 hors lot)   ─┤        search-catalog.ts:102-342
dp-boutique.json    349                  ─┘
                                              ↓
                                   allProductSlugs() → 448 routes /produit/[slug] × 7 locales = 3 136 pages
```

- Ordre de priorité : fiches rédigées > rails > catalogue vérifié > boutique (`catalogue-to-search.ts:10-13`, `boutique-to-search.ts:17-18`). La règle « rien n'est déduit » est bien tenue dans les JSON ; elle est **rompue à l'affichage** par `product-resolve.ts` : pyramide « approximée » en coupant la liste plate en tiers (`splitPyramid`, l.31-41), note et nombre d'avis dérivés (l.47-52), `concentration: "Eau de parfum"` et `volume: "100ml"` par défaut (l.96-97) alors que 40 produits du catalogue ont `contenance: null`.

### 10.2 Chiffres clés

| Indicateur | Valeur | Source |
|---|---|---|
| Fiches servies | **448** (37 rédigées/rails, 96 catalogue, 312 boutique, 3 autres) | `tsx` sur `SEARCH_PRODUCTS` |
| Sans pyramide olfactive | **317** (71 %) | idem |
| Indisponibles | **114** (25 %) ; catalogue vérifié : 36/111 | idem ; `dp-catalogue.json` |
| Sans photo / sans prix | 0 / 0 | idem |
| Avec prix barré | 36 (4 dans le catalogue vérifié) | idem |
| Marques | 36 (boutique : Ard Al Zaafaran 96, Lattafa 62, Al Haramain 36, Swiss Arabian 36, Ajmal 31 ; catalogue : Maison Alhambra 23, Ahmed Al Maghribi 22, Nabeel 11, Paris Corner 10) | JSON |
| **Arbitrages de prix manuels** | **7** (`PRIX_IMPOSES`) : 4 Ahmed Al Maghribi conservés (`null`), Jean Lowe Vibe → 34,90 €, Vanilla Voyage conservé 49 € malgré médiane 31,90 €, Daam Watani → 80 € | `dp-corrections-prix.ts:95-120` |
| Corrections automatiques (écart > 15 %) | 45 lignes ; confiance : ≥ 3 relevés « solide », 2 « moyenne », 1 « faible » (non appliquée) ; écart ≥ 300 % = format douteux (non appliqué) | `dp-corrections-prix.json`, `.ts:124-147` |
| **Produits sans comparateur** | **37** (`marche.n = 0`, `verdict_prix = null`) | `dp-catalogue.json` |
| Verdicts prix | 30 « trop cher », 29 « aligné », 15 « agressif », 37 non mesurés | idem |
| Contenance inconnue | 40/111 | idem |
| Marque corrigée | 1 (« Lueur d'Espoir Ambre » : Paris Corner → Emir) | idem |
| Pyramide vide dans le catalogue vérifié | 4/111 | idem |
| **Slugs en double avant fusion** | **33** (6 intra-catalogue dont `taskeen-caramel-cascade` ×2 ; 23 intra-boutique ; 4 catalogue ∩ boutique) → fusionnés silencieusement | script Python + `mergeBySlug` |
| Slugs avec contenance | 42 ; **12 paires** « X » / « X-50ml » servies comme deux produits | `tsx` |
| Dupes | 105 lignes, 50 servies (34 fortes + 16 moyennes), 58 avec original nommé, 47 « aucune » ; 7 jumeaux manuels dans `olfactive-twins.ts` | `dp-dupes.json`, `dp-dupes.ts:48` |
| Avis boutique récupérés | 34/349 fiches boutique avec `note`, 9/110 fiches-site — **non utilisés** (le JSON-LD préfère la note dérivée) | JSON |

### 10.3 Incohérences repérées (et déjà notées dans `MD/hype-reseaux-accueil.md` § 5)

- « Club de Nuit » sans déclinaison (Intense Man vs Urban Man Elixir : deux jumeaux différents) ; « Amber Oud » sans édition (la hype est sur Gold).
- Notes de Jean Lowe Vibe (oud, cacao, safran) = celles d'Ombre Nomade alors que les sources donnent Pacific Chill.
- « Oud Pour Elle », « Opulent Blue », « L'Or de Saba » introuvables sous ces noms chez les maisons — ce sont pourtant 3 des 6 produits du sitemap.
- Un même produit à plusieurs prix selon la source (Oud Pour Elle : 54,90 / 18,90 / 74,90 barré).
- Les 34 notes clients réellement relevées sur la boutique (`note`, `avis`) sont ignorées au profit d'une formule.

### 10.4 Plan de fiabilisation

| # | Action | Type | Priorité | Effort |
|---|---|---|---|---|
| D1 | **Un identifiant produit unique** (`sku` boutique `DP-XXX-NNNNNN` existe pour 349 produits) porté par toutes les couches ; clé de fusion = SKU, pas slug | P | P1 | 2 j |
| D2 | Modèle **produit → variantes** (contenance) : fusionner les 12 paires, `Offer` multiple, sélecteur de volume réel (`VolumeSelector.tsx` existe déjà en UI) | M/P | P1 | 2 j |
| D3 | Supprimer les dérivations : pas de `rating/reviews` synthétiques, pas de `volume` par défaut (afficher « contenance non précisée »), `splitPyramid` remplacé par « notes principales » sans tête/cœur/fond | M | P1 | 0,5 j |
| D4 | Dédoublonnage explicite : rapport des 33 collisions, décision par ligne, correction des JSON (`taskeen-caramel-cascade-2`…) | M | P1 | 0,5 j |
| D5 | Vague 2 du catalogue vérifié : les 312 fiches boutique, en commençant par les 62 Lattafa et 96 Ard Al Zaafaran (marques les plus recherchées) — même schéma, `notes_source` obligatoire | P | P2 | 3 vagues |
| D6 | Compléter les 37 comparateurs manquants et les 40 contenances ; rejouer `prixRetenu` ; journaliser chaque changement de prix (base Omnibus 30 jours) | P | P2 | 2 j |
| D7 | Réutiliser les 34 notes boutique réelles dans l'affichage (avec la mention « avis boutique ») ou les archiver | M | P2 | 0,25 j |
| D8 | Test automatisé sur les données : unicité des slugs, prix > 0, `available` cohérent avec JSON-LD, aucune `oldPrice` sans justification | M | P1 | 0,5 j |

---

## 11. Feuille de route 30 / 60 / 90 jours

Responsables suggérés : **Dev** (front Next.js), **Contenu** (rédaction/SEO), **Data** (catalogue), **Juridique** (conseil externe), **Marketing** (analytics/GEO), **Client** (décisions commerciales).

### J+30 — arrêter les signaux faux, rendre la démo crédible

| Action | Réf. | Impact | Effort | Resp. |
|---|---|---|---|---|
| Panier : brancher `AddToCart`, `/panier` récapitulatif, « Passer commande » → page démo | R1 | Fort | 1 j | Dev |
| JSON-LD : `availability` réelle, retirer `aggregateRating`, image absolue, `sku` | S6, D3 | Fort | 1 j | Dev |
| Retirer avis génériques, fausse rareté, prix barrés inventés (`promo-flash`, lots) | R8, R4, R2, R3 | Fort | 1 j | Dev + Client |
| `lang`/`dir` sur `<html>`, titres dédoublés, `<h1>` manquants, canonical/hreflang génériques | S2, S1, S3, A6 | Fort | 2 j | Dev |
| Sitemap dynamique 448 fiches ; `noindex` des 22 previews ; locales réduites à FR + AR (+ EN) | S4, S5, I1 | Fort | 1 j | Dev |
| Pages légales (gabarits) + corriger 18 liens footer ; une seule durée de rétractation ; « TTC » | L1, L2, L3 | Fort | 1,5 j | Dev + Juridique |
| Contraste : `gold-700` et `ink-500` pour le texte ; noms accessibles ; `alt` packshots | A1, A2, A3, S10 | Moyen-fort | 1 j | Dev |
| Mobile fiche : prix + CTA visibles, bulles déplacées ; modale de bienvenue tactile | R5, A4 | Fort | 1 j | Dev |
| Nettoyage build : chunk 404, 4 erreurs `tsc`, PNG → WebP | S13, S11 | Moyen | 1 j | Dev |
| Chiffres publics alignés (références, maisons, note) | C7 | Moyen | 0,5 j | Contenu |
| Dédoublonnage des 33 slugs, modèle variantes 50/100 ml | D4, D2 | Moyen | 2,5 j | Data + Dev |

### J+60 — contenu propriétaire et GEO

| Action | Réf. | Impact | Effort | Resp. |
|---|---|---|---|---|
| Rédiger les 96 fiches du catalogue vérifié (gabarit + FAQ produit) | C1, G4 | Fort | 5 j | Contenu |
| 50 pages « Alternative à [Original] » générées depuis `dp-dupes.json`, après relecture PI | G1, L5 | Fort | 2 j + conseil | Dev + Juridique |
| Module jumeau olfactif rendu côté serveur ; `llms.txt` | G2, G5 | Fort | 1,25 j | Dev |
| Pages catégories enrichies (texte, FAQ, maillage) ; pagination catalogue crawlable | C4, S9 | Fort | 3 j | Contenu + Dev |
| 36 pages maison | C5, G3 | Moyen | 2 j | Dev + Contenu |
| Chaînes header/footer externalisées ; métadonnées localisées FR/AR/EN ; devise convertie ou retirée | I2, I3, I4 | Moyen | 2 j | Dev |
| Rupture : « me prévenir » + lien commande à la demande ; échantillons : une politique | R6, R7 | Moyen | 1 j | Dev + Client |
| Labels de formulaires, pause vidéos, cibles 44 px ; axe-core en CI | A5, A7, A4, A8 | Moyen | 2,5 j | Dev |
| Blog : liens morts, `Article` JSON-LD, 2 articles/mois | C6 | Moyen | continu | Contenu |
| Compléter 37 comparateurs et 40 contenances ; tests données | D6, D8 | Moyen | 2,5 j | Data |

### J+90 — préparer la production

| Action | Réf. | Impact | Effort | Resp. |
|---|---|---|---|---|
| `next build` + Lighthouse CI, budgets CWV ; fonts réduites ; vidéos `preload=none` | S12, S11 | Fort | 1,5 j | Dev |
| Plan de redirections 301 des 456 URL de dubaiparfumerie.com | C3 | Fort | 1 j | Dev + Data |
| Identifiant unique SKU sur toutes les couches ; vague 2 du catalogue (Lattafa, Ard Al Zaafaran) | D1, D5 | Fort | 2 j + vagues | Data |
| Sécurisation des 4 routes API (rate limit, taille, origine) | R11 | Fort | 0,5 j | Dev |
| Search Console + Matomo exempté + événements e-commerce ; tableau de bord | § 9 | Fort | 2 j | Marketing + Dev |
| Avis réels via tiers de confiance ; page Authenticité ; mentions RGPD formulaires | G7, L7, L8 | Moyen | 3 j | Client + Dev |
| Journal des prix 30 jours (Omnibus) avant tout prix barré | R3, D6 | Moyen | 1 j | Data |
| Traduction professionnelle des fiches pour les locales conservées | I6 | Moyen | par locale | Contenu |
| Panier abandonné, CMP si analytics tiers | R10, L6 | Moyen | 2,5 j | Marketing |

---

## 12. Annexes

### 12.1 Mesures Playwright — mobile 390 × 844 (Chromium, mode dev)

| Route | Transféré | JS | Images | LCP | CLS | Cibles < 44 px | Texte < AA | Champs sans label | Erreurs console |
|---|---|---|---|---|---|---|---|---|---|
| `/` | 11,3 Mo | 7,5 Mo | 2,7 Mo / 36 | 276 ms | 0 | 196 | 179 | 11 | 1 (chunk 404) |
| `/catalogue` | 6,1 Mo | 5,4 Mo | 188 Ko / 12 | 220 ms | 0 | 125 | 73 | 7 | 0 |
| `/produit/lattafa-khamrah` | 6,6 Mo | 5,5 Mo | 680 Ko / 30 | 304 ms | 0 | 54 | 64 | 7 | 0 |
| `/produit/ne-emah-laya` | 6,2 Mo | 5,5 Mo | 267 Ko / 13 | 280 ms | 0 | 54 | 55 | 7 | 0 |
| `/marques` | 5,8 Mo | 5,2 Mo | 234 Ko / 19 | 272 ms | 0 | 53 | 62 | 7 | 0 |
| `/promo-flash` | 5,7 Mo | 5,3 Mo | 143 Ko / 8 | 180 ms | 0 | 80 | 55 | 7 | 0 |
| `/offres/lot-3-pour-2` | 5,8 Mo | 5,3 Mo | 169 Ko / 8 | 124 ms | 0 | 50 | 35 | 7 | 0 |
| `/commande-a-la-demande` | 7,8 Mo | 6,8 Mo | 606 Ko / 55 | 168 ms | 0 | 129 | 36 | 7 | 0 |
| `/huile-de-parfum` | 5,7 Mo | 5,2 Mo | 178 Ko / 8 | 208 ms | 0 | 42 | 36 | 7 | 0 |
| `/parfums-femme` | 5,7 Mo | 5,2 Mo | 128 Ko / 7 | 132 ms | 0 | 42 | 38 | 7 | 0 |
| `/preview/selecteur-echantillons` | 8,8 Mo | 5,4 Mo | 3,1 Mo / 22 | 152 ms | 0 | 92 | 22 | 7 | 0 |
| `/blog` | 5,8 Mo | 5,2 Mo | 247 Ko / 7 | 364 ms | 0 | 42 | 36 | 8 | 0 |
| `/faq` | 5,8 Mo | 5,4 Mo | 83 Ko / 1 | 156 ms | 0 | 54 | 21 | 7 | 0 |
| `/en` | 11,3 Mo | 7,5 Mo | 2,7 Mo / 36 | 260 ms | 0 | 196 | 179 | 11 | 1 |

`scrollWidth` = 390 px sur les 14 routes (aucun débordement horizontal). Poids et LCP mesurés en développement local : non représentatifs de la production, utiles uniquement pour comparer les pages entre elles.

### 12.2 Statut HTTP des routes testées

200 : `/`, `/catalogue`, `/produit/*` (448 slugs, dont les 6 du sitemap), `/marques`, `/marques/reef`, `/promo-flash`, `/offres/lot-3-pour-2`, `/commande-a-la-demande`, `/huile-de-parfum`, `/parfums-femme`, `/parfums-homme`, `/preview/selecteur-echantillons`, `/blog`, `/blog/<4 slugs>`, `/faq`, `/livraison`, `/a-propos`, `/suivi-commande`, `/lots`, `/mur-des-eloges`, `/en/catalogue`, `/en/produit/lattafa-khamrah`, `/sitemap.xml` (77 URL), `/robots.txt`, `/preview-welcome`, `/preview-card`.
308 : `/en/`, `/ar/`, `/de/` → sans slash.
404 : `/mentions-legales`, `/cgv`, `/confidentialite`, `/cookies`, `/sitemap`, `/panier`, `/checkout`, `/nouveautes`, `/notre-histoire`, `/familles-olfactives`, `/roue-des-senteurs`, `/quiz`, `/livraison-retours`, `/suivi`, `/b2b`, `/compte`, `/commandes`, `/favoris`, `/fidelite`, `/parrainage`.

### 12.3 Rappel de l'audit du 1er juillet 2026 (`MD/AUDIT_REPORT.md`)

Résolu depuis : slug inconnu → 404 franc (`resolveProduct` renvoie `null`), page `/catalogue` créée, agrégation des sources dans `search-catalog.ts`, WhatsApp centralisé, `<meta viewport>` correct, catalogue vérifié de 111 fiches + relevé boutique de 349.
Toujours ouvert : pages légales, `<html lang>`, `AddToCart` factice, previews indexables, contraste or, i18n de façade (65 clés consommées), multidevise cosmétique, 4 erreurs `tsc` (3 en juillet), routes API sans limitation.

### 12.4 Fichiers de référence cités

`src/app/layout.tsx` · `src/app/[locale]/layout.tsx` · `src/app/[locale]/page.tsx` · `src/app/[locale]/_home-client.tsx` · `src/app/[locale]/produit/[slug]/page.tsx` · `src/app/[locale]/produit/[slug]/AddToCart.tsx` · `src/app/[locale]/catalogue/page.tsx` · `src/app/[locale]/catalogue/CatalogueClient.tsx` · `src/app/[locale]/promo-flash/page.tsx` · `src/app/[locale]/suivi-commande/page.tsx` · `src/app/sitemap.ts` · `src/app/robots.ts` · `src/middleware.ts` · `src/i18n/routing.ts` · `src/components/layout/Header.tsx` · `src/components/layout/Footer.tsx` · `src/components/faq/FaqJsonLd.tsx` · `src/components/faq/answers/PromoChecker.tsx` · `src/data/search-catalog.ts` · `src/data/product-resolve.ts` · `src/data/product-details.ts` · `src/data/catalogue/dp-catalogue.ts` · `src/data/catalogue/catalogue-to-search.ts` · `src/data/catalogue/boutique-to-search.ts` · `src/data/catalogue/dp-corrections-prix.ts` · `src/data/catalogue/dp-dupes.ts` · `src/data/olfactive-twins.ts` · `src/data/sample-pricing.ts` · `src/data/sample-selector-products.ts` · `src/data/bundle-products.ts` · `src/lib/cart.ts` · `src/lib/contact.ts` · `src/app/globals.css` · `MD/hype-reseaux-accueil.md` · `MD/AUDIT_REPORT.md` · `RESPONSIVE_AUDIT.md`.
