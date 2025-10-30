import { useState } from "react";
import { Hero } from "@/components/Hero";
import { CoverLetterForm } from "@/components/CoverLetterForm";
import { CoverLetterResult } from "@/components/CoverLetterResult";
import { MatchingData } from "@/components/MatchingScore";
import { ProjectDetailsStep, DetectedProject } from "@/components/ProjectDetailsStep";
import { generateCoverLetter, generateMatchingAnalysis } from "@/services/ollamaService";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [matchingData, setMatchingData] = useState<MatchingData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [detectedProjects, setDetectedProjects] = useState<DetectedProject[] | null>(null);
  const [projectDetails, setProjectDetails] = useState<Record<string, string>>({});

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
      // Generate project summary from details
      const projectSummary = Object.entries(projDetails)
        .filter(([_, detail]) => detail.trim())
        .map(([id, detail]) => {
          const project = detectedProjects?.find(p => p.id === id);
          return `Bei ${project?.name} konnte ich: ${detail}`;
        })
        .join(' ');

      // Mock CV text (in a real app, this would come from PDF parsing)
      const cvText = "Erfahrener Softwareentwickler mit mehrjähriger Berufserfahrung in der Entwicklung von Web-Anwendungen. " + 
                     (projectSummary || "");

      toast({
        title: "Generierung gestartet",
        description: "Das Anschreiben wird mit Ollama erstellt...",
      });

      // Generate cover letter with Ollama
      const letter = await generateCoverLetter(
        data.jobTitle || "",
        data.jobDescription,
        cvText,
        data.motivation,
        data.tone,
        data.careerGoals,
        projectSummary
      );

      // Generate matching analysis with Ollama
      const matching = await generateMatchingAnalysis(
        data.jobDescription,
        cvText,
        data.motivation,
        data.careerGoals
      );

      setGeneratedLetter(letter);
      setMatchingData(matching);
      
      toast({
        title: "Erfolgreich generiert!",
        description: "Ihr Anschreiben und die Matching-Analyse sind fertig.",
      });
    } catch (error) {
      console.error("Fehler bei der Generierung:", error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
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
