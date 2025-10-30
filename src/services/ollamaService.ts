const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL = "gemma3:4b";

interface OllamaResponse {
  response: string;
  done: boolean;
}

export const generateCoverLetter = async (
  jobTitle: string,
  jobDescription: string,
  cvText: string,
  motivation?: string,
  tone?: string,
  careerGoals?: string,
  projectSummary?: string
): Promise<string> => {
  const toneInstructions = {
    professional: "professionell und sachlich",
    enthusiastic: "enthusiastisch und energiegeladen",
    formal: "sehr förmlich und distanziert",
    creative: "kreativ und individuell"
  };

  const prompt = `Erstelle ein deutsches Bewerbungsanschreiben mit folgenden Informationen:

Stellenbezeichnung: ${jobTitle || "Nicht angegeben"}
Stellenbeschreibung: ${jobDescription}

Lebenslauf/Erfahrung: ${cvText || "Nicht angegeben"}

${motivation ? `Persönliche Motivation: ${motivation}` : ""}
${careerGoals ? `Karriereziele: ${careerGoals}` : ""}
${projectSummary ? `Projekterfahrungen: ${projectSummary}` : ""}

Tonalität: ${toneInstructions[tone as keyof typeof toneInstructions] || "professionell"}

Erstelle ein vollständiges, überzeugendes Anschreiben im deutschen Format mit:
- Anrede "Sehr geehrte Damen und Herren,"
- Einleitung mit Bezug zur ausgeschriebenen Position
- Hauptteil mit Erfahrungen und Qualifikationen
- Bezug zur Motivation und den Karrierezielen (falls angegeben)
- Schlussteil mit Gesprächsangebot
- Grußformel "Mit freundlichen Grüßen,"
- "[Ihr Name]" als Platzhalter für die Unterschrift

Das Anschreiben sollte etwa 300-400 Wörter haben und professionell klingen.`;

  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API Fehler: ${response.statusText}`);
    }

    const data: OllamaResponse = await response.json();
    return data.response.trim();
  } catch (error) {
    console.error("Fehler bei der Cover Letter Generierung:", error);
    throw new Error("Verbindung zu Ollama fehlgeschlagen. Stellen Sie sicher, dass Ollama läuft und das Modell gemma3:4b verfügbar ist.");
  }
};

export const generateMatchingAnalysis = async (
  jobDescription: string,
  cvText: string,
  motivation?: string,
  careerGoals?: string
): Promise<{
  overallScore: number;
  categories: Array<{ name: string; score: number; description: string }>;
  strengths: string[];
  improvements: string[];
  interviewTips: string[];
}> => {
  const prompt = `Analysiere die Übereinstimmung zwischen Kandidat und Stellenbeschreibung und gebe eine strukturierte Bewertung.

Stellenbeschreibung: ${jobDescription}
Lebenslauf: ${cvText || "Nicht angegeben"}
${motivation ? `Motivation: ${motivation}` : ""}
${careerGoals ? `Karriereziele: ${careerGoals}` : ""}

Erstelle eine JSON-Antwort mit folgender Struktur (nur JSON, keine zusätzlichen Erklärungen):
{
  "overallScore": <Zahl zwischen 0-100>,
  "categories": [
    {
      "name": "Fachliche Qualifikation",
      "score": <Zahl zwischen 0-100>,
      "description": "<Kurze Beschreibung>"
    },
    {
      "name": "Berufserfahrung",
      "score": <Zahl zwischen 0-100>,
      "description": "<Kurze Beschreibung>"
    },
    {
      "name": "Kulturelle Passung",
      "score": <Zahl zwischen 0-100>,
      "description": "<Kurze Beschreibung>"
    },
    {
      "name": "Karriereziele",
      "score": <Zahl zwischen 0-100>,
      "description": "<Kurze Beschreibung>"
    }
  ],
  "strengths": ["<Stärke 1>", "<Stärke 2>", "<Stärke 3>", "<Stärke 4>"],
  "improvements": ["<Verbesserung 1>", "<Verbesserung 2>", "<Verbesserung 3>"],
  "interviewTips": ["<Tipp 1>", "<Tipp 2>", "<Tipp 3>", "<Tipp 4>"]
}`;

  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API Fehler: ${response.statusText}`);
    }

    const data: OllamaResponse = await response.json();
    
    // Try to extract JSON from the response
    const jsonMatch = data.response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error("Keine gültige JSON-Antwort von Ollama erhalten");
  } catch (error) {
    console.error("Fehler bei der Matching-Analyse:", error);
    throw new Error("Verbindung zu Ollama fehlgeschlagen. Stellen Sie sicher, dass Ollama läuft und das Modell gemma3:4b verfügbar ist.");
  }
};
