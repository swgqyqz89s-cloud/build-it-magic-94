import { useState } from "react";
import { Hero } from "@/components/Hero";
import { CoverLetterForm } from "@/components/CoverLetterForm";
import { CoverLetterResult } from "@/components/CoverLetterResult";
import { MatchingData } from "@/components/MatchingScore";
import { ProjectDetailsStep, GapQuestion } from "@/components/ProjectDetailsStep";
import { generateGapQuestions, generateCoverLetter, generateMatchingAnalysis } from "@/lib/ollama";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [matchingData, setMatchingData] = useState<MatchingData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [gapQuestions, setGapQuestions] = useState<GapQuestion[] | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleFormSubmit = async (data: any) => {
    setIsGenerating(true);
    setFormData(data);
    
    try {
      toast({
        title: "Analyzing job description...",
        description: "This may take a moment. Make sure Ollama is running.",
      });

      const questions = await generateGapQuestions(data.jobDescription);
      setGapQuestions(questions);
    } catch (error) {
      console.error("Error generating gap questions:", error);
      toast({
        title: "Error",
        description: "Failed to connect to Ollama. Make sure it's running on localhost:11434",
        variant: "destructive",
      });
      
      // Fallback to mock questions if Ollama fails
      const mockQuestions: GapQuestion[] = [
        {
          id: "1",
          question: "What specific achievements or results have you accomplished in your last position?",
          context: "Quantifiable achievements make your application more compelling",
          category: "Work Experience"
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
        }
      ];
      setGapQuestions(mockQuestions);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuestionsContinue = async (answers: Record<string, string>) => {
    setQuestionAnswers(answers);
    await handleGenerate(formData, answers);
  };

  const handleGenerate = async (data: any, answers: Record<string, string> = {}) => {
    setIsGenerating(true);
    setGeneratedLetter(null);
    setMatchingData(null);
    
    try {
      toast({
        title: "Generating cover letter...",
        description: "Our AI is crafting your personalized cover letter.",
      });

      // Generate cover letter using Ollama
      const letter = await generateCoverLetter(
        data.jobTitle || "the position",
        data.jobDescription,
        data.motivation,
        data.careerGoals,
        answers
      );
      
      setGeneratedLetter(letter);

      toast({
        title: "Analyzing match...",
        description: "Calculating your fit for this position.",
      });

      // Generate matching analysis using Ollama
      const matching = await generateMatchingAnalysis(
        data.jobDescription,
        letter
      );
      
      setMatchingData(matching);

      toast({
        title: "Complete!",
        description: "Your cover letter and analysis are ready.",
      });
    } catch (error) {
      console.error("Error generating cover letter:", error);
      toast({
        title: "Error",
        description: "Failed to generate cover letter. Check if Ollama is running.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
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
