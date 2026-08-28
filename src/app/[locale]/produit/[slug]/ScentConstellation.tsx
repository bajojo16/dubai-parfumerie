/**
 * Pyramide olfactive en constellation.
 *
 * Les trois cartes empilées d'avant listaient bien les notes, mais elles se
 * lisaient comme un tableau : rien n'y disait que ces matières tournent autour
 * d'un même flacon. Ici le produit occupe le centre, et chaque note s'y rattache
 * par un trait — la composition se voit d'un coup d'œil.
 *
 * L'étage (tête, cœur, fond) n'est pas rendu par une colonne mais par la teinte
 * du repère et son ordre de lecture : les notes se répartissent de haut en bas,
 * les plus volatiles d'abord. Une légende rappelle le code couleur, car une
 * teinte seule ne se comprend pas.
 *
 * Le nombre de notes varie de 3 à 13 selon les fiches : la colonne s'allonge au
 * lieu de se disperser en cercle, où treize satellites deviendraient illisibles.
 */

import Image from "next/image";

/**
 * Visuels de matière, un par MATIÈRE et non plus un par famille.
 *
 * Il n'y en avait que sept — ambre, boisé, épice, floral, musc, oud, rose — et
 * chaque note y était rattachée par mot-clé. Praline, vanille, benjoin et ambre
 * gris montraient donc la même photo d'ambre ; santal, myrrhe et encens le même
 * bois. Datte et bergamote, faute de mot-clé, retombaient sur un monogramme.
 * Vingt-six visuels dédiés les remplacent ; les sept d'origine restent en
 * dernier recours pour les notes qui n'ont pas encore le leur.
 */
const NOTE_IMAGES: Record<string, string> = {
  // — Matières propres —
  ambre: "/assets/scents/ambre.jpg",
  ambreGris: "/assets/scents/ambre-gris.jpg",
  benjoin: "/assets/scents/benjoin.jpg",
  bergamote: "/assets/scents/bergamote.jpg",
  cannelle: "/assets/scents/cannelle.jpg",
  cardamome: "/assets/scents/cardamome.jpg",
  cedre: "/assets/scents/cedre.jpg",
  citron: "/assets/scents/citron.jpg",
  datte: "/assets/scents/datte.jpg",
  encens: "/assets/scents/encens.jpg",
  feveTonka: "/assets/scents/feve-tonka.jpg",
  fruits: "/assets/scents/fruits.jpg",
  jasmin: "/assets/scents/jasmin.jpg",
  marine: "/assets/scents/marine.jpg",
  musc: "/assets/scents/musc.jpg",
  muscade: "/assets/scents/muscade.jpg",
  myrtille: "/assets/scents/myrtille.jpg",
  oud: "/assets/scents/oud.jpg",
  patchouli: "/assets/scents/patchouli.jpg",
  poivre: "/assets/scents/poivre.jpg",
  praline: "/assets/scents/praline.jpg",
  rose: "/assets/scents/rose.jpg",
  safran: "/assets/scents/safran.jpg",
  santal: "/assets/scents/santal.jpg",
  vanille: "/assets/scents/vanille.jpg",
  vetiver: "/assets/scents/vetiver.jpg",
  // — Familles, dernier recours —
  boise: "/assets/scents/boise.jpg",
  epice: "/assets/scents/epice.jpg",
  floral: "/assets/scents/floral.jpg",
};

/**
 * Mots-clés rattachant une note à un visuel. L'ORDRE COMPTE : la première
 * entrée dont le mot est contenu dans la note gagne. Les mots les plus précis
 * passent donc avant les plus larges — « ambre gris » avant « ambre », « fève
 * tonka » avant « fève », « bois de santal » avant « bois ».
 */
