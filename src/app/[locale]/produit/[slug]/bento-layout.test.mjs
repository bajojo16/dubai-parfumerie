/**
 * Vérification autonome du moteur de pavage bento.
 *
 *   npx tsx --tsconfig tsconfig.json "src/app/[locale]/produit/[slug]/bento-layout.test.mjs"
 *
 * Pas de framework : cinq fiches représentatives du catalogue, le pavage
 * rejoué comme le ferait le placement automatique de CSS Grid, puis trois
 * assertions par cas (aucune rangée incomplète, aucune tuile perdue, aucune
 * tuile en double) et le schéma ASCII de la grille pour qu'on VOIE le résultat.
 */

import { bentoLayout, tileSpecs } from "./bento-layout.ts";

const COLUMNS = 6;

// ─── Fabriques de jeux de données ─────────────────────────────────────────────

function product(over = {}) {
  return {
    name: "Parfum",
    brand: "Maison",
    price: 49,
    oldPrice: 69,
    rating: 4.8,
    reviews: 891,
    concentration: "Eau de parfum 30 %",
    volume: "100 ml",
    origin: "Émirats arabes unis",
    description: "Un oriental gourmand à la datte confite, cannelle et fève tonka.",
    topNotes: ["Cannelle", "Muscade"],
    heartNotes: ["Datte", "Praline"],
    baseNotes: ["Benjoin", "Vanille"],
    badges: ["Best-seller"],
    image: "/assets/prod-1.jpg",
    ...over,
  };
}

function neighbours(n) {
  return Array.from({ length: n }, (_, i) => ({ slug: `voisin-${i}`, product: product() }));
}

const TWIN = {
  key: "khamrah-angels-share",
  referenceId: "kilian-angels-share",
  targetName: "Angels' Share",
  productHandle: "lattafa-khamrah",
  family: "Gourmand",
  description: "Cognac, cannelle, fève tonka.",
  product: { name: "Khamrah", brand: "Lattafa", price: 49, image: "/assets/prod-1.jpg", href: "/produit/lattafa-khamrah" },
};

const REVIEW_WITH_PHOTO = {
  id: "r1",
  author: "Nadia R.",
  city: "Lyon",
  date: "2026-08-14",
  rating: 5,
  text: "Sillage énorme, tenue toute la journée.",
  verified: true,
  helpful: 12,
  photo: "/assets/reviews/r1.jpg",
};

const SUMMARY = {
  distribution: [700, 120, 40, 20, 11],
  recommendPct: 94,
  keywords: ["datte", "sillage"],
  criteria: { longevity: 4.7, sillage: 4.9, value: 4.6, accuracy: 4.5 },
};

// ─── Les cinq fiches ──────────────────────────────────────────────────────────

const CASES = [
  {
    label: "(i)   Fiche complète — type Khamrah, tout disponible",
    input: {
      slug: "lattafa-khamrah",
      product: product(),
      content: {
        longevityHours: 12,
        sillage: "fort",
        seasons: ["automne", "hiver"],
        forWhom: ["Mixte"],
        when: ["Soirée"],
        howToWear: ["Deux pulvérisations"],
      },
      reviews: [REVIEW_WITH_PHOTO],
      summary: SUMMARY,
      mediaCount: 3,
      twin: TWIN,
      siblings: neighbours(2),
      related: neighbours(4),
    },
  },
  {
    label: "(ii)  Fiche sans avis ni photos",
    input: {
      slug: "sans-avis",
      product: product({ reviews: 0, rating: 0 }),
      content: { longevityHours: 8, sillage: "modéré", seasons: ["été"], forWhom: ["Pour l'été"] },
      reviews: [],
      summary: undefined,
      mediaCount: 0,
      twin: TWIN,
      siblings: neighbours(3),
      related: neighbours(4),
    },
  },
  {
    label: "(iii) Fiche sans jumeau ni déclinaison",
    input: {
      slug: "sans-jumeau",
      product: product(),
      content: { longevityHours: 6, sillage: "discret", when: ["Bureau"] },
      reviews: [REVIEW_WITH_PHOTO],
      summary: SUMMARY,
      mediaCount: 2,
      twin: undefined,
      siblings: [],
      related: neighbours(4),
    },
  },
  {
    label: "(iv)  Fiche minimale — nom, prix, description, une note",
    input: {
      slug: "minimale",
      product: product({
        reviews: 0,
        rating: 0,
        topNotes: ["Oud"],
        heartNotes: [],
        baseNotes: [],
        badges: [],
      }),
      content: {},
      reviews: [],
      summary: undefined,
      mediaCount: 0,
      twin: undefined,
      siblings: [],
      related: [],
    },
  },
  {
    label: "(v)   Fiche sans aucune note olfactive",
    input: {
      slug: "sans-notes",
      product: product({ topNotes: [], heartNotes: [], baseNotes: [] }),
      content: { longevityHours: 10, sillage: "fort", seasons: ["hiver"], forWhom: ["Les amateurs d'oud"] },
      reviews: [REVIEW_WITH_PHOTO],
      summary: SUMMARY,
      mediaCount: 1,
      twin: TWIN,
      siblings: neighbours(2),
      related: neighbours(3),
    },
  },
];

