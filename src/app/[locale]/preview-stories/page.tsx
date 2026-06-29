"use client";

import { useLocale } from "next-intl";
import { StoryBubbles } from "@/components/sections/StoryBubbles";
import { DEMO_STORIES } from "@/data/product-stories";

export default function PreviewStoriesPage() {
  const locale = useLocale();
  return (
    <main style={{ background: "#FDFBF6", minHeight: "100vh", padding: "60px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "#2C2620", margin: "0 0 6px" }}>
          StoryBubbles + StoryPlayer
        </h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "#6A655D", margin: "0 0 28px" }}>
          Survole une bulle (zoom + lecture muette). Clic = lecteur plein écran (backdrop flou, vignettes, progression, son, partage, CTA shoppable). 2 stories shoppables (badge prix).
        </p>

        {/* Simulé : bloc d'achat puis bulles dessous */}
        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "#2C2620" }}>Bloc d&apos;achat (simulé)</div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#8A857C", marginTop: 4 }}>Les bulles s&apos;affichent juste en dessous.</div>
        </div>

        <StoryBubbles stories={DEMO_STORIES} locale={locale} />
      </div>
    </main>
  );
}
