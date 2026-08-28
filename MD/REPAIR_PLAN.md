# STRATÉGIE DE RÉPARATION — Dubaï Parfumerie
**Date** : 2026-07-01 · Compagnon de `AUDIT_REPORT.md` (IDs référencés).
Règles d'exécution : branche dédiée par phase, commits atomiques, aucun merge sans validation.

> ## ⚠️ PÉRIMÈTRE RÉVISÉ (2026-07-01) : MAQUETTE DESIGN
> Le projet est une **maquette design**, pas une boutique en production. Décision utilisateur.
> **Hors périmètre tant que statut maquette** : commerce réel (checkout, suivi, newsletter, codes promo — 1.6, 4.7), pages légales (CONT-03), rate limiting/headers sécurité (1.4, 1.7 — garder juste la clé API côté serveur ✅ déjà OK), multidevise réel (4.3), SEO production (3.1-3.3, hreflang, sitemap, JSON-LD).
> **Reste prioritaire pour une maquette** :
> 1. **Build sain** — ARC-01 (3 erreurs tsc)
> 2. **Cohérence visuelle** — DS-01 (2 palettes or), DS-02 (contrastes), DS-04 (conflit fonts), DS-07 (cards divergentes)
> 3. **Incohérences visibles à l'écran** — même produit à 2 prix/2 marques sur la même page (DAT-01 version légère : aligner les valeurs, pas besoin d'architecture), formats de prix (CUR-03), stock contradictoire (DAT-03)
> 4. **Démo multilingue/RTL crédible** — switcher (I18N-03), liens qui gardent la locale (I18N-02), RTL Header (I18N-06) — la traduction exhaustive (I18N-01) peut se limiter aux pages de démo
> 5. **Poids des assets** — PERF-01 (64 Mo → maquette lente à charger/partager)
> 6. **Copy/branding** — accents Dubaï, tu/vous, WhatsApp ✅ fait
> Le numéro WhatsApp +966 est le **numéro officiel confirmé** (centralisé dans `src/lib/contact.ts`).

---

## 1. Priorisation — matrice impact × effort

```
IMPACT
  ↑
 F │ DAT-02 notFound()   SEO-01 noindex previews │ DAT-01 catalogue unique
 O │ CUR-02 AddToCart    ARC-01 fix tsc          │ I18N-01 traduire ~1425 chaînes
 R │ CONT-01 WhatsApp    SEO-02/03 slugs blog    │ CUR-01 vrai multidevise
 T │ PERF-01 compresser  SEC-01 rate limit       │ ARC-04/06 refonte cartes + home RSC
   │─────────────────────────────────────────────│─────────────────────────────
 f │ CONT-06 accents     DS-08 header colors     │ DS-05 unifier breakpoints
 a │ CONT-09 .bak        ARC-10 code mort inline │ ARC-08 use client superflus
 i │ SEO-10 og:locale    A11Y-04 labels inputs   │ DS-09 règles de base CSS
 b │                                             │
 l └──────── FAIBLE EFFORT ──────────────────────┴──────── FORT EFFORT ────────→
```

**Quick wins** (fort impact, < 2 h chacun) : ARC-01, DAT-02+SEO-02, SEO-01, SEO-03, CUR-02, CONT-01, PERF-01, I18N-03.
**Chantiers de fond** (à planifier, pas à improviser) : DAT-01 (source unique), I18N-01 (traduction réelle), CUR-01 (multidevise réel), ARC-04/06 (refonte cartes + home RSC).

---

## 2. Plan par phases

### Phase 0 — Quick wins (1-2 jours, risque ≈ nul)

