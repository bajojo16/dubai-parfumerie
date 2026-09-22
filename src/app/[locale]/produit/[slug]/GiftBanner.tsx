/**
 * Bandeau « Offrir {produit} » — l'emballage cadeau offert dès le seuil de
 * livraison, posé en bas de fiche, là où le client qui achète POUR quelqu'un
 * cherche la réponse à « est-ce que ça arrive joliment emballé ? ».
 *
 * Server Component : aucun état, aucun clic à gérer ici. Le seuil vient de
 * `carriers.ts` — un seul endroit pour ce chiffre, sinon la fiche annonce
 * 60 € quand le tiroir panier en annonce 50. Pas de carte manuscrite : le
 * client ne la propose pas, on ne promet pas ce qu'on ne fait pas.
 */

import Image from "next/image";
import { FREE_SHIPPING_THRESHOLD_EUR } from "@/data/carriers";

/** Vignette du coffret — même côté que la colonne de grille. */
const THUMB = 120;

interface Props {
  productName: string;
  image: string;
  /** `product.gallery` brut : la vue « coffret » y est cherchée par son nom de fichier. */
  gallery?: string[];
}

/** « 60 » pour 60, « 59,90 » pour 59.9 — pas de « 60,00 € » dans une accroche. */
function euroWhole(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ",");
}

export default function GiftBanner({ productName, image, gallery }: Props) {
  // Le coffret est illustré par la vue « coffret » de la galerie quand elle
  // existe ; sinon le packshot — jamais un écrin générique d'une autre fiche.
  const boxImage = gallery?.find((g) => /coffret/i.test(g)) ?? image;

  return (
    <section aria-labelledby="dp-gift-title" style={{ marginTop: "3rem" }}>
      <style>{`
        .dp-gift { display: grid; grid-template-columns: 120px 1fr auto; gap: 1.5rem; align-items: center; }
        @media (max-width: 640px) {
          .dp-gift { grid-template-columns: 1fr; gap: 1rem; }
          .dp-gift-cta { width: 100%; text-align: center; }
        }
      `}</style>

      <div
        className="dp-gift"
        style={{
          background: "var(--surface-cream)",
          border: "1px solid var(--line-200)",
          borderRadius: "var(--r-lg)",
          padding: "1.25rem 1.5rem",
        }}
      >
        <span
          style={{
            position: "relative",
            display: "block",
            width: THUMB,
            height: THUMB,
            borderRadius: "var(--r-md)",
            background: "var(--surface-white)",
            overflow: "hidden",
          }}
        >
          <Image src={boxImage} alt={`Coffret cadeau ${productName}`} fill sizes={`${THUMB}px`} style={{ objectFit: "contain", padding: 8 }} />
        </span>

        <div style={{ minWidth: 0 }}>
          <p
            style={{
              margin: "0 0 0.35rem",
              fontFamily: "var(--font-sans)",
              fontSize: "var(--t-xs)",
              fontWeight: "var(--fw-semibold)",
              letterSpacing: "var(--ls-widest)",
              textTransform: "uppercase",
              color: "var(--gold-700)",
            }}
          >
            Offrir {productName}
          </p>
          <h3
            id="dp-gift-title"
            style={{ margin: "0 0 0.4rem", fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 600, color: "var(--ink-900)", lineHeight: 1.2 }}
          >
            Emballage cadeau offert dès {euroWhole(FREE_SHIPPING_THRESHOLD_EUR)} €
          </h3>
          <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "var(--t-sm)", color: "var(--ink-700)", lineHeight: 1.5 }}>
            Écrin rigide et ruban or, envoyés à l&apos;adresse de votre choix. Aucun prix n&apos;apparaît dans le colis.
          </p>
        </div>

        {/*
          Aucune route `/panier` n'existe dans `src/app/[locale]/` : le panier
          est un tiroir ouvert depuis le `Header`. Le bouton est donc inerte
          (`aria-disabled`) jusqu'à ce qu'une page panier accepte `?cadeau=1`.
        */}
        <a
          href="#"
          aria-disabled="true"
          className="dp-gift-cta"
          style={{
            display: "inline-block",
            padding: "0.8rem 1.4rem",
            borderRadius: "var(--r-md)",
            border: "1px solid var(--line-300)",
            background: "var(--surface-white)",
            color: "var(--ink-900)",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--t-xs)",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textDecoration: "none",
            whiteSpace: "nowrap",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          Ajouter l&apos;option cadeau
        </a>
      </div>
    </section>
  );
}
