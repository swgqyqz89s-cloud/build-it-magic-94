// Real service for cover letter generation using local Ollama + Llama 3
// This replaces the earlier mock implementation.

export interface GapQuestion {
  id: string;
  question: string;
  context?: string;
  category: string;
}

export interface FormData {
  jobTitle?: string;
  jobDescription?: string;
  jobDescriptionUrl?: string;
  motivation?: string;
  tone: string;
  careerGoals?: string;
  cvText?: string;
}

// Shape, das vom MatchingScore-Component erwartet wird
export interface CategoryScore {
  name: string;
  score: number;
  description: string;
}

export interface MatchingData {
  overallScore: number;
  categories: CategoryScore[];
  strengths: string[];
  improvements: string[];
  interviewTips: string[];
}

const MODEL_NAME = "llama3";

// -----------------------------
// Hilfsfunktionen
// -----------------------------

// Aufruf an Ollama (/ollama/api/chat -> via Vite-Proxy an http://localhost:11434/api/chat)
async function callOllama(prompt: string): Promise<string> {

  // 🔥 FULL PROMPT LOGGING (TERMINAL)
  console.log("====================================================");
  console.log("📤 FULL PROMPT SENT TO OLLAMA");
  console.log("====================================================");
  console.log(prompt);
  console.log("====================================================\n");

  // 🔥 Optional: Zusätzlich Datei-Logging aktivieren
  try {
    await import("./prompt-logger").then(mod => mod.logPrompt(prompt));
  } catch (err) {
    console.warn("Prompt-Logger konnte nicht geladen werden:", err);
  }

  const response = await fetch("/ollama/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL_NAME,
      stream: false,
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Ollama request failed: ${response.status} ${response.statusText} ${text}`,
    );
  }

  const data = await response.json();
  const content: string = data?.message?.content ?? "";
  if (!content) {
    throw new Error("Ollama returned an empty response.");
  }
  return content;
}

// Extrahiert das erste JSON-Objekt aus einem String
function extractJson<T>(text: string): T {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new Error("Could not find JSON object in Ollama response.");
  }

  const jsonText = text.slice(first, last + 1);
  try {
    return JSON.parse(jsonText) as T;
  } catch (err) {
    console.error("Failed to parse JSON from:", jsonText);
    throw new Error("Failed to parse JSON from Ollama response.");
  }
}

// -----------------------------
// Prompt für Schritt 1 (Fragen generieren)
// -----------------------------
function buildGapQuestionPrompt(formData: FormData): string {
  const jobTitle = formData.jobTitle?.trim() || "";
  const jobDescription = formData.jobDescription?.trim() || "";
  const jobDescriptionUrl = formData.jobDescriptionUrl || "";
  const motivation = formData.motivation || "";
  const careerGoals = formData.careerGoals || "";
  const tone = formData.tone || "professional";
  const cvText = formData.cvText?.trim() || "Not provided.";

  const jobDescriptionSection = jobDescription?.trim()
    ? jobDescription
    : jobDescriptionUrl
      ? `Provided via URL: ${jobDescriptionUrl}`
      : "Not provided.";

  return `
You are an AI career assistant specialized in writing personalized, job-specific cover letters. 

Your current task is NOT to write a cover letter, but to prepare for it: you must generate 3–6 smart, open-ended questions that help gather any missing or deeper information from the applicant. 

These questions will be used in the next step to create a highly personalized, convincing cover letter that matches the applicant’s background with the job posting. 

GOAL: Generate thoughtful, relevant questions that help uncover: 
- quantifiable achievements and results, 
- specific experiences or projects that demonstrate role fit, 
- motivations and values behind the job choice, 
- tone and personality the letter should express, 
- career aspirations and cultural fit. 

You are NOT improving the CV. You are collecting the most useful context for a powerful cover letter. 

RULES: 
- Ask only open-ended questions (no yes/no). 
- Avoid asking about information that’s already provided. 
- Keep wording natural, professional, and human. 
- Match the language and tone of the job description. 
- Use the chosen “Tone Preference” to guide your style. 
- Always return exactly 3 to 6 questions. 
- Output must be valid JSON. 

OUTPUT FORMAT: Return only JSON in this structure: 

{ "questions": [ { "id": 1, "category": "Achievements", "question": "What specific results or projects are you most proud of that would show your ability to succeed in this role?", "hint": "Share concrete examples, such as measurable improvements, successful collaborations, or creative solutions." } ] } 

Valid categories: 
- "Achievements" 
- "Professional Experience" 
- "Motivation & Fit" 
- "Career Goals" 
- "Tone & Style" 

Here is the user input from the “Create Cover Letter” form. 

CV (text extracted from PDF):
"""
${cvText}
"""

Job Title (optional):
${jobTitle}

Job Description (required):
"""
${jobDescriptionSection}
"""

Job Posting URL (optional):
${jobDescriptionUrl}

Personal Motivation (optional): 
""" 
${motivation} 
""" 

Career Goals (optional): 
""" 
${careerGoals} 
""" 

Tone Preference: 
${tone} 

  

TASK: 

1. Analyze the job description and CV to understand the type of role, skills, and expectations. 
2. Identify what is missing or too general for writing a strong cover letter. 
3. Generate 3–6 open-ended questions that help reveal: 
   - the candidate’s most relevant achievements, 
   - their true motivation and connection to the role or company, 
   - personal tone and communication style, 
   - future goals or alignment with company mission. 
4. Categorize each question according to its main purpose. 

  

Output only valid JSON in the defined format. No extra text or explanations. 
`.trim();
}

// -----------------------------
// Prompt für Schritt 2 (Cover Letter + Matching)
// -----------------------------
function buildCoverLetterPrompt(
  formData: FormData,
  qaBlock: { id: string; question: string; answer: string }[],
): string {
  const jobTitle = formData.jobTitle?.trim() || "";
  const jobDescription = formData.jobDescription?.trim() || "";
  const jobDescriptionUrl = formData.jobDescriptionUrl || "";
  const motivation = formData.motivation || "";
  const careerGoals = formData.careerGoals || "";
  const tone = formData.tone || "professional";
  const cvText = formData.cvText?.trim() || "Not provided.";
  const jobDescriptionSection = jobDescription?.trim()
    ? jobDescription
    : jobDescriptionUrl
      ? `Provided via URL: ${jobDescriptionUrl}`
      : "Not provided.";

  const qaJson = JSON.stringify(qaBlock, null, 2);

  return `
You are an expert AI career assistant specialized in creating highly personalized, job-specific cover letters and evaluating how well a candidate matches a given job. 

In this step you must do TWO things, based on all inputs provided: 

Generate a strong, well-structured cover letter. 
Compute a matching score and a short analysis of how well the candidate fits the job. 

You will receive: 

The candidate's CV text. 
The job title and job description. 
Optional personal motivation and career goals. 
A set of custom questions together with the candidate's answers. 
A tone preference. 

Your goals: 

A) COVER LETTER 

Use ALL relevant information: CV, job description, motivation, career goals, and especially the answers to the custom questions. 
The cover letter must feel specific to: 
this company, 
this role, 
this candidate. 
Mirror important requirements, keywords, and language from the job description. 
Highlight concrete achievements, results, and examples that come from: 
the CV, and 
the Q&A answers. 
Adapt tone to the given tone preference (e.g. "Professional", "Friendly", "Confident"). 
Write in the same primary language as the job description (if the job ad is mainly in German, write German; if mainly English, write English). 

B) MATCHING SCORE & ANALYSIS Based on ALL inputs, evaluate how well the candidate fits the job. 

