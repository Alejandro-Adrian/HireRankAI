"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Users, Utensils, Home, CreditCard, Coffee, Flower, Phone } from "lucide-react"
import type { RankingData } from "@/app/rankings/create/page"

interface JobPositionStepProps {
  data: RankingData
  onUpdate: (updates: Partial<RankingData>) => void
  onNext: () => void
}

const jobPositions = [
  {
    id: "kitchen-helper",
    title: "Kitchen Helper",
    description: "Assist with food preparation and kitchen maintenance",
    icon: Utensils,
  },
  {
    id: "server/waiter",
    title: "Server/Waiter",
    description: "Serve customers and manage dining experience",
    icon: Users,
  },
  {
    id: "housekeeping",
    title: "House Keeping",
    description: "Maintain cleanliness and organization of facilities",
    icon: Home,
  },
  {
    id: "cashier",
    title: "Cashier",
    description: "Handle transactions and provide customer service at checkout",
    icon: CreditCard,
  },
  {
    id: "barista",
    title: "Barista",
    description: "Prepare coffee drinks and provide excellent customer service",
    icon: Coffee,
  },
  {
    id: "gardener",
    title: "Gardener",
    description: "Maintain landscapes, plants, and outdoor spaces",
    icon: Flower,
  },
  {
    id: "receptionist",
    title: "Receptionist",
    description: "Greet visitors and manage front desk operations",
    icon: Phone,
  },
]

export function JobPositionStep({ data, onUpdate, onNext }: JobPositionStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handlePositionSelect = (positionId: string) => {
    const position = jobPositions.find((p) => p.id === positionId)
    if (position) {
      onUpdate({
        position: positionId,
        title: data.title || position.title,
      })
    }
  }

  const handleNext = () => {
    const newErrors: Record<string, string> = {}

    if (!data.position) {
      newErrors.position = "Please select a job position"
    }
    if (!data.title.trim()) {
      newErrors.title = "Job title is required"
    }
    if (!data.description.trim()) {
      newErrors.description = "Job description is required"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      {/* Position Selection */}
      <div>
        <Label className="text-base font-medium">Select Job Position</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-3">
          {jobPositions.map((position) => {
            const Icon = position.icon
            return (
              <Card
                key={position.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  data.position === position.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                }`}
                onClick={() => handlePositionSelect(position.id)}
              >
                <CardContent className="p-4 text-center">
                  <Icon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-medium text-gray-900">{position.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{position.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
        {errors.position && <p className="text-sm text-red-600 mt-1">{errors.position}</p>}
      </div>

      {/* Job Details */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            value={data.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Enter job title"
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
        </div>

        <div>
          <Label htmlFor="description">Job Description</Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Describe the job responsibilities and requirements"
            rows={4}
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end">
        <Button onClick={handleNext} className="flex items-center gap-2">
          Next: Select Criteria
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
