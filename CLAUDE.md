@AGENTS.md

# Dubaï Parfumerie — Instructions projet

## Démarrage de session
1. Vérifier si le serveur tourne : `lsof -i :3000`
2. Si non : `cd app && npm run dev` puis ouvrir http://localhost:3000
3. Vérifier que le remote GitHub existe : `git remote -v`
4. Si pas de remote : demander à l'utilisateur de créer le repo GitHub et fournir l'URL, puis `git remote add origin <url>`

## Auto-save GitHub — toutes les 10 minutes

**À chaque session** : lancer une boucle auto-save avec `/loop 10m` et la commande suivante :

```bash
git add -A && git commit -m "auto-save $(date '+%Y-%m-%d %H:%M')" && git push origin main
```

Si pas de remote GitHub configuré → demander l'URL du repo à l'utilisateur avant de lancer la boucle.

Ne jamais committer : `.env*`, `node_modules/`, fichiers secrets.

## Stack
- Next.js 16 App Router + TypeScript
- Tailwind CSS v4 + CSS variables design tokens
- Framer Motion pour les animations
- next-intl pour l'i18n (7 langues : FR EN ES DE IT RU AR)

## Structure
```
src/
  app/              → pages (App Router)
  components/
    ui/             → Badge, Button, ProductCard
    layout/         → Header, Footer
    sections/       → sections homepage
  lib/              → utilitaires
  messages/         → traductions i18n
public/assets/      → images produits, logo, hero
```

## Design tokens
Tous définis dans `src/app/globals.css` comme CSS custom properties.
Palette : `--gold-500 #C8901E`, `--espresso-900 #15100B`, `--surface-page #FDFBF6`
Typo : `--font-display 'Cormorant Garamond'`, `--font-sans 'Jost'`

## GitHub
Repo : à configurer (demander à l'utilisateur si absent)
Branch principale : `main`
