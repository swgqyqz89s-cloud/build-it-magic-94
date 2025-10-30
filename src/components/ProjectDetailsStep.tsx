import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronRight, FileText } from "lucide-react";

export interface DetectedProject {
  id: string;
  name: string;
  description?: string;
}

interface ProjectDetailsStepProps {
  detectedProjects: DetectedProject[];
  onContinue: (projectDetails: Record<string, string>) => void;
  onBack: () => void;
}

export const ProjectDetailsStep = ({ detectedProjects, onContinue, onBack }: ProjectDetailsStepProps) => {
  const [projectDetails, setProjectDetails] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue(projectDetails);
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Projekte in Ihrem CV erkannt
          </CardTitle>
          <CardDescription>
            Wir haben {detectedProjects.length} Projekt{detectedProjects.length !== 1 ? 'e' : ''} in Ihrem Lebenslauf gefunden. 
            Fügen Sie weitere Details hinzu, um Ihr Bewerbungsschreiben zu optimieren.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {detectedProjects.map((project, index) => (
              <div key={project.id} className="space-y-3 p-4 border rounded-lg bg-muted/20">
                <div>
                  <Label htmlFor={`project-${project.id}`} className="text-base font-semibold">
                    {index + 1}. {project.name}
                  </Label>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`details-${project.id}`} className="text-sm">
                    Zusätzliche Informationen <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id={`details-${project.id}`}
                    placeholder="z.B. Verwendete Technologien, Ergebnisse, Ihr Beitrag, besondere Erfolge..."
                    value={projectDetails[project.id] || ""}
                    onChange={(e) => setProjectDetails(prev => ({
                      ...prev,
                      [project.id]: e.target.value
                    }))}
                    rows={3}
                  />
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                Zurück
              </Button>
              <Button type="submit" className="flex-1">
                Weiter zur Generierung
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
