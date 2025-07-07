import { type NextRequest, NextResponse } from "next/server"
import { getAllCases, createCase } from "@/lib/data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const search = searchParams.get("search")

    let allCases = await getAllCases()

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase()
      allCases = allCases.filter(
        (case_) =>
          case_.title.toLowerCase().includes(searchLower) || case_.description.toLowerCase().includes(searchLower),
      )
    }

    // Sort cases
    if (sortBy === "trending") {
      allCases.sort((a, b) => {
        const totalA = a.plaintiff_votes + a.defendant_votes + a.split_votes
        const totalB = b.plaintiff_votes + b.defendant_votes + b.split_votes
        return totalB - totalA
      })
    }

    // Paginate
    const paginatedCases = allCases.slice(offset, offset + limit)

    // Format for frontend
    const formattedCases = paginatedCases.map((case_) => ({
      id: case_.id,
      title: case_.title,
      description: case_.description,
      tone: case_.tone,
      submittedAt: new Date(case_.created_at).toLocaleDateString(),
      votes: {
        plaintiff: case_.plaintiff_votes,
        defendant: case_.defendant_votes,
        split: case_.split_votes,
      },
      status: case_.verdict_unlocked ? "Verdict Ready" : "Jury Voting",
      comments: 0, // TODO: Add actual comment count
    }))

    return NextResponse.json({ cases: formattedCases })
  } catch (error) {
    console.error("Error fetching cases:", error)
    return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, tone, evidenceUrls = [] } = await request.json()

    // Basic validation
    if (!title || !description || !tone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Content moderation - basic profanity filter
    const profanityWords = ["fuck", "shit", "damn", "bitch", "asshole"]
    const contentToCheck = `${title} ${description}`.toLowerCase()

    const hasProfanity = profanityWords.some((word) => contentToCheck.includes(word))
    if (hasProfanity) {
      return NextResponse.json(
        { error: "Content contains inappropriate language. Please revise and resubmit." },
        { status: 400 },
      )
    }

    const clientIP = request.headers.get("x-forwarded-for") || "unknown"

    const newCase = await createCase({
      title,
      description,
      tone,
      evidence_urls: evidenceUrls,
      ip_address: clientIP,
    })

    return NextResponse.json({ case: newCase })
  } catch (error) {
    console.error("Error creating case:", error)
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 })
  }
}
