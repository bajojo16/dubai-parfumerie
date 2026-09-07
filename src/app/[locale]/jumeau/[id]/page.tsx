/**
 * `/jumeau/<referenceId>` — l'ADRESSE d'un résultat du jumeau olfactif.
 *
 * Un résultat n'en avait pas : impossible de l'envoyer à quelqu'un, de le
 * retrouver, ou de l'indexer. En revenant sur le site, tout était à refaire.
 * Cette page ouvre le module DÉJÀ RÉSOLU sur la référence demandée
 * (`initialReferenceId`) et porte le titre et la description du partage —
 * c'est ce que WhatsApp affichera dans l'aperçu du lien.
 *
 * Serveur, volontairement : `generateMetadata` a besoin du moteur, et le moteur
 * n'a rien à faire dans le bundle du client tant que la section n'est pas à
 * l'écran. Le composant, lui, reste client (`OlfactiveTwin`).
 *
 * `notFound()` dès que l'identifiant n'existe pas dans la base : une adresse
 * inventée doit rendre un 404 propre, jamais une page vide ni un résultat au
 * hasard. Une référence QUI EXISTE mais sans jumeau, en revanche, est une page
 * valable : le module y montre l'écran « pas encore de jumeau » et son alerte
 * e-mail.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { findTwinById, getReference } from "@/data/olfactive-match";
import { savingsOf } from "@/data/reference-prices";
import { OLFACTIVE_TWINS } from "@/data/olfactive-twins";
import { JumeauSection } from "./JumeauSection";

type Params = { params: Promise<{ locale: string; id: string }> };

function euros(locale: string, n: number): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, id } = await params;
  const reference = getReference(id);
  if (!reference) return { title: "Jumeau introuvable" };

  const t = await getTranslations({ locale, namespace: "olfactiveTwin" });
  const name = `${reference.house} · ${reference.name}`;
  const title = t("page_title", { name });
  const twin = findTwinById(id);

  if (!twin) {
    return {
      // Le gabarit « %s | Dubaï Parfumerie » est posé par le layout racine :
      // le répéter ici doublait le suffixe dans l'onglet.
      title,
      description: t("no_twin_text"),
      openGraph: { title, type: "website" },
    };
  }

  const twinName = `${twin.product.brand} · ${twin.product.name}`;
  const price = twin.product.price ?? 0;
  const savings = savingsOf(id, price);
  // Le prix de l'original n'entre dans la description QUE s'il est connu : la
  // règle de `reference-prices.ts` vaut aussi pour les métadonnées.
  const description = savings
    ? t("page_description_priced", {
        twin: twinName,
        price: euros(locale, price),
        retail: `≈ ${Math.round(savings.retail).toLocaleString("fr-FR")} €`,
        percent: savings.percent,
        name,
      })
    : t("page_description", { twin: twinName, price: euros(locale, price), name });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: twin.product.image ?? "/assets/prod-1.jpg" }],
    },
  };
}

export default async function JumeauPage({ params }: Params) {
  const { locale, id } = await params;
  // Seule vérification : la référence doit exister. L'absence de JUMEAU n'est
  // pas un 404 — c'est un état légitime que le module sait montrer.
  if (!getReference(id)) notFound();

  const t = await getTranslations({ locale, namespace: "olfactiveTwin" });
  const reference = getReference(id)!;

  return (
    <main style={{ background: "var(--surface-page, #FDFBF6)", minHeight: "100vh", padding: "56px 24px 72px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#A8801F",
              marginBottom: 8,
            }}
          >
            {t("eyebrow")}
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "#2C2620", margin: "0 0 8px" }}>
            {t("page_title", { name: `${reference.house} · ${reference.name}` })}
          </h1>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "#6A655D", margin: 0 }}>{t("subtitle")}</p>
        </div>

        <JumeauSection matches={OLFACTIVE_TWINS} locale={locale} referenceId={id} />
      </div>
    </main>
  );
}
