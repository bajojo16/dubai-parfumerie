"use client";

import { useState } from "react";

const FAQ_GROUPS = [
  {
    group: "Commande & Paiement",
    icon: "💳",
    items: [
      {
        q: "Quels modes de paiement acceptez-vous ?",
        a: "Nous acceptons les cartes bancaires (Visa, Mastercard, American Express), PayPal, Apple Pay, Google Pay et le paiement en 4× sans frais via Alma pour les commandes entre 60€ et 2 000€.",
      },
      {
        q: "Comment fonctionne le paiement en 4× sans frais ?",
        a: "Lors du paiement, sélectionnez Alma. Vous payez 25% à la commande, puis 3 prélèvements égaux à 30, 60 et 90 jours. Aucun intérêt, aucun frais cachés. Disponible dès 60€ d'achats.",
      },
      {
        q: "Puis-je utiliser un code promo ?",
        a: "Oui ! Entrez votre code dans le champ prévu à l'étape du panier, avant de procéder au paiement. Un seul code promo par commande. Les codes ne se cumulent pas avec les offres flash.",
      },
      {
        q: "Ma commande est-elle sécurisée ?",
        a: "Absolument. Toutes nos transactions sont chiffrées SSL 256 bits. Nous ne stockons jamais vos données de carte bancaire. Nos paiements sont traités par Stripe, certifié PCI-DSS niveau 1.",
      },
    ],
  },
  {
    group: "Livraison",
    icon: "📦",
    items: [
      {
        q: "Quels sont les délais de livraison ?",
        a: "Livraison standard : 2-4 jours ouvrés (gratuite dès 60€, sinon 4,90€). Livraison express : 24h (9,90€). Toute commande passée avant 14h est expédiée le jour même. Livraison internationale : 5-10 jours selon destination.",
      },
      {
        q: "Livrez-vous à l'international ?",
        a: "Oui, nous livrons dans toute l'Europe (5-7 jours, à partir de 9,90€), au Maghreb (7-10 jours, à partir de 14,90€) et dans les pays du Golfe (7-12 jours, à partir de 19,90€). Certaines destinations peuvent avoir des restrictions douanières.",
      },
      {
        q: "Comment suivre ma commande ?",
        a: "Dès l'expédition, vous recevrez un email avec votre numéro de suivi. Vous pouvez suivre votre colis en temps réel sur notre page dédiée ou directement sur le site du transporteur (Chronopost, Colissimo).",
      },
    ],
  },
  {
    group: "Retours",
    icon: "↩️",
    items: [
      {
        q: "Quelle est votre politique de retour ?",
        a: "Vous disposez de 30 jours après réception pour retourner tout article non ouvert et dans son emballage d'origine. Initiez votre retour depuis votre espace client. Les frais de retour sont à votre charge (sauf article défectueux).",
      },
      {
        q: "Dans quel délai serai-je remboursé(e) ?",
        a: "Dès réception et vérification de votre retour (2-3 jours ouvrés), le remboursement est initié. Comptez 3-5 jours supplémentaires selon votre banque pour voir le crédit apparaître. Pour PayPal, le remboursement est immédiat.",
      },
    ],
  },
  {
    group: "Authenticité",
    icon: "✅",
    items: [
      {
        q: "Comment garantissez-vous l'authenticité de vos produits ?",
        a: "Nous nous approvisionnons directement auprès des maisons de parfumerie ou de leurs distributeurs officiels agréés. Chaque lot est contrôlé à réception : vérification des codes-barres, des numéros de lot, des hologrammes et de la qualité olfactive par notre équipe.",
      },
      {
        q: "Que faire si je suspecte un produit contrefait ?",
        a: "Notre garantie d'authenticité couvre 100% de nos produits. Si vous avez le moindre doute, contactez-nous immédiatement avec des photos. Nous analyserons le produit et vous rembourserons intégralement si un problème est constaté.",
      },
    ],
  },
  {
    group: "Professionnel / B2B",
    icon: "🏢",
    items: [
      {
        q: "Proposez-vous des tarifs professionnels ou la vente en gros ?",
        a: "Oui ! Nous avons un programme B2B dédié aux revendeurs, hôtels, spas et instituts de beauté. Remises selon volumes, conditionnements spéciaux, livraison palettisée. Contactez notre équipe commerciale à b2b@dubai-parfumerie.fr ou via WhatsApp pour un devis personnalisé.",
      },
    ],
  },
];