// ─── Rejeu du pavage, à l'identique du placement automatique de CSS Grid ──────

/**
 * Repose la liste ordonnée de tuiles sur une grille de six colonnes avec un
 * curseur qui ne revient jamais en arrière — c'est la règle du navigateur.
 * Renvoie la grille, ou lève si une tuile ne tient nulle part.
 */
function replay(tiles) {
  const grid = [];
  const ensure = (r) => {
    while (grid.length <= r) grid.push(new Array(COLUMNS).fill(null));
  };

  let curRow = 0;
  let curCol = 0;

  for (const tile of tiles) {
    const { cols, rows } = tile.size;
    if (cols < 2 || cols > COLUMNS) throw new Error(`${tile.id} : largeur illégale ${cols}`);

    let r = curRow;
    let c = curCol;
    let guard = 0;
    for (;;) {
      if (guard++ > 500) throw new Error(`${tile.id} : placement introuvable`);
      if (c + cols > COLUMNS) {
        r += 1;
        c = 0;
        continue;
      }
      ensure(r + rows - 1);
      let free = true;
      for (let dr = 0; dr < rows && free; dr += 1) {
        for (let dc = 0; dc < cols; dc += 1) {
          if (grid[r + dr][c + dc] !== null) {
            free = false;
            break;
          }
        }
      }
      if (free) break;
      c += 1;
    }

    for (let dr = 0; dr < rows; dr += 1) {
      for (let dc = 0; dc < cols; dc += 1) grid[r + dr][c + dc] = tile.id;
    }
    curRow = r;
    curCol = c + cols;
  }

  return grid;
}

function ascii(grid) {
  return grid
    .map((row, i) => {
      const cells = row.map((id) => (id ? id.slice(0, 3) : "···").padEnd(3, " "));
      return `  ${String(i).padStart(2, " ")} │ ${cells.join(" │ ")} │`;
    })
    .join("\n");
}

// ─── Exécution ────────────────────────────────────────────────────────────────

const failures = [];

for (const testCase of CASES) {
  const expected = tileSpecs(testCase.input)
    .filter((t) => t.available)
    .map((t) => t.id);
  const tiles = bentoLayout(testCase.input);

  console.log(`\n${testCase.label}`);
  console.log(`  tuiles disponibles : ${expected.length} — ${expected.join(", ")}`);

  let grid;
  try {
    grid = replay(tiles);
  } catch (error) {
    failures.push(`${testCase.label} · rejeu impossible : ${error.message}`);
    continue;
  }

  console.log(ascii(grid));

  // 1. Aucune rangée incomplète : chaque cellule des six colonnes est occupée,
  //    les tuiles sur deux rangées comptant dans les deux.
  grid.forEach((row, i) => {
    const filled = row.filter((cell) => cell !== null).length;
    if (filled !== COLUMNS) {
      failures.push(`${testCase.label} · rangée ${i} incomplète : ${filled}/${COLUMNS} colonnes`);
    }
  });

  // 2. Aucune tuile en double.
  const seen = new Set();
  for (const tile of tiles) {
    if (seen.has(tile.id)) failures.push(`${testCase.label} · tuile dupliquée : ${tile.id}`);
    seen.add(tile.id);
  }

  // 3. Aucune tuile perdue, aucune tuile inventée.
  for (const id of expected) {
    if (!seen.has(id)) failures.push(`${testCase.label} · tuile perdue : ${id}`);
  }
  for (const id of seen) {
    if (!expected.includes(id)) failures.push(`${testCase.label} · tuile inventée : ${id}`);
  }

  // 4. Cohérence entre la liste rendue et la grille rejouée.
  const onGrid = new Set(grid.flat().filter(Boolean));
  if (onGrid.size !== seen.size) {
    failures.push(`${testCase.label} · ${seen.size} tuiles rendues, ${onGrid.size} sur la grille`);
  }
}

console.log("");
if (failures.length === 0) {
  console.log("OK — les 5 fiches pavent sans trou, sans doublon et sans perte.");
} else {
  console.log(`ÉCHECS (${failures.length}) :`);
  for (const failure of failures) console.log(`  ✗ ${failure}`);
  process.exitCode = 1;
}
