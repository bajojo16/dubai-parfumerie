import { Faq } from "@/components/faq/Faq";
import { FaqJsonLd } from "@/components/faq/FaqJsonLd";

export default async function PreviewFaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <main style={{ background: "#FAF6EE", minHeight: "100vh", padding: "32px 0" }}>
      {/* Schéma FAQPage (rendu serveur) pour les rich results */}
      <FaqJsonLd />
      <Faq locale={locale} />
    </main>
  );
}