You must output: 

An overall matching score from 0–100 (integer). 
A matching label: 
0–49: "Weak Match" 
50–69: "Moderate Match" 
70–84: "Good Match" 
85–100: "Excellent Match" 
Four dimension scores (0–100 each) with one-sentence explanations: 
"Professional Qualification" (skills & technical fit) 
"Professional Experience" (relevant background & track record) 
"Cultural Fit" (values, work style, motivation vs. company) 
"Career Goals" (alignment of long-term goals with the role) 
A short list of: 
3–5 strengths (bullet-style sentences) 
3–5 areas for improvement (bullet-style sentences) 

IMPORTANT: 

Be fair and realistic, but not discouraging. 
Use the custom question answers as strong evidence for both the cover letter and the scores. 

OUTPUT FORMAT: You MUST respond with a single JSON object in this structure: 

{ "cover_letter": "string", "matching": { "overall_score": 0, "overall_label": "Excellent Match", "dimensions": [ { "name": "Professional Qualification", "score": 0, "comment": "string" }, { "name": "Professional Experience", "score": 0, "comment": "string" }, { "name": "Cultural Fit", "score": 0, "comment": "string" }, { "name": "Career Goals", "score": 0, "comment": "string" } ], "strengths": [ "string" ], "areas_for_improvement": [ "string" ] } } 

Do NOT output anything outside this JSON. 

Here is all information collected from the user to generate a tailored cover letter 

