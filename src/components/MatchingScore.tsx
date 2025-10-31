import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

export interface MatchingData {
  overallScore: number;
  categories: {
    name: string;
    score: number;
    description: string;
  }[];
  strengths: string[];
  improvements: string[];
  interviewTips: string[];
}

interface MatchingScoreProps {
  data: MatchingData;
}

export const MatchingScore = ({ data }: MatchingScoreProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: "Excellent Match", variant: "default" as const };
    if (score >= 60) return { label: "Good Match", variant: "secondary" as const };
    return { label: "Fair Match", variant: "outline" as const };
  };

  const scoreBadge = getScoreBadge(data.overallScore);

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="mb-4">
          <Badge variant={scoreBadge.variant} className="mb-2">
            {scoreBadge.label}
          </Badge>
        </div>
        <div className={`text-6xl font-bold mb-2 ${getScoreColor(data.overallScore)}`}>
          {data.overallScore}%
        </div>
        <p className="text-lg text-muted-foreground">Matching Score</p>
        <p className="text-sm text-muted-foreground mt-2">
          How well you match the advertised position
        </p>
      </Card>

      {/* Category Breakdown */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Detailed Analysis
        </h3>
        <div className="space-y-6">
          {data.categories.map((category, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{category.name}</span>
                <span className={`font-semibold ${getScoreColor(category.score)}`}>
                  {category.score}%
                </span>
              </div>
              <Progress value={category.score} className="h-2" />
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Strengths and Improvements */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            Your Strengths
          </h3>
          <ul className="space-y-3">
            {data.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600 dark:text-green-400" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <AlertCircle className="w-5 h-5" />
            Areas for Improvement
          </h3>
          <ul className="space-y-3">
            {data.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Interview Tips */}
      <Card className="p-6 bg-primary/5">
        <h3 className="text-lg font-semibold mb-4">💡 Interview Tips</h3>
        <ul className="space-y-2">
          {data.interviewTips.map((tip, index) => (
            <li key={index} className="text-sm pl-4 border-l-2 border-primary py-1">
              {tip}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
