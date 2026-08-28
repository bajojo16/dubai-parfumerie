# AUDIT — Dubaï Parfumerie
**Date** : 2026-07-01 · **Périmètre** : dépôt complet (`app/` = code Next.js) · **Mode** : audit seul, aucun fichier de code modifié
**Méthode** : inventaire manuel + `tsc --noEmit` + ESLint + 9 audits de domaine parallèles (lecture exhaustive, fichier:ligne cités)

---

## 1. Résumé exécutif

### Note globale : 38 / 100 (en tant que boutique e-commerce production) — ~70/100 en tant que prototype design

Le site est une **vitrine visuellement aboutie mais fonctionnellement factice** : le design system existe (mais est concurrencé par une palette pirate), l'infra i18n existe (mais n'est raccordée à ~3 % de l'UI), le panier existe (mais le bouton principal d'achat n'y écrit rien), les données produit existent (en 7 catalogues contradictoires sans clé commune).

### 5 risques majeurs

| # | Risque | Preuve clé |
|---|--------|-----------|
| R1 | **Couche de données éclatée** : 7 catalogues produit indépendants, même parfum à 3-4 prix (Oud Pour Elle : 28,90 / 54,90 / 18,90 €), marques/images/stock contradictoires, et la fiche produit consomme un 8ᵉ catalogue disjoint de tout — quasi tous les liens produit affichent « Oud Pour Elle » en fallback silencieux | `produit/[slug]/page.tsx:231`, `src/data/*` |
| R2 | **Parcours d'achat factice** : bouton « Ajouter au panier » PDP purement visuel, vérificateur promo qui accepte tout code `DUBAI*`/`BIENVENUE*`, suivi de commande à dates codées en dur, newsletter qui jette les emails, numéro WhatsApp +966 marqué « à remplacer » | `AddToCart.tsx:15-18`, `PromoChecker.tsx:30`, `suivi-commande/page.tsx:5-8` |
| R3 | **Facture Anthropic exposée** : 4 routes API IA publiques sans rate limiting ni validation ; `/api/chat` est un proxy Claude générique ; 2 routes ne sont appelées par aucun composant | `src/app/api/*/route.ts` |
| R4 | **i18n de façade** : ~1 425 chaînes FR en dur vs 45 clés next-intl consommées ; 100 % des liens internes perdent le préfixe de locale ; aucun sélecteur de langue ; metadata/JSON-LD FR pour les 7 locales ; RTL partiel (tiroirs Header glissent du mauvais côté en AR) | `src/messages/*`, `Header.tsx`, `Footer.tsx` |
| R5 | **Conformité & SEO** : aucune page légale (CGV/mentions/confidentialité liées mais inexistantes), 22 routes preview × 7 locales indexables, slugs blog tous cassés, `<html>` sans `lang`/`dir`, contrastes or 2,2-2,8:1 sur CTA et labels | `Footer.tsx`, `robots.ts:5`, `layout.tsx:34` |

### Verdict (5 lignes)
Excellent prototype de direction artistique, non déployable en l'état comme boutique. Le build échoue au typecheck (3 erreurs `tsc`). Aucune transaction réelle n'est possible ni légale (pas de checkout, pas de CGV). La priorité absolue n'est pas d'ajouter des features mais de **consolider : une source de vérité produit, un vrai routage localisé, la fermeture des routes IA et preview**. La dette est massive mais bien circonscrite — l'infrastructure (next-intl, tokens CSS, next/font, cart lib) est saine, c'est le raccordement qui manque partout.

---

## 2. Inventaire

### Stack réelle observée
- **Next.js 16.2.9** App Router + React 19.2.4 + TypeScript 5 (`strict: true`) — `app/package.json`
- **Tailwind CSS v4** installé mais **quasi inutilisé** : 0 classe utilitaire de couleur ; tout le style est **inline + CSS custom properties** (conforme au CLAUDE.md projet)
- **next-intl 4.13** : 7 locales (fr défaut sans préfixe, `localePrefix: 'as-needed'`), middleware standard — `src/i18n/routing.ts`, `src/middleware.ts`
- **Framer Motion 12** (3 consommateurs vivants sur 7), **Lenis** (installé, jamais monté = mort), **@anthropic-ai/sdk 0.105** (4 routes API, modèle `claude-sonnet-4-6`)
- Polices : `next/font/google` (Cormorant Garamond + Jost, `display: swap`) — mais redéfinies en `:root` dans globals.css (conflit, voir DS-04)
- Scripts : `dev`/`build`/`start`/`lint`. Pas de tests. Git repo dans `app/` (remote GitHub `bajojo16/dubai-parfumerie` documenté, `.env*` non trackés ✅)

