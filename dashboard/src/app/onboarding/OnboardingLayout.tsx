'use client';

import { ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import StepIndicator from '@/components/onboarding/StepIndicator';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import CompanySetup from './steps/CompanySetup';
import CeoSetup from './steps/CeoSetup';
import ExecutiveHiring from './steps/ExecutiveHiring';
import ProviderSetup from './steps/ProviderSetup';
import FirstTeam from './steps/FirstTeam';
import GovernanceSetup from './steps/GovernanceSetup';
import ReviewLaunch from './steps/ReviewLaunch';

const SKIPPABLE_STEPS = [3, 4, 5, 6];

export default function OnboardingLayout() {
  const {
    currentStep,
    completedSteps,
    nextStep,
    prevStep,
    goToStep,
    completeStep,
  } = useOnboardingStore();

  const canSkip = SKIPPABLE_STEPS.includes(currentStep);

  const handleNext = () => {
    // Validate required fields before advancing
    const store = useOnboardingStore.getState();
    if (currentStep === 1 && !store.companyInfo.name.trim()) {
      alert('Please enter a company name before continuing.');
      return;
    }
    if (currentStep === 2 && !store.ceoConfig.name.trim()) {
      alert('Please enter your name before continuing.');
      return;
    }
    completeStep(currentStep);
    nextStep();
  };

  const handleSkip = () => {
    nextStep();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CompanySetup />;
      case 2:
        return <CeoSetup />;
      case 3:
        return <ExecutiveHiring />;
      case 4:
        return <ProviderSetup />;
      case 5:
        return <FirstTeam />;
      case 6:
        return <GovernanceSetup />;
      case 7:
        return <ReviewLaunch />;
      default:
        return <CompanySetup />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <h1 className="text-lg font-bold text-slate-100">
                BaroHQ Setup
              </h1>
            </div>
            <span className="text-xs text-slate-500">
              Step {currentStep} of 7
            </span>
          </div>
          <StepIndicator
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={(step) => {
              if (
                completedSteps.includes(step) ||
                step <= Math.max(...completedSteps, 0) + 1
              ) {
                goToStep(step);
              }
            }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 animate-fade-in">
          {renderStep()}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-slate-800 bg-slate-950/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            {canSkip && (
              <button
                onClick={handleSkip}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors"
              >
                Skip
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep < 7 && (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-sm transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
