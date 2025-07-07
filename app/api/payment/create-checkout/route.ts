import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🏪 Creating Gumroad checkout session...")

    const { caseId } = await request.json()
    console.log("📋 Case ID:", caseId)

    if (!caseId) {
      console.error("❌ No case ID provided")
      return NextResponse.json({ error: "Case ID is required" }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const gumroadProductId = process.env.GUMROAD_PRODUCT_ID

    console.log("🔑 Gumroad product ID available:", !!gumroadProductId)
    console.log("🌐 Base URL:", baseUrl)

    if (!gumroadProductId) {
      console.warn("[payment] Gumroad product ID missing – falling back to DEMO mode")

      return NextResponse.json({
        checkoutUrl: `${baseUrl}/case/${caseId}?payment=demo-success`,
        sessionId: `demo_${Date.now()}`,
        mode: "demo",
      })
    }

    // Create Gumroad checkout URL
    const checkoutUrl = `https://gumroad.com/l/${gumroadProductId}?wanted=true&case_id=${caseId}`

    console.log("✅ Gumroad checkout URL created:", checkoutUrl)

    return NextResponse.json({
      checkoutUrl: checkoutUrl,
      sessionId: `gumroad_${Date.now()}`,
      mode: "gumroad",
    })
  } catch (error) {
    console.error("💥 Error creating checkout session:", error)

    // Fallback to demo mode
    const { caseId } = await request.json().catch(() => ({ caseId: null }))
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    return NextResponse.json({
      checkoutUrl: `${baseUrl}/case/${caseId}?payment=demo-success`,
      sessionId: "demo_session_" + Date.now(),
      mode: "demo",
      error: "Gumroad unavailable - using demo mode",
    })
  }
}
