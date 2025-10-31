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
        question: "Welche konkreten Erfolge oder Ergebnisse haben Sie in Ihrer letzten Position erreicht?",
        context: "Quantifizierbare Erfolge machen Ihre Bewerbung überzeugender",
        category: "Berufserfahrung"
      },
      {
        id: "2",
        question: "Warum interessieren Sie sich speziell für diese Position und unser Unternehmen?",
        context: "Zeigen Sie Ihre Motivation und Recherche über das Unternehmen",
        category: "Motivation"
      },
      {
        id: "3",
        question: "Welche relevanten technischen Kenntnisse oder Zertifizierungen haben Sie?",
        context: "Ergänzen Sie spezifische Skills, die in der Stellenbeschreibung erwähnt werden",
        category: "Qualifikationen"
      },
      {
        id: "4",
        question: "Können Sie ein Beispiel für eine komplexe Herausforderung nennen, die Sie gemeistert haben?",
        context: "Konkrete Beispiele zeigen Ihre Problemlösungskompetenz",
        category: "Erfahrung"
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
    const mockLetter = `Sehr geehrte Damen und Herren,

mit großem Interesse habe ich Ihre Stellenausschreibung für die Position als ${data.jobTitle || 'position'} gelesen und möchte mich hiermit bei Ihnen bewerben.

${data.motivation ? data.motivation + '\n\n' : ''}Im Laufe meiner Karriere habe ich ein vielfältiges Kompetenzprofil entwickelt, das hervorragend zu den in Ihrer Stellenbeschreibung genannten Anforderungen passt.${additionalContext ? ' ' + additionalContext : ''} Meine Erfahrung hat mich befähigt, mich schnell anzupassen, kritisch zu denken und in schnelllebigen Umgebungen Ergebnisse zu liefern.

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
