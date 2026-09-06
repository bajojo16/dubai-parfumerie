/**
 * Commande à la demande — textes éditoriaux de la page.
 *
 * Séparés de `on-demand-catalog.ts` (le périmètre du service) parce qu'ils
 * n'ont pas la même vie : le catalogue bouge quand une maison arrive, ces
 * textes quand la boutique change ses conditions. Les délais ne sont PAS
 * écrits en dur ici : ils viennent des constantes du catalogue, pour que
 * l'en-tête, les étapes et la FAQ annoncent toujours le même chiffre.
 *
 * Français en dur, comme `livraison/page.tsx` : `src/messages/` ne couvre pas
 * cette page.
 */

import { LEAD_TIME, QUOTE_DELAY } from "@/data/on-demand-catalog";

// ─── Conditions du service ───────────────────────────────────────────────────

export type Condition = { title: string; body: string };

export const CONDITIONS: readonly Condition[] = [
  {
    title: "Délai " + LEAD_TIME,
    body: "Le flacon part de nos relais du Golfe après votre validation. Nous vous donnons une date estimée au moment du devis.",
  },
  {
    title: "Prix confirmé sous " + QUOTE_DELAY,
    body: "Le prix affiché sur la page est indicatif. Le prix définitif — flacon, transport, taxes — vous est confirmé avant toute validation.",
  },
  {
    title: "Acompte ou paiement à la commande",
    body: "Au choix : un acompte à la validation du devis et le solde à l'expédition, ou le règlement complet à la commande. Le montant de l'acompte est indiqué sur le devis.",
  },
  {
    title: "Pas de retour, sauf défaut",
    body: "Une commande spéciale est faite pour vous ; elle n'est ni reprise ni échangée. Un flacon abîmé ou non conforme est bien sûr remplacé ou remboursé.",
  },
];

// ─── Étapes ──────────────────────────────────────────────────────────────────

export type Step = { n: string; title: string; body: string; meta: string };

export const STEPS: readonly Step[] = [
  {
    n: "01",
    title: "Vous cherchez",
    body: "Choisissez la maison, tapez le nom du parfum. S'il est dans notre répertoire, sa fiche s'affiche ; sinon, écrivez-le tel quel — nous le retrouverons.",
    meta: "2 minutes",
  },
  {
    n: "02",
    title: "Nous confirmons",
    body: "Nos acheteurs vérifient la disponibilité, la contenance et le prix départ auprès de la maison, puis vous envoient un devis clair, sans frais cachés.",
    meta: "Sous " + QUOTE_DELAY,
  },
  {
    n: "03",
    title: "Vous validez",
    body: "Rien n'est engagé avant votre accord. Vous réglez l'acompte ou la totalité, et la commande part le jour même vers nos relais.",
    meta: "À votre rythme",
  },
  {
    n: "04",
    title: "Vous recevez",
    body: "Le flacon transite par notre entrepôt, où il est contrôlé, puis vous est expédié avec un numéro de suivi.",
    meta: LEAD_TIME,
  },
];

// ─── Réassurance ─────────────────────────────────────────────────────────────

/**
 * Libellés repris MOT POUR MOT de la barre de réassurance du header
 * (`TOP_TRUST` dans `components/layout/Header.tsx`). Le tableau n'y est pas
 * exporté et ce fichier-là n'est pas dans le périmètre de la page ; on recopie
 * les libellés plutôt que d'en inventer d'autres, pour que la promesse soit la
 * même en haut de chaque page et ici.
 */
export const REASSURANCE: readonly { label: string; body: string }[] = [
  {
    label: "Authenticité certifiée",
    body: "Flacons achetés auprès des maisons ou de leurs distributeurs officiels, contrôlés à réception dans notre entrepôt.",
  },
  {
    label: "Livraison dans le monde, DOM-TOM compris",
    body: "Colis suivi de bout en bout ; vous recevez le numéro de suivi dès l'expédition.",
  },
  {
    label: "Paiement 100% sécurisé",
    body: "Acompte et solde réglés par lien de paiement sécurisé, jamais par virement vers un compte personnel.",
  },
];

// ─── FAQ ─────────────────────────────────────────────────────────────────────

export type FaqEntry = { q: string; a: string };

export const FAQ: readonly FaqEntry[] = [
  {
    q: "Quel est le délai réel pour une commande à la demande ?",
    a: "Comptez " + LEAD_TIME + " entre votre validation et la réception. Le flacon part de nos relais dans le Golfe, transite par notre entrepôt pour contrôle, puis vous est expédié. Nous vous donnons une date estimée dès le devis et vous prévenons si elle bouge.",
  },
  {
    q: "Dois-je verser un acompte ?",
    a: "Vous choisissez : soit un acompte à la validation du devis (son montant y est indiqué) et le solde à l'expédition, soit le règlement complet à la commande. Dans les deux cas, rien n'est débité avant que vous ayez accepté le prix confirmé.",
  },
  {
    q: "Comment savoir que le parfum est authentique ?",
    a: "Nous achetons auprès des maisons ou de leurs distributeurs officiels dans le Golfe, et chaque flacon est contrôlé à réception dans notre entrepôt — emballage, cellophane, code de lot, jus. Un flacon qui ne passe pas ce contrôle ne vous est pas envoyé.",
  },
  {
    q: "Y a-t-il des frais de douane ou des frais cachés ?",
    a: "Non. Le prix confirmé sous " + QUOTE_DELAY + " comprend le flacon, le transport et les taxes : c'est le montant final que vous réglez. Nous nous chargeons du dédouanement à l'import.",
  },
  {
    q: "Et si le parfum est discontinué ou introuvable ?",
    a: "Nous vous le disons franchement dans notre réponse, et nous vous proposons, si vous le souhaitez, une référence de la même maison au profil olfactif proche. Vous restez libre de décliner : une demande n'engage à rien.",
  },
  {
    q: "Quelles contenances puis-je demander ?",
    a: "Celles que la maison produit — souvent 100 ml pour les parfums du Golfe, parfois 50 ou 30 ml, et des huiles de parfum en petits formats. Indiquez votre préférence dans la demande, ou « peu importe » : nous vous dirons ce qui existe.",
  },
  {
    q: "Puis-je retourner une commande à la demande ?",
    a: "Une commande spéciale est passée pour vous ; elle n'est ni reprise ni échangée pour convenance. En revanche, un flacon arrivé abîmé, non conforme ou différent du devis est remplacé ou remboursé intégralement.",
  },
  {
    q: "Comment suivre ma commande ?",
    a: "Vous recevez un message à chaque étape — devis, validation, départ du Golfe, arrivée en entrepôt, expédition — par le canal que vous aurez choisi (e-mail ou WhatsApp). Le numéro de suivi du colis vous est envoyé à l'expédition.",
  },
];
