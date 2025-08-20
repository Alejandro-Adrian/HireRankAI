import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { realScoring } from "@/lib/real-scoring"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    // Get ranking
    const { data: ranking, error: rankingError } = await supabase
      .from("rankings")
      .select("*")
      .eq("id", params.id)
      .single()

    if (rankingError || !ranking) {
      return NextResponse.json({ error: "Ranking not found" }, { status: 404 })
    }

    const { data: applications, error: applicationsError } = await supabase
      .from("applications")
      .select(`
        *,
        application_files (*)
      `)
      .eq("ranking_id", params.id)
      .eq("status", "pending")

    if (applicationsError) {
      console.error("[v0] Error fetching applications:", applicationsError)
      return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
    }

    if (!applications || applications.length === 0) {
      return NextResponse.json({ message: "No pending applications to score" }, { status: 200 })
    }

    const criteriaWeights = ranking.criteria_weights || {}
    let scoredCount = 0
    const scoringErrors: string[] = []

    console.log(`[v0] Starting to score ${applications.length} applications`)

    // Score each application
    for (const application of applications) {
      try {
        console.log(`[v0] Scoring application for ${application.applicant_name}`)

        if (!application.resume_summary || !application.key_skills) {
          console.log(`[v0] Skipping ${application.applicant_name} - no resume data available`)
          scoringErrors.push(`Skipped ${application.applicant_name}: No resume data available`)
          continue
        }

        const scoringResult = realScoring.scoreApplication(application, criteriaWeights)

        const { error: updateError } = await supabase
          .from("applications")
          .update({
            scores: scoringResult.criteriaScores,
            total_score: scoringResult.totalScore,
            status: "scored",
            scored_at: new Date().toISOString(),
          })
          .eq("id", application.id)

        if (updateError) {
          console.error(`[v0] Error updating application ${application.id}:`, updateError)
          scoringErrors.push(`Failed to update ${application.applicant_name}: ${updateError.message}`)
        } else {
          scoredCount++
          console.log(`[v0] Successfully scored ${application.applicant_name}: ${scoringResult.totalScore}`)
        }
      } catch (error) {
        console.error(`[v0] Error scoring application ${application.id}:`, error)
        scoringErrors.push(`Failed to score ${application.applicant_name}: ${error.message}`)
      }
    }

    if (scoredCount > 0) {
      console.log(`[v0] Updating rankings for ${scoredCount} applications`)

      const { data: scoredApplications, error: fetchError } = await supabase
        .from("applications")
        .select("id, total_score, applicant_name")
        .eq("ranking_id", params.id)
        .not("total_score", "is", null)
        .order("total_score", { ascending: false })

      if (!fetchError && scoredApplications) {
        for (let i = 0; i < scoredApplications.length; i++) {
          const { error: rankError } = await supabase
            .from("applications")
            .update({ rank: i + 1 })
            .eq("id", scoredApplications[i].id)

          if (rankError) {
            console.error(`[v0] Error updating rank for ${scoredApplications[i].applicant_name}:`, rankError)
          }
        }

        console.log(`[v0] Updated rankings for ${scoredApplications.length} applications`)
      }
    }

    return NextResponse.json({
      message: `Successfully scored ${scoredCount} out of ${applications.length} applications`,
      scoredCount: scoredCount,
      totalApplications: applications.length,
      errors: scoringErrors.length > 0 ? scoringErrors : undefined,
    })
  } catch (error) {
    console.error("[v0] Error in scoring API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
