import { Exercise, Opponent, ExerciseResult } from '../types';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-opus-4-6';

async function callClaude(
  apiKey: string,
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  maxTokens = 1024,
  onStream?: (text: string) => void
): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
      stream: !!onStream,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = (err as { error?: { message?: string } }).error?.message ?? `HTTP ${response.status}`;
    throw new Error(msg);
  }

  if (onStream && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
              const text = parsed.delta.text ?? '';
              fullText += text;
              onStream(text);
            }
          } catch {
            // skip malformed
          }
        }
      }
    }
    return fullText;
  }

  const data = await response.json() as { content: { type: string; text: string }[] };
  return data.content.find((b) => b.type === 'text')?.text ?? '';
}

const COACH_SYSTEM = `Je bent een expert coach in sociaal daensistisch debatteren. Je evalueert antwoorden van studenten op basis van:
1. Structuur (Is het antwoord logisch opgebouwd?)
2. Overtuigingskracht (Is het overtuigend voor een breed publiek?)
3. Daensistische consistentie (Sluit het aan bij sociaal-daensistische waarden: arbeidswaardigheid, solidariteit, gemeenschap, menselijke maat?)

Je antwoorden zijn altijd in het NEDERLANDS. Je bent streng maar aanmoedigend. Je geeft concrete verbeterpunten.`;

export async function evaluateAnswer(
  apiKey: string,
  exercise: Exercise,
  userAnswer: string
): Promise<ExerciseResult> {
  const prompt = `Evalueer dit antwoord van een student op de volgende debatsoefening.

SCENARIO: ${exercise.context}
UITDAGING: "${exercise.prompt}"
ANTWOORD VAN DE STUDENT: "${userAnswer}"

Geef een evaluatie in dit EXACTE JSON-formaat (geen markdown, enkel JSON):
{
  "score": <getal 0-100>,
  "structuurScore": <getal 0-100>,
  "overtuigingScore": <getal 0-100>,
  "consistentieScore": <getal 0-100>,
  "feedback": "<algemene feedback in 2-3 zinnen>",
  "verbeterd": "<verbeterd antwoord in de stijl van een ervaren daensistisch debater>",
  "sterktepunten": ["<sterk punt 1>", "<sterk punt 2>"],
  "verbeterpunten": ["<verbeterpunt 1>", "<verbeterpunt 2>"]
}`;

  const text = await callClaude(apiKey, COACH_SYSTEM, [{ role: 'user', content: prompt }], 1500);

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    return JSON.parse(jsonMatch[0]) as ExerciseResult;
  } catch {
    return {
      score: 60,
      structuurScore: 60,
      overtuigingScore: 60,
      consistentieScore: 60,
      feedback: text.slice(0, 300),
      verbeterd: '',
      sterktepunten: ['Je hebt een antwoord gegeven'],
      verbeterpunten: ['Werk aan de structuur', 'Wees concreter'],
    };
  }
}

export async function analyzeText(
  apiKey: string,
  text: string,
  onStream: (chunk: string) => void
): Promise<void> {
  const system = `Je bent een expert in framing, drogredenen en daensistische retoriek. Je analyseert teksten en geeft een grondige retorische analyse. Alles in het NEDERLANDS.`;

  const prompt = `Analyseer de volgende tekst vanuit een sociaal-daensistisch retorisch perspectief:

"${text}"

Geef een gestructureerde analyse met:
## Hoofdclaim
Wat beweert de auteur/spreker eigenlijk?

## Verborgen Aannames
Welke aannames liggen verscholen in dit argument?

## Frame-Analyse
Welk frame wordt gebruikt? Hoe stuurt dit het denken van de lezer/luisteraar?

## Drogredenen
Zijn er logische fouten? (stroman, vals dilemma, ad hominem, enz.)

## Daensistische Respons
Hoe zou een sociaal-daensistisch debater op dit argument reageren? Geef een concreet tegenargument én een punchline.`;

  await callClaude(apiKey, system, [{ role: 'user', content: prompt }], 2048, onStream);
}

export async function debateResponse(
  apiKey: string,
  opponent: Opponent,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[],
  onStream: (chunk: string) => void
): Promise<void> {
  await callClaude(apiKey, opponent.systemPrompt, conversationHistory, 512, onStream);
}

export async function generatePunchlines(
  apiKey: string,
  topic: string,
  onStream: (chunk: string) => void
): Promise<void> {
  const system = `Je bent een meester in daensistische retoriek en punchlines. Je maakt korte, krachtige zinnen die een debat kunnen draaien. Alles in het NEDERLANDS.`;

  const prompt = `Genereer 5 krachtige punchlines voor een debat over het volgende thema: "${topic}"

Format elke punchline als volgt:
**Punchline:** [de zin]
**Gebruik:** [wanneer/hoe te gebruiken]
**Effect:** [waarom dit werkt]

De punchlines moeten:
- Kort zijn (max 2 zinnen)
- Moreel krachtig zijn
- Daensistische waarden uitdrukken
- Memorabel zijn`;

  await callClaude(apiKey, system, [{ role: 'user', content: prompt }], 1500, onStream);
}

export async function getEmergencyBriefing(
  apiKey: string,
  topic: string,
  onStream: (chunk: string) => void
): Promise<void> {
  const system = `Je bent een snelle debatcoach voor sociaal daensisme. Je geeft bliksemsnelle voorbereiding voor een debat. Alles in het NEDERLANDS. Wees concreet en bruikbaar.`;

  const prompt = `Ik moet DIRECT debatteren over: "${topic}"
Geef me een noodvoorbereiding in dit format:

## ⚡ Kernargumenten (top 3)
[3 sterke daensistische argumenten over dit thema]

## ⚠️ Valkuilen
[2 dingen die je NIET moet zeggen]

## 🎯 Punchlines (top 3)
[3 sterke afsluiters of tussenkomsten]

## 🔍 Te verwachten aanvallen
[2 typische tegenargumenten + hoe je ze pareert]`;

  await callClaude(apiKey, system, [{ role: 'user', content: prompt }], 1500, onStream);
}

export async function getPersonalizedTip(
  apiKey: string,
  weakTopics: string[],
  recentScore: number,
  onStream: (chunk: string) => void
): Promise<void> {
  const system = `Je bent een persoonlijke debatcoach voor sociaal daensisme. Je geeft korte, gerichte tips. Alles in het NEDERLANDS.`;

  const prompt = `Mijn zwakke punten zijn: ${weakTopics.join(', ') || 'nog niet bekend'}
Mijn recentste score was: ${recentScore}/100

Geef me één concrete tip voor vandaag in max 3 zinnen. Wees direct en praktisch.`;

  await callClaude(apiKey, system, [{ role: 'user', content: prompt }], 300, onStream);
}
