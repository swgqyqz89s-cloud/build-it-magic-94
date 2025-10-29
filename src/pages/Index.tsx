import { useState } from "react";
import { Hero } from "@/components/Hero";
import { CoverLetterForm } from "@/components/CoverLetterForm";
import { CoverLetterResult } from "@/components/CoverLetterResult";
import { MatchingData } from "@/components/MatchingScore";
import { ProjectDetailsStep, DetectedProject } from "@/components/ProjectDetailsStep";

const Index = () => {
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
    
    // Simulate AI generation with delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate project summary from details
    const projectSummary = Object.entries(projDetails)
      .filter(([_, detail]) => detail.trim())
      .map(([id, detail]) => {
        const project = detectedProjects?.find(p => p.id === id);
        return `Bei ${project?.name} konnte ich: ${detail}`;
      })
      .join(' ');

    // Mock generated cover letter
    const mockLetter = `Sehr geehrte Damen und Herren,

mit großem Interesse habe ich Ihre Stellenausschreibung für die Position als ${data.jobTitle || 'position'} gelesen und möchte mich hiermit bei Ihnen bewerben.

${data.motivation ? data.motivation + '\n\n' : ''}Im Laufe meiner Karriere habe ich ein vielfältiges Kompetenzprofil entwickelt, das hervorragend zu den in Ihrer Stellenbeschreibung genannten Anforderungen passt.${projectSummary ? ' ' + projectSummary : ''} Meine Erfahrung hat mich befähigt, mich schnell anzupassen, kritisch zu denken und in schnelllebigen Umgebungen Ergebnisse zu liefern.

Diese Position spricht mich besonders an, da sie die Möglichkeit bietet, an anspruchsvollen Projekten zu arbeiten, die mit meinen beruflichen Zielen übereinstimmen${data.careerGoals ? ': ' + data.careerGoals : ''}. Ich freue mich darauf, meine einzigartige Perspektive und Expertise in Ihr Unternehmen einzubringen.

Gerne würde ich in einem persönlichen Gespräch erläutern, wie mein Hintergrund, meine Fähigkeiten und meine Begeisterung zum Erfolg Ihres Teams beitragen können. Vielen Dank für die Berücksichtigung meiner Bewerbung.

Mit freundlichen Grüßen,
[Ihr Name]`;
    
    // Mock matching data
    const mockMatchingData: MatchingData = {
      overallScore: 85,
      categories: [
        {
          name: "Fachliche Qualifikation",
          score: 88,
          description: "Ihre Skills und Erfahrungen passen hervorragend zu den technischen Anforderungen."
        },
        {
          name: "Berufserfahrung",
          score: 82,
          description: "Ihre bisherige Karriere zeigt relevante Erfahrungen für diese Position."
        },
        {
          name: "Kulturelle Passung",
          score: 90,
          description: "Ihre Werte und Arbeitsweise passen sehr gut zur Unternehmenskultur."
        },
        {
          name: "Karriereziele",
          score: 78,
          description: "Die Position unterstützt Ihre langfristigen Karrierepläne gut."
        }
      ],
      strengths: [
        "Umfassende Erfahrung in den geforderten Hauptkompetenzen",
        "Nachweisbare Erfolge in ähnlichen Projekten",
        "Starke Kommunikationsfähigkeiten und Teamorientierung",
        "Motivation und Begeisterung für die Position sind deutlich erkennbar"
      ],
      improvements: [
        "Vertiefen Sie Ihr Wissen in spezifischen Nischentechnologien, die in der Stellenbeschreibung erwähnt wurden",
        "Bereiten Sie konkrete Beispiele für Ihre Führungserfahrung vor",
        "Informieren Sie sich detailliert über aktuelle Projekte des Unternehmens"
      ],
      interviewTips: [
        "Bereiten Sie 2-3 konkrete Beispiele vor, wie Sie ähnliche Herausforderungen gemeistert haben",
        "Zeigen Sie Ihre Kenntnisse über das Unternehmen und dessen Produkte/Dienstleistungen",
        "Formulieren Sie klar, wie Sie in den ersten 90 Tagen einen Mehrwert schaffen würden",
        "Bereiten Sie intelligente Fragen vor, die Ihr Interesse und Ihre Expertise demonstrieren"
      ]
    };
    
    setGeneratedLetter(mockLetter);
    setMatchingData(mockMatchingData);
    setIsGenerating(false);
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
