import { useState } from "react";
import { Hero } from "@/components/Hero";
import { ProcessStepper } from "@/components/ProcessStepper";
import { CoverLetterForm } from "@/components/CoverLetterForm";
import { CoverLetterResult } from "@/components/CoverLetterResult";
import { MatchingData } from "@/components/MatchingScore";
import { ProjectDetailsStep, GapQuestion } from "@/components/ProjectDetailsStep";
import { 
  generateGapQuestions, 
  generateCoverLetter, 
  generateMatchingAnalysis,
  FormData as ServiceFormData
} from "@/services/mockCoverLetterService";

const Index = () => {
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [matchingData, setMatchingData] = useState<MatchingData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [gapQuestions, setGapQuestions] = useState<GapQuestion[] | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});

  const handleFormSubmit = async (data: any) => {
    setIsGenerating(true);
    try {
      // Generate gap questions using mock service
      const questions = await generateGapQuestions(data);
      setFormData(data);
      setGapQuestions(questions);
    } catch (error) {
      console.error("Error generating questions:", error);
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
      // Generate cover letter using mock service
      const letter = await generateCoverLetter(data, answers, gapQuestions || []);
      setGeneratedLetter(letter);
      
      // Generate matching analysis using mock service
      const matching = await generateMatchingAnalysis(data, letter);
      setMatchingData(matching);
    } catch (error) {
      console.error("Error generating cover letter:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getCurrentStep = () => {
    if (generatedLetter && matchingData) return 3;
    if (gapQuestions) return 2;
    return 1;
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
      <ProcessStepper currentStep={getCurrentStep()} />
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
