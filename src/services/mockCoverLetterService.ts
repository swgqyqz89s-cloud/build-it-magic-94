// Mock service for cover letter generation
// This will be replaced with real Ollama backend calls later

export interface GapQuestion {
  id: string;
  question: string;
  context?: string;
  category: string;
}

export interface FormData {
  jobTitle: string;
  jobDescription: string;
  motivation?: string;
  tone: string;
  careerGoals?: string;
  cvFile?: File;
}

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

export const generateGapQuestions = async (formData: FormData): Promise<GapQuestion[]> => {
  // Simulate AI analysis delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock questions based on form data
  return [
    {
      id: "1",
      question: "What specific achievements or results have you accomplished in your last position?",
      context: "Quantifiable achievements make your application more convincing",
      category: "Professional Experience"
    },
    {
      id: "2",
      question: "Why are you specifically interested in this position and company?",
      context: "Show your motivation and research about the company",
      category: "Motivation"
    },
    {
      id: "3",
      question: "What relevant technical skills or certifications do you have?",
      context: "Add specific skills mentioned in the job description",
      category: "Qualifications"
    },
    {
      id: "4",
      question: "Can you provide an example of a complex challenge you've mastered?",
      context: "Concrete examples demonstrate your problem-solving competence",
      category: "Experience"
    }
  ];
};

export const generateCoverLetter = async (
  formData: FormData,
  answers: Record<string, string>,
  gapQuestions: GapQuestion[]
): Promise<string> => {
  // Simulate AI generation delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Generate additional context from answers
  const additionalContext = Object.entries(answers)
    .filter(([_, answer]) => answer.trim())
    .map(([id, answer]) => {
      const question = gapQuestions.find(q => q.id === id);
      return `${question?.category}: ${answer}`;
    })
    .join(' ');

  // Mock generated cover letter
  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${formData.jobTitle || 'position'} role and to submit my application for your consideration.

${formData.motivation ? formData.motivation + '\n\n' : ''}Throughout my career, I have developed a diverse skill set that aligns excellently with the requirements outlined in your job description.${additionalContext ? ' ' + additionalContext : ''} My experience has equipped me to adapt quickly, think critically, and deliver results in fast-paced environments.

This position particularly appeals to me as it offers the opportunity to work on challenging projects that align with my professional goals${formData.careerGoals ? ': ' + formData.careerGoals : ''}. I am excited about the prospect of bringing my unique perspective and expertise to your organization.

I would welcome the opportunity to discuss how my background, skills, and enthusiasm can contribute to your team's success. Thank you for considering my application.

Sincerely,
[Your Name]`;
};

export const generateMatchingAnalysis = async (
  formData: FormData,
  coverLetter: string
): Promise<MatchingData> => {
  // Simulate AI analysis delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock matching data
  return {
    overallScore: 85,
    categories: [
      {
        name: "Professional Qualification",
        score: 88,
        description: "Your skills and experience align excellently with the technical requirements."
      },
      {
        name: "Professional Experience",
        score: 82,
        description: "Your career history shows relevant experience for this position."
      },
      {
        name: "Cultural Fit",
        score: 90,
        description: "Your values and work style fit very well with the company culture."
      },
      {
        name: "Career Goals",
        score: 78,
        description: "This position supports your long-term career plans well."
      }
    ],
    strengths: [
      "Comprehensive experience in the required core competencies",
      "Proven successes in similar projects",
      "Strong communication skills and team orientation",
      "Motivation and enthusiasm for the position are clearly evident"
    ],
    improvements: [
      "Deepen your knowledge in specific niche technologies mentioned in the job description",
      "Prepare concrete examples of your leadership experience",
      "Research current company projects in detail"
    ],
    interviewTips: [
      "Prepare 2-3 concrete examples of how you've mastered similar challenges",
      "Demonstrate your knowledge about the company and its products/services",
      "Clearly articulate how you would add value in the first 90 days",
      "Prepare intelligent questions that demonstrate your interest and expertise"
    ]
  };
};
