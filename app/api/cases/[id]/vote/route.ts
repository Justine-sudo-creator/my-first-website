import { type NextRequest, NextResponse } from "next/server"
import { addVote, hasUserVoted } from "@/lib/data"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { vote } = await request.json()
    const caseId = Number.parseInt(params.id)
    const clientIP = request.headers.get("x-forwarded-for") || "unknown"

    // Check if user has already voted
    if (hasUserVoted(caseId, clientIP)) {
      return NextResponse.json({ error: "You have already voted on this case" }, { status: 400 })
    }

    // Add the vote
    const success = await addVote(caseId, vote, clientIP)

    if (!success) {
      return NextResponse.json({ error: "Failed to record vote" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Vote recorded successfully",
    })
  } catch (error) {
    console.error("Error recording vote:", error)
    return NextResponse.json({ error: "Failed to record vote" }, { status: 500 })
  }
}
