"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Copy, ExternalLink, CheckCircle, Loader2, AlertTriangle, Eye, EyeOff } from "lucide-react"
import type { RankingData } from "@/app/rankings/create/page"

interface ReviewStepProps {
  data: RankingData
  onPrev: () => void
}

export function ReviewStep({ data, onPrev }: ReviewStepProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [applicationLink, setApplicationLink] = useState("")
  const [isCreated, setIsCreated] = useState(false)
  const [error, setError] = useState("")
  const [showCriteriaToApplicants, setShowCriteriaToApplicants] = useState(true)

  const totalWeight = Object.values(data.criteriaWeights).reduce((sum, weight) => sum + weight, 0)
  const isValidWeight = totalWeight === 100

  const handleCreateRanking = async () => {
    if (!isValidWeight) {
      alert("Total weight must equal 100% before creating the ranking.")
      return
    }

    setIsCreating(true)
    setError("")

    try {
      console.log("Sending ranking data:", {
        title: data.title,
        position: data.position,
        description: data.description,
        criteria: data.selectedCriteria,
        criteriaWeights: data.criteriaWeights,
        areaLivingCity: data.areaLivingCity,
        showCriteriaToApplicants,
      })

      const response = await fetch("/api/rankings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          position: data.position,
          description: data.description,
          criteria: data.selectedCriteria,
          criteriaWeights: data.criteriaWeights,
          areaLivingCity: data.areaLivingCity,
          showCriteriaToApplicants,
        }),
      })

      const result = await response.json()
      console.log("API Response:", result)

      if (response.ok) {
        const link = `${window.location.origin}/apply/${result.linkId}`
        setApplicationLink(link)
        setIsCreated(true)
      } else {
        const errorMessage = result.details || result.error || "Failed to create ranking"
        console.error("API Error:", result)
        setError(`Error: ${errorMessage}`)
      }
    } catch (error) {
      console.error("Network error creating ranking:", error)
      setError(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsCreating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(applicationLink)
    alert("Application link copied to clipboard!")
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

  if (isCreated) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Ranking Created Successfully!</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Your job ranking has been created and is ready to receive applications.
          </p>
        </div>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Application Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={applicationLink}
                readOnly
                className="font-mono text-sm bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              />
              <Button onClick={copyToClipboard} size="sm">
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => window.open(applicationLink, "_blank")}
                variant="outline"
                className="flex-1 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview Application Form
              </Button>
              <Button onClick={() => (window.location.href = "/")} className="flex-1">
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {/* Job Details Review */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Position</Label>
            <p className="text-gray-900 dark:text-gray-100 capitalize">{data.position.replace("-", " ")}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</Label>
            <p className="text-gray-900 dark:text-gray-100">{data.title}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</Label>
            <p className="text-gray-900 dark:text-gray-100">{data.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Criteria Review */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Evaluation Criteria & Weights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.selectedCriteria.map((criteriaId) => (
              <div
                key={criteriaId}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{criteriaLabels[criteriaId]}</span>
                  {criteriaId === "area_living" && data.areaLivingCity && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({data.areaLivingCity})</span>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className="text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                >
                  {data.criteriaWeights[criteriaId]}% weight
                </Badge>
              </div>
            ))}
          </div>

          <div
            className={`mt-4 p-3 rounded-lg border ${isValidWeight ? "bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800"}`}
          >
            <p
              className={`text-sm font-medium ${isValidWeight ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}`}
            >
              <strong>Total Weight:</strong> {totalWeight}%{isValidWeight ? " ✓" : ` (Must equal 100%)`}
            </p>
          </div>

          {!isValidWeight && (
            <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {totalWeight > 100
                  ? `Total weight is ${totalWeight}%. Please go back and reduce the weights to equal exactly 100%.`
                  : `Total weight is ${totalWeight}%. Please go back and increase the weights to equal exactly 100%.`}
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Show Evaluation Criteria to Applicants
                </Label>
                <p className="text-xs text-blue-700 dark:text-blue-200 mt-1">
                  When enabled, applicants will see what criteria they'll be evaluated on and their importance levels.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCriteriaToApplicants(!showCriteriaToApplicants)}
                className={`flex items-center gap-2 ${
                  showCriteriaToApplicants
                    ? "bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-200"
                    : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                }`}
              >
                {showCriteriaToApplicants ? (
                  <>
                    <Eye className="w-4 h-4" />
                    Visible
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Hidden
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrev}
          className="flex items-center gap-2 bg-transparent border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button
          onClick={handleCreateRanking}
          disabled={isCreating || !isValidWeight}
          className="flex items-center gap-2"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating Ranking...
            </>
          ) : (
            "Create Ranking & Generate Link"
          )}
        </Button>
      </div>
    </div>
  )
}
