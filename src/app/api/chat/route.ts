import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic();

const SYSTEM_PROMPT = `Tu es un parfumeur expert chez Dubaï Parfumerie, la référence française des parfums orientaux authentiques du Golfe.

Tu connais parfaitement :
- Les grandes maisons du Golfe : Lattafa, Reef, Al Haramain, Ahmed Al Maghribi, Armaf, Swiss Arabian, Paris Corner, Gulf Orchid, Surrati, Khadlaj
- Les familles olfactives orientales : Oud, Musc, Ambre, Rose, Santal, Épices, Vanille, Bakhour
- Les différences entre EDP, EDT, Huile de parfum (attar), concentrations
- Le storytelling culturel des parfums arabes

Tes réponses :
- Chaleureuses, expertes, sensorielles
- En français par défaut, en arabe si le client écrit en arabe
- Courtes (3-5 phrases max) sauf si question technique détaillée
- Recommandes toujours des produits de notre catalogue
- Tu peux suggérer le quiz signature si le client cherche son profil olfactif

Catalogue disponible :
• Lattafa Oud Pour Elle — Oud · Rose · Musc blanc — 28,90€
• Al Haramain Amber Oud — Ambre · Vanille · Bois de oud — 34,90€
• Reef Opulent Blue — Musc · Cèdre · Bergamote — 22,90€
• Swiss Arabian Shaghaf Oud — Oud · Santal · Rose de Taïf — 42,90€
• Armaf Club de Nuit — Agrumes · Bois · Musc — 19,90€
• Ahmed Al Maghribi L'Or Intense — Épices · Ambre · Encens — 36,90€`;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
