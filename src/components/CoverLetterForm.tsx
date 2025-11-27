import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, FileText, Loader2, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromPDF } from "@/utils/pdfParser";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  jobTitle: z.string().optional(),
  jobDescription: z.string().optional(),
  jobDescriptionUrl: z.string().optional(),
  motivation: z.string().optional(),
  tone: z.string().default("professional"),
  careerGoals: z.string().optional(),
  cvText: z.string().optional(),
}).refine(
  (data) => {
    return (data.jobDescription && data.jobDescription.length >= 10) || 
           (data.jobDescriptionUrl && data.jobDescriptionUrl.length > 0);
  },
  {
    message: "Please provide either a job description or a job posting URL",
    path: ["jobDescription"],
  }
);

type FormData = z.infer<typeof formSchema>;

interface CoverLetterFormProps {
  onGenerate: (data: FormData) => void;
  isGenerating: boolean;
}

export const CoverLetterForm = ({ onGenerate, isGenerating }: CoverLetterFormProps) => {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState<string>("");
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [jobInputMode, setJobInputMode] = useState<"text" | "link">("text");
  const { toast } = useToast();
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tone: "professional",
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setCvFile(file);
      setIsExtractingPdf(true);
      
      try {
        const text = await extractTextFromPDF(file);
        setCvText(text);
        toast({
          title: "PDF erfolgreich verarbeitet",
          description: `${text.split(' ').length} Wörter extrahiert`,
        });
      } catch (error) {
        toast({
          title: "Fehler beim Verarbeiten der PDF",
          description: "Bitte versuchen Sie es erneut",
          variant: "destructive",
        });
        setCvFile(null);
      } finally {
        setIsExtractingPdf(false);
      }
    }
  };

  const onSubmit = (data: FormData) => {
    onGenerate({ ...data, cvText });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* CV Upload */}
        <Card className="p-6 border-2 border-dashed hover:border-primary/50 transition-colors">
          <Label htmlFor="cv-upload" className="block mb-4 text-lg font-semibold">
            Upload Your CV
          </Label>
          <div className="flex items-center gap-4">
            <Input
              id="cv-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("cv-upload")?.click()}
              className="w-full justify-center gap-2"
              disabled={isExtractingPdf}
            >
              {isExtractingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  PDF wird verarbeitet...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {cvFile ? cvFile.name : "PDF-Datei wählen"}
                </>
              )}
            </Button>
          </div>
          {cvFile && cvText && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>{cvFile.name} ({cvText.split(' ').length} Wörter extrahiert)</span>
              </div>
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Extrahierten Text anzeigen
                </summary>
                <pre className="mt-2 p-2 bg-muted rounded-md max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {cvText.substring(0, 500)}...
                </pre>
              </details>
            </div>
          )}
        </Card>

        {/* Job Details */}
        <Card className="p-6 space-y-4">
          <div>
            <Label htmlFor="jobTitle">Job Title (Optional)</Label>
            <Input
              id="jobTitle"
              placeholder="e.g., Senior Software Engineer"
              {...register("jobTitle")}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Job Description *</Label>
            <Tabs value={jobInputMode} onValueChange={(value) => setJobInputMode(value as "text" | "link")} className="mt-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Paste Text</TabsTrigger>
                <TabsTrigger value="link">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Enter Link
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="mt-4">
                <Textarea
                  id="jobDescription"
                  placeholder="Paste the complete job description here..."
                  {...register("jobDescription")}
                  className="min-h-[200px]"
                />
                {errors.jobDescription && (
                  <p className="text-sm text-destructive mt-1">{errors.jobDescription.message}</p>
                )}
              </TabsContent>
              
              <TabsContent value="link" className="mt-4">
                <Input
                  id="jobDescriptionUrl"
                  type="url"
                  placeholder="https://example.com/job-posting"
                  {...register("jobDescriptionUrl")}
                />
                {errors.jobDescriptionUrl && (
                  <p className="text-sm text-destructive mt-1">{errors.jobDescriptionUrl.message}</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </Card>

        {/* Additional Information */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Customize Your Letter</h3>
          
          <div>
            <Label htmlFor="motivation">Personal Motivation (Optional)</Label>
            <Textarea
              id="motivation"
              placeholder="Why are you interested in this position? What excites you about this opportunity?"
              {...register("motivation")}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="tone">Tone</Label>
            <Select 
              defaultValue="professional" 
              onValueChange={(value) => setValue("tone", value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="careerGoals">Career Goals (Optional)</Label>
            <Textarea
              id="careerGoals"
              placeholder="What are your career aspirations? How does this role fit into your plans?"
              {...register("careerGoals")}
              className="mt-2"
            />
          </div>
        </Card>

        {/* Generate Button */}
        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            size="lg"
            disabled={isGenerating}
            className="min-w-[200px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Cover Letter"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
