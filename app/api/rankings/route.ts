import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: rankings, error } = await supabase
      .from("rankings")
      .select(`
        *,
        applications:applications(count)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching rankings:", error)
      return NextResponse.json({ error: "Failed to fetch rankings" }, { status: 500 })
    }

    // Transform the data to include application counts
    const transformedRankings =
      rankings?.map((ranking) => ({
        ...ranking,
        applications_count: ranking.applications?.[0]?.count || 0,
      })) || []

    return NextResponse.json(transformedRankings)
  } catch (error) {
    console.error("Error in rankings API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Starting ranking creation...")
    const supabase = await createClient()

    const body = await request.json()
    console.log("Request body:", body)

    const { title, position, description, criteria, criteriaWeights, areaLivingCity, showCriteriaToApplicants } = body

    // Validate required fields
    if (!title || !position || !criteriaWeights) {
      console.log("Validation failed - missing fields:", { title, position, criteriaWeights })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const validPositions = [
      "kitchen-helper",
      "server/waiter",
      "housekeeping",
      "cashier",
      "barista",
      "gardener",
      "receptionist",
    ]
    if (!validPositions.includes(position)) {
      console.log("Invalid position:", position)
      return NextResponse.json({ error: "Invalid position" }, { status: 400 })
    }

    const linkId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    console.log("Generated linkId:", linkId)

    const insertData = {
      title,
      position,
      description,
      criteria_weights: criteriaWeights,
      area_city: areaLivingCity,
      is_active: true,
      application_link_id: linkId,
      created_by: null,
      show_criteria_to_applicants: showCriteriaToApplicants !== false, // Default to true if not specified
    }

    console.log("Inserting data:", insertData)

    const { data: ranking, error } = await supabase.from("rankings").insert(insertData).select().single()

    if (error) {
      console.error("Supabase error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return NextResponse.json(
        {
          error: "Failed to create ranking",
          details: error.message,
          supabaseError: error,
        },
        { status: 500 },
      )
    }

    console.log("Successfully created ranking:", ranking)
    return NextResponse.json({ ...ranking, linkId }, { status: 201 })
  } catch (error) {
    console.error("Unexpected error in rankings POST API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
