/**
 * Libellés FR par défaut du FragranceFinder.
 * i18n via props (FinderLabels) — on ne touche pas aux JSON de messages.
 */
import type { FinderLabels } from "./types";

export const DEFAULT_LABELS: FinderLabels = {
  openAria: "Ouvrir le conseiller olfactif",
  openLabel: "Choisir mon parfum",
  eyebrow: "Conseiller olfactif",
  modalTitle: "Trouvez votre signature",
  questionCounter: "Question {current}/{total}",
  back: "Retour",
  unsure: "Je ne sais pas",
  skip: "Passer",
  searchPlaceholder: "Un parfum que vous aimez…",
  searchHint: "Tapez un nom — ou utilisez votre saisie libre.",
  searchEmpty: "Aucun parfum trouvé dans notre catalogue.",
  freeTextPrefix: "Utiliser",
  resultEyebrow: "Votre profil olfactif",
  resultTitleOne: "Votre parfum sur mesure",
  resultTitleMany: "Vos {count} parfums sur mesure",
  resultSubtitle: "Sélectionnés d'après vos réponses, du plus proche au plus surprenant.",
  badgeMatch: "Votre match",
  badgeCoupDeCoeur: "Coup de cœur",
  badgeADecouvrir: "À découvrir",
  addToCart: "Ajouter au panier",
  added: "Ajouté ✓",
  viewProduct: "Voir le parfum",
  restart: "Refaire le quiz",
  optInTitle: "Recevez votre profil olfactif",
  optInText:
    "Gardez vos recommandations et recevez nos conseils sur mesure. Sans engagement.",
  emailPlaceholder: "Votre adresse e-mail",
  emailCta: "Recevoir par e-mail",
  emailSuccess: "C'est noté ! Vous recevrez votre profil très vite.",
  whatsappCta: "Recevoir mes parfums sur WhatsApp",
  optInOr: "ou par e-mail",
  rgpd:
    "En continuant, vous acceptez d'être recontacté(e). Vos données ne sont jamais revendues — désinscription à tout moment (RGPD).",
  loading: "Composition de votre profil olfactif…",
};
