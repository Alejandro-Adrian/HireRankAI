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
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Set Criteria Importance</h4>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Drag the sliders to adjust how important each criteria is for evaluating applicants. Higher values mean the
          criteria will have more impact on the final ranking.
        </p>
      </div>

      {/* Weight Controls */}
      <div className="space-y-6">
        {data.selectedCriteria.map((criteriaId) => {
          const Icon = criteriaIcons[criteriaId]
          const weight = data.criteriaWeights[criteriaId] || 50

          return (
            <Card key={criteriaId} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{criteriaLabels[criteriaId]}</h3>
                    {criteriaId === "area_living" && data.areaLivingCity && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Preferred city: {data.areaLivingCity}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{weight}%</div>
                    <div className={`text-sm font-medium ${getImportanceColor(weight)} dark:brightness-125`}>
                      {getImportanceLabel(weight)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Less Important</span>
                    <span>More Important</span>
                  </div>
                  <Slider
                    value={[weight]}
                    onValueChange={(value) => handleWeightChange(criteriaId, value)}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Weight Summary */}
      <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Weight Summary</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Total: {totalWeight}% | Average: {averageWeight.toFixed(1)}%
              </p>
              {totalWeight !== 100 && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  {totalWeight < 100 ? `${100 - totalWeight}% remaining` : `${totalWeight - 100}% over limit`}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {totalWeight !== 100 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRoundOff}
                  className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50 bg-transparent"
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
                className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Reset to Equal Weights
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrev}
          className="flex items-center gap-2 bg-transparent border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button onClick={onNext} className="flex items-center gap-2">
          Next: Review & Generate
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
