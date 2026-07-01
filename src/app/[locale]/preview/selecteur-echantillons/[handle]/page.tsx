import SampleSelector from "@/components/sample-selector/SampleSelector";

// Variante paramétrable : /preview/selecteur-echantillons/<N>
// où <N> = nombre d'échantillons (ex. /6, /12). Défaut 10 si non numérique.
export default async function SampleSelectorHandlePage({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>;
}) {
  const { locale, handle } = await params;
  const n = Number.parseInt(handle, 10);
  const sampleCount = Number.isFinite(n) && n > 0 && n <= 30 ? n : 10;
  return <SampleSelector sampleCount={sampleCount} locale={locale} />;
}
