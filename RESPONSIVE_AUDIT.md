# Audit Responsive — Dubaï Parfumerie

Mission : rendre le site irréprochable sur mobile/tablette, sans régression desktop ni RTL (7 langues, dont arabe).
Conventions : styles inline + variables CSS + `<style>` scoped (PAS de classes Tailwind utilitaires).
Couche responsive centrale : `src/app/globals.css` (overrides `!important` sur les styles inline via sélecteurs d'attribut `[style*="…"]`).

Date : 2026-06-30 · Statut global : **bon** (infra responsive déjà en place par les passes précédentes ; trous comblés ci-dessous).

---

## État de l'infrastructure (déjà en place avant cette passe)

- ✅ `<meta viewport width=device-width, initial-scale=1, maximum-scale=5>` présent dans `src/app/layout.tsx` (`export const viewport`).
- ✅ `html, body { max-width:100%; overflow-x:hidden }` + `img,svg,video { max-width:100% }` dans globals.css → garde-fou anti-scroll horizontal.
- ✅ Header : burger + drawer plein écran (`.dp-burger`/`.dp-nav`/`.dp-search` togglés par media query ≤760), `CartSidebar`/`AuthModal`/`mobile drawer` en `min(…, Xvw)`.
- ✅ Grilles inline `repeat(4,…)`/`repeat(3,…)` rabattues en 2 col (≤980) via globals.
- ✅ Composants enfants (ScentWheelInteractive, FAQ, PackCard/PackGrid, ShippingChecker, CategoryRail, OilProductCard, TrendCarousel, NewsletterSection, FragranceFinderModal) gèrent leur propre responsive — non touchés.
- ✅ `FragranceFinderModal` utilise déjà `100dvh`.

---

## Problèmes repérés → criticité → statut

| Zone / fichier | Problème mobile | Criticité | Statut |
|---|---|---|---|
| Réassurance 5 piliers — `_home-client.tsx:1320` `repeat(5,1fr)` | Non couvert par globals → 5 colonnes maintenues en tablette ET mobile → débordement / illisible | **Bloquant** | ✅ Résolu (règle `repeat(5,…)` ajoutée : 2 col ≤980 et ≤760) |
| Footer colonnes liens — `Footer.tsx:371` `repeat(5,1fr)` | 5 colonnes maintenues sur mobile → texte écrasé / overflow | **Bloquant** | ✅ Résolu (même règle `repeat(5,…)` ; le sélecteur d'attribut capture aussi le footer) |
| Grilles cartes produits mobile — `repeat(4,…)`/`repeat(3,…)` | Forcées en **1 colonne** ≤760 (cartes géantes), alors que la norme e-commerce / le brief demandent **2 colonnes** | Moyen | ✅ Résolu (≤760 : cartes `repeat(4/3/5)` → 2 col ; panneaux `1fr 1fr`/`1.3fr`/`repeat(2)` restent empilés) |
| WelcomeModal — `_home-client.tsx` `.dp-welcome-inner max-height:88vh` | `vh` provoque des sauts avec la barre d'URL mobile | Cosmétique | ✅ Résolu (`88dvh` sur mobile) |
| Fiche produit — grille principale `1fr 1fr` (`page.tsx:285`) | Deux colonnes côte à côte sur mobile | Moyen | ✅ Déjà couvert (rabat 1 col ≤760) ; miniatures `repeat(4,1fr)` → 2×2 sur mobile (OK) |
| Header — sélecteurs langue/devise (`<select>` 11px, topbar 38px) | Cibles tactiles < 44px | Cosmétique | ⚠️ Restant — natifs `<select>` (picker OS), usables mais sous la cible 44px |
| Header mega-menu — caption `left:16` (`Header.tsx:625`) | Propriété physique `left` (ne flippe pas en RTL) | Cosmétique | ⚠️ Restant — desktop only (mega caché ≤760), impact RTL marginal |
| Captions absolues symétriques (`left:20;right:20`, ex. `_home-client.tsx:1129`) | Propriétés physiques | Cosmétique | ⚠️ Restant — symétriques donc visuellement RTL-safe |
| AnimatedHero `minHeight:70vh` / produit `minHeight:100vh` | `vh` (pas `dvh`) sur conteneurs de page | Cosmétique | ⚠️ Restant — conteneurs de page (pas des modales), tolérable |
| QuizSignature `optionsGrid repeat(2,1fr)` | Rabattu en 1 col ≤760 | Cosmétique | ✅ Acceptable (1 col mobile correct) |

---

## Modifications apportées (cette passe)

**`src/app/globals.css`** (seul fichier modifié) :
1. `@media (max-width: 980px)` — ajout de `repeat(5,…)` → 2 colonnes (corrige réassurance + footer en tablette).
2. `@media (max-width: 760px)` — séparation en deux groupes :
   - Grilles de **cartes** `repeat(4/3/5,1fr)` → **2 colonnes** (au lieu de 1) — aligné sur le brief.
   - Panneaux **éditoriaux** `1fr 1fr` / `1.3fr…` / `repeat(2,…)` → **1 colonne** (empilés).
3. `.dp-welcome-inner` → `max-height: 88dvh` (au lieu de `88vh`).

Aucun composant `.tsx` modifié → zéro risque de conflit avec les autres agents.

---

## Vérification

- `curl -L` 200 : `/fr`, `/ar`, `/fr/faq`, `/fr/produit/oud-pour-elle`, `/fr/livraison`, `/fr/parfums-femme`, `/ar/marques`.
- Aucune erreur de compilation dans le log dev.
- Breakpoints testés mentalement (360 / 390 / 414 / 768 / 1280) en LTR + RTL : grilles cartes 2 col mobile, panneaux empilés, footer/réassurance 2 col, zéro débordement horizontal (garde-fou `overflow-x:hidden`).

## Reste à faire (non bloquant)

1. Cibles tactiles 44px : agrandir les `<select>` langue/devise du Header sur mobile (padding/hauteur) — touche `Header.tsx` (zone partagée).
2. RTL strict : convertir les `left/right` physiques résiduels (mega-menu caption, captions absolues) en propriétés logiques `insetInlineStart/End`.
3. `dvh` : remplacer `vh` → `dvh` sur `AnimatedHero` (70vh) et le wrapper fiche produit (100vh) si l'on veut le comportement mobile idéal.
