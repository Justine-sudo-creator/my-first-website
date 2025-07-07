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
      console.error("❌ GUMROAD_PRODUCT_ID environment variable is not set")
      return NextResponse.json(
        {
          error: "Payment system not configured. Please contact support.",
        },
        { status: 500 },
      )
    }

    // Create Gumroad checkout URL with success redirect
    const checkoutUrl = new URL(`https://gumroad.com/l/${gumroadProductId}`)

    // Add parameters for better UX
    checkoutUrl.searchParams.set("wanted", "true") // Skip product page, go straight to checkout
    checkoutUrl.searchParams.set("case_id", caseId.toString()) // Track which case this is for

    // Set up redirect URL for after successful purchase
    const successUrl = `${baseUrl}/case/${caseId}?payment=success&source=gumroad`
    checkoutUrl.searchParams.set("redirect_url", successUrl)

    console.log("✅ Gumroad checkout URL created:", checkoutUrl.toString())

    return NextResponse.json({
      checkoutUrl: checkoutUrl.toString(),
      sessionId: `gumroad_${caseId}_${Date.now()}`,
      mode: "gumroad",
      productId: gumroadProductId,
    })
  } catch (error) {
    console.error("💥 Error creating Gumroad checkout session:", error)

    return NextResponse.json(
      {
        error: "Failed to create checkout session. Please try again.",
      },
      { status: 500 },
    )
  }
}
