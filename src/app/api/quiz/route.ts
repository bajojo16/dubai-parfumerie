import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

const PRODUCTS = [
  { id: 1, slug: 'lattafa-oud-pour-elle', name: 'Oud Pour Elle', brand: 'Lattafa', price: 28.90, image: '/assets/prod-1.jpg', families: ['oud', 'rose', 'musc'], gender: 'femme', intensity: 'intense' },
  { id: 2, slug: 'al-haramain-amber-oud', name: 'Amber Oud', brand: 'Al Haramain', price: 34.90, image: '/assets/prod-2.jpg', families: ['ambre', 'vanille', 'oud'], gender: 'mixte', intensity: 'intense' },
  { id: 3, slug: 'reef-opulent-blue', name: 'Opulent Blue', brand: 'Reef', price: 22.90, image: '/assets/prod-3.jpg', families: ['musc', 'frais', 'boisé'], gender: 'homme', intensity: 'léger' },
  { id: 4, slug: 'swiss-arabian-shaghaf', name: 'Shaghaf Oud', brand: 'Swiss Arabian', price: 42.90, image: '/assets/prod-4.jpg', families: ['oud', 'rose', 'santal'], gender: 'femme', intensity: 'intense' },
  { id: 5, slug: 'armaf-club-de-nuit', name: 'Club de Nuit', brand: 'Armaf', price: 19.90, image: '/assets/prod-5.jpg', families: ['frais', 'boisé', 'musc'], gender: 'homme', intensity: 'modéré' },
  { id: 6, slug: 'ahmed-al-maghribi-lor', name: "L'Or Intense", brand: 'Ahmed Al Maghribi', price: 36.90, image: '/assets/prod-6.jpg', families: ['épicé', 'ambre', 'encens'], gender: 'mixte', intensity: 'intense' },
];

interface QuizAnswers {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
}

interface QuizResult {
  profile: string;
  description: string;
  recommended: string[];
  why: string[];
}

export async function POST(req: NextRequest) {
  const { answers }: { answers: QuizAnswers } = await req.json();
  // answers: { q1: gender, q2: season, q3: mood, q4: notes, q5: intensity }

  const prompt = `Tu es expert en parfums orientaux chez Dubaï Parfumerie.

Un client a répondu au quiz :
- Genre préféré : ${answers.q1}
- Saison favorite : ${answers.q2}
- Humeur recherchée : ${answers.q3}
- Notes préférées : ${answers.q4}
- Intensité souhaitée : ${answers.q5}

Produits disponibles :
${PRODUCTS.map(p => `• ${p.name} (${p.brand}) — familles: ${p.families.join(', ')} — genre: ${p.gender} — intensité: ${p.intensity} — ${p.price}€`).join('\n')}

Retourne un JSON avec :
{
  "profile": "Nom du profil olfactif (ex: L'Aventurier Oriental, La Sultane des Roses...)",
  "description": "2-3 phrases décrivant la personnalité olfactive du client",
  "recommended": [3 slugs de produits les plus adaptés],
  "why": ["raison pour produit 1", "raison pour produit 2", "raison pour produit 3"]
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0].type === 'text' ? response.content[0].text : '';

  let parsed: QuizResult;
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch?.[0] ?? '{}') as QuizResult;
  } catch {
    parsed = {
      profile: "L'Amateur Oriental",
      description: 'Vous aimez les fragrances riches et enveloppantes.',
      recommended: ['al-haramain-amber-oud', 'lattafa-oud-pour-elle', 'ahmed-al-maghribi-lor'],
      why: ['Notes chaudes', 'Tenue longue durée', 'Authenticité orientale'],
    };
  }

  const recommendedProducts = (parsed.recommended as string[])
    .map((slug: string, i: number) => ({
      ...PRODUCTS.find(p => p.slug === slug),
      why: parsed.why?.[i] ?? '',
    }))
    .filter(Boolean);

  return NextResponse.json({
    profile: parsed.profile,
    description: parsed.description,
    products: recommendedProducts,
  });
}
