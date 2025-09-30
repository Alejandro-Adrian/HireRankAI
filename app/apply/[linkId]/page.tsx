import { createAdminClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import ApplicationForm from "@/components/ApplicationForm"

interface PageProps {
  params: { linkId: string }
}

export default async function ApplicationPage({ params }: PageProps) {
  const supabase = await createAdminClient()

  console.log("[v0] ========== APPLICATION PAGE DEBUG ==========")
  console.log("[v0] Fetching ranking for linkId:", params.linkId)

  const { data: ranking, error: rankingError } = await supabase
    .from("rankings")
    .select("*")
    .eq("application_link_id", params.linkId)
    .eq("is_active", true)
    .single()

  if (rankingError || !ranking) {
    console.error("[v0] ❌ Error fetching ranking:", rankingError)
    console.error("[v0] LinkId:", params.linkId)
    notFound()
  }

  console.log("[v0] ✅ Found ranking:", {
    id: ranking.id,
    title: ranking.title,
    created_by: ranking.created_by,
    created_by_type: typeof ranking.created_by,
  })

  console.log("[v0] Fetching user with ID:", ranking.created_by)

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, firstname, lastname, company_name, email")
    .eq("id", ranking.created_by)
    .single()

  console.log("[v0] User query result:", {
    user,
    userError,
    hasUser: !!user,
    userFields: user ? Object.keys(user) : [],
  })

  let fullName = ""
  let companyName = ""

  if (user && !userError) {
    const firstName = user.firstname?.trim() || ""
    const lastName = user.lastname?.trim() || ""
    fullName = `${firstName} ${lastName}`.trim()

    console.log("[v0] Name parts:", { firstName, lastName, fullName })

    // If no full name, try email prefix
    if (!fullName && user.email) {
      fullName = user.email.split("@")[0]
      console.log("[v0] Using email prefix as name:", fullName)
    }

    // Get company name
    companyName = user.company_name?.trim() || ""
    console.log("[v0] Company name:", companyName)
  } else {
    console.log("[v0] ⚠️ No user data found or error occurred")
  }

  if (!fullName) {
    console.log("[v0] ⚠️ No name found, using fallback 'HR Team'")
    fullName = "HR Team"
  }
  if (!companyName) {
    console.log("[v0] ⚠️ No company found, using fallback 'Company'")
    companyName = "Company"
  }

  const enrichedRanking = {
    ...ranking,
    created_by_name: fullName,
    company_name: companyName,
  }

  console.log("[v0] ✅ Final enriched ranking data:", {
    id: ranking.id,
    created_by: ranking.created_by,
    created_by_name: enrichedRanking.created_by_name,
    company_name: enrichedRanking.company_name,
  })
  console.log("[v0] ========== END DEBUG ==========")

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">{ranking.title}</h1>
          <p className="text-lg text-muted-foreground capitalize">{ranking.position.replace("/", " / ")}</p>
          {ranking.description && <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">{ranking.description}</p>}
        </div>

        <ApplicationForm ranking={enrichedRanking} />
      </div>
    </div>
  )
}