| # | Correctif | Où | Comment | Risque | Test de validation |
|---|-----------|----|---------| -------|--------------------|
| 0.1 | **ARC-01** Fix 3 erreurs tsc | `_home-client.tsx:1010,1016` | Garde `if (!selectedScent) return null` (ou `selectedScent &&`) avant l'indexation ; typer `p` | Nul | `npx tsc --noEmit` → 0 erreur ; home s'affiche, roue interactive OK |
| 0.2 | **DAT-02 + SEO-02** `notFound()` sur slug inconnu | `produit/[slug]/page.tsx:231`, `blog/[slug]/page.tsx:61` | Remplacer `?? PRODUCTS[...]` par `if (!product) notFound()` ; idem generateMetadata | Faible : liens actuellement « fonctionnels » via fallback deviendront 404 — c'est voulu, mais vérifier les liens de la home avant (cf. 1.2) | `curl -s -o /dev/null -w '%{http_code}' localhost:3000/produit/xyz` → 404 ; les 6 slugs valides → 200 |
| 0.3 | **SEO-03** Resynchroniser slugs blog | `blog/page.tsx:15-87` | Aligner les 7 slugs du listing sur les clés existantes (2) ou déplacer les données dans un fichier commun `src/data/blog-articles.ts` consommé par les 2 pages (préférable, prépare 4.x) | Faible | Cliquer chaque carte du listing → article correspondant, plus jamais le fallback |
| 0.4 | **SEO-01** Bloquer les previews | `robots.ts` + `src/app/[locale]/preview*/` | `disallow: ['/api/', '/_next/', '/*/preview', '/preview']` + export `metadata.robots = {index: false}` via un `layout.tsx` commun `preview`-group ; option : gate par `process.env.NODE_ENV !== 'production'` avec `notFound()` | Nul en prod | `curl localhost:3000/robots.txt` ; `curl -I /preview-roue` → header noindex ou 404 |
| 0.5 | **CUR-02** Brancher AddToCart | `AddToCart.tsx:15-18` | Importer `addItem` de `@/lib/cart`, pousser `{id: slug, name, price(, sample±1.90)}` | Faible : vérifier clé id cohérente avec le tiroir Header | Ajouter depuis la PDP → article + total corrects dans le tiroir panier ; badge compteur s'incrémente |
| 0.6 | **CONT-01** Numéro WhatsApp | `WhatsAppBubble.tsx:15`, `FaqHelpCard.tsx:25`, `Footer.tsx:35,262`, `ResultScreen.tsx:14` | Centraliser dans une constante `src/lib/contact.ts` (ou `NEXT_PUBLIC_WHATSAPP_NUMBER`) ; ⚠️ demander le vrai numéro à l'utilisateur | Nul | grep `966583728407` → 0 occurrence ; clic bulle → bon numéro |
| 0.7 | **PERF-01** Compresser les assets | `public/assets/` | `slider-1.jpg` 6,9 Mo → ~300 Ko (JPEG q80 2400px) ; PNG photos categories/scents → JPEG/WebP ; supprimer `saison-bg.bak.jpg`, `slider-2-reef.jpg`, `oud-roses-card.mp4` (orphelins) ; ajouter `images.formats: ['image/avif','image/webp']` dans next.config | Nul (garder les originaux dans `Creation Contenu/`) | `du -sh public/` < 15 Mo ; home visuellement identique ; Lighthouse LCP |
| 0.8 | **CONT-06/07/08** Micro-copy | `_home-client.tsx:1263,1269`, `ChatbotWidget.tsx:127`, `produit/[slug]:743,56` | « Dubaï » accentué, « Vous pourriez aussi aimer », « bois d'oud » | Nul | grep « Dubai Parfumerie » (sans accent) → 0 dans le texte visible |
| 0.9 | **SEO-10** `og:locale` | `[locale]/page.tsx:29` | Map explicite `{en:'en_US', fr:'fr_FR', ar:'ar_AE', ...}` | Nul | View-source /en/ → `og:locale` valide |

### Phase 1 — Critiques : données, sécurité, commerce (1-2 semaines)