### Couche de données produit — IDENTIFIÉE (fait central de l'audit)
**Aucun CMS, aucune API, aucun backend.** Tout est fichiers TypeScript locaux, **7 catalogues sans clé commune** :

```
produit/[slug]/page.tsx   PRODUCTS{6}        ← PDP ; slugs DISJOINTS de tout le reste
src/data/best-sellers.ts        {4}  → BestSellersRail #1   [price: Money{amount,currency}]
src/data/best-sellers-top.ts    {5}  → BestSellersRail #2   [Money]
src/data/bundle-products.ts     {7}  → BundleBuilder        [price/was: number]
src/data/oil-products.ts        {2}  → OilSection           [number + variantId]
src/data/packs.ts               {9}  → PackGrid             [number + variantId]
src/data/trend-products.ts      {5}  → TrendCarousel        [number + variantId]
src/data/shoppable-videos.ts    {4}  → ShoppableVideoCarousel  [produit embarqué]
src/data/product-stories.ts     {4}  → StoryBubbles         [shop embarqué]
src/data/olfactive-twins.ts     {8}  → OlfactiveTwin
src/data/scent-families.ts      {6×2}→ ScentWheelInteractive
src/data/sample-selector-products.ts  ← AGRÈGE 5 sources (dédup brand|name → échoue, doublons visibles)
fragrance-finder/data/productAttributes.ts ← AGRÈGE 3 sources (dédup slug → doublons aurum/reef-aurum)
+ catalogues hardcodés dans : api/chat, api/quiz, api/search-*, BestSellers.tsx (SLIDES), ScentWheel.tsx (copie assumée), _home-client.tsx
```
Identifiants : 6 conventions concurrentes (`id`, `slug`, `productHandle`, `shopProductHandle`, `variantId`, `key`). Prix : `number` EUR implicite partout sauf 2 fichiers en `Money`. Panier (`lib/cart.ts`, localStorage `dp_cart`) : chaque source pousse son propre id → le même parfum peut créer 5 lignes panier distinctes.

