import { type NextRequest, NextResponse } from "next/server"
import { applyToBeJudge, getOrCreateUser } from "@/lib/data"

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get("x-forwarded-for") || "unknown"
    const user = getOrCreateUser(clientIP)

    if (user.karma_points < 50) {
      return NextResponse.json(
        {
          error: "You need at least 50 karma points to become a judge",
          current_karma: user.karma_points,
        },
        { status: 400 },
      )
    }

    if (user.is_judge) {
      return NextResponse.json({ error: "You are already a judge" }, { status: 400 })
    }

    const success = applyToBeJudge(clientIP)

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Congratulations! You are now a verified judge!",
      })
    } else {
      return NextResponse.json({ error: "Failed to process judge application" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing judge application:", error)
    return NextResponse.json({ error: "Failed to process application" }, { status: 500 })
  }
}
