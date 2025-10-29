import { useState } from "react";
import { Hero } from "@/components/Hero";
import { CoverLetterForm } from "@/components/CoverLetterForm";
import { CoverLetterResult } from "@/components/CoverLetterResult";
import { MatchingData } from "@/components/MatchingScore";
import { ProjectDetailsStep, DetectedProject } from "@/components/ProjectDetailsStep";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [matchingData, setMatchingData] = useState<MatchingData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [detectedProjects, setDetectedProjects] = useState<DetectedProject[] | null>(null);
  const [projectDetails, setProjectDetails] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleFormSubmit = async (data: any) => {
    // Simulate CV analysis to detect projects
    const mockProjects: DetectedProject[] = [
      {
        id: "1",
        name: "E-Commerce Platform Entwicklung",
        description: "Erwähnt im CV unter Berufserfahrung 2022-2023"
      },
      {
        id: "2",
        name: "Mobile App für Kundenservice",
        description: "Erwähnt im CV unter Projekten"
      },
      {
        id: "3",
        name: "Datenbank-Migration",
        description: "Erwähnt im CV unter Technische Projekte"
      }
    ];
    
    setFormData(data);
    setDetectedProjects(mockProjects);
  };

  const handleProjectDetailsContinue = async (details: Record<string, string>) => {
    setProjectDetails(details);
    await handleGenerate(formData, details);
  };

  const handleGenerate = async (data: any, projDetails: Record<string, string> = {}) => {
    setIsGenerating(true);
    setGeneratedLetter(null);
    setMatchingData(null);
    
    try {
      // Call the AI edge function
      const { data: result, error } = await supabase.functions.invoke('generate-cover-letter', {
        body: {
          cvText: data.cvText || '',
          jobTitle: data.jobTitle || '',
          jobDescription: data.jobDescription,
          motivation: data.motivation || '',
          tone: data.tone || 'professional',
          careerGoals: data.careerGoals || '',
          projectDetails: projDetails
        }
      });

      if (error) {
        console.error('Error generating cover letter:', error);
        toast({
          title: "Fehler",
          description: "Es gab einen Fehler beim Generieren des Anschreibens. Bitte versuchen Sie es erneut.",
          variant: "destructive"
        });
        return;
      }

      if (result && result.letter && result.matching) {
        setGeneratedLetter(result.letter);
        setMatchingData(result.matching);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: "Fehler",
        description: "Es gab einen Fehler beim Generieren des Anschreibens. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setGeneratedLetter(null);
    setMatchingData(null);
    setDetectedProjects(null);
    setFormData(null);
    setProjectDetails({});
  };

  const handleBackToForm = () => {
    setDetectedProjects(null);
    setFormData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      {!generatedLetter || !matchingData ? (
        !detectedProjects ? (
          <CoverLetterForm onGenerate={handleFormSubmit} isGenerating={isGenerating} />
        ) : (
          <ProjectDetailsStep 
            detectedProjects={detectedProjects}
            onContinue={handleProjectDetailsContinue}
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
