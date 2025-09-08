"use client"
import { useState } from "react"
import type React from "react"

import { Upload, FileText, Award, Briefcase, Send, CheckCircle, AlertCircle } from "lucide-react"

interface ApplicationFormProps {
  ranking: any
}

interface FileUpload {
  file: File
  category: "resume" | "certificate" | "portfolio" | "other"
  preview?: string
}

export default function ApplicationForm({ ranking }: ApplicationFormProps) {
  const [files, setFiles] = useState<FileUpload[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [extractedInfo, setExtractedInfo] = useState<any>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, category: FileUpload["category"]) => {
    const selectedFiles = Array.from(e.target.files || [])

    const validFiles: FileUpload[] = []

    for (const file of selectedFiles) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError(`File "${file.name}" is too large. Maximum size is 10MB.`)
        continue
      }

      // Check file type for resume
      if (category === "resume") {
        const validTypes = [".pdf", ".doc", ".docx", ".txt", ".jpg", ".jpeg", ".png"]
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))
        if (!validTypes.includes(fileExtension)) {
          setError(`Resume must be in PDF, DOC, DOCX, TXT, JPG, or PNG format. "${file.name}" is not supported.`)
          continue
        }
      }

      validFiles.push({
        file,
        category,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      })
    }

    setFiles((prev) => [...prev, ...validFiles])
    if (error && validFiles.length > 0) setError("")
  }

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev]
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const hasResume = files.some((f) => f.category === "resume")
    if (!hasResume) {
      setError("Please upload your resume to continue")
      return
    }

    if (files.length === 0) {
      setError("Please upload at least your resume")
      return
    }

    setSubmitting(true)

    try {
      const submitData = new FormData()
      submitData.append("ranking_id", ranking.id)

      files.forEach((fileUpload, index) => {
        submitData.append(`file_${index}`, fileUpload.file)
        submitData.append(`file_${index}_category`, fileUpload.category)
      })

      console.log("[v0] Submitting application with", files.length, "files")

      const response = await fetch("/api/applications", {
        method: "POST",
        body: submitData,
      })

      const responseData = await response.json()

      if (response.ok) {
        console.log("[v0] Application submitted successfully:", responseData)
        setExtractedInfo(responseData.extracted_info)
        setSubmitted(true)
      } else {
        console.error("[v0] Application submission failed:", responseData)
        setError(responseData.error || `Failed to submit application (${response.status})`)
      }
    } catch (error) {
      console.error("[v0] Error submitting application:", error)
      setError("An error occurred while submitting your application. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-8 text-center">
        <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
        <p className="text-gray-300 mb-4">
          Thank you for your interest in the {ranking.position.replace("/", " / ")} position.
        </p>
        {extractedInfo && (
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-blue-300 mb-2">Extracted Information</h3>
            <div className="text-sm text-blue-200">
              <p>
                <strong>Name:</strong> {extractedInfo.name}
              </p>
              <p>
                <strong>Email:</strong> {extractedInfo.email}
              </p>
              {extractedInfo.phone && (
                <p>
                  <strong>Phone:</strong> {extractedInfo.phone}
                </p>
              )}
              {extractedInfo.city && (
                <p>
                  <strong>City:</strong> {extractedInfo.city}
                </p>
              )}
            </div>
          </div>
        )}
        <p className="text-sm text-gray-400">
          We have received your application and automatically extracted your personal information from your resume. Your
          application is being processed and scored automatically. You will be contacted if you are selected for the
          next stage.
        </p>
      </div>
    )
  }

  const criteriaWeights = ranking.criteria_weights || {}
  const selectedCriteria = Object.keys(criteriaWeights)
  const showCriteria = ranking.show_criteria_to_applicants !== false

  const hasResume = files.some((f) => f.category === "resume")

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-start space-x-3 animate-bounce-gentle">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {hasResume && !error && (
        <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 flex items-start space-x-3 animate-scale-in">
          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-green-200 text-sm">
            Resume uploaded successfully. Personal information will be extracted automatically when you submit.
          </p>
        </div>
      )}

      <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6 hover-lift animate-slide-in-left">
        <div className="flex items-center space-x-2 mb-4">
          <Upload className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Documents</h2>
        </div>

        <p className="text-sm text-gray-300 mb-6">
          Upload your resume and any supporting documents. Your personal information (name, email, phone, location) will
          be automatically extracted from your resume.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-2 border-dashed border-blue-600 rounded-lg p-6 text-center hover:border-blue-500 transition-all duration-300 bg-blue-900/20 hover:bg-blue-900/30 hover:scale-105 transform">
            <FileText className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-white mb-1">Resume/CV *</h3>
            <p className="text-xs text-gray-400 mb-3">PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB) - Required</p>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(e, "resume")}
              className="hidden"
              id="resume-upload"
            />
            <label
              htmlFor="resume-upload"
              className="inline-flex items-center px-3 py-2 border border-blue-600 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-300 bg-gray-800 hover:bg-gray-700 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md"
            >
              Choose File
            </label>
          </div>

          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-all duration-300 bg-gray-800/20 hover:bg-gray-800/30 hover:scale-105 transform">
            <Award className="h-8 w-8 text-gray-500 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-white mb-1">Certificates</h3>
            <p className="text-xs text-gray-400 mb-3">PDF, JPG, PNG (Max 10MB each)</p>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={(e) => handleFileUpload(e, "certificate")}
              className="hidden"
              id="certificate-upload"
            />
            <label
              htmlFor="certificate-upload"
              className="inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md"
            >
              Choose Files
            </label>
          </div>

          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-all duration-300 bg-gray-800/20 hover:bg-gray-800/30 hover:scale-105 transform">
            <Briefcase className="h-8 w-8 text-gray-500 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-white mb-1">Portfolio</h3>
            <p className="text-xs text-gray-400 mb-3">PDF, JPG, PNG (Max 10MB each)</p>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={(e) => handleFileUpload(e, "portfolio")}
              className="hidden"
              id="portfolio-upload"
            />
            <label
              htmlFor="portfolio-upload"
              className="inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md"
            >
              Choose Files
            </label>
          </div>

          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-all duration-300 bg-gray-800/20 hover:bg-gray-800/30 hover:scale-105 transform">
            <Upload className="h-8 w-8 text-gray-500 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-white mb-1">Other Documents</h3>
            <p className="text-xs text-gray-400 mb-3">Any format (Max 10MB each)</p>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileUpload(e, "other")}
              className="hidden"
              id="other-upload"
            />
            <label
              htmlFor="other-upload"
              className="inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md"
            >
              Choose Files
            </label>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-6 animate-slide-in-right">
            <h3 className="text-sm font-medium text-white mb-3">Uploaded Files</h3>
            <div className="space-y-2">
              {files.map((fileUpload, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-sm stagger-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{fileUpload.file.name}</p>
                      <p className="text-xs text-gray-400 capitalize">
                        {fileUpload.category} • {(fileUpload.file.size / 1024 / 1024).toFixed(2)} MB
                        {fileUpload.category === "resume" && (
                          <span className="text-blue-400 font-medium"> (Required)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-400 hover:text-red-300 text-sm transition-all duration-200 hover:scale-110 px-2 py-1 rounded hover:bg-red-900/20"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showCriteria && selectedCriteria.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6 animate-slide-in-right">
          <h3 className="text-sm font-medium text-blue-300 mb-2">Evaluation Criteria</h3>
          <p className="text-sm text-blue-200 mb-3">
            Your application will be evaluated based on the following criteria (extracted from your resume and
            documents):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedCriteria.map((criterion) => {
              const weight = criteriaWeights[criterion]
              const importance = weight <= 0.3 ? "Low" : weight <= 0.6 ? "Medium" : weight <= 0.8 ? "High" : "Critical"
              return (
                <span
                  key={criterion}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-800/30 text-blue-200"
                >
                  {criterion.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())} ({importance})
                </span>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex justify-center animate-slide-in-right">
        <button
          type="submit"
          disabled={submitting || !hasResume}
          className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-lg font-medium transform hover:scale-105 hover:shadow-lg active:scale-95"
        >
          {submitting ? (
            <>
              <div className="loading-spinner"></div>
              <span>Submitting & Processing...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Submit Application</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
