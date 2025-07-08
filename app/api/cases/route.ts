import { type NextRequest, NextResponse } from "next/server"
import { getAllCases, createCase, getVerdictByCaseId, getOrCreateUser } from "@/lib/data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const sortBy = searchParams.get("sortBy") || "recent"
    const search = searchParams.get("search")
    const status = searchParams.get("status")

    let allCases = await getAllCases({ sortBy, status: status || undefined })

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase()
      allCases = allCases.filter(
        (case_) =>
          case_.title.toLowerCase().includes(searchLower) || case_.description.toLowerCase().includes(searchLower),
      )
    }

    // Paginate
    const paginatedCases = allCases.slice(offset, offset + limit)

    // Format for frontend with verdict info
    const formattedCases = paginatedCases.map((case_) => {
      const verdict = getVerdictByCaseId(case_.id)
      let judgeInfo = null
      let verdictPreview = null

      if (verdict) {
        const judge = getOrCreateUser(verdict.judge_id)
        judgeInfo = {
          username: judge.username,
          avatar: judge.avatar,
        }
        // Get first 2-3 lines for preview
        const lines = verdict.verdict_text.split("\n").filter((line) => line.trim())
        verdictPreview = lines.slice(0, 3).join("\n") + (lines.length > 3 ? "..." : "")
      }

      return {
        id: case_.id,
        title: case_.title,
        description: case_.description,
        tone: case_.tone,
        theme: case_.theme,
        submittedAt: new Date(case_.created_at).toLocaleDateString(),
        votes: {
          plaintiff: case_.plaintiff_votes,
          defendant: case_.defendant_votes,
          split: case_.split_votes,
        },
        status: case_.status,
        verdict: verdict
          ? {
              preview: verdictPreview,
              judge: judgeInfo,
              likes: verdict.likes,
            }
          : null,
        comments: 0, // TODO: Add actual comment count if needed
      }
    })

    return NextResponse.json({ cases: formattedCases })
  } catch (error) {
    console.error("Error fetching cases:", error)
    return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, tone, evidenceUrls = [], theme } = await request.json()

    // Basic validation
    if (!title || !description || !tone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const clientIP = request.headers.get("x-forwarded-for") || "unknown"

    const newCase = await createCase({
      title,
      description,
      tone,
      theme,
      evidence_urls: evidenceUrls,
      submitter_id: clientIP,
      is_featured: false,
    })

    return NextResponse.json({ case: newCase })
  } catch (error) {
    console.error("Error creating case:", error)
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 })
  }
}
