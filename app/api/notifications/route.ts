import { type NextRequest, NextResponse } from "next/server"
import { getUserNotifications } from "@/lib/data"

export async function GET(request: NextRequest) {
  try {
    const clientIP = request.headers.get("x-forwarded-for") || "unknown"
    const notifications = getUserNotifications(clientIP)

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
