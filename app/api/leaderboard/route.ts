import { type NextRequest, NextResponse } from "next/server"
import { getLeaderboard } from "@/lib/data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const leaderboard = getLeaderboard(limit)

    // Format for frontend (hide IP addresses)
    const formattedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      id: `Judge${user.id.slice(-4)}`, // Show last 4 chars of IP as anonymous ID
      karma_points: user.karma_points,
      level: user.level,
      title: user.title,
      badges: user.badges,
      cases_voted: user.cases_voted,
      cases_submitted: user.cases_submitted,
      verdict_accuracy: user.verdict_accuracy,
    }))

    return NextResponse.json({ leaderboard: formattedLeaderboard })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
