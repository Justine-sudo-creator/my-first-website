import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const search = searchParams.get("search")

    let query = supabase
      .from("cases")
      .select("*")
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Sort by total votes for trending
    if (sortBy === "trending") {
      query = query.order("plaintiff_votes", { ascending: false })
    } else {
      query = query.order(sortBy, { ascending: false })
    }

    const { data: cases, error } = await query

    if (error) throw error

    // Format cases for frontend
    const formattedCases =
      cases?.map((case_) => ({
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
        comments: 0, // TODO: Add comment count
      })) || []

    return NextResponse.json({ cases: formattedCases })
  } catch (error) {
    console.error("Error fetching cases:", error)
    return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, tone, evidenceUrls = [] } = await request.json()

    // Content moderation - basic profanity filter
    const profanityWords = ["fuck", "shit", "damn", "bitch", "asshole"] // Add more as needed
    const contentToCheck = `${title} ${description}`.toLowerCase()

    const hasProfanity = profanityWords.some((word) => contentToCheck.includes(word))
    if (hasProfanity) {
      return NextResponse.json(
        {
          error: "Content contains inappropriate language. Please revise and resubmit.",
        },
        { status: 400 },
      )
    }

    // Rate limiting check (simple IP-based)
    const clientIP = request.headers.get("x-forwarded-for") || "unknown"

    const { data: recentCases } = await supabase
      .from("cases")
      .select("created_at")
      .eq("ip_address", clientIP)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (recentCases && recentCases.length >= 3) {
      return NextResponse.json({ error: "Rate limit exceeded. Maximum 3 cases per day." }, { status: 429 })
    }

    const { data: newCase, error } = await supabase
      .from("cases")
      .insert({
        title,
        description,
        tone,
        evidence_urls: evidenceUrls,
        plaintiff_votes: 0,
        defendant_votes: 0,
        split_votes: 0,
        ip_address: clientIP,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ case: newCase })
  } catch (error) {
    console.error("Error creating case:", error)
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 })
  }
}
