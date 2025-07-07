import { type NextRequest, NextResponse } from "next/server"
import { getAllCases } from "@/lib/data"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Debug endpoint called")

    // Check environment variables
    const envCheck = {
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      GUMROAD_PRODUCT_ID: process.env.GUMROAD_PRODUCT_ID ? "SET" : "NOT SET",
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    }

    // Check if AI SDK is working
    let aiCheck = "NOT TESTED"
    try {
      const testResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/test-verdict`, {
        method: "POST",
      })
      aiCheck = testResponse.ok ? "WORKING" : `FAILED: ${testResponse.status}`
    } catch (error) {
      aiCheck = `ERROR: ${error.message}`
    }

    // Get current cases
    const cases = getAllCases()

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      aiVerdictAPI: aiCheck,
      casesCount: cases.length,
      cases: cases.map((c) => ({
        id: c.id,
        title: c.title,
        verdict_unlocked: c.verdict_unlocked,
        votes: {
          plaintiff: c.plaintiff_votes,
          defendant: c.defendant_votes,
          split: c.split_votes,
        },
      })),
    })
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
