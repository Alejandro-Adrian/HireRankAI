"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, User, Award, MapPin, Briefcase, GraduationCap, FileText, Star } from "lucide-react"
import type { RankingData } from "@/app/rankings/create/page"

interface CriteriaWeightingStepProps {
  data: RankingData
  onUpdate: (updates: Partial<RankingData>) => void
  onNext: () => void
  onPrev: () => void
}

const criteriaIcons: Record<string, any> = {
  personality: User,
  skill: Star,
  area_living: MapPin,
  experience: Briefcase,
  training: Award,
  certification: FileText,
  education: GraduationCap,
}

const criteriaLabels: Record<string, string> = {
  personality: "Personality",
  skill: "Skill",
  area_living: "Area Living",
  experience: "Experience",
  training: "Training",
  certification: "Certification",
  education: "Education",
}

export function CriteriaWeightingStep({ data, onUpdate, onNext, onPrev }: CriteriaWeightingStepProps) {
  const handleWeightChange = (criteriaId: string, value: number[]) => {
    const newWeights = {
      ...data.criteriaWeights,
      [criteriaId]: value[0],
    }
    onUpdate({ criteriaWeights: newWeights })
  }

  const getImportanceLabel = (weight: number) => {
    if (weight <= 20) return "Very Low"
    if (weight <= 40) return "Low"
    if (weight <= 60) return "Medium"
    if (weight <= 80) return "High"
    return "Very High"
  }

  const getImportanceColor = (weight: number) => {
    if (weight <= 20) return "text-gray-500"
    if (weight <= 40) return "text-yellow-600"
    if (weight <= 60) return "text-blue-600"
    if (weight <= 80) return "text-orange-600"
    return "text-red-600"
  }

  const totalWeight = Object.values(data.criteriaWeights).reduce((sum, weight) => sum + weight, 0)
  const averageWeight = totalWeight / data.selectedCriteria.length

  const handleRoundOff = () => {
    if (totalWeight === 100) return // Already at 100%

    const currentWeights = { ...data.criteriaWeights }
    const criteriaIds = data.selectedCriteria
    const difference = 100 - totalWeight

    // Distribute the difference proportionally
    const totalCurrentWeight = Object.values(currentWeights).reduce((sum, weight) => sum + weight, 0)
    const newWeights: Record<string, number> = {}

    let remainingDifference = difference

    criteriaIds.forEach((criteriaId, index) => {
      const currentWeight = currentWeights[criteriaId] || 0
      const proportion = totalCurrentWeight > 0 ? currentWeight / totalCurrentWeight : 1 / criteriaIds.length

      if (index === criteriaIds.length - 1) {
        // Last item gets the remaining difference to ensure exact 100%
        newWeights[criteriaId] = Math.max(0, Math.min(100, currentWeight + remainingDifference))
      } else {
        const adjustment = Math.round(difference * proportion)
        newWeights[criteriaId] = Math.max(0, Math.min(100, currentWeight + adjustment))
        remainingDifference -= adjustment
      }
    })

    onUpdate({ criteriaWeights: newWeights })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Instructions - Made mobile responsive with better spacing */}
      <div className="bg-blue-50 dark:bg-blue-950/50 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm sm:text-base">
          Set Criteria Importance
        </h4>
        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
          Drag the sliders to adjust how important each criteria is for evaluating applicants. Higher values mean the
          criteria will have more impact on the final ranking.
        </p>
      </div>

      {/* Weight Controls - Enhanced mobile layout and touch targets */}
      <div className="space-y-3 sm:space-y-6">
        {data.selectedCriteria.map((criteriaId) => {
          const Icon = criteriaIcons[criteriaId]
          const weight = data.criteriaWeights[criteriaId] || 50

          return (
            <Card key={criteriaId} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3 sm:mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                        {criteriaLabels[criteriaId]}
                      </h3>
                      {criteriaId === "area_living" && data.areaLivingCity && (
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                          Preferred city: {data.areaLivingCity}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-center sm:text-right flex-shrink-0">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{weight}%</div>
                    <div className={`text-xs sm:text-sm font-medium ${getImportanceColor(weight)} dark:brightness-125`}>
                      {getImportanceLabel(weight)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    <span>Less Important</span>
                    <span>More Important</span>
                  </div>
                  <div className="px-1 py-2 sm:py-0">
                    <Slider
                      value={[weight]}
                      onValueChange={(value) => handleWeightChange(criteriaId, value)}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full [&_[role=slider]]:h-6 [&_[role=slider]]:w-6 sm:[&_[role=slider]]:h-5 sm:[&_[role=slider]]:w-5 [&_.slider-track]:h-3 sm:[&_.slider-track]:h-2"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
                    <span>0%</span>
                    <span className="hidden sm:inline">25%</span>
                    <span>50%</span>
                    <span className="hidden sm:inline">75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Weight Summary - Improved mobile layout with stacked buttons */}
      <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">Weight Summary</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                Total: {totalWeight}% | Average: {averageWeight.toFixed(1)}%
              </p>
              {totalWeight !== 100 && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  {totalWeight < 100 ? `${100 - totalWeight}% remaining` : `${totalWeight - 100}% over limit`}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {totalWeight !== 100 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRoundOff}
                  className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50 bg-transparent text-xs sm:text-sm w-full sm:w-auto"
                >
                  Round Off to 100%
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const equalWeight = Math.round(100 / data.selectedCriteria.length)
                  const newWeights: Record<string, number> = {}
                  data.selectedCriteria.forEach((criteriaId) => {
                    newWeights[criteriaId] = equalWeight
                  })
                  onUpdate({ criteriaWeights: newWeights })
                }}
                className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs sm:text-sm w-full sm:w-auto"
              >
                Reset to Equal Weights
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation - Enhanced mobile button layout and touch targets */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
        <Button
          variant="outline"
          onClick={onPrev}
          className="flex items-center justify-center gap-2 bg-transparent border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 w-full sm:w-auto py-3 sm:py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button onClick={onNext} className="flex items-center justify-center gap-2 w-full sm:w-auto py-3 sm:py-2">
          Next: Review & Generate
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
