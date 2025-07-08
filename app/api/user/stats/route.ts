import { type NextRequest, NextResponse } from "next/server"
import { getUserStats } from "@/lib/data"

export async function GET(request: NextRequest) {
  try {
    const clientIP = request.headers.get("x-forwarded-for") || "unknown"
    const userStats = getUserStats(clientIP)

    // Format for frontend (hide IP address)
    const formattedStats = {
      id: `Judge${userStats.id.slice(-4)}`,
      karma_points: userStats.karma_points,
      level: userStats.level,
      title: userStats.title,
      badges: userStats.badges,
      cases_voted: userStats.cases_voted,
      cases_submitted: userStats.cases_submitted,
      verdict_accuracy: userStats.verdict_accuracy,
    }

    return NextResponse.json({ user: formattedStats })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json({ error: "Failed to fetch user stats" }, { status: 500 })
  }
}
