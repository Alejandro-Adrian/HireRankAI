import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { put } from "@vercel/blob"
import { simpleResumeParser } from "@/lib/simple-resume-parser"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting application submission process")

    let supabase
    try {
      supabase = createClient()
      console.log("[v0] Supabase client created successfully")

      // Test database connection
      const { data: testQuery, error: testError } = await supabase.from("rankings").select("count").limit(1)

      if (testError) {
        console.error("[v0] Database connection test failed:", testError)
        return NextResponse.json(
          {
            error: "Database connection failed",
            details: testError.message,
          },
          { status: 500 },
        )
      }

      console.log("[v0] Database connection verified")
    } catch (clientError) {
      console.error("[v0] Failed to create Supabase client:", clientError)
      return NextResponse.json(
        {
          error: "Database client initialization failed",
          details: clientError.message,
        },
        { status: 500 },
      )
    }

    const formData = await request.formData()

    console.log("[v0] Processing application submission")

    const ranking_id = formData.get("ranking_id") as string

    if (!ranking_id) {
      console.error("[v0] Missing ranking ID")
      return NextResponse.json({ error: "Missing ranking ID" }, { status: 400 })
    }

    console.log("[v0] Ranking ID:", ranking_id)

    // Process uploaded files
    const fileEntries = Array.from(formData.entries()).filter(
      ([key]) => key.startsWith("file_") && !key.includes("_category"),
    )

    let resumeFile: File | null = null
    const allFiles: { file: File; category: string; index: string }[] = []

    for (const [key, file] of fileEntries) {
      if (file instanceof File) {
        const index = key.split("_")[1]
        const category = (formData.get(`file_${index}_category`) as string) || "other"

        allFiles.push({ file, category, index })

        if (category === "resume") {
          resumeFile = file
        }
      }
    }

    if (!resumeFile) {
      console.error("[v0] No resume file found")
      return NextResponse.json({ error: "Resume file is required" }, { status: 400 })
    }

    console.log(`[v0] Found ${allFiles.length} files, including resume: ${resumeFile.name}`)

    let resumeData
    try {
      console.log("[v0] Starting resume parsing with new OCR system...")
      console.log("[v0] Resume file details:", {
        name: resumeFile.name,
        size: resumeFile.size,
        type: resumeFile.type,
      })

      resumeData = await simpleResumeParser.parseFromFile(resumeFile)

      console.log("[v0] Resume parsing completed successfully")
      console.log("[v0] Parsed resume data:", resumeData)

      if (!resumeData.applicant_name || resumeData.applicant_name === "Name Not Found") {
        console.error("[v0] Resume parsing incomplete - no name found")
        return NextResponse.json(
          {
            error: "Failed to extract information from resume",
            details:
              "Could not extract applicant name from resume. Please ensure the file contains readable text or is a clear image.",
          },
          { status: 400 },
        )
      }
    } catch (parseError) {
      console.error("[v0] Resume parsing failed:", parseError)

      if (parseError.message.includes("PDF processing failed") && allFiles.length > 1) {
        return NextResponse.json(
          {
            error: "PDF processing failed when mixed with other files",
            details: "Please submit PDF files separately from images, or use only image files (JPG, PNG).",
          },
          { status: 400 },
        )
      }

      return NextResponse.json(
        {
          error: "Failed to parse resume",
          details: parseError.message,
        },
        { status: 500 },
      )
    }

    // Verify ranking exists and is active
    console.log("[v0] Validating ranking...")
    const { data: ranking, error: rankingError } = await supabase
      .from("rankings")
      .select("id, is_active, title")
      .eq("id", ranking_id)
      .eq("is_active", true)
      .single()

    if (rankingError || !ranking) {
      console.error("[v0] Ranking validation failed:", rankingError)
      return NextResponse.json({ error: "Invalid or inactive ranking" }, { status: 400 })
    }

    console.log("[v0] Validated ranking:", ranking.title)

    console.log("[v0] Creating application record...")
    const applicationData = {
      ranking_id,
      applicant_name: resumeData.applicant_name,
      applicant_email: resumeData.applicant_email || `applicant-${Date.now()}@placeholder.com`,
      applicant_phone: resumeData.applicant_phone || null,
      applicant_city: resumeData.applicant_city || null,
      status: "pending",
      submitted_at: new Date().toISOString(),
      resume_summary: resumeData.resume_summary,
      key_skills: resumeData.key_skills,
      experience_years: resumeData.experience_years,
      education_level: resumeData.education_level,
      certifications: resumeData.certifications,
      ocr_transcript: resumeData.raw_text || null,
    }

    console.log("[v0] Application data to insert:", JSON.stringify(applicationData, null, 2))

    const requiredFields = ["ranking_id", "applicant_name", "status", "submitted_at"]
    const missingFields = requiredFields.filter((field) => !applicationData[field])

    if (missingFields.length > 0) {
      console.error("[v0] Missing required fields for application:", missingFields)
      return NextResponse.json(
        {
          error: "Missing required application data",
          details: `Missing fields: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      )
    }

    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .insert(applicationData)
      .select()
      .single()

    if (applicationError) {
      console.error("[v0] Error creating application:", applicationError)
      console.error("[v0] Application error details:", JSON.stringify(applicationError, null, 2))

      if (applicationError.code === "23505") {
        return NextResponse.json(
          {
            error: "Duplicate application",
            details: "An application with this information already exists",
          },
          { status: 409 },
        )
      } else if (applicationError.code === "23503") {
        return NextResponse.json(
          {
            error: "Invalid ranking reference",
            details: "The specified ranking does not exist",
          },
          { status: 400 },
        )
      }

      return NextResponse.json(
        {
          error: "Failed to create application",
          details: applicationError.message,
          code: applicationError.code,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Created application:", application.id)

    // Upload files to Vercel Blob
    const uploadedFiles: any[] = []

    for (const { file, category } of allFiles) {
      try {
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          console.warn(`[v0] File ${file.name} exceeds size limit, skipping`)
          continue
        }

        const fileName = `applications/${application.id}/${category}/${Date.now()}-${file.name}`
        console.log(`[v0] Uploading file: ${fileName}`)

        const blob = await put(fileName, file, {
          access: "public",
        })

        const { data: fileRecord, error: fileError } = await supabase
          .from("application_files")
          .insert({
            application_id: application.id,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            file_url: blob.url,
            file_category: category,
            uploaded_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (fileError) {
          console.error("[v0] Error saving file info:", fileError)
        } else {
          uploadedFiles.push(fileRecord)
          console.log(`[v0] Successfully uploaded: ${file.name}`)
        }
      } catch (error) {
        console.error(`[v0] Error processing file ${file.name}:`, error)
      }
    }

    console.log(`[v0] Successfully uploaded ${uploadedFiles.length} files`)

    console.log("[v0] Starting automatic scoring process")
    try {
      const { directScoringService } = await import("@/lib/direct-scoring-service")

      console.log("[v0] Attempting to score application:", application.id)
      const scoringResult = await directScoringService.scoreApplication(application.id)

      if (scoringResult) {
        console.log("[v0] Application scored successfully with direct scoring service")
      } else {
        console.error("[v0] Direct scoring failed: No result returned")
        // Don't fail the entire application if scoring fails
      }
    } catch (scoringError) {
      console.error("[v0] Scoring service error:", scoringError)
      // Continue without failing - scoring can be done manually later
    }

    return NextResponse.json(
      {
        message: "Application submitted successfully",
        application_id: application.id,
        extracted_info: {
          name: resumeData.applicant_name,
          email: resumeData.applicant_email || "Email not detected",
          phone: resumeData.applicant_phone || "Phone not detected",
          city: resumeData.applicant_city || "Location not detected",
        },
        uploaded_files: uploadedFiles.length,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error in applications API:", error)
    console.error("[v0] Error stack:", error.stack)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