const NOTE_KEYWORDS: [string, string][] = [
  // ── Pièges de sous-chaîne, à traiter EN PREMIER ─────────────────────────
  // La comparaison est un `includes` : « framBOISe » contient « bois »,
  // « menthe POIVRÉe » contient « poivre », « musc BOISé » contient « bois ».
  // Sans ces trois lignes en tête, la framboise s'affichait en rondins de
  // cèdre et la menthe en grains de poivre.
  ["framboise", "fruits"],
  ["menthe", "marine"],
  ["musc boisé", "musc"],
  ["musc boise", "musc"],
  // Résines et ambres — le plus précis d'abord
  ["ambre gris", "ambreGris"],
  ["ambre", "ambre"],
  ["ambré", "ambre"],
  ["labdanum", "benjoin"],
  ["benjoin", "benjoin"],
  ["résine", "benjoin"],
  ["resine", "benjoin"],
  ["myrrhe", "encens"],
  ["encens", "encens"],
  // Bois
  ["bois de santal", "santal"],
  ["santal", "santal"],
  ["cèdre", "cedre"],
  ["cedre", "cedre"],
  ["bouleau", "cedre"],
  ["bois", "boise"],
  ["vétiver", "vetiver"],
  ["vetiver", "vetiver"],
  ["patchouli", "patchouli"],
  ["oud", "oud"],
  // Épices
  ["cannelle", "cannelle"],
  ["cardamome", "cardamome"],
  ["muscade", "muscade"],
  ["poivre", "poivre"],
  ["safran", "safran"],
  ["épice", "epice"],
  ["epice", "epice"],
  // Gourmand
  ["fève tonka", "feveTonka"],
  ["feve tonka", "feveTonka"],
  ["tonka", "feveTonka"],
  ["praline", "praline"],
  ["vanille", "vanille"],
  ["datte", "datte"],
  // Agrumes
  ["citron bergamote", "bergamote"],
  ["bergamote", "bergamote"],
  ["citron", "citron"],
  ["mandarine", "citron"],
  ["pamplemousse", "citron"],
  // Fruits
  ["myrtille", "myrtille"],
  ["cassis", "fruits"],
  ["framboise", "fruits"],
  ["fruits rouges", "fruits"],
  ["fruité", "fruits"],
  ["ananas", "fruits"],
  ["pomme", "fruits"],
  ["poire", "fruits"],
  ["pêche", "fruits"],
  // Aquatique et frais
  ["marine", "marine"],
  ["aquatique", "marine"],
  ["concombre", "marine"],
  ["menthe", "marine"],
  ["frais", "marine"],
  // Fleurs
  ["jasmin", "jasmin"],
  ["rose", "rose"],
  ["fleur", "floral"],
  ["fleurs", "floral"],
  ["oranger", "floral"],
  ["néroli", "floral"],
  ["neroli", "floral"],
  ["muguet", "floral"],
  ["iris", "floral"],
  ["lilas", "floral"],
  ["violette", "floral"],
  ["floral", "floral"],
  // Musc
  ["musc", "musc"],
];

function noteImage(note: string): string | null {
  const key = note
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
  for (const [word, image] of NOTE_KEYWORDS) {
    const plain = word.normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (key.includes(plain)) return NOTE_IMAGES[image];
  }
  return null;
}

type Tier = "top" | "heart" | "base";

const TIERS: Record<Tier, { label: string; accent: string }> = {
  top: { label: "Tête", accent: "var(--gold-300)" },
  heart: { label: "Cœur", accent: "var(--gold-500)" },
  base: { label: "Fond", accent: "var(--espresso-600)" },
};

export interface ScentConstellationProps {
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  productName: string;
  brand: string;
  image?: string;
}

export function ScentConstellation({
  topNotes,
  heartNotes,
  baseNotes,
  productName,
  brand,
  image,
}: ScentConstellationProps) {
  const entries: { note: string; tier: Tier }[] = [
    ...topNotes.map((note) => ({ note, tier: "top" as const })),
    ...heartNotes.map((note) => ({ note, tier: "heart" as const })),
    ...baseNotes.map((note) => ({ note, tier: "base" as const })),
  ];

  if (!entries.length) return null;

  // Réparti en deux colonnes autour du médaillon : la gauche prend une note sur
  // deux pour que les deux côtés progressent ensemble de la tête vers le fond,
  // au lieu d'avoir toute la tête à gauche et tout le fond à droite.
  const left = entries.filter((_, i) => i % 2 === 0);
  const right = entries.filter((_, i) => i % 2 === 1);

  const tiersUsed = (["top", "heart", "base"] as Tier[]).filter((t) =>
    entries.some((e) => e.tier === t),
  );

  function renderNote({ note, tier }: { note: string; tier: Tier }, side: "left" | "right") {
    const img = noteImage(note);
    const accent = TIERS[tier].accent;

    return (
      <li key={`${side}-${note}`} className="dp-sc-note" data-side={side}>
        <span className="dp-sc-badge" style={{ borderColor: accent }}>
          {img ? (
            <Image src={img} alt="" fill sizes="52px" style={{ objectFit: "cover" }} />
          ) : (
            // Pas de visuel pour cette matière : une initiale gravée, comme un
            // monogramme — plus sobre qu'une image approximative.
            <b style={{ color: accent === "var(--espresso-600)" ? "var(--espresso-600)" : "var(--gold-700)" }}>
              {note.charAt(0).toUpperCase()}
            </b>
          )}
        </span>
        <span className="dp-sc-line" style={{ background: accent }} aria-hidden="true" />
        <span className="dp-sc-label">
          {note}
          <i style={{ color: accent }}>{TIERS[tier].label}</i>
        </span>
      </li>
    );
  }

  return (
    <div className="dp-sc">
      <style>{CSS}</style>

      <div className="dp-sc-grid">
        <ul className="dp-sc-col dp-sc-col-left">{left.map((e) => renderNote(e, "left"))}</ul>

        {/* Le médaillon : le flacon sur fond blanc, ce qui le détache du crème
            de la page sans avoir besoin d'un packshot détouré. */}
        <div className="dp-sc-core">
          <div className="dp-sc-halo" aria-hidden="true" />
          <div className="dp-sc-medallion">
            {image ? (
              <Image src={image} alt={productName} fill sizes="230px" style={{ objectFit: "contain" }} />
            ) : (
              <span className="dp-sc-core-text">
                <b>{productName}</b>
                <i>{brand}</i>
              </span>
            )}
          </div>
          {image && (
            <p className="dp-sc-core-caption">
              <b>{productName}</b>
              <i>{brand}</i>
            </p>
          )}
        </div>

        <ul className="dp-sc-col dp-sc-col-right">{right.map((e) => renderNote(e, "right"))}</ul>
      </div>

      <ul className="dp-sc-legend">
        {tiersUsed.map((t) => (
          <li key={t}>
            <span style={{ background: TIERS[t].accent }} aria-hidden="true" />
            {TIERS[t].label}
          </li>
        ))}
      </ul>
    </div>
  );
}

