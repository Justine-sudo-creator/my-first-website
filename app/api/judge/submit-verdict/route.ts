import { type NextRequest, NextResponse } from "next/server"
import { submitVerdict, getOrCreateUser } from "@/lib/data"

export async function POST(request: NextRequest) {
  try {
    const { caseId, verdictText } = await request.json()
    const clientIP = request.headers.get("x-forwarded-for") || "unknown"
    const user = getOrCreateUser(clientIP)

    if (!user.is_judge) {
      return NextResponse.json({ error: "Judge access required" }, { status: 403 })
    }

    if (!verdictText || verdictText.trim().length < 50) {
      return NextResponse.json({ error: "Verdict must be at least 50 characters" }, { status: 400 })
    }

    const success = submitVerdict(caseId, clientIP, verdictText.trim())

    if (success) {
      return NextResponse.json({ success: true, message: "Verdict submitted successfully" })
    } else {
      return NextResponse.json({ error: "Failed to submit verdict" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error submitting verdict:", error)
    return NextResponse.json({ error: "Failed to submit verdict" }, { status: 500 })
  }
}
