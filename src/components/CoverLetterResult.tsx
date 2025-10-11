import { useState } from "react";
import { Copy, Download, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface CoverLetterResultProps {
  letter: string;
  onReset: () => void;
}

export const CoverLetterResult = ({ letter, onReset }: CoverLetterResultProps) => {
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
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Your Cover Letter is Ready!</h2>
        <p className="text-muted-foreground">Review, edit, and download your personalized cover letter</p>
      </div>

      <Card className="p-8 mb-6">
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

      <div className="mt-8 p-4 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
        💡 Tip: Review and personalize the letter before sending. Add specific examples from your experience to make it even stronger!
      </div>
    </div>
  );
};
