"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${
                    currentStep > step.id
                      ? "bg-green-500 border-green-500 text-white"
                      : currentStep === step.id
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <span className="text-xs sm:text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="ml-3 flex-1 sm:flex-none">
                  <p
                    className={`text-sm font-medium ${currentStep >= step.id ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:flex flex-1 h-0.5 mx-4 ${currentStep > step.id ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">
              Step {currentStep}: {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>
      </div>
    </div>
  )
}
