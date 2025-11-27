import { useState } from "react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, FileText, Loader2, Link as LinkIcon } from "lucide-react";
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

if (typeof window !== "undefined") {
  GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.394/pdf.worker.min.mjs`;
}

const isValidUrl = (value?: string | null) => {
  if (!value) return true;

  try {
    const normalized = value.startsWith("http") ? value : `https://${value}`;
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
};

const formSchema = z.object({
  jobTitle: z.string().optional(),
  jobDescription: z.string().optional(),
    jobDescriptionUrl: z
    .string()
    .optional()
    .refine((value) => isValidUrl(value), {
      message: "Bitte gib eine gültige URL ein (z. B. https://example.com).",
    }),
  motivation: z.string().optional(),
  tone: z.string().default("professional"),
  careerGoals: z.string().optional(),
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
type FormDataWithCv = FormData & { cvText?: string };

const extractTextFromHtml = (html: string): string => {
  const trimmed = html.trim();
  if (!trimmed) return "";

  // r.jina.ai returns simplified text without HTML tags. In that case, just normalize spaces.
  if (!trimmed.match(/<\w+/)) {
    return trimmed.replace(/\s+/g, " ").trim();
  }

  if (typeof window === "undefined") return trimmed;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const mainContent = doc.querySelector("main") || doc.querySelector("article") || doc.body;
  const rawText = mainContent?.innerText || "";

  return rawText.replace(/\s+/g, " ").trim();
};

const normalizeUrl = (url: string) => (url.startsWith("http") ? url : `https://${url}`);

const fetchJobDescriptionFromUrl = async (url: string): Promise<string> => {
  const normalizedUrl = normalizeUrl(url);
  const fallbackUrl = `https://r.jina.ai/${normalizedUrl}`;

  const tryFetch = async (target: string, label: string) => {
    const response = await fetch(target);
    if (!response.ok) {
      throw new Error(`${label} request failed: HTTP ${response.status}`);
    }
    const html = await response.text();
    const text = extractTextFromHtml(html);
    if (text.length < 20) {
      throw new Error(`${label} response was too short after extraction`);
    }
    return text;
  };

  try {
    return await tryFetch(normalizedUrl, "Direkter Fetch");
  } catch (error) {
    console.warn("Direct job link fetch failed, using proxy:", error);
    return await tryFetch(fallbackUrl, "Proxy Fetch");
  }
};

const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const textParts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    textParts.push(pageText);
  }

  return textParts.join("\n").replace(/\s+\n/g, "\n").trim();
};

interface CoverLetterFormProps {
  onGenerate: (data: FormDataWithCv) => void;
  isGenerating: boolean;
}

export const CoverLetterForm = ({ onGenerate, isGenerating }: CoverLetterFormProps) => {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState<string | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const [isProcessingCv, setIsProcessingCv] = useState(false);
  const [isFetchingJobDescription, setIsFetchingJobDescription] = useState(false);
  const [jobUrlError, setJobUrlError] = useState<string | null>(null);
  const [jobInputMode, setJobInputMode] = useState<"text" | "link">("text");
  const cvPreview = cvText ? cvText.slice(0, 800) : "";
  const isSubmitDisabled = isGenerating || isProcessingCv || isFetchingJobDescription;  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tone: "professional",
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
     if (!file) return;

    if (file.type !== "application/pdf") {
      setCvError("Bitte lade eine PDF-Datei hoch.");
      setCvFile(null);
      setCvText(null);
      return;
    }

    setCvError(null);
    setIsProcessingCv(true);

    try {
      const extractedText = await extractTextFromPdf(file);

      if (!extractedText) {
        setCvError("Die PDF enthält keinen lesbaren Text.");
        setCvFile(null);
        setCvText(null);
        return;
      }

      setCvFile(file);
      setCvText(extractedText);
    } catch (error) {
      console.error("Fehler beim Lesen der PDF:", error);
      setCvError("Die PDF konnte nicht verarbeitet werden. Bitte versuche es erneut.");
      setCvFile(null);
      setCvText(null);
    } finally {
      setIsProcessingCv(false);
    }
  };

  const handleJobInputModeChange = (value: "text" | "link") => {
    setJobUrlError(null);
    setJobInputMode(value);
  };

  const onSubmit = async (data: FormData) => {
    setJobUrlError(null);

    let enrichedData = { ...data };

    if (jobInputMode === "link" && data.jobDescriptionUrl) {
      setIsFetchingJobDescription(true);

      try {
        const jobText = await fetchJobDescriptionFromUrl(data.jobDescriptionUrl.trim());
        enrichedData = { ...enrichedData, jobDescription: jobText };
      } catch (error) {
        console.error("Fehler beim Laden der Stellenanzeige:", error);
        setJobUrlError(
          "Die Stellenanzeige konnte nicht geladen werden. Bitte prüfe den Link oder füge den Text direkt ein.",
        );
        return;
      } finally {
        setIsFetchingJobDescription(false);
      }
    }

    onGenerate({ ...enrichedData, cvText: cvText || undefined });
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
              disabled={isProcessingCv}

            >
              {isProcessingCv ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {cvFile ? cvFile.name : isProcessingCv ? "Processing PDF..." : "Choose PDF file"}
            </Button>
          </div>
          {cvError && (
            <p className="mt-3 text-sm text-destructive">{cvError}</p>
          )}
          {isProcessingCv && (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Text wird aus deinem Lebenslauf extrahiert...
            </p>
          )}
          {cvFile && cvText && (
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{cvFile.name}</span>
              </div>
              <div className="rounded-md border bg-muted/40 p-3 max-h-40 overflow-y-auto whitespace-pre-wrap">
                {cvPreview}
                {cvText.length > cvPreview.length ? "…" : ""}
              </div>
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
            <Tabs value={jobInputMode} onValueChange={(value) => handleJobInputModeChange(value as "text" | "link")} className="mt-2">
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
                   {jobUrlError && (
                  <p className="text-sm text-destructive mt-1">{jobUrlError}</p>
                )}
                {isFetchingJobDescription && (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Laden der Stellenanzeige...
                  </p>
                )}
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
            disabled={isSubmitDisabled}
            className="min-w-[200px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : isProcessingCv ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verarbeite PDF...
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