const CSS = `
.dp-sc { --sc-gap: clamp(0.75rem, 2vw, 1.75rem); }

.dp-sc-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--sc-gap);
}

.dp-sc-col {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 1.4vw, 1.1rem);
}
.dp-sc-col-left { align-items: flex-end; }
.dp-sc-col-right { align-items: flex-start; }

.dp-sc-note {
  display: flex;
  align-items: center;
  gap: 0;
  max-width: 100%;
}
.dp-sc-note[data-side="left"] { flex-direction: row-reverse; }

.dp-sc-badge {
  position: relative;
  flex: 0 0 auto;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--surface-white);
  border: 1.5px solid;
  box-shadow: var(--shadow-xs);
  display: flex;
  align-items: center;
  justify-content: center;
}
.dp-sc-badge b {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: var(--fw-regular);
}

/* Le trait de rattachement : il relie visuellement la note au médaillon.
   Assez court pour ne pas traverser la carte, assez net pour se voir. */
.dp-sc-line {
  flex: 0 0 auto;
  width: clamp(14px, 2.5vw, 34px);
  height: 1px;
  opacity: 0.5;
}

.dp-sc-label {
  font-family: var(--font-sans);
  font-size: var(--t-xs);
  letter-spacing: var(--ls-wide);
  text-transform: uppercase;
  color: var(--ink-700);
  line-height: 1.3;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 4px;
}
.dp-sc-note[data-side="left"] .dp-sc-label { text-align: right; align-items: flex-end; }
.dp-sc-label i {
  font-style: normal;
  font-size: 9px;
  letter-spacing: var(--ls-wider);
  opacity: 0.85;
}

/* ── Médaillon central ── */
.dp-sc-core {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 0 clamp(0.25rem, 1vw, 1rem);
}
.dp-sc-halo {
  position: absolute;
  top: -8%;
  left: 50%;
  transform: translateX(-50%);
  width: 130%;
  aspect-ratio: 1;
  border-radius: 50%;
  /* Le halo doré tient lieu de fond : il détache le médaillon du crème de la
     page sans introduire de cadre supplémentaire. */
  background: radial-gradient(circle, rgba(200,144,30,.13) 0%, transparent 62%);
  pointer-events: none;
}
.dp-sc-medallion {
  position: relative;
  width: clamp(170px, 22vw, 230px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--surface-white);
  border: 1px solid var(--line-200);
  box-shadow: 0 18px 44px rgba(40,28,14,.13), inset 0 0 0 6px var(--surface-white);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
}
.dp-sc-core-text, .dp-sc-core-caption {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  margin: 0;
  text-align: center;
}
.dp-sc-core-text b, .dp-sc-core-caption b {
  font-family: var(--font-display);
  font-size: var(--t-serif-lg);
  font-weight: var(--fw-regular);
  color: var(--ink-900);
  line-height: var(--lh-snug);
}
.dp-sc-core-text i, .dp-sc-core-caption i {
  font-style: normal;
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: var(--ls-wider);
  text-transform: uppercase;
  color: var(--gold-700);
}

/* ── Légende ── */
.dp-sc-legend {
  list-style: none;
  margin: clamp(1.25rem, 3vw, 2rem) 0 0;
  padding: 0;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}
.dp-sc-legend li {
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: var(--ls-wider);
  text-transform: uppercase;
  color: var(--ink-400);
}
.dp-sc-legend span {
  width: 18px;
  height: 2px;
  border-radius: 2px;
}

/* ── Écrans étroits ──
   Deux colonnes de part et d'autre d'un médaillon ne tiennent pas sous 760 px :
   le médaillon passe au-dessus et les notes se remettent en une seule colonne,
   toutes alignées à gauche pour garder une lecture de haut en bas. */
@media (max-width: 760px) {
  .dp-sc-grid { grid-template-columns: 1fr; justify-items: center; }
  .dp-sc-core { order: -1; margin-bottom: 0.5rem; }
  .dp-sc-col { width: 100%; align-items: stretch; }
  .dp-sc-col-left { align-items: stretch; }
  .dp-sc-note, .dp-sc-note[data-side="left"] { flex-direction: row; }
  .dp-sc-note[data-side="left"] .dp-sc-label { text-align: left; align-items: flex-start; }
  .dp-sc-badge { width: 42px; height: 42px; }
  .dp-sc-line { width: 16px; }
}
`;
