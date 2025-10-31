import { useState } from "react";
import { Hero } from "@/components/Hero";
import { CoverLetterForm } from "@/components/CoverLetterForm";
import { CoverLetterResult } from "@/components/CoverLetterResult";
import { MatchingData } from "@/components/MatchingScore";
import { ProjectDetailsStep, GapQuestion } from "@/components/ProjectDetailsStep";

const Index = () => {
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [matchingData, setMatchingData] = useState<MatchingData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [gapQuestions, setGapQuestions] = useState<GapQuestion[] | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});

  const handleFormSubmit = async (data: any) => {
    // Simulate AI analysis to identify gaps and generate questions
    const mockQuestions: GapQuestion[] = [
      {
        id: "1",
        question: "What specific achievements or results have you accomplished in your last position?",
        context: "Quantifiable achievements make your application more convincing",
        category: "Professional Experience"
      },
      {
        id: "2",
        question: "Why are you specifically interested in this position and our company?",
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
    
    setFormData(data);
    setGapQuestions(mockQuestions);
  };

  const handleQuestionsContinue = async (answers: Record<string, string>) => {
    setQuestionAnswers(answers);
    await handleGenerate(formData, answers);
  };

  const handleGenerate = async (data: any, answers: Record<string, string> = {}) => {
    setIsGenerating(true);
    setGeneratedLetter(null);
    setMatchingData(null);
    
    // Simulate AI generation with delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate additional context from answers
    const additionalContext = Object.entries(answers)
      .filter(([_, answer]) => answer.trim())
      .map(([id, answer]) => {
        const question = gapQuestions?.find(q => q.id === id);
        return `${question?.category}: ${answer}`;
      })
      .join(' ');

    // Mock generated cover letter
    const mockLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${data.jobTitle || 'position'} role and to submit my application for your consideration.

${data.motivation ? data.motivation + '\n\n' : ''}Throughout my career, I have developed a diverse skill set that aligns excellently with the requirements outlined in your job description.${additionalContext ? ' ' + additionalContext : ''} My experience has equipped me to adapt quickly, think critically, and deliver results in fast-paced environments.

This position particularly appeals to me as it offers the opportunity to work on challenging projects that align with my professional goals${data.careerGoals ? ': ' + data.careerGoals : ''}. I am excited about the prospect of bringing my unique perspective and expertise to your organization.

I would welcome the opportunity to discuss how my background, skills, and enthusiasm can contribute to your team's success. Thank you for considering my application.

Sincerely,
[Your Name]`;
    
    // Mock matching data
    const mockMatchingData: MatchingData = {
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
    
    setGeneratedLetter(mockLetter);
    setMatchingData(mockMatchingData);
    setIsGenerating(false);
  };

  const handleReset = () => {
    setGeneratedLetter(null);
    setMatchingData(null);
    setGapQuestions(null);
    setFormData(null);
    setQuestionAnswers({});
  };

  const handleBackToForm = () => {
    setGapQuestions(null);
    setFormData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      {!generatedLetter || !matchingData ? (
        !gapQuestions ? (
          <CoverLetterForm onGenerate={handleFormSubmit} isGenerating={isGenerating} />
        ) : (
          <ProjectDetailsStep 
            gapQuestions={gapQuestions}
            onContinue={handleQuestionsContinue}
            onBack={handleBackToForm}
          />
        )
      ) : (
        <CoverLetterResult 
          letter={generatedLetter} 
          matchingData={matchingData}
          onReset={handleReset} 
        />
      )}
    </div>
  );
};

export default Index;
