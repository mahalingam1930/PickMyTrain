import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
}

interface BookingStepsProps {
  currentStep: number;
}

const steps: Step[] = [
  { id: 1, label: 'Search' },
  { id: 2, label: 'Seats' },
  { id: 3, label: 'Passengers' },
  { id: 4, label: 'Payment' },
  { id: 5, label: 'Confirmed' },
];

export default function BookingSteps({ currentStep }: BookingStepsProps) {
  return (
    <div className="flex items-center justify-center gap-0 py-6">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                currentStep > step.id
                  ? 'bg-green-500 text-white'
                  : currentStep === step.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
            </div>
            <span
              className={`text-xs font-medium hidden sm:block ${
                currentStep >= step.id ? 'text-slate-700' : 'text-slate-400'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-0.5 w-8 sm:w-14 mx-1 transition-all ${
                currentStep > step.id ? 'bg-green-400' : 'bg-slate-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
