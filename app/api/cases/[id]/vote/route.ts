import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { vote } = await request.json()
    const caseId = Number.parseInt(params.id)
    const clientIP = request.headers.get("x-forwarded-for") || "unknown"

    // Check if user has already voted
    const { data: existingVote } = await supabase
      .from("votes")
      .select("id")
      .eq("case_id", caseId)
      .eq("ip_address", clientIP)
      .single()

    if (existingVote) {
      return NextResponse.json({ error: "You have already voted on this case" }, { status: 400 })
    }

    // Insert the vote
    const { error } = await supabase.from("votes").insert({
      case_id: caseId,
      vote_type: vote,
      ip_address: clientIP,
    })

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: "Vote recorded successfully",
    })
  } catch (error) {
    console.error("Error recording vote:", error)
    return NextResponse.json({ error: "Failed to record vote" }, { status: 500 })
  }
}
