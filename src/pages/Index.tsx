import { useState } from "react";
import { Hero } from "@/components/Hero";
import { CoverLetterForm } from "@/components/CoverLetterForm";
import { CoverLetterResult } from "@/components/CoverLetterResult";

const Index = () => {
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (data: any) => {
    setIsGenerating(true);
    setGeneratedLetter(null);
    
    // Simulate AI generation with delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock generated cover letter
    const mockLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${data.jobTitle || 'position'} at your esteemed organization. With my background and experience, I am confident that I can make a valuable contribution to your team.

${data.motivation ? data.motivation + '\n\n' : ''}Throughout my career, I have developed a diverse skill set that aligns perfectly with the requirements outlined in your job description. My experience has equipped me with the ability to adapt quickly, think critically, and deliver results in fast-paced environments.

I am particularly drawn to this opportunity because it offers the chance to work on challenging projects that align with my professional goals${data.careerGoals ? ': ' + data.careerGoals : ''}. I am excited about the prospect of bringing my unique perspective and expertise to your organization.

I would welcome the opportunity to discuss how my background, skills, and enthusiasm can contribute to your team's success. Thank you for considering my application.

Sincerely,
[Your Name]`;
    
    setGeneratedLetter(mockLetter);
    setIsGenerating(false);
  };

  const handleReset = () => {
    setGeneratedLetter(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      {!generatedLetter ? (
        <CoverLetterForm onGenerate={handleGenerate} isGenerating={isGenerating} />
      ) : (
        <CoverLetterResult letter={generatedLetter} onReset={handleReset} />
      )}
    </div>
  );
};

export default Index;