export default function FaqPage() {
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenItem((prev) => (prev === key ? null : key));
  };

  return (
    <main style={{ background: "var(--surface-page)", minHeight: "100vh" }}>
      {/* ── Hero ── */}
      <section
        style={{
          background: "var(--espresso-900)",
          padding: "80px 24px 72px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--gold-500)",
            marginBottom: "16px",
          }}
        >
          Centre d&rsquo;aide
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(40px, 6vw, 64px)",
            fontWeight: 500,
            color: "var(--on-dark-strong)",
            lineHeight: 1.15,
            marginBottom: "20px",
            letterSpacing: "0.02em",
          }}
        >
          Questions Fréquentes
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "16px",
            color: "var(--on-dark-muted)",
            maxWidth: "440px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Trouvez rapidement les réponses à vos questions
        </p>
      </section>

      {/* ── Accordion sections ── */}
      <section
        style={{
          padding: "64px 24px 80px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {FAQ_GROUPS.map((group, gi) => (
          <div
            key={gi}
            style={{
              background: "var(--surface-white)",
              borderRadius: "var(--r-lg)",
              boxShadow:
                "0 2px 8px rgba(21,16,11,0.07), 0 1px 2px rgba(21,16,11,0.04)",
              overflow: "hidden",
            }}
          >
            {/* Group header */}
            <div
              style={{
                padding: "20px 28px",
                borderBottom: "1px solid rgba(200,144,30,0.15)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "20px" }}>{group.icon}</span>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "var(--gold-700)",
                  letterSpacing: "0.01em",
                  flex: 1,
                }}
              >
                {group.group}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--gold-500)",
                  background: "rgba(200,144,30,0.1)",
                  borderRadius: "99px",
                  padding: "2px 10px",
                  letterSpacing: "0.04em",
                }}
              >
                {group.items.length}
              </span>
            </div>

            {/* FAQ items */}
            {group.items.map((item, ii) => {
              const key = `${gi}-${ii}`;
              const isOpen = openItem === key;
              return (
                <div
                  key={ii}
                  style={{
                    borderBottom:
                      ii < group.items.length - 1
                        ? "1px solid rgba(107,93,78,0.1)"
                        : "none",
                  }}
                >
                  <button
                    onClick={() => toggle(key)}
                    style={{
                      width: "100%",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "20px 28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      textAlign: "left",
                      borderLeft: isOpen
                        ? "3px solid var(--gold-500)"
                        : "3px solid transparent",
                      transition: "border-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isOpen) {
                        (e.currentTarget as HTMLButtonElement).style.borderLeftColor =
                          "var(--gold-300)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isOpen) {
                        (e.currentTarget as HTMLButtonElement).style.borderLeftColor =
                          "transparent";
                      }
                    }}
                    aria-expanded={isOpen}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "15px",
                        fontWeight: 500,
                        color: isOpen ? "var(--gold-700)" : "var(--ink-900)",
                        lineHeight: 1.5,
                        transition: "color 0.2s ease",
                      }}
                    >
                      {item.q}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "22px",
                        fontWeight: 300,
                        color: "var(--gold-500)",
                        lineHeight: 1,
                        flexShrink: 0,
                        transition: "transform 0.25s ease",
                        transform: isOpen ? "rotate(0deg)" : "rotate(0deg)",
                        display: "inline-block",
                        width: "24px",
                        textAlign: "center",
                      }}
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {/* Answer with maxHeight animation */}
                  <div
                    style={{
                      maxHeight: isOpen ? "500px" : "0",
                      overflow: "hidden",
                      transition: "max-height 0.35s ease",
                    }}
                  >
                    <div
                      style={{
                        padding: "0 28px 24px 31px",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "14px",
                          color: "var(--ink-500)",
                          lineHeight: 1.75,
                          margin: 0,
                        }}
                      >
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </section>

      {/* ── Contact card ── */}
      <section
        style={{
          background: "var(--surface-cream)",
          padding: "64px 24px 80px",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--gold-500)",
              textAlign: "center",
              marginBottom: "12px",
            }}
          >
            Besoin d&rsquo;aide ?
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 500,
              color: "var(--ink-900)",
              textAlign: "center",
              marginBottom: "40px",
              letterSpacing: "0.01em",
            }}
          >
            Notre équipe est là pour vous
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {/* WhatsApp card */}
            <div
              style={{
                background: "var(--surface-white)",
                borderRadius: "var(--r-lg)",
                padding: "36px 32px",
                boxShadow:
                  "0 2px 8px rgba(21,16,11,0.07), 0 1px 2px rgba(21,16,11,0.04)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "36px", marginBottom: "4px" }}>📱</span>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "22px",
                  fontWeight: 600,
                  color: "var(--ink-900)",
                  margin: 0,
                }}
              >
                WhatsApp
              </p>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--ink-700)",
                  margin: 0,
                  letterSpacing: "0.02em",
                }}
              >
                +33 6 12 34 56 78
              </p>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                  color: "var(--ink-400)",
                  margin: "4px 0 20px",
                }}
              >
                Réponse en moins de 2h
              </p>
              <a
                href="https://wa.me/33612345678"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "13px 28px",
                  background: "#25D366",
                  color: "#ffffff",
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  borderRadius: "var(--r-sm)",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "#1ebe5d";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "#25D366";
                }}
              >
                Ouvrir WhatsApp
              </a>
            </div>

            {/* Email card */}
            <div
              style={{
                background: "var(--surface-white)",
                borderRadius: "var(--r-lg)",
                padding: "36px 32px",
                boxShadow:
                  "0 2px 8px rgba(21,16,11,0.07), 0 1px 2px rgba(21,16,11,0.04)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "36px", marginBottom: "4px" }}>📧</span>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "22px",
                  fontWeight: 600,
                  color: "var(--ink-900)",
                  margin: 0,
                }}
              >
                Email
              </p>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "var(--ink-700)",
                  margin: 0,
                }}
              >
                contact@dubai-parfumerie.fr
              </p>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                  color: "var(--ink-400)",
                  margin: "4px 0 20px",
                }}
              >
                Réponse sous 24h
              </p>
              <a
                href="mailto:contact@dubai-parfumerie.fr"
                style={{
                  display: "inline-block",
                  padding: "12px 28px",
                  background: "transparent",
                  color: "var(--gold-700)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  borderRadius: "var(--r-sm)",
                  border: "1.5px solid var(--gold-500)",
                  transition: "background 0.2s ease, color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = "var(--gold-500)";
                  el.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = "transparent";
                  el.style.color = "var(--gold-700)";
                }}
              >
                Envoyer un email
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
