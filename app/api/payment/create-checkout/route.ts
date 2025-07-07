import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🏪 Creating PayMongo checkout session...")

    const { caseId } = await request.json()
    console.log("📋 Case ID:", caseId)

    if (!caseId) {
      console.error("❌ No case ID provided")
      return NextResponse.json({ error: "Case ID is required" }, { status: 400 })
    }

    // Check if PayMongo keys are available
    const paymongoSecretKey = process.env.PAYMONGO_SECRET_KEY
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    console.log("🔑 PayMongo secret key available:", !!paymongoSecretKey)
    console.log("🌐 Base URL:", baseUrl)

    if (!paymongoSecretKey) {
      console.warn("[payment] PayMongo keys missing – falling back to Gumroad mode")

      // Check if Gumroad keys are available
      const gumroadAccessToken = process.env.GUMROAD_ACCESS_TOKEN
      const gumroadProductId = process.env.GUMROAD_PRODUCT_ID

      console.log("🔑 Gumroad access token available:", !!gumroadAccessToken)
      console.log("📦 Gumroad product ID available:", !!gumroadProductId)

      if (!gumroadAccessToken || !gumroadProductId) {
        console.warn("[payment] Gumroad keys missing – falling back to DEMO mode")

        return NextResponse.json({
          checkoutUrl: `${baseUrl}/case/${caseId}?payment=demo-success`,
          sessionId: `demo_${Date.now()}`,
          mode: "demo",
        })
      }

      // Create Gumroad checkout URL with custom fields
      const checkoutUrl = new URL(`https://gumroad.com/l/${gumroadProductId}`)

      // Add custom parameters
      checkoutUrl.searchParams.set("wanted", "true") // Auto-redirect to checkout
      checkoutUrl.searchParams.set("case_id", caseId.toString())
      checkoutUrl.searchParams.set("redirect_url", `${baseUrl}/case/${caseId}?payment=success`)

      // Optional: Set custom price if you want dynamic pricing
      // checkoutUrl.searchParams.set('price', '150') // ₱150 in PHP

      console.log("✅ Gumroad checkout URL created:", checkoutUrl.toString())

      return NextResponse.json({
        checkoutUrl: checkoutUrl.toString(),
        sessionId: `gumroad_${Date.now()}`,
        mode: "gumroad",
      })
    }

    // Create PayMongo checkout session
    const checkoutData = {
      data: {
        attributes: {
          send_email_receipt: false,
          show_description: true,
          show_line_items: true,
          line_items: [
            {
              currency: "PHP",
              amount: 15000, // ₱150.00 (amount in centavos)
              description: "AI Verdict Unlock",
              name: `PettyCourt Case #${caseId} Verdict`,
              quantity: 1,
            },
          ],
          payment_method_types: [
            "card",
            "gcash",
            "grab_pay",
            "paymaya",
            "billease",
            "dob",
            "dob_ubp",
            "brankas_bdo",
            "brankas_landbank",
            "brankas_metrobank",
          ],
          success_url: `${baseUrl}/case/${caseId}?payment=success`,
          cancel_url: `${baseUrl}/case/${caseId}?payment=cancelled`,
          description: `Unlock AI verdict for PettyCourt Case #${caseId}`,
          metadata: {
            case_id: caseId.toString(),
          },
        },
      },
    }

    const response = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(paymongoSecretKey + ":").toString("base64")}`,
      },
      body: JSON.stringify(checkoutData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("PayMongo API error:", errorData)
      throw new Error(`PayMongo API error: ${response.status}`)
    }

    const session = await response.json()
    console.log("✅ PayMongo session created:", session.data.id)
    console.log("🔗 Checkout URL:", session.data.attributes.checkout_url)

    return NextResponse.json({
      checkoutUrl: session.data.attributes.checkout_url,
      sessionId: session.data.id,
      mode: "paymongo",
    })
  } catch (error) {
    console.error("💥 Error creating PayMongo checkout session:", error)

    // Fallback to Gumroad mode if PayMongo fails
    const { caseId } = await request.json().catch(() => ({ caseId: null }))
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    // Check if Gumroad keys are available
    const gumroadAccessToken = process.env.GUMROAD_ACCESS_TOKEN
    const gumroadProductId = process.env.GUMROAD_PRODUCT_ID

    console.log("🔑 Gumroad access token available:", !!gumroadAccessToken)
    console.log("📦 Gumroad product ID available:", !!gumroadProductId)

    if (!gumroadAccessToken || !gumroadProductId) {
      console.warn("[payment] Gumroad keys missing – falling back to DEMO mode")

      return NextResponse.json({
        checkoutUrl: `${baseUrl}/case/${caseId}?payment=demo-success`,
        sessionId: "demo_session_" + Date.now(),
        mode: "demo",
        error: "PayMongo and Gumroad unavailable - using demo mode",
      })
    }

    // Create Gumroad checkout URL with custom fields
    const checkoutUrl = new URL(`https://gumroad.com/l/${gumroadProductId}`)

    // Add custom parameters
    checkoutUrl.searchParams.set("wanted", "true") // Auto-redirect to checkout
    checkoutUrl.searchParams.set("case_id", caseId.toString())
    checkoutUrl.searchParams.set("redirect_url", `${baseUrl}/case/${caseId}?payment=success`)

    // Optional: Set custom price if you want dynamic pricing
    // checkoutUrl.searchParams.set('price', '150') // ₱150 in PHP

    console.log("✅ Gumroad checkout URL created:", checkoutUrl.toString())

    return NextResponse.json({
      checkoutUrl: checkoutUrl.toString(),
      sessionId: `gumroad_${Date.now()}`,
      mode: "gumroad",
      error: "PayMongo unavailable - using Gumroad mode",
    })
  }
}
