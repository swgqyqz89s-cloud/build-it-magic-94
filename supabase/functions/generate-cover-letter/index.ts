import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      cvText, 
      jobTitle, 
      jobDescription, 
      motivation, 
      tone, 
      careerGoals,
      projectDetails 
    } = await req.json();

    console.log('Generating cover letter with:', { jobTitle, tone, hasProjects: !!projectDetails });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build project summary if available
    let projectSummary = '';
    if (projectDetails && Object.keys(projectDetails).length > 0) {
      const projectEntries = Object.entries(projectDetails)
        .filter(([_, detail]: [string, any]) => detail?.trim())
        .map(([_, detail]: [string, any]) => detail);
      
      if (projectEntries.length > 0) {
        projectSummary = `\n\nRelevante Projekterfahrungen:\n${projectEntries.join('\n')}`;
      }
    }

    // Tone mapping
    const toneInstructions: Record<string, string> = {
      professional: 'Verwenden Sie einen professionellen und sachlichen Ton.',
      enthusiastic: 'Verwenden Sie einen enthusiastischen und energiegeladenen Ton.',
      formal: 'Verwenden Sie einen sehr förmlichen und traditionellen Ton.',
      creative: 'Verwenden Sie einen kreativen und einzigartigen Ton.'
    };

    const toneInstruction = toneInstructions[tone] || toneInstructions.professional;

    // Generate cover letter
    const coverLetterPrompt = `Du bist ein Experte für das Schreiben von Bewerbungsschreiben. Erstelle ein personalisiertes, professionelles deutsches Bewerbungsschreiben basierend auf den folgenden Informationen:

Stellenbezeichnung: ${jobTitle || 'Position'}

Stellenbeschreibung:
${jobDescription}

${cvText ? `Lebenslauf des Bewerbers:\n${cvText}` : ''}

${motivation ? `Persönliche Motivation des Bewerbers:\n${motivation}` : ''}

${careerGoals ? `Karriereziele des Bewerbers:\n${careerGoals}` : ''}

${projectSummary}

Anweisungen:
1. ${toneInstruction}
2. Erstelle ein vollständiges Bewerbungsschreiben mit Anrede, mehreren Absätzen und Schluss.
3. Hebe relevante Erfahrungen und Fähigkeiten aus dem CV hervor, die zur Stellenbeschreibung passen.
4. Verwende konkrete Beispiele aus den Projekten, falls verfügbar.
5. Spiegele die Terminologie aus der Stellenbeschreibung wider.
6. Zeige echte Begeisterung und Eignung für die Position.
7. Halte das Schreiben auf 3-4 Absätze konzentriert.
8. Verwende "Sehr geehrte Damen und Herren" als Anrede und "Mit freundlichen Grüßen" als Schluss.

Gib NUR das Bewerbungsschreiben zurück, ohne zusätzliche Kommentare oder Erklärungen.`;

    console.log('Calling AI for cover letter generation...');
    
    const coverLetterResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: coverLetterPrompt }
        ],
      }),
    });

    if (!coverLetterResponse.ok) {
      const errorText = await coverLetterResponse.text();
      console.error('AI API error:', coverLetterResponse.status, errorText);
      throw new Error(`AI API error: ${coverLetterResponse.status}`);
    }

    const coverLetterData = await coverLetterResponse.json();
    const generatedLetter = coverLetterData.choices[0].message.content;

    console.log('Cover letter generated, now generating matching analysis...');

    // Generate matching analysis
    const matchingPrompt = `Du bist ein Karriereberater. Analysiere die Übereinstimmung zwischen dem Bewerber und der Stelle basierend auf:

Stellenbeschreibung:
${jobDescription}

${cvText ? `Lebenslauf:\n${cvText}` : ''}

${projectSummary}

Erstelle eine detaillierte Matching-Analyse im folgenden JSON-Format:

{
  "overallScore": [Zahl zwischen 0-100],
  "categories": [
    {
      "name": "Fachliche Qualifikation",
      "score": [Zahl zwischen 0-100],
      "description": "[Kurze Beschreibung der Übereinstimmung]"
    },
    {
      "name": "Berufserfahrung",
      "score": [Zahl zwischen 0-100],
      "description": "[Kurze Beschreibung]"
    },
    {
      "name": "Kulturelle Passung",
      "score": [Zahl zwischen 0-100],
      "description": "[Kurze Beschreibung]"
    },
    {
      "name": "Karriereziele",
      "score": [Zahl zwischen 0-100],
      "description": "[Kurze Beschreibung]"
    }
  ],
  "strengths": [
    "[Stärke 1]",
    "[Stärke 2]",
    "[Stärke 3]",
    "[Stärke 4]"
  ],
  "improvements": [
    "[Verbesserungsvorschlag 1]",
    "[Verbesserungsvorschlag 2]",
    "[Verbesserungsvorschlag 3]"
  ],
  "interviewTips": [
    "[Interview-Tipp 1]",
    "[Interview-Tipp 2]",
    "[Interview-Tipp 3]",
    "[Interview-Tipp 4]"
  ]
}

Gib NUR das JSON-Objekt zurück, ohne zusätzlichen Text oder Markdown-Formatierung.`;

    const matchingResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: matchingPrompt }
        ],
      }),
    });

    if (!matchingResponse.ok) {
      const errorText = await matchingResponse.text();
      console.error('Matching AI API error:', matchingResponse.status, errorText);
      throw new Error(`Matching AI API error: ${matchingResponse.status}`);
    }

    const matchingData = await matchingResponse.json();
    let matchingAnalysis = matchingData.choices[0].message.content;

    // Clean up JSON response (remove markdown code blocks if present)
    matchingAnalysis = matchingAnalysis.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const matchingJson = JSON.parse(matchingAnalysis);

    console.log('Successfully generated cover letter and matching analysis');

    return new Response(
      JSON.stringify({ 
        letter: generatedLetter,
        matching: matchingJson
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-cover-letter function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
