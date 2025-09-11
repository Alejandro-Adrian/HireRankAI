"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, ArrowLeft } from "lucide-react"
import { JobPositionStep } from "@/components/ranking-steps/JobPositionStep"
import { CriteriaSelectionStep } from "@/components/ranking-steps/CriteriaSelectionStep"
import { CriteriaWeightingStep } from "@/components/ranking-steps/CriteriaWeightingStep"
import { ReviewStep } from "@/components/ranking-steps/ReviewStep"
import { useRouter } from "next/navigation"

export interface RankingData {
  title: string
  position: string
  description: string
  selectedCriteria: string[]
  criteriaWeights: Record<string, number>
  areaLivingCity?: string
}

const steps = [
  { id: 1, title: "Job Position", description: "Select the job position and add details" },
  { id: 2, title: "Criteria Selection", description: "Choose evaluation criteria" },
  { id: 3, title: "Criteria Weighting", description: "Set importance weights" },
  { id: 4, title: "Review & Generate", description: "Review and create application link" },
]

export default function CreateRankingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()
  const [rankingData, setRankingData] = useState<RankingData>({
    title: "",
    position: "",
    description: "",
    selectedCriteria: [],
    criteriaWeights: {},
    areaLivingCity: "",
  })

  const updateRankingData = (updates: Partial<RankingData>) => {
    setRankingData((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <JobPositionStep data={rankingData} onUpdate={updateRankingData} onNext={nextStep} />
      case 2:
        return (
          <CriteriaSelectionStep data={rankingData} onUpdate={updateRankingData} onNext={nextStep} onPrev={prevStep} />
        )
      case 3:
        return (
          <CriteriaWeightingStep data={rankingData} onUpdate={updateRankingData} onNext={nextStep} onPrev={prevStep} />
        )
      case 4:
        return <ReviewStep data={rankingData} onPrev={prevStep} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50 dark:from-slate-900 dark:via-emerald-950/30 dark:to-teal-950 py-4 sm:py-8 transition-all duration-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-6 animate-fade-in-up">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-4 transition-all duration-300 hover:scale-105 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/50 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/30 rounded-lg px-4 py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="mb-6 sm:mb-8 backdrop-blur-md bg-white/70 dark:bg-gray-800/70 rounded-xl border border-white/20 dark:border-gray-700/50 p-6 animate-fade-in-up shadow-lg hover:shadow-xl transition-all duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center animate-slide-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-500 transform hover:scale-110 ${
                    currentStep > step.id
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                      : currentStep === step.id
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/40 animate-pulse"
                        : "bg-white/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 backdrop-blur-sm"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5 animate-bounce-gentle" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="ml-3 flex-1 sm:flex-none">
                  <p
                    className={`text-sm font-medium transition-all duration-300 ${
                      currentStep >= step.id
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:flex flex-1 h-0.5 mx-4 rounded-full transition-all duration-500 ${
                      currentStep > step.id
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/70 dark:bg-gray-800/70 rounded-xl border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-700 animate-fade-in-up">
          <div className="p-6 border-b border-white/20 dark:border-gray-700/50">
            <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Step {currentStep}: {steps[currentStep - 1].title}
            </h2>
          </div>
          <div className="p-6">{renderStep()}</div>
        </div>
      </div>
    </div>
  )
}
