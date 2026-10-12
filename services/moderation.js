import { GoogleGenAI } from "@google/genai";

let aiClient = null;

function getAiClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    } catch (err) {
      console.warn("Failed to initialize GoogleGenAI client:", err.message);
    }
  }
  return aiClient;
}

const FORBIDDEN_WORDS = [
  "spam", "casino", "viagra", "crypto scam", "plagiat", "insulte", 
  "connard", "salaud", "merde", "putain", "idiot", "imbecile", "hack",
  "cheat", "leak", "nude", "porn", "xxx"
];

export async function moderateForumContent({ title = "", content = "", category = "" }) {
  const combinedText = `${title}\n${content}`.trim();
  
  // Rule-based quick filter
  const lower = combinedText.toLowerCase();
  for (const word of FORBIDDEN_WORDS) {
    if (lower.includes(word)) {
      return {
        approved: false,
        reason: `Contenu inapproprié détecté par le système de sécurité (terme prohibé : "${word}"). Le respect des règles académiques est obligatoire.`
      };
    }
  }

  // Check if AI moderation is available via Gemini
  const client = getAiClient();
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Tu es le modérateur intelligent de la plateforme de mathématiques MK Olympiades.
Examine ce message destiné au forum communautaire (thème : "${category}") :

Titre : ${title || "(sans titre)"}
Contenu :
${content}

Règles de modération :
1. Le contenu doit être respectueux, sans insultes, sans attaques personnelles, sans grossièretés, sans haine et sans harcèlement.
2. Pas de spam commercial, de liens frauduleux, ni d'activités malveillantes.
3. Le contenu peut contenir du LaTeX mathématique ($...$, $$...$$), des questions d'olympiades, des démonstrations et des échanges scientifiques.
4. Pas de plagiat flagrant revendiqué comme propre travail sans attribution.

Réponds STRICTEMENT sous format JSON avec deux clés :
{
  "approved": true ou false,
  "reason": "Explication brève si refusé, ou 'OK' si approuvé."
}`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        return {
          approved: Boolean(parsed.approved),
          reason: parsed.reason || (parsed.approved ? "Approuvé par la modération IA" : "Contenu refusé par la modération IA.")
        };
      }
    } catch (err) {
      console.warn("Gemini moderation call error, fallback to permissive:", err.message);
    }
  }

  // Default fallback if AI service is offline
  return {
    approved: true,
    reason: "Approuvé (vérification standard)"
  };
}
