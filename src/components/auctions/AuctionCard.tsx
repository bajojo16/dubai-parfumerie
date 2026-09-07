"use client";

/**
 * Carte d'un lot dans la grille : la photo plein cadre fait tout le travail,
 * le texte se pose en bas sur un dégradé. Le prix courant et le compte à
 * rebours se lisent sans ouvrir le panneau — c'est ce qui décide du clic.
 *
 * Le lot « à la une » (celui qui ferme le premier) occupe 2 × 2 cellules sur
 * grand écran ; la classe `au-card--featured` est stylée dans le bloc <style>
 * de la page, les styles inline ne pouvant pas porter de media query.
 *
 * État du flacon : pastille « Neuf » ou « Occasion · 75 % » à côté du statut,
 * et pour une occasion une jauge verticale discrète sous le chrono — le
 * visiteur voit depuis la grille qu'il enchérit sur un flacon entamé.
 */

import Image from "next/image";
import { fmtPrice, type LotView } from "./auction-store";
import { Countdown } from "./Countdown";
import { DEMO_BIDDER_COUNTRY, conditionLabel, initialsOf } from "@/data/auctions";
import { FillGauge } from "./FillGauge";
import { StatusBadge } from "./StatusBadge";

export function AuctionCard({ view, featured = false, onOpen }: { view: LotView; featured?: boolean; onOpen: () => void }) {
  const { lot, price, status, hasBids, state, remainingMs } = view;
  const ended = status === "won" || status === "ended";
  const last = state.bids.length ? state.bids[state.bids.length - 1] : null;
  const occasion = lot.condition === "occasion";

  return (
    <article className={`au-card${featured ? " au-card--featured" : ""}`} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Ouvrir l'enchère ${lot.brand} ${lot.name}`}
        className="au-card-btn"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          padding: 0,
          border: "none",
          background: "var(--espresso-800)",
          borderRadius: 22,
          overflow: "hidden",
          cursor: "pointer",
          textAlign: "start",
          color: "inherit",
          boxShadow: "0 12px 32px rgba(21,16,11,.16)",
          position: "relative",
        }}
      >
        <Image
          src={lot.image}
          alt={`${lot.brand} ${lot.name}`}
          fill
          sizes={featured ? "(max-width: 640px) 100vw, (max-width: 1100px) 66vw, 720px" : "(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 360px"}
          priority={featured}
          className="au-card-img"
          style={{ objectFit: "cover", objectPosition: "center", filter: ended ? "saturate(.55) brightness(.8)" : undefined }}
        />
        {/* Dégradé de lisibilité : le texte blanc doit rester lisible sur les
            photos claires (Yara sur satin rose, Marshmallow sur marbre). */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(21,16,11,.92) 0%, rgba(21,16,11,.55) 32%, rgba(21,16,11,0) 62%)",
          }}
        />

        {/* Haut : statut à gauche, chrono à droite */}
        <div style={{ position: "absolute", top: 14, insetInline: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {featured && !ended && <Pill tone="gold">À la une</Pill>}
            <Pill tone={occasion ? "cream" : "glass"}>{conditionLabel(lot)}</Pill>
            <StatusBadge status={status} />
          </div>
          <span
            // Pastille rouge tant que l'enchère court : le chrono est l'information
          // n° 1 de la carte, il doit se voir depuis la grille — le gris
          // translucide d'avant se fondait dans la photo. Gris quand c'est fini.
          style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "6px 10px",
              borderRadius: 999,
              background: ended ? "rgba(21,16,11,.72)" : "#C0392B",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,.14)",
            }}
          >
            <Countdown remainingMs={remainingMs} size="sm" onDark />
          </span>
        </div>

        {/* Jauge de niveau (occasion) : sous le chrono, alignée à droite, hors
            du texte du bas pour ne pas se battre avec le prix. */}
        {occasion && lot.fillLevel !== null && (
          <div style={{ position: "absolute", top: 56, insetInlineEnd: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <FillGauge level={lot.fillLevel} length={featured ? 96 : 64} thickness={8} onDark />
            <span aria-hidden style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, color: "var(--on-dark-strong)", textShadow: "0 1px 4px rgba(0,0,0,.6)", fontVariantNumeric: "tabular-nums" }}>
              {lot.fillLevel} %
            </span>
          </div>
        )}

        {/* Bas : maison, nom, prix */}
        <div style={{ position: "absolute", insetInline: 0, bottom: 0, padding: featured ? "0 24px 22px" : "0 18px 18px" }}>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold-300)", marginBottom: 4 }}>
            {lot.brand} · {lot.volume}
          </div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: featured ? "clamp(1.8rem, 3vw, 2.6rem)" : "clamp(1.35rem, 2vw, 1.7rem)",
              lineHeight: 1.05,
              color: "var(--on-dark-strong)",
              margin: 0,
            }}
          >
            {lot.name}
          </h3>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginTop: 10 }}>
            <div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--on-dark-muted)" }}>
                {ended ? (status === "won" ? "Remporté à" : "Adjugé à") : hasBids ? "Enchère actuelle" : "Mise à prix"}
              </div>
              {/* La clé change avec le montant : l'animation « saut » se rejoue à chaque relance. */}
              <div
                key={price}
                className="au-pop"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: featured ? 34 : 26,
                  lineHeight: 1,
                  color: "var(--on-dark-strong)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {fmtPrice(price)}
              </div>
            </div>
            <div style={{ textAlign: "end", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--on-dark-muted)", lineHeight: 1.35 }}>
              <div>
                Boutique <s style={{ color: "var(--on-dark-muted)" }}>{fmtPrice(lot.shopPrice)}</s>
              </div>
              <div>{state.bids.length === 0 ? "Aucune enchère" : state.bids.length === 1 ? "1 enchère" : `${state.bids.length} enchères`}</div>
              {/* Qui tient l'enchère : initiales + pays du dernier enchérisseur,
                  pour lire la course depuis la grille. Le visiteur reste « Vous ». */}
              {last && (
                <div style={{ marginTop: 2, color: "var(--on-dark-strong)", fontWeight: 600 }}>
                  {last.mine ? "Vous menez" : `Dernière : ${initialsOf(last.bidder)} ${DEMO_BIDDER_COUNTRY[last.bidder] ?? ""}`}
                </div>
              )}
            </div>
          </div>
        </div>
      </button>
    </article>
  );
}

/** Petite pastille de carte : or (à la une), crème (occasion) ou verre sombre. */
export function Pill({ children, tone = "glass" }: { children: React.ReactNode; tone?: "gold" | "cream" | "glass" }) {
  const bg = tone === "gold" ? "var(--gold-500)" : tone === "cream" ? "var(--surface-cream)" : "rgba(21,16,11,.55)";
  const fg = tone === "glass" ? "var(--on-dark-strong)" : "var(--espresso-900)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 10px",
        borderRadius: 999,
        fontFamily: "var(--font-sans)",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: ".14em",
        textTransform: "uppercase",
        background: bg,
        color: fg,
        border: tone === "glass" ? "1px solid rgba(255,255,255,.14)" : "none",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
