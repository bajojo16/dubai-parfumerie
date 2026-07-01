import SampleSelector from "@/components/sample-selector/SampleSelector";

// Preview du sélecteur d'échantillons (N=10 comme la maquette).
// NON ajouté à la nav — route de prévisualisation uniquement.
export default async function SampleSelectorPreviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <SampleSelector sampleCount={10} locale={locale} />;
}