### Structure & conventions
- `src/app/[locale]/` : 14 pages production + **22 routes `preview-*`** de dev accessibles publiquement
- `src/components/` : ui / layout / sections / faq / fragrance-finder / bundle / sample-selector / welcome
- 93 fichiers sur 129 en `"use client"` (72 %) ; home = 1 282 lignes 100 % client
- Design tokens : `globals.css` = copie conforme de la référence `_extracted/ds/tokens/*` ; mais un **second système** (`fragrance-finder/tokens.ts`, or #C9A24A vs canonique #C8901E) couvre 33-40 fichiers
- `public/` : 64 Mo (hero LCP 6,9 Mo, PNG photographiques 5 Mo, vidéos 9,4 Mo)

### Vérifications machine
- `tsc --noEmit` : **3 erreurs** (`_home-client.tsx:1010,1016` — TS2538 ×2, TS7006)
- ESLint : **88 problèmes (70 erreurs / 18 warnings)** — 28× `no-html-link-for-pages`, 19× `no-unescaped-entities`, 13× `set-state-in-effect`, 9× `no-unused-vars`, 8× `react-hooks/refs`, 6× `no-img-element`

---

## 3. Constats par domaine

Sévérités : **[C]**ritique · **[M]**ajeur · **[m]**ineur · **[c]**osmétique. Tout constat = FAIT vérifié fichier:ligne, sauf mention HYPOTHÈSE.

### 3.1 Architecture & code (ARC)

- **ARC-01 [C] Build cassé au typecheck** — `_home-client.tsx:1010,1016` — `scentProducts[selectedScent]` avec `selectedScent: string | null` (TS2538 ×2) + param `p` any implicite. Impact : `next build` échoue.
- **ARC-02 [M] Aucun error boundary ni 404** — `find src/app` : zéro `error.tsx`, `global-error.tsx`, `not-found.tsx`, `loading.tsx`. Toute exception → écran Next brut ; slug inconnu → jamais 404 (cf. DAT-02).
- **ARC-03 [M] 8 composants morts** — jamais importés : `AnimatedCounter`, `GoldDivider`†, `HoverCard`, `ParallaxSection`, `ProductCard` (224 l., + `Badge`/`Button` par transitivité), `LenisProvider` (seul consommateur du package `lenis`), `ChatbotWidget` (209 l., seul consommateur UI de `/api/chat`). † vérifié par graphe d'imports complet.
- **ARC-04 [M] 5+ implémentations de carte produit** — `ProductCard`, `ProductCardLuxe`, `RailProductCard`, `OilProductCard`, `TrendCard` (+`ShoppableVideoCard`, `PackCard`) — chevauchement 60-80 %, calcul remise dupliqué (`ProductCardLuxe:55`, `RailProductCard:92`…), chacune avec sa palette hex locale.
- **ARC-05 [M] 3 sections best-sellers + 2 roues des senteurs rendues sur la même home** — `BestSellers` (SLIDES hardcodées) + `BestSellersRail` ×2 ; roue inline `_home-client.tsx:900-1050` + `ScentWheelInteractive` ; `ScentWheel.tsx:6` avoue être une copie.
- **ARC-06 [M] Home 100 % client** — `page.tsx` délègue tout à `_home-client.tsx` (1 282 l., `"use client"`, 35 imports, 10 fichiers data embarqués ~40 Ko dans le JS). Aucune frontière RSC.
- **ARC-07 [M] `lenis` mort** — package installé, `LenisProvider` jamais monté.
- **ARC-08 [m] `use client` superflus ×7** — `Badge`, `VideoPlaceholder`, `FreeShippingBar`, `JournalSection`, `OilSection`, `PaymentBadges`, `preview-card` (0 hook, 0 handler) + 21 pages preview clientes juste pour `useLocale`.
- **ARC-09 [m] 22 erreurs hooks ESLint** — `set-state-in-effect` ×13 (concentrées `ShippingChecker.tsx`), `react-hooks/refs` ×8, cleanup ref `RailProductCard.tsx:109`.
- **ARC-10 [m] Code mort intra-fichier** — `_home-client.tsx` : `oilItems:74`, `olfactoryFamilies:91`, `blogPosts:131`, `scentFamilies:138`, `CountdownTimer:192`, `FAQAccordion:296` + `{false && <BestSellers/>}` ligne 515 (import reste dans le bundle).
- **ARC-11 [m] Couche data importe la couche composants** — `best-sellers.ts:5`, `best-sellers-top.ts:7` (type-only, fragile) ; cycle type/valeur `CategoryRail` ⇄ `category-rail-data`.
- **ARC-12 [m] preview-twin vs preview-twin-compact ~90 % identiques** ; `OilSection` = wrapper de `OilCardCarousel` consommé seulement par preview.
- **ARC-13 [c] 19× apostrophes non échappées** (JSX) ; `@ts-expect-error` unique documenté (`Faq.tsx:247`, OK) ; mockup HTML orphelin à la racine.

### 3.2 Données produit (DAT)

- **DAT-01 [C] Même parfum, valeurs contradictoires dans 3-6 fichiers** — Aurum : 64,9 € (best-sellers) / 88 € (trends, marque « Dubaï Parfumerie » au lieu de Reef) / 49 € (videos, stories) / barré 129,9 vs 84,9 (bundle) ; Vanilla Voyage : marque « Maison Yara » vs « Dubaï Parfumerie » ; Noora : notes « Rosé/Ambré/Boisé » vs « Vanille, Musc blanc » ; Amber Oud : 34,9 / 29,9 / 68 €. Tableau complet dans l'annexe agent données.
- **DAT-02 [C] PDP disjointe + fallback silencieux** — `produit/[slug]/page.tsx:44-153,231` — les 6 slugs de `PRODUCTS` ne recoupent AUCUN slug de la couche data ; `PRODUCTS[slug] ?? PRODUCTS["lattafa-oud-pour-elle"]` → tout lien produit du site rend « Oud Pour Elle » en 200. `generateMetadata:160` rend pourtant « Produit introuvable ».
- **DAT-03 [C] Stock contradictoire** — Reef 33 : `trend-products.ts:105` épuisé vs `shoppable-videos.ts:75` dispo ; Oud & Roses inverse ; Noora idem (`oil-products.ts:75` vs `bundle-products.ts:58`).
- **DAT-04 [M] IDs panier non unifiés** — Aurum = `reef-aurum` / `top-aurum` / `bundle-aurum` / `aurum-50` / `aurum-100ml` → jusqu'à 5 lignes panier pour le même flacon ; `SampleSelector.tsx:463` génère des ids `Date.now()` → doublons à chaque ajout.
- **DAT-05 [M] Types divergents** — `price: Money` vs `number` ; prix barré = `compareAtPrice` / `was` / `oldPrice` ; 6 conventions d'identifiant ; `CURRENCY = "EUR"` dupliqué ×2.
- **DAT-06 [M] Agrégateurs à dédup cassée** — `sample-selector-products.ts:244` (clé brand|name, échoue car marques divergentes → même parfum affiché 2× à 2 prix) ; `productAttributes.ts:133` (aurum + reef-aurum coexistent avec attributs olfactifs différents).
- **DAT-07 [M] category-rail-data : labels/slugs croisés** — « Homme » → `slug: "parfum-interieur"` + icône diffuseur ; « Femme » → `parfum-voyage` ; « Mixte » → `format-50ml` (`category-rail-data.tsx:39-64`) ; et les 14 routes `/categorie/*` n'existent pas.
- **DAT-08 [M] Liens vers routes inexistantes (data)** — `/marques/reef`, `/best-sellers`, `/parfums`, `/retours`, `/pro`, `/jeu-concours`, `/confidentialite`, 14× `/categorie/*`.
- **DAT-09 [M] Images 404** — `oil-products.ts:42,63` → `/oils/accent-*.png` (dossier inexistant ; fallback gracieux mais accent jamais affiché).
- **DAT-10 [M] Quiz budget désaligné** — hints UI « <30 / 30-60 / >60 € » (`questions.ts:161-163`) vs filtres réels 0-40/40-65/65+ (`scoring.ts:29-33`).
- **DAT-11 [M] FAQ contredit shipping-countries** — France « 2-4 j » vs « 3-5 j » (`faq.data.ts:131` vs `shipping-countries.ts:70`) ; « 78 pays » vs 77 servis ; « 48h » vs « 24h » PDP ; intl « 5-12 j » vs max réel « 10-16 j ».
- **DAT-12 [M] PDP : contenu hardcodé identique pour les 6 produits** — image figée `/assets/prod-1.jpg` (ligne 304, ignore `product.image`), breadcrumb « Parfums Femme » pour tous (y compris Club de Nuit homme), 3 avis partagés, JSON-LD `InStock` toujours, promo permanente (oldPrice obligatoire).
- **DAT-13 [m] `available` absent de la moitié des modèles** (RailProduct, ScentProduct, SampleProduct, CatalogProduct) → ajout panier possible sur produits épuisés ailleurs.
- **DAT-14 [m] Quiz : options mortes** — Q7 `saffron`/`sandalwood` ne matchent aucun produit ; Q5 « saison » détournée en « occasion », `spring`/`autumn` insélectionnables.
- **DAT-15 [m] CTA stories/twins → `/promo-flash`** au lieu de la fiche produit malgré `productHandle` présent.
- **DAT-16 [m] Visuels croisés** — `prod-2.jpg` sert à 6 produits différents ; Noora affiche le flacon d'un autre produit.
- **DAT-17 [c] `was` = 2× price systématique** (bundle) — prix barré artificiel ; `href` dérivable stocké (`journal-articles.ts:12`) ; asymétrie promo Volcano entre les 2 rails.

### 3.3 i18n & RTL (I18N)

- **I18N-01 [C] Traduction de façade** — ~1 425 chaînes UI en dur (603 pages + 700 composants + 124 previews) vs 45 clés next-intl consommées par 6 fichiers sur 111. Un visiteur en/ar/ru voit ~97 % du site en FR. Pires fichiers : `_home-client.tsx` ~180, `Header.tsx` ~95, `produit/[slug]/page.tsx` ~85. ~60 aria-label/placeholder/alt FR en dur. Namespace `hero` traduit dans les 7 JSON mais **non consommé** (`AnimatedHero` SLIDES en dur).
- **I18N-02 [C] Tous les liens internes perdent la locale** — aucun `createNavigation`/`navigation.ts` ; 23 `<Link>` next/link bruts + 23 `<a>` internes (dont logo `Header.tsx:834`) → depuis `/en/` ou `/ar/`, chaque clic revient au FR. Recoupe les 28 erreurs ESLint `no-html-link-for-pages`.
- **I18N-03 [C] Aucun sélecteur de langue dans l'UI** — les 7 locales ne sont atteignables que par URL manuelle.
- **I18N-04 [M] `<html>` sans `lang` ni `dir`** — `layout.tsx:34` ; `lang`/`dir` posés sur un `<div>` (`[locale]/layout.tsx:25`) → scrollbar/portails LTR en arabe, WCAG 3.1.1. Contrainte : `<html>` hors segment `[locale]` (restructuration nécessaire).
- **I18N-05 [M] 14 fichiers `src/data` : texte utilisateur 100 % FR** rendu tel quel pour les 7 locales (descriptions, familles olfactives, 78 noms de pays, éditos).
- **I18N-06 [M] RTL incomplet** — 85 propriétés physiques inline vs 115 logiques ; `Header.tsx` non RTL-aware : tiroir panier `right:0` + `translateX(100%)` (:326,331), menu mobile `left:0` (:1129) glissent du mauvais côté en AR ; 56 flèches/chevrons non miroirés ; marquees non inversés. 28 composants correctement isRTL ✅.
- **I18N-07 [m] Parité JSON : parfaite** — 45 clés × 7 locales, 0 manquante, 0 ICU mismatch ✅ (3 valeurs identiques = invariants légitimes).

### 3.4 Design system & UI (DS)

- **DS-01 [M] Second design system pirate** — `fragrance-finder/tokens.ts:6-14` (or #C9A24A/#A8801F/#E8C873, crème #FAF6EE, encre #15110D) utilisé dans 33-40 fichiers — plus répandu que la palette officielle (#C8901E/#F8F2E6/#1C1611). Deux ors visiblement différents cohabitent sur la home. 919 hex + 362 rgb() en dur dans 82 fichiers (vs 1 677 `var(--…)`).
- **DS-02 [M] Contrastes hors WCAG (calculés)** — blanc sur or `Button.tsx:31-33` = 2,81:1 ; `--gold-500` sur crème = 2,52-2,72:1 (~30 usages texte : eyebrows, prix promo, `.dp-eyebrow`) ; #C9A24A sur #FAF6EE = 2,23:1 ; CTA newsletter 2,43:1. Conformes : or sur espresso 10,87:1, `--gold-700` sur page 4,52:1.
- **DS-03 [M] Focus ring écrasable** — unique indicateur = `globals.css:257` `:focus-visible {box-shadow: var(--focus-ring)}` ; tout `boxShadow` inline l'écrase (`BackToTop.tsx:35`, boutons de cards) + 20 `outline:"none"` inline ; hover de `Button` via onMouseEnter JS sans équivalent clavier ; 20 fichiers de `<button>` sans aucun état hover/focus.
- **DS-04 [M] Fonts : triple définition conflictuelle** — `next/font` (variable `--font-display`, famille hashée auto-hébergée) vs `globals.css:39,105` qui redéfinit `--font-display: 'Cormorant Garamond'` en `:root` (spécificité identique (0,1,0) → gagnant = ordre de cascade, fragile ; si `:root` gagne, retombée Times New Roman car aucune famille chargée sous ce nom). + `fontFamily` en dur dans les SVG (`ScentWheel.tsx:119-145`, `_home-client.tsx:971-997`) — mêmes symptôme potentiel. HYPOTHÈSE sur le rendu runtime, duplication = FAIT.
- **DS-05 [M] 16 breakpoints distincts** pour 3 canoniques (980/760/420) — les sections d'une même page basculent mobile à des largeurs différentes (760/768/860/900/1180).
- **DS-06 [M] Responsive par sélecteur d'attribut sur styles inline** — `globals.css:284-339` : `[style*="repeat(4,"] {...!important}` — matching textuel, déjà 3 variantes d'espaces gérées, extrêmement fragile.
- **DS-07 [m] Cards produit : 4 radius (14/18/18/22px), 3 typos de nom (17/20/24px), 4 paddings** — tokens `--t-serif-*` et `--r-sm` (spec « nearly square ») jamais utilisés ; `.dp-eyebrow` défini, 0 usage, réimplémenté inline en 6+ variantes.
- **DS-08 [m] Header : 64 lignes de couleurs littérales** — #ddd au lieu de `--line-200`, gradient or pirate ; `Badge.tsx:19-22` fallbacks hors palette (bleu marine) ; containers 1180 vs 1240px.
- **DS-09 [c] body en `--ink-900`** au lieu de `--ink-700` (référence) ; règles de base h1-h4/p/a absentes vs référence ; `@theme inline` = 3ᵉ copie morte des hex ; presets trend hors palette = choix documenté OK sauf preset `cream` (palette pirate).

### 3.5 Multidevise & prix (CUR)

- **CUR-01 [C] Multidevise = façade totale** — 7 devises en `<select>` Header/Footer (`Header.tsx:23`, `Footer.tsx:5`) ; state local jamais lu par rien, jamais persisté, Header et Footer indépendants (peuvent afficher 2 devises différentes) ; zéro taux de change, zéro prix par devise, zéro mapping locale→devise. Seul `RailProductCard` est structurellement multidevise-ready (`Money`), figé EUR.
- **CUR-02 [C] AddToCart PDP décoratif** — `AddToCart.tsx:15-18` : `setCartAdded(true)` + timeout, aucun `addItem`. Frais échantillon « +1,90 € » affiché mais jamais facturé (magic number dupliqué :75/:222). + `QuizSignature.tsx:241` émet `dp:add-to-cart` sans aucun listener.
- **CUR-03 [M] 7 conventions de formatage prix concurrentes** — `toFixed(2).replace(".",",")+" €"` / `toFixed(2)+" €"` (point non FR ×8 fichiers) / `toFixed(2)+"€"` collé / `Intl.NumberFormat` 0 décimale (**arrondit 34,9 → « 35 € »**, prix affiché ≠ prix panier ×8 composants) / `Intl` 2 déc. / symbole avant `"€ 129,80"` (BundleBuilder) / `currency ?? "€"` mélangé. Une même home peut afficher « 28,90 € », « 34.90 € », « 35 € », « € 129,80 ».
- **CUR-04 [M] Bundle 3-pour-2 : récap ≠ panier** — `BundleBuilder.tsx:35-42,133-140` — remise affichée dans le builder, produits ajoutés au panier au prix plein, aucun message dans le tiroir (divergence documentée mais visible client).
- **CUR-05 [M] Bandeau « il vous manque 42 € » statique** — `Header.tsx:1096,1109` — montant et barre 30 % codés en dur alors qu'un calcul réel existe 800 lignes plus haut (`GiftProgress:255-285`).
- **CUR-06 [m] Flottants non arrondis dans le panier** — `cart.ts:36-38` (63.800000000000004 ; seuils `>=` potentiellement ratés à l'epsilon — HYPOTHÈSE sur l'occurrence) ; mensualité 4× incohérente au centime (`produit/[slug]:234`) ; badge « -77% » vs 78 calculé (`promo-flash:8`).
- **CUR-07 [c] € en dur dans les traductions** — 3 conventions selon la locale (`en.json:11` « from €60 » vs `ru.json:11` « от 60 € ») ; `AnimatedCounter` en `toLocaleString("fr-FR")` fixe.

### 3.6 SEO (SEO)

- **SEO-01 [C] 22 routes preview indexables** — `robots.ts:5` ne bloque que `/api/` et `/_next/` ; 0 `metadata.robots` dans les preview → ~154 URLs de démo crawlables.
- **SEO-02 [C] Slug inconnu → 200** — produit (DAT-02) + blog (`blog/[slug]/page.tsx:61`, fallback) : duplicate content infini, jamais `notFound()`.
- **SEO-03 [C] Listing blog 100 % cassé** — 7 slugs de `blog/page.tsx` vs 2 clés de `blog/[slug]/page.tsx`, zéro correspondance → 7 liens × 7 locales servent le même article fallback.
- **SEO-04 [C] Zéro metadata traduite** — `getTranslations` : 0 occurrence dans src/. Title/description FR en dur pour les 7 locales sur toutes les pages.
- **SEO-05 [M] canonical/hreflang : home uniquement** (sans x-default) ; `og:locale` invalide `en_EN` (`page.tsx:29`).
- **SEO-06 [M] sitemap incomplet** — 5 pages sur 14 ; 0 article blog ; `lastModified: new Date()` à chaque build ; pas d'`alternates.languages` par entrée. Previews exclues ✅.
- **SEO-07 [M] 6 pages sans metadata** — marques, blog, faq (aucun export) ; promo-flash, suivi-commande, offres/lot-3-pour-2 (`"use client"` → export impossible dans le fichier).
- **SEO-08 [M] Lien interne vers route inexistante** — `/catalogue` (`produit/[slug]:380`) + liens Footer/FAQ morts (cf. CONT-04).
- **SEO-09 [m] JSON-LD Product : image relative, pas d'url/sku, `aggregateRating` 4.8/312 fabriqué** (risque pénalité rich snippets) ; pas de BreadcrumbList/Article ; FAQ JSON-LD valide mais FR-only sur 7 locales + injecté sur une preview.
- **SEO-10 [m] `NEXT_PUBLIC_SITE_URL` jamais lu** ; base URL en dur ×4 ; OG/twitter absents partout sauf home ; `generateStaticParams` absent sur blog ; meta keywords obsolète.

### 3.7 Performance (PERF)

- **PERF-01 [C] `public/` = 64 Mo** — LCP hero `slider-1.jpg` **6,9 Mo** (`AnimatedHero.tsx:21`, priority) ; PNG photographiques 5 Mo ×3 (categories), `scents/` 16 Mo ; vidéos `grecia-trend.mp4` 9,4 Mo en autoplay.
- **PERF-02 [M] Home full-client + data dans le bundle** (= ARC-06) — ~40 Ko de data TS shippés au client, hydration massive.
- **PERF-03 [m] `fill` sans `sizes`** — hero (`AnimatedHero:318`) + grille cards (`_home-client:804`) → srcset 100vw pour des cartes 50vw. Les ~40 autres usages ont un sizes correct ✅.
- **PERF-04 [m] StoryPlayer : 2 vidéos simultanées** dont une `filter: blur(40px)` plein écran (GPU mobile) ; 8 particules framer `repeat: Infinity` sur la home ; 15 fichiers de police (5 poids × 2 styles + 5).
- **PERF-05 [m] 7 `<img>` bruts** ; `next.config.ts` vide (pas de `images.formats` AVIF) ; framer importé de `"framer-motion"` sans LazyMotion.
- **PERF-06 [c] Attributs vidéo globalement corrects** (`preload="none"/"metadata"`, posters, muted) ✅ sauf TrendLightbox sans poster.

### 3.8 Accessibilité (A11Y)

- **A11Y-01 [M] `<html>` sans lang** (= I18N-04).
- **A11Y-02 [M] WelcomeModal sans sémantique dialog** — `WelcomeModal.tsx:106-235` : pas de role/aria-modal/Escape/focus trap/scroll lock ; inputs email+tel placeholder seul ; 2 `<select>` sans nom accessible ; s'ouvre auto après 1,8 s.
- **A11Y-03 [M] Contraste or** (= DS-02) — ~30 usages texte sous 3:1.
- **A11Y-04 [m] Inputs sans label** — suivi-commande (:39-49), Header login (:504-506) + recherche mobile (:1146), ChatbotWidget (:169). Corrects : Newsletter, PromoChecker, B2B, FaqSearch, ShippingChecker ✅.
- **A11Y-05 [m] TrendLightbox + BundleBuilder : dialog sans piège Tab** (Escape/focus initial OK) ; FragranceFinderModal et StoryPlayer complets ✅.
- **A11Y-06 [m] framer-motion ignore prefers-reduced-motion** — blanket CSS `globals.css:260` n'atteint pas les animations JS ; aucun `useReducedMotion`/`MotionConfig`. Le reste du site gère très bien reduced-motion (10+ composants) ✅.
- **A11Y-07 [c] Sémantique saine** — main/nav/footer, h1 unique (sauf 2ᵉ h1 dans le modal BundleBuilder), alt corrects, carousels labellisés ✅.

### 3.9 Sécurité & API IA (SEC)

- **SEC-01 [C] 4 routes IA publiques sans protection** — 0 rate limit, 0 auth, 0 validation de taille ; `/api/chat` transmet `messages` tel quel (payload jusqu'à ~1M tokens ≈ 3 $/requête) ; system prompt purement thématique sans garde-fou → proxy Claude générique détournable. Modèle `claude-sonnet-4-6`.
- **SEC-02 [M] Zéro validation d'entrée** — `quiz` (`answers` non vérifié), `search-audio` (`transcript` interpolé dans le prompt = injection triviale), `search-image` (`mediaType` non vérifié runtime).
- **SEC-03 [M] Aucun try/catch API** — body malformé ou 429/529 Anthropic → 500 brut, stack trace en dev ; stream chat non protégé mid-flight (client pend).
- **SEC-04 [M] 2 routes orphelines facturables** — `search-audio`/`search-image` appelées par aucun composant (+ `/api/chat` de facto mort, ChatbotWidget non monté).
- **SEC-05 [M] Aucun header de sécurité** — `next.config.ts` vide : pas de CSP/X-Frame-Options/HSTS/Referrer-Policy.
- **SEC-06 [m] ChatbotWidget ne vérifie pas `res.ok`** (bulle vide silencieuse) ; quiz `.filter(Boolean)` inopérant (spread d'undefined truthy → cartes produit vides) ; `cart.ts` : JSON.parse protégé ✅ mais cast non validé ; historique chat non plafonné (coût quadratique).
- **SEC-07 [c] Sain vérifié** ✅ — clé API serveur uniquement, 0 fuite `sk-ant`, `.env*` gitignorés et non trackés, `rel="noopener"` partout, pas d'eval, JSON-LD statique (commentaire d'échappement inexact mais sans risque).

### 3.10 Contenu & branding (CONT)

- **CONT-01 [C] WhatsApp +966 (Arabie Saoudite) marqué « à remplacer », actif à 4 endroits** — `FaqHelpCard.tsx:25`, `WhatsAppBubble.tsx:15`, `Footer.tsx:35,262`, `ResultScreen.tsx:14` — messages clients réels perdus.
- **CONT-02 [C] Commerce simulé visible** — PromoChecker accepte `/^(DUBAI|BIENVENUE)/` (:30) ; suivi-commande à dates en dur (« 20 juin, 09:14 ») quel que soit le numéro ; newsletter stub (commentaire « à remplacer par Brevo/Mailchimp », `NewsletterSection.tsx:88`).
- **CONT-03 [C] Pages légales inexistantes** — `/mentions-legales`, `/cgv`, `/confidentialite`, `/cookies` liées au Footer, aucune route. Non-conformité e-commerce (LCEN/RGPD).
- **CONT-04 [M] 15+ liens Footer morts** — `/nouveautes`, `/notre-histoire`, `/quiz`, `/b2b`, `/compte`, `/fidelite`… + FAQ (`/parfums`, `/retours`, `/pro`) ; réseaux sociaux génériques (`instagram.com` sans handle) alors que `@dubaiparfumerie` existe dans le JSON-LD.
- **CONT-05 [M] 3 domaines email** — `contact@dubaiparfumerie.com` / `retour@dubaiparfumerie.com` / `pro@dubai-parfumerie.fr` (tiret + .fr, `_home-client.tsx:122`).
- **CONT-06 [M] « Dubai » sans accent** — bloc SEO home (`_home-client.tsx:1263,1269`), chat « DUBAI PARFUMERIE » (`ChatbotWidget.tsx:127`) — graphie accentuée majoritaire ailleurs (35+).
- **CONT-07 [M] Rupture tu/vous** — « Tu pourrais aussi aimer » (`produit/[slug]:743`) sur un site vouvoyant.
- **CONT-08 [m] Terminologie éclatée** — « Best Sellers »/« Best-sellers »/« bestsellers »/« Best-seller » (6 variantes, 0 « meilleures ventes ») ; « 3 pour 2 acheté » bancal ; nav « Best-sellers » → `/promo-flash` ; « bois de oud » (élision manquante, :56).
- **CONT-09 [m] Médias** — `saison-bg.bak.jpg` en prod ; `slider-2-reef.jpg` + `oud-roses-card.mp4` orphelins ; conventions de nommage mixtes ; icônes scaffold Next à la racine `public/`. `brands/` homogène ✅ ; blog = vrai contenu rédactionnel, dates cohérentes ✅ ; espaces français avant ponctuation double globalement corrects ✅.

---

## 4. Tableau récapitulatif (Critiques + Majeurs)

| ID | Domaine | Sév. | Fichier principal | Effort |
|----|---------|------|-------------------|--------|
| ARC-01 | Archi | C | `_home-client.tsx:1010,1016` | S |
| DAT-01 | Données | C | `src/data/*` (7 catalogues) | L |
| DAT-02 | Données | C | `produit/[slug]/page.tsx:231` | M |
| DAT-03 | Données | C | trend/shoppable/oil/bundle | S* |
| SEO-01 | SEO | C | `robots.ts:5` | S |
| SEO-02 | SEO | C | produit+blog `[slug]` | S |
| SEO-03 | SEO | C | `blog/page.tsx` vs `blog/[slug]` | S |
| SEO-04 | SEO | C | toutes pages (metadata FR) | M |
| I18N-01 | i18n | C | ~48 composants + 14 pages | XL |
| I18N-02 | i18n | C | 46 liens internes | M |
| I18N-03 | i18n | C | Header (switcher absent) | S |
| CUR-01 | Devises | C | Header:23, Footer:5 | M/L |
| CUR-02 | Devises | C | `AddToCart.tsx:15` | S |
| SEC-01 | Sécurité | C | `api/*/route.ts` | M |
| CONT-01 | Contenu | C | WhatsApp ×4 fichiers | S |
| CONT-02 | Contenu | C | PromoChecker, suivi, newsletter | M |
| CONT-03 | Contenu | C | Footer (pages légales) | M |
| PERF-01 | Perf | C | `public/assets` 64 Mo | S |
| ARC-02 | Archi | M | src/app (error/404 absents) | S |
| ARC-03..07 | Archi | M | composants morts, cartes ×5, home client | M-L |
| DAT-04..12 | Données | M | ids, types, agrégateurs, FAQ | M-L |
| I18N-04..06 | i18n | M | html lang, data FR, RTL Header | M |
| DS-01..06 | Design | M | tokens.ts pirate, contrastes, fonts, focus | M-L |
| CUR-03..05 | Devises | M | 7 formats prix, bundle, bandeau 42 € | M |
| SEO-05..08 | SEO | M | hreflang, sitemap, metadata | M |
| SEC-02..05 | Sécurité | M | validation, try/catch, headers | M |
| A11Y-02..03 | A11y | M | WelcomeModal, contrastes | S-M |
| CONT-04..07 | Contenu | M | liens morts, emails, accents, tu/vous | S |

\* S en résolution ponctuelle, dépend de DAT-01 pour la résolution de fond.
Efforts : S < 2 h · M = ½-2 j · L = 2-5 j · XL > 5 j.

**Totaux consolidés (après dédoublonnage inter-domaines) : 18 Critiques · ~35 Majeurs · ~35 Mineurs · ~15 Cosmétiques.**

### Non vérifié (limites de l'audit)
- Rendu runtime réel des polices (DS-04) et de l'écrasement du focus ring — nécessite test navigateur.
- Comportement build complet (`next build`) — seul le typecheck a été exécuté.
- Occurrence réelle du raté de seuil flottant (CUR-06).
- Contenu du zip `Site/` et `Design System/` (archives non extraites, `_extracted/` supposé équivalent).
