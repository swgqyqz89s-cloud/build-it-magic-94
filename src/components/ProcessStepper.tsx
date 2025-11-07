import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessStepperProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: "Job Details" },
  { id: 2, name: "Project Details" },
  { id: 3, name: "Results" },
];

export const ProcessStepper = ({ currentStep }: ProcessStepperProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 -mt-4">
      <div className="flex items-center justify-center gap-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center min-w-[120px]">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                  currentStep > step.id
                    ? "bg-primary border-primary text-primary-foreground"
                    : currentStep === step.id
                    ? "border-primary text-primary"
                    : "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="font-semibold">{step.id}</span>
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-sm font-medium transition-colors",
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-20 h-0.5 mx-4 -mt-8">
                <div
                  className={cn(
                    "h-full transition-all",
                    currentStep > step.id ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
