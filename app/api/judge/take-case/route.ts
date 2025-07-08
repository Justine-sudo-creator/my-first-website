import { type NextRequest, NextResponse } from "next/server"
import { assignCaseToJudge, getOrCreateUser } from "@/lib/data"

export async function POST(request: NextRequest) {
  try {
    const { caseId } = await request.json()
    const clientIP = request.headers.get("x-forwarded-for") || "unknown"
    const user = getOrCreateUser(clientIP)

    if (!user.is_judge) {
      return NextResponse.json({ error: "Judge access required" }, { status: 403 })
    }

    const success = assignCaseToJudge(caseId, clientIP)

    if (success) {
      return NextResponse.json({ success: true, message: "Case assigned successfully" })
    } else {
      return NextResponse.json({ error: "Failed to assign case" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error taking case:", error)
    return NextResponse.json({ error: "Failed to take case" }, { status: 500 })
  }
}