and a matching score. 

  

CV TEXT:

""" 

${cvText}

""" 

  

JOB TITLE (optional): 

${jobTitle} 

  

JOB DESCRIPTION (required): 

""" 

${jobDescription} 

""" 

JOB DESCRIPTION (required):

"""

${jobDescriptionSection}

"""

JOB POSTING URL (optional):

${jobDescriptionUrl}

PERSONAL MOTIVATION (optional): 

""" 

${motivation} 

""" 

  

CAREER GOALS (optional): 

""" 

${careerGoals} 

""" 

  

TONE PREFERENCE: 

${tone} 

  

CUSTOM QUESTIONS AND ANSWERS: 

${qaJson} 

  

TASK: 

Using EVERYTHING above, please: 

1) Write a complete, polished cover letter that is specific to this role and company. 

2) Calculate the matching score and detailed analysis as defined in the system instructions. 

  

Return ONLY the JSON object in the specified format. 
`.trim();
}

// -----------------------------
// State: letztes Matching-Result merken
// -----------------------------
let lastMatchingData: MatchingData | null = null;

// -----------------------------
// STEP 1 – Gap Questions von Ollama holen
// -----------------------------
export const generateGapQuestions = async (
  formData: FormData,
): Promise<GapQuestion[]> => {
  const prompt = buildGapQuestionPrompt(formData);
  const raw = await callOllama(prompt);

  type GapResponse = {
    questions: {
      id?: number | string;
      category: string;
      question: string;
      hint?: string;
    }[];
  };

  const parsed = extractJson<GapResponse>(raw);

  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error("Ollama did not return a valid questions array.");
  }

  return parsed.questions.slice(0, 6).map((q, index) => ({
    id: String(q.id ?? index + 1),
    question: q.question,
    context: q.hint,
    category: q.category || "Motivation & Fit",
  }));
};

// -----------------------------
// STEP 2 – Cover Letter + Matching von Ollama holen
// -----------------------------
export const generateCoverLetter = async (
  formData: FormData,
  answers: Record<string, string>,
  gapQuestions: GapQuestion[],
): Promise<string> => {
  const qaBlock = gapQuestions.map((q) => ({
    id: q.id,
    question: q.question,
    answer: answers[q.id] || "",
  }));

  const prompt = buildCoverLetterPrompt(formData, qaBlock);
  const raw = await callOllama(prompt);

  type MatchingResponse = {
    cover_letter: string;
    matching: {
      overall_score: number;
      overall_label: string;
      dimensions: { name: string; score: number; comment: string }[];
      strengths: string[];
      areas_for_improvement: string[];
    };
  };

  const parsed = extractJson<MatchingResponse>(raw);
  const m = parsed.matching;

  // Mapping auf dein UI-MatchingData
  lastMatchingData = {
    overallScore: m.overall_score,
    categories: (m.dimensions || []).map((d) => ({
      name: d.name,
      score: d.score,
      description: d.comment,
    })),
    strengths: m.strengths || [],
    improvements: m.areas_for_improvement || [],
    interviewTips: [
      `Overall evaluation: ${m.overall_label}.`,
      ...(m.dimensions || []).slice(0, 3).map((d) => d.comment),
    ].filter(Boolean),
  };

  return parsed.cover_letter;
};

// STEP 2b – Matching aus dem gespeicherten Ergebnis liefern
export const generateMatchingAnalysis = async (
  _formData: FormData,
  _coverLetter: string,
): Promise<MatchingData> => {
  if (lastMatchingData) {
    return lastMatchingData;
  }

  // Fallback, falls irgendwas schiefging
  return {
    overallScore: 50,
    categories: [
      {
        name: "Professional Qualification",
        score: 50,
        description: "Baseline evaluation – detailed AI analysis not available.",
      },
      {
        name: "Professional Experience",
        score: 50,
        description: "Baseline evaluation – detailed AI analysis not available.",
      },
      {
        name: "Cultural Fit",
        score: 50,
        description: "Baseline evaluation – detailed AI analysis not available.",
      },
      {
        name: "Career Goals",
        score: 50,
        description: "Baseline evaluation – detailed AI analysis not available.",
      },
    ],
    strengths: [
      "AI analysis not available – provide more details for a better evaluation.",
    ],
    improvements: [
      "AI analysis not available – clarify your goals and experience.",
    ],
    interviewTips: [
      "Prepare clear examples of your achievements and how they relate to this role.",
      "Explain why this company and role are a strong fit for your long-term goals.",
    ],
  };
};
