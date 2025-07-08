import { type NextRequest, NextResponse } from "next/server"
import { getCasesAwaitingVerdict, getOrCreateUser } from "@/lib/data"

export async function GET(request: NextRequest) {
  try {
    const clientIP = request.headers.get("x-forwarded-for") || "unknown"
    const user = getOrCreateUser(clientIP)

    if (!user.is_judge) {
      return NextResponse.json({ error: "Judge access required" }, { status: 403 })
    }

    const pendingCases = getCasesAwaitingVerdict()

    // Format for frontend
    const formattedCases = pendingCases.map((case_) => ({
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
    }))

    return NextResponse.json({ cases: formattedCases })
  } catch (error) {
    console.error("Error fetching pending cases:", error)
    return NextResponse.json({ error: "Failed to fetch pending cases" }, { status: 500 })
  }
}
