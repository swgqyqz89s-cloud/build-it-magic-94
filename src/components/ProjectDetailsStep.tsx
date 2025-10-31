import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronRight, FileText } from "lucide-react";

export interface GapQuestion {
  id: string;
  question: string;
  context?: string;
  category: string;
}

interface ProjectDetailsStepProps {
  gapQuestions: GapQuestion[];
  onContinue: (answers: Record<string, string>) => void;
  onBack: () => void;
}

export const ProjectDetailsStep = ({ gapQuestions, onContinue, onBack }: ProjectDetailsStepProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue(answers);
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Optimize Your Application
          </CardTitle>
          <CardDescription>
            Our AI has identified {gapQuestions.length} question{gapQuestions.length !== 1 ? 's' : ''} to complete and optimize your cover letter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {gapQuestions.map((question, index) => (
              <div key={question.id} className="space-y-3 p-4 border rounded-lg bg-muted/20">
                <div>
                  <Label htmlFor={`question-${question.id}`} className="text-base font-semibold">
                    {index + 1}. {question.question}
                  </Label>
                  {question.context && (
                    <p className="text-sm text-muted-foreground mt-1">{question.context}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Category: {question.category}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`answer-${question.id}`} className="text-sm">
                    Your Answer <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id={`answer-${question.id}`}
                    placeholder="Enter your answer here..."
                    value={answers[question.id] || ""}
                    onChange={(e) => setAnswers(prev => ({
                      ...prev,
                      [question.id]: e.target.value
                    }))}
                    rows={3}
                  />
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1">
                Continue to Generation
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
