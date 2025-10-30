import { useState } from "react";
import { Copy, Download, RotateCcw, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MatchingScore, MatchingData } from "@/components/MatchingScore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CoverLetterResultProps {
  letter: string;
  matchingData: MatchingData;
  onReset: () => void;
}

export const CoverLetterResult = ({ letter, matchingData, onReset }: CoverLetterResultProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Your cover letter has been copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([letter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cover-letter.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded",
      description: "Your cover letter has been downloaded.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Ihr Cover Letter ist bereit!</h2>
        <p className="text-muted-foreground">Überprüfen Sie Ihr personalisiertes Anschreiben und die Matching-Analyse</p>
      </div>

      <Tabs defaultValue="letter" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="letter" className="text-base">
            <FileText className="w-4 h-4 mr-2" />
            Cover Letter
          </TabsTrigger>
          <TabsTrigger value="matching" className="text-base">
            <Check className="w-4 h-4 mr-2" />
            Matching Score
          </TabsTrigger>
        </TabsList>

        <TabsContent value="letter" className="space-y-6">
          <Card className="p-8">
            <div className="prose prose-slate max-w-none">
              <div className="whitespace-pre-wrap font-serif text-foreground leading-relaxed">
                {letter}
              </div>
            </div>
          </Card>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={handleCopy} variant="outline" size="lg">
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy to Clipboard"}
            </Button>
            
            <Button onClick={handleDownload} variant="outline" size="lg">
              <Download className="w-4 h-4 mr-2" />
              Download as Text
            </Button>
            
            <Button onClick={onReset} variant="default" size="lg">
              <RotateCcw className="w-4 h-4 mr-2" />
              Create Another
            </Button>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
            💡 Tipp: Überprüfen und personalisieren Sie den Brief vor dem Versenden. Fügen Sie spezifische Beispiele aus Ihrer Erfahrung hinzu!
          </div>
        </TabsContent>

        <TabsContent value="matching">
          <MatchingScore data={matchingData} />
          
          <div className="flex justify-center mt-8">
            <Button onClick={onReset} variant="default" size="lg">
              <RotateCcw className="w-4 h-4 mr-2" />
              Neues Cover Letter erstellen
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
