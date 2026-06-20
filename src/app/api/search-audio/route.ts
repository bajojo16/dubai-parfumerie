import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { transcript }: { transcript: string } = await req.json();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    messages: [{
      role: 'user',
      content: `Tu es l'assistant de recherche de Dubaï Parfumerie.

L'utilisateur a dit : "${transcript}"

Catalogue : Lattafa Oud Pour Elle, Al Haramain Amber Oud, Reef Opulent Blue, Swiss Arabian Shaghaf Oud, Armaf Club de Nuit, Ahmed Al Maghribi L'Or Intense.

Retourne un JSON : { "query": "terme de recherche normalisé", "suggestions": ["produit1", "produit2"], "message": "Je cherche..." }`,
    }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  try {
    const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? '{}');
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ query: transcript, suggestions: [], message: transcript });
  }
}