| # | Correctif | Où | Comment | Risque | Test |
|---|-----------|----|---------|--------|------|
| 1.1 | **DAT-01/04/05 Source unique de vérité produit** — LE chantier pivot | Créer `src/data/catalog.ts` | Un type `Product` canonique (`slug` clé unique, `name`, `brand`, `price: Money`, `compareAtPrice?`, `available`, `images[]`, `notes`, `families`, `gender`) ; fusionner les 7 catalogues en arbitrant chaque conflit (prix/marque/image — décision métier à valider avec l'utilisateur, tableau des conflits dans AUDIT_REPORT DAT-01) ; les fichiers existants deviennent des **vues** (`bestSellerSlugs: string[]` + lookup) ; panier : id = slug partout | **Moyen** : touche toutes les sections de la home. Migrer section par section, commit par commit (rails → trends → oils → packs → videos → stories → twins → scent-wheel → agrégateurs → PDP → API) | Après chaque section : prix identique home vs PDP vs panier ; `tsc` 0 erreur ; aucun doublon dans SampleSelector ni FragranceFinder |
| 1.2 | **DAT-02 (fond)** PDP consomme le catalogue | `produit/[slug]/page.tsx:44-153` | Supprimer `PRODUCTS` local, lire `catalog.ts` ; `generateStaticParams` depuis le catalogue ; image/breadcrumb/genre depuis les données (DAT-12) | Moyen | Tout lien produit du site → fiche du BON produit ; slug bidon → 404 |
| 1.3 | **DAT-03** Stock unifié | via 1.1 | `available` unique par produit dans catalog.ts | Nul après 1.1 | Reef 33 cohérent partout |
| 1.4 | **SEC-01/02/03** Blinder les routes IA | `api/chat`, `api/quiz` (+ décision sur search-*) | try/catch + statuts propres ; validation : max 20 messages × 2 000 chars, rôles `user|assistant` seulement, `answers` schéma strict ; rate limit (LRU en mémoire par IP : 10 req/min, ou Vercel KV) ; `max_tokens` déjà borné à vérifier ; system prompt : consigne de refus hors-sujet | Faible | curl body 1 Mo → 413/400 ; 11ᵉ requête/min → 429 ; erreur Anthropic simulée → 502 JSON propre, pas de stack |
| 1.5 | **SEC-04 + ARC-03** Supprimer le code mort | `api/search-audio`, `api/search-image`, `ChatbotWidget` (ou le monter), `LenisProvider`+dep `lenis`, `ProductCard`+`Badge`+`Button`, `AnimatedCounter`, `HoverCard`, `ParallaxSection`, `GoldDivider` | **Décision utilisateur** : le chatbot est-il voulu ? Si oui → le monter dans `[locale]/layout.tsx` et garder `/api/chat` blindé ; si non → supprimer widget + route. Search audio/image : supprimer (re-créables depuis git) | Faible (rien n'est importé — vérifié par graphe) | `npm run build` OK ; grep imports → 0 référence |
| 1.6 | **CONT-02/03** Commerce honnête + légal | `PromoChecker`, `suivi-commande`, `NewsletterSection`, 4 pages légales | PromoChecker : liste réelle de codes (constante) ou message « bientôt disponible » ; suivi : état vide honnête (« aucune commande trouvée ») tant que pas de backend ; newsletter : brancher un provider OU stocker en attendant (⚠️ décision utilisateur) ; créer `/mentions-legales`, `/cgv`, `/confidentialite`, `/cookies` (contenu à fournir par l'utilisateur — gabarits vides interdits en prod) | Faible | Code promo bidon `DUBAIXYZ` → refusé ; liens Footer légaux → 200 |
| 1.7 | **SEC-05** Headers sécurité | `next.config.ts` | `headers()` : X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy ; CSP en Report-Only d'abord (styles inline partout → `style-src 'unsafe-inline'` requis) | Moyen (CSP peut casser) — d'où Report-Only | `curl -I /` → headers présents ; console navigateur sans violation bloquante |
| 1.8 | **ARC-02** error.tsx / not-found.tsx / loading.tsx | `src/app/[locale]/` | not-found brandée (charbon/or, lien retour) ; error.tsx client avec reset ; loading.tsx léger sur produit et blog | Nul | Slug bidon → 404 brandée ; throw volontaire → error boundary |
| 1.9 | **CONT-04/05 + DAT-08** Liens et emails | `Footer.tsx`, `Header.tsx:108`, `faq.data.ts`, `category-rail-data.tsx`, data hrefs | Corriger vers les routes réelles, supprimer les entrées sans page (ou créer les pages si prévues — décision), un seul domaine email (lequel ? → utilisateur), vrais handles sociaux `@dubaiparfumerie` | Faible | Script : extraire tous les href internes, curl chacun → 0×404 |

### Phase 2 — i18n réelle & design system (2-4 semaines)

| # | Correctif | Où | Comment | Risque | Test |
|---|-----------|----|---------|--------|------|
| 2.1 | **I18N-02** Navigation localisée — AVANT la traduction | `src/i18n/navigation.ts` (nouveau) | `createNavigation(routing)` ; remplacer les 23 `next/link` + 23 `<a>` internes par le `Link` next-intl (corrige aussi les 28 erreurs ESLint) | Faible, mécanique | Depuis `/en/`, cliquer logo/nav/cards → reste sur `/en/...` |
| 2.2 | **I18N-04** `<html lang dir>` | Restructurer : root layout minimal, `<html>`/`<body>` dans `[locale]/layout.tsx` (pattern next-intl officiel) | Attention à `next/font` (variables sur html) et suppressHydrationWarning | Moyen : layout racine touché | `/ar/` → `<html lang="ar" dir="rtl">` ; scrollbar à gauche ; hydration sans warning |
| 2.3 | **I18N-03** Sélecteur de langue | `Header.tsx` | `useLocale` + `router.replace(pathname, {locale})` du navigation.ts ; drapeau/label dans le header desktop + menu mobile | Faible | Switch fr→ar → même page en AR RTL |
| 2.4 | **I18N-01** Migration des chaînes — par lots | messages/*.json + composants | Ordre : chrome (Header/Footer ~140) → home → PDP → pages catégories → FAQ/livraison → fragrance-finder/quiz → previews (ou jamais). Inclure les ~60 aria-label/placeholder. Consommer le namespace `hero` déjà traduit. Traductions : FR source, EN humain, autres = à faire valider | Long mais mécanique ; risque de clés oubliées | Script de parité de clés (déjà 0 écart) ; balayage visuel /en/ et /ar/ par page migrée : 0 texte FR résiduel |
| 2.5 | **I18N-05** Localiser src/data | Choix d'architecture : champs `{fr: '', en: '', ...}` OU clés i18n dans les données (`nameKey`) | Recommandation : textes courts (labels, familles) → messages ; descriptions produit → champ multilingue dans catalog.ts | Moyen | ScentWheel/OlfactiveTwin en /en/ → descriptions EN |
| 2.6 | **I18N-06** RTL Header + flèches | `Header.tsx:326,331,1129`, 56 glyphes | Tiroirs : `insetInlineEnd`/`translateX` conditionné isRTL ; flèches : composant `<DirectionalArrow/>` ou `transform: scaleX(-1)` conditionnel ; marquees inversés | Faible | /ar/ : tiroir panier glisse depuis la gauche visuelle correcte, chevrons miroirés |
| 2.7 | **DS-01** Fusionner les deux palettes or | `fragrance-finder/tokens.ts` + 33 fichiers | **Décision design à valider** : quel or gagne (#C8901E canonique vs #C9A24A répandu) ? Puis : `tokens.ts` re-exporte des `var(--...)` (1 fichier) et migration progressive des hex | Moyen (visuel) : screenshots avant/après par section | Diff visuel home/PDP ; grep #C9A24A → 0 |
| 2.8 | **DS-02/A11Y-03** Contrastes | `Button.tsx:31`, eyebrows, prix promo | Texte sur or → `--ink-900` (le DS le prévoit : `--badge-promo-fg`) ; or sur crème → `--gold-700` (4,52:1 ✅) pour tout texte < 18px | Faible (visuel à valider) | Script de ratio (réutiliser celui de l'audit) → 100 % ≥ 4,5:1 texte normal |
| 2.9 | **DS-04** Trancher le conflit fonts | `globals.css:39-40,105-106` | Supprimer les redéfinitions littérales de `--font-display`/`--font-sans` en `:root`/@theme (next/font est la source) ; SVG : `fontFamily="var(--font-display)"` | Faible mais **tester d'abord au runtime** (screenshot avant/après) | Screenshot : Cormorant rendu partout, y compris textes SVG de la roue |
| 2.10 | **DS-03** Focus & hover | Button, 20 fichiers | Hover : remplacer onMouseEnter JS par classes CSS `:hover/:focus-visible` ; auditer les boxShadow inline qui écrasent le ring | Faible | Tab sur toute la home : ring visible sur chaque interactif |
| 2.11 | **A11Y-02** WelcomeModal + dialogs | `WelcomeModal.tsx`, `TrendLightbox`, `BundleBuilder` | role=dialog, aria-modal, Escape, focus trap (copier le pattern déjà correct de `FragranceFinderModal:135-166`), labels inputs/selects | Faible | Clavier seul : ouvrir/naviguer/fermer chaque modal |
| 2.12 | **CUR-03** Formateur de prix unique | `src/lib/price.ts` (nouveau) | `formatPrice(money, locale)` via Intl.NumberFormat 2 décimales ; remplacer les 7 patterns (~25 fichiers) ; supprime le bug d'arrondi « 35 € » | Faible, mécanique | 34,9 → « 34,90 € » en fr, « €34.90 » en en ; grep `toFixed(2)` → 0 dans les composants |

### Phase 3 — SEO, perf, a11y résiduelle (1-2 semaines)

| # | Correctif | Où | Comment | Test |
|---|-----------|----|---------|------|
| 3.1 | **SEO-04/05/07** Metadata localisées + hreflang partout | Toutes les pages | `generateMetadata` + `getTranslations` ; helper `buildAlternates(path)` (hreflang 7 locales + x-default, cohérent as-needed) ; pages client (promo-flash, suivi, offres) : extraire un `page.tsx` serveur qui exporte metadata et rend le client | View-source de chaque page × 2 locales : title traduit, canonical, hreflang complet |
| 3.2 | **SEO-06** Sitemap complet | `sitemap.ts` | Les 14 pages + produits + articles depuis catalog/blog data ; `alternates.languages` ; lastModified réel (date de données) | `curl /sitemap.xml` : toutes les URLs, 0 preview |
| 3.3 | **SEO-09** JSON-LD | PDP, blog | Product : image absolue, url, sku, retirer `aggregateRating` fabriqué (⚠️ avant prod) ; BreadcrumbList ; Article sur blog ; FAQ JSON-LD localisé | Validateur schema.org / Rich Results Test |
| 3.4 | **PERF-02/ARC-06** Home : découpage RSC | `_home-client.tsx` | Éclater en sections ; celles sans interactivité (SEO text block, trust items, journal) → Server Components ; data lourde (shipping-countries 14 Ko) chargée côté serveur ou à la demande | Bundle analyzer avant/après ; comportement visuel identique |
| 3.5 | **PERF-03/05** Images | AnimatedHero, _home-client:804, 7 `<img>` | `sizes` explicites ; migrer les `<img>` vers next/image | Lighthouse ; 0 warning ESLint no-img-element |
| 3.6 | **A11Y-04/06** Labels + reduced-motion framer | inputs listés, 3 composants framer vivants | aria-label/labels ; `useReducedMotion()` → désactiver particules hero et reveals | axe-core 0 erreur critique ; OS reduced-motion → home statique |
| 3.7 | **ARC-09** Hooks ESLint | ShippingChecker, WhatsAppBubble, etc. | setState-in-effect → init lazy/useSyncExternalStore ; refs cleanup | `npm run lint` → 0 erreur |

### Phase 4 — Dette structurelle (continu, après stabilisation)

| # | Chantier | Contenu |
|---|----------|---------|
| 4.1 | **ARC-04** Carte produit unique | `<ProductCard variant="luxe|rail|oil|trend">` sur le type Product canonique ; supprime ~1 200 lignes dupliquées. À faire APRÈS 1.1 (même modèle de données) et 2.7 (même palette) |
| 4.2 | **ARC-05** Une seule section best-sellers, une seule roue | Décision produit : garder `BestSellersRail` (données catalog) + `ScentWheelInteractive` ; supprimer `BestSellers`, roue inline, `ScentWheel` copie |
| 4.3 | **CUR-01** Multidevise réel | Seulement si besoin métier confirmé : table de taux (statique versionnée ou API), `CurrencyContext` persisté (localStorage), mapping locale→devise par défaut, formatPrice l'utilise. Le modèle `Money` de 1.1 le prépare |
| 4.4 | **ARC-12 + routes preview** | Supprimer les previews (ou les déplacer hors `[locale]` derrière un flag dev) ; fusionner les variantes twin/bestsellers |
| 4.5 | **DS-05/06** Breakpoints + responsive | 3 breakpoints canoniques ; remplacer le hack `[style*="repeat(4,"]` par des classes utilitaires grid |
| 4.6 | **Décision Tailwind** | Soit l'adopter vraiment, soit retirer la chaîne PostCSS/Tailwind (le CLAUDE.md projet dit styles inline + variables → retrait cohérent) |
| 4.7 | **Backend réel** | Checkout, commandes, suivi, newsletter, codes promo : tout le « commerce simulé » de Phase 1.6 attend une vraie plateforme (décision : Stripe + backend léger ? Shopify headless ? hors périmètre audit) |

---

## 3. Ordre d'exécution & dépendances

```
Phase 0 (tout parallélisable, sauf 0.2 après vérif des liens home)
   ↓
1.1 catalog.ts ──→ 1.2 PDP ──→ 1.3 stock ──→ (4.1 cartes, 4.2 sections, 4.3 devises)
1.4 API blindées ──→ 1.5 suppression code mort (décision chatbot d'abord)
1.6 commerce honnête (décisions utilisateur : codes promo, newsletter, contenu légal)
1.8 error/404 (indépendant, peut se faire en Phase 0)
   ↓
2.1 navigation.ts ──→ 2.4 migration chaînes (JAMAIS l'inverse : traduire avant
2.2 html lang/dir ──→ 2.3 switcher            de fixer les liens = retravail)
2.7 palette (décision design) ──→ 2.8 contrastes ──→ 4.1 carte unique
2.9 fonts (test runtime d'abord)
2.12 formatPrice ← dépend de 1.1 (type Money)
   ↓
3.1-3.3 SEO ← dépendent de 2.4 (metadata traduites) et 1.1 (données fiables)
3.4 home RSC ← après 2.4 (éviter de migrer deux fois les mêmes lignes)
```

**Décisions utilisateur bloquantes à obtenir tôt** :
1. Vrai numéro WhatsApp (0.6)
2. Arbitrage des conflits produit : prix/marque/image officiels par parfum (1.1)
3. Chatbot : garder ou supprimer (1.5)
4. Domaine email officiel (1.9)
5. Or canonique : #C8901E ou #C9A24A (2.7)
6. Contenu des pages légales (1.6)
7. Multidevise : vraiment nécessaire ou retirer les selects ? (4.3 vs quick-fix : masquer les selects)

## 4. Ce qu'il NE faut PAS toucher tout de suite

- **La refonte des 5 cartes produit (4.1)** avant d'avoir catalog.ts et la palette unifiée — sinon on refactorise deux fois.
- **La migration Tailwind ou son retrait (4.6)** — cosmétique de build, zéro impact utilisateur, à faire à froid.
- **Le multidevise réel (4.3)** — gros chantier sans valeur tant que le checkout n'existe pas ; masquer les selects suffit (10 min) pour arrêter de mentir à l'utilisateur.
- **Les routes preview** au-delà du noindex (0.4) — utiles en dev ; suppression = Phase 4.
- **`shipping-countries.ts` (78 pays)** — données saines, seule la FAQ doit s'y aligner (1.9/DAT-11), pas l'inverse.
- **L'infra next-intl (routing/middleware/request)** — correcte, ne pas la « réparer ».
- **Les composants RTL-aware existants (28)** et les modals FragranceFinder/StoryPlayer — ce sont les modèles à copier, pas à modifier.
- **`.env.local` / secrets** — hors périmètre, ne jamais committer.

## 5. Trois premières actions à lancer

1. **Phase 0 complète sur une branche `fix/quick-wins`** (~1 jour) : tsc, notFound, slugs blog, noindex previews, AddToCart branché, WhatsApp centralisé, assets compressés. Débloque le build et arrête les dégâts SEO/commerciaux immédiats.
2. **Obtenir les 7 décisions utilisateur** (section 3) — surtout l'arbitrage prix/marque par produit, préalable absolu au chantier pivot.
3. **Lancer 1.1 `catalog.ts`** (branche `feat/catalog-unique`) : le correctif dont dépendent la moitié des autres — migration section par section, commits atomiques, test de cohérence prix home/PDP/panier à chaque étape.
