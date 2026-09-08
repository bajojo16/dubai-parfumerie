import SampleSelector from "@/components/sample-selector/SampleSelector";
import { sampleProductsFromCatalog } from "@/data/sample-selector-catalog";

// Preview du sélecteur d'échantillons (N=10 comme la maquette).
// NON ajouté à la nav — route de prévisualisation uniquement.
//
// Les échantillons viennent du CATALOGUE COMPLET des maisons en stock, pas des
// cinq listes de l'accueil : Reef n'y figurait que dans une, d'où trois flacons
// proposés là où la boutique en tient vingt-huit. L'appel reste ici, côté
// serveur, parce qu'il charge l'agrégat des huit fichiers de données.
export default async function SampleSelectorPreviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <SampleSelector sampleCount={10} locale={locale} products={sampleProductsFromCatalog()} />;
}
