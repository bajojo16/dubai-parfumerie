"use client";

/**
 * WhatsAppBubble — bouton flottant rond (vert WhatsApp) ouvrant la
 * conversation service client. Monté globalement dans le layout.
 *
 * - Position : bas à DROITE (propriétés logiques → RTL-safe).
 *   Décalé en hauteur (insetBlockEnd 88) pour ne PAS chevaucher le
 *   bouton back-to-top (insetInlineEnd 24 / bottom 24, zIndex 1200).
 * - zIndex 1150 : au-dessus du contenu, SOUS les modales.
 * - prefers-reduced-motion : désactive le pulse.
 */
import { useEffect, useState } from "react";

const WA_PHONE = "966583728407";
const WA_URL = `https://wa.me/${WA_PHONE}`;
const WA_GREEN = "#25D366";

export function WhatsAppBubble() {
  const [hover, setHover] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(
      typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  return (
    <>
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacter le service client sur WhatsApp"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          position: "fixed",
          insetBlockEnd: 88,
          insetInlineStart: 24,
          zIndex: 1150,
          width: 56,
          height: 56,
          borderRadius: "50%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: WA_GREEN,
          color: "#FFFFFF",
          boxShadow: hover
            ? "0 12px 30px rgba(37,211,102,0.45)"
            : "0 8px 22px rgba(37,211,102,0.32)",
          transition: "transform .2s ease, box-shadow .25s ease",
          transform: hover && !reduced ? "scale(1.06)" : "none",
          animation:
            reduced || hover ? undefined : "wa-pulse 2.8s ease-in-out infinite",
          cursor: "pointer",
        }}
      >
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
        </svg>
      </a>

      <style>{`
        @keyframes wa-pulse {
          0%, 100% { box-shadow: 0 8px 22px rgba(37,211,102,0.32); }
          50% { box-shadow: 0 10px 30px rgba(37,211,102,0.55); }
        }
      `}</style>
    </>
  );
}
