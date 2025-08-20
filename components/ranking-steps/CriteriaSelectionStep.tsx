"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, User, Award, MapPin, Briefcase, GraduationCap, FileText, Star } from "lucide-react"
import type { RankingData } from "@/app/rankings/create/page"

interface CriteriaSelectionStepProps {
  data: RankingData
  onUpdate: (updates: Partial<RankingData>) => void
  onNext: () => void
  onPrev: () => void
}

const availableCriteria = [
  {
    id: "personality",
    title: "Personality",
    description: "Communication skills, attitude, and cultural fit",
    icon: User,
  },
  {
    id: "skill",
    title: "Skill",
    description: "Technical abilities and job-specific competencies",
    icon: Star,
  },
  {
    id: "area_living",
    title: "Area Living",
    description: "Geographic location and proximity to workplace",
    icon: MapPin,
    hasInput: true,
  },
  {
    id: "experience",
    title: "Experience",
    description: "Previous work experience in relevant roles",
    icon: Briefcase,
  },
  {
    id: "training",
    title: "Training",
    description: "Professional training and workshops completed",
    icon: Award,
  },
  {
    id: "certification",
    title: "Certification",
    description: "Industry certifications and licenses",
    icon: FileText,
  },
  {
    id: "education",
    title: "Education",
    description: "Educational background and qualifications",
    icon: GraduationCap,
  },
]

export function CriteriaSelectionStep({ data, onUpdate, onNext, onPrev }: CriteriaSelectionStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleCriteriaToggle = (criteriaId: string) => {
    const isSelected = data.selectedCriteria.includes(criteriaId)
    const newSelectedCriteria = isSelected
      ? data.selectedCriteria.filter((id) => id !== criteriaId)
      : [...data.selectedCriteria, criteriaId]

    onUpdate({ selectedCriteria: newSelectedCriteria })
  }

  const handleNext = () => {
    const newErrors: Record<string, string> = {}

    if (data.selectedCriteria.length === 0) {
      newErrors.criteria = "Please select at least one evaluation criteria"
    }

    if (data.selectedCriteria.includes("area_living") && !data.areaLivingCity?.trim()) {
      newErrors.areaLivingCity = "Please specify the preferred city for area living criteria"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      // Initialize weights for selected criteria
      const initialWeights: Record<string, number> = {}
      data.selectedCriteria.forEach((criteriaId) => {
        initialWeights[criteriaId] = data.criteriaWeights[criteriaId] || 50
      })
      onUpdate({ criteriaWeights: initialWeights })
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      {/* Criteria Selection */}
      <div>
        <Label className="text-base font-medium">Select Evaluation Criteria</Label>
        <p className="text-sm text-gray-600 mt-1">Choose the criteria you want to use for evaluating applicants</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {availableCriteria.map((criteria) => {
            const Icon = criteria.icon
            const isSelected = data.selectedCriteria.includes(criteria.id)

            return (
              <Card
                key={criteria.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                }`}
                onClick={() => handleCriteriaToggle(criteria.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox checked={isSelected} onChange={() => {}} className="mt-1" />
                    <Icon className="w-5 h-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{criteria.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{criteria.description}</p>

                      {/* Special input for Area Living */}
                      {criteria.hasInput && isSelected && (
                        <div className="mt-3">
                          <Label htmlFor="areaLivingCity" className="text-sm">
                            Preferred City
                          </Label>
                          <Input
                            id="areaLivingCity"
                            value={data.areaLivingCity || ""}
                            onChange={(e) => onUpdate({ areaLivingCity: e.target.value })}
                            placeholder="Enter preferred city"
                            className="mt-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {errors.criteria && <p className="text-sm text-red-600 mt-2">{errors.criteria}</p>}
        {errors.areaLivingCity && <p className="text-sm text-red-600 mt-2">{errors.areaLivingCity}</p>}
      </div>

      {/* Selected Criteria Summary */}
      {data.selectedCriteria.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Selected Criteria ({data.selectedCriteria.length})</h4>
          <div className="flex flex-wrap gap-2">
            {data.selectedCriteria.map((criteriaId) => {
              const criteria = availableCriteria.find((c) => c.id === criteriaId)
              return (
                <span key={criteriaId} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {criteria?.title}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="flex items-center gap-2 bg-transparent">
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button onClick={handleNext} className="flex items-center gap-2">
          Next: Set Weights
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
