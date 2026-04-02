'use client';

import { Check } from 'lucide-react';
import { ONBOARDING_STEPS } from '@/lib/constants';

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (step: number) => void;
}

export default function StepIndicator({
  currentStep,
  completedSteps,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {ONBOARDING_STEPS.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = currentStep === step.id;
        const isClickable =
          isCompleted || step.id <= Math.max(...completedSteps, 0) + 1;

        return (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => isClickable && onStepClick?.(step.id)}
              disabled={!isClickable}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div
                className={`
                  w-9 h-9 rounded-sm flex items-center justify-center text-sm font-bold
                  transition-all duration-200 pixel-border
                  ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-500'
                  }
                  ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}
                `}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`text-[10px] font-medium whitespace-nowrap ${
                  isCurrent
                    ? 'text-blue-400'
                    : isCompleted
                    ? 'text-emerald-400'
                    : 'text-slate-600'
                }`}
              >
                {step.title}
              </span>
            </button>

            {index < ONBOARDING_STEPS.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-1 mt-[-18px] ${
                  completedSteps.includes(step.id)
                    ? 'bg-emerald-600'
                    : 'bg-slate-800'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
