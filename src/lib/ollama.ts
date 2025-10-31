const OLLAMA_BASE_URL = "http://localhost:11434";

export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export async function chatWithOllama(
  messages: OllamaMessage[],
  model: string = "llama3"
): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data: OllamaResponse = await response.json();
    return data.message.content;
  } catch (error) {
    console.error("Error communicating with Ollama:", error);
    throw new Error(
      "Failed to connect to Ollama. Make sure Ollama is running on localhost:11434"
    );
  }
}

export async function generateGapQuestions(
  jobDescription: string,
  cvContent?: string
): Promise<any[]> {
  const systemPrompt = `You are an expert career advisor. Analyze the job description and identify 3-4 important questions to ask the candidate to fill gaps in their application. Return ONLY a valid JSON array of objects with this structure:
[
  {
    "id": "1",
    "question": "Question text here",
    "context": "Why this question is important",
    "category": "Category name"
  }
]`;

  const userPrompt = `Job Description: ${jobDescription}\n\n${cvContent ? `CV Content: ${cvContent}` : ""}`;

  const messages: OllamaMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const response = await chatWithOllama(messages);
  
  // Extract JSON from response
  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  throw new Error("Failed to parse gap questions from AI response");
}

export async function generateCoverLetter(
  jobTitle: string,
  jobDescription: string,
  motivation?: string,
  careerGoals?: string,
  answers?: Record<string, string>
): Promise<string> {
  const systemPrompt = `You are an expert cover letter writer. Create a professional, compelling cover letter based on the provided information. The letter should be personalized, well-structured, and highlight the candidate's fit for the position.`;

  let userPrompt = `Create a cover letter for the following position:

Job Title: ${jobTitle}
Job Description: ${jobDescription}`;

  if (motivation) {
    userPrompt += `\n\nCandidate's Motivation: ${motivation}`;
  }

  if (careerGoals) {
    userPrompt += `\n\nCareer Goals: ${careerGoals}`;
  }

  if (answers && Object.keys(answers).length > 0) {
    userPrompt += `\n\nAdditional Information:\n${Object.values(answers).filter(a => a.trim()).join('\n')}`;
  }

  const messages: OllamaMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  return await chatWithOllama(messages);
}

export async function generateMatchingAnalysis(
  jobDescription: string,
  coverLetter: string
): Promise<any> {
  const systemPrompt = `You are an expert career analyst. Analyze how well a candidate matches a job based on their cover letter. Return ONLY a valid JSON object with this exact structure:
{
  "overallScore": 85,
  "categories": [
    {
      "name": "Technical Skills",
      "score": 88,
      "description": "Description here"
    }
  ],
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement 1", "Improvement 2"],
  "interviewTips": ["Tip 1", "Tip 2"]
}`;

  const userPrompt = `Job Description: ${jobDescription}\n\nCover Letter: ${coverLetter}`;

  const messages: OllamaMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const response = await chatWithOllama(messages);
  
  // Extract JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  throw new Error("Failed to parse matching analysis from AI response");
}
