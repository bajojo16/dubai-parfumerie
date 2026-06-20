import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

type SupportedMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

export async function POST(req: NextRequest) {
  const { imageBase64, mediaType }: { imageBase64: string; mediaType?: SupportedMediaType } = await req.json();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType ?? 'image/jpeg',
            data: imageBase64,
          },
        },
        {
          type: 'text',
          text: `Tu es l'assistant visuel de Dubaï Parfumerie.

Analyse cette image et identifie :
1. Si c'est un flacon de parfum : sa marque et son nom si visible
2. Sinon : l'ambiance/style/occasion qui pourrait inspirer un choix de parfum

Catalogue disponible : Lattafa Oud Pour Elle (oud floral), Al Haramain Amber Oud (ambré), Reef Opulent Blue (frais marin), Swiss Arabian Shaghaf Oud (oud rose), Armaf Club de Nuit (boisé frais), Ahmed Al Maghribi L'Or Intense (épicé).

Retourne JSON : { "identified": "ce que tu vois", "suggestions": ["slug1", "slug2", "slug3"], "reasoning": "pourquoi ces parfums" }`,
        },
      ],
    }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  try {
    const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? '{}');
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({
      identified: 'Image analysée',
      suggestions: ['al-haramain-amber-oud'],
      reasoning: "Basé sur l'ambiance détectée",
    });
  }
}
