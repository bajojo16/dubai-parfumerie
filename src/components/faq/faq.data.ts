/**
 * FAQ « centre d'aide » — données de départ (FR en dur).
 *
 * Structure pensée pour l'i18n ultérieure : chaque catégorie / question
 * porte un `id` slug stable (jamais traduit). Les textes (label, atmosphere,
 * question, answer) pourront être remplacés par des clés next-intl plus tard
 * sans changer les ancres ni le schéma JSON-LD.
 */

/* ── Tokens partagés (hex exacts spec) ── */
export const T = {
  gold: "#A8843E",
  goldSoft: "#C9A86A",
  goldBright: "#C9A24A",
  goldDeep: "#A8801F",
  cream: "#F8F4EA",
  cream2: "#FAF6EE",
  cream3: "#FCF9F1",
  card: "#FFFEFB",
  ink: "#1a1712",
  inkWarm: "#2C2620",
  ink2: "#6b6151",
  ink3: "#8a7e67",
  line: "#E5DCC8",
  line2: "#E0D2B4",
} as const;

/* ── Catégories ── */
export type FaqCategoryId = "all" | "cmd" | "pay" | "liv" | "ret" | "pro";

export type FaqCategory = {
  id: FaqCategoryId;
  /** Libellé court (onglet / pill) */
  label: string;
  /** Petit sur-titre du hero */
  eyebrow: string;
  /** Phrase d'ambiance serif affichée dans le hero */
  atmosphere: string;
  /** Visuel optionnel ; si absent → illustration line-art dorée (fallback) */
  image?: string;
};

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "all",
    label: "Toutes les questions",
    eyebrow: "Centre d'aide",
    atmosphere: "L'art du parfum, livré jusqu'à vous",
  },
  {
    id: "cmd",
    label: "Commande",
    eyebrow: "Votre commande",
    atmosphere: "Composez votre sélection en toute simplicité",
  },
  {
    id: "pay",
    label: "Paiement",
    eyebrow: "Paiement",
    atmosphere: "Réglez en toute sérénité",
  },
  {
    id: "liv",
    label: "Livraison",
    eyebrow: "Livraison",
    atmosphere: "Vos fragrances voyagent avec soin, partout dans le monde",
  },
  {
    id: "ret",
    label: "Retours",
    eyebrow: "Retours & remboursements",
    atmosphere: "Changer d'avis, simplement",
  },
  {
    id: "pro",
    label: "Professionnels",
    eyebrow: "Espace professionnel",
    atmosphere: "Pour les professionnels exigeants",
  },
];

/* ── Actions (union discriminée) ── */
export type FaqAction =
  | { type: "cta"; label: string; href: string }
  | { type: "payments" }
  | { type: "promo" }
  | { type: "b2b" };

/* ── Questions ── */
export type FaqQuestion = {
  /** slug stable (sert d'ancre `#id` et d'identifiant JSON-LD) */
  id: string;
  categoryId: Exclude<FaqCategoryId, "all">;
  question: string;
  /** Texte brut de la réponse (réutilisé tel quel pour le JSON-LD) */
  answer: string;
  /** Une action, ou plusieurs (ex. formulaire B2B + lien espace pro) */
  action?: FaqAction | FaqAction[];
};

export const FAQ_QUESTIONS: FaqQuestion[] = [
  {
    id: "passer-commande",
    categoryId: "cmd",
    question: "Comment passer ma commande ?",
    answer:
      "Parcourez notre catalogue, ajoutez vos fragrances au panier puis validez en quelques étapes. Le paiement est sécurisé et le règlement en 4× sans frais est disponible dès 60€ d'achat. Vous recevez une confirmation par email immédiatement, et votre commande est expédiée sous 48h.",
    action: { type: "cta", label: "Découvrir nos parfums", href: "/parfums" },
  },
  {
    id: "modes-paiement",
    categoryId: "pay",
    question: "Quels modes de paiement acceptez-vous ?",
    answer:
      "Nous acceptons les cartes Visa et Mastercard, Apple Pay, Google Pay ainsi que PayPal. Le paiement en 4× sans frais est proposé dès 60€ d'achat. Toutes les transactions sont chiffrées et traitées par un prestataire certifié.",
    action: { type: "payments" },
  },
  {
    id: "code-promo",
    categoryId: "pay",
    question: "Mon code promo ne fonctionne pas",
    answer:
      "Vérifiez que le code est saisi sans espace et qu'il n'a pas expiré : un seul code s'applique par commande et certains ne se cumulent pas avec les offres en cours. Saisissez-le ci-dessous pour le tester en direct. S'il ne fonctionne toujours pas, notre service client le réactive en quelques minutes.",
    action: { type: "promo" },
  },
  {
    id: "delais-livraison",
    categoryId: "liv",
    question: "Quels sont les délais de livraison ?",
    answer:
      "Toute commande est expédiée sous 48h. En France métropolitaine, comptez 2 à 4 jours ouvrés, et la livraison est offerte dès 60€ d'achat. Vous recevez un numéro de suivi dès le départ du colis.",
  },
  {
    id: "suivre-commande",
    categoryId: "liv",
    question: "Comment suivre ma commande ?",
    answer:
      "Dès l'expédition, un email vous transmet votre numéro de suivi. Vous pouvez ensuite suivre votre colis en temps réel depuis notre page dédiée, à tout moment.",
    action: { type: "cta", label: "Suivre ma commande", href: "/suivi-commande" },
  },
  {
    id: "effectuer-retour",
    categoryId: "ret",
    question: "Comment effectuer un retour ?",
    answer:
      "Vous disposez de 14 jours après réception pour changer d'avis. Initiez votre retour en quelques clics : une étiquette vous est fournie et le remboursement intervient dès réception du colis dans nos entrepôts.",
    action: { type: "cta", label: "Démarrer un retour", href: "/retours" },
  },
  {
    id: "livraison-internationale",
    categoryId: "liv",
    question: "Livrez-vous à l'international ?",
    answer:
      "Oui, nous expédions dans 78 pays. Les délais varient de 5 à 12 jours selon la destination, et des frais de douane peuvent s'appliquer en dehors de l'Union européenne. Chaque envoi est suivi et soigneusement protégé.",
  },
  {
    id: "projet-b2b",
    categoryId: "pro",
    question: "Vous avez un projet B2B / grossiste ?",
    answer:
      "Revendeurs, hôtels, spas et instituts : nous proposons des tarifs dégressifs, des conditionnements dédiés et un accompagnement personnalisé. Laissez-nous votre email, notre équipe commerciale vous recontacte sous 48h.",
    action: [
      { type: "b2b" },
      { type: "cta", label: "Accéder à l'espace pro", href: "/pro" },
    ],
  },
];

/* ── Normalisation recherche : insensible casse + accents (NFD + suppr. diacritiques) ── */
export function fold(input: string): string {
  return input
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase();
}

/** Normalise une action en tableau (gère le cas singulier et multiple). */
export function toActions(action?: FaqAction | FaqAction[]): FaqAction[] {
  if (!action) return [];
  return Array.isArray(action) ? action : [action];
}
