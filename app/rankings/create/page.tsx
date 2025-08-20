"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { JobPositionStep } from "@/components/ranking-steps/JobPositionStep"
import { CriteriaSelectionStep } from "@/components/ranking-steps/CriteriaSelectionStep"
import { CriteriaWeightingStep } from "@/components/ranking-steps/CriteriaWeightingStep"
import { ReviewStep } from "@/components/ranking-steps/ReviewStep"

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep > step.id
                      ? "bg-green-500 border-green-500 text-white"
                      : currentStep === step.id
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "bg-white border-gray-300 text-gray-500"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${currentStep >= step.id ? "text-gray-900" : "text-gray-500"}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.id ? "bg-green-500" : "bg-gray-300"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>
              Step {currentStep}: {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>
      </div>
    </div>
  )
}
