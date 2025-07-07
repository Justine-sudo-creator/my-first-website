import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { getCaseById, updateCaseVerdict } from "@/lib/data"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()

    console.log("🎣 Gumroad webhook received")
    console.log("📨 Raw body:", body)
    console.log("📋 Headers:", Object.fromEntries(headersList.entries()))

    // Gumroad sends form-encoded data, not JSON
    const formData = new URLSearchParams(body)

    // Log all form data
    console.log("📝 All form data:")
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`)
    }

    const saleId = formData.get("sale_id")
    const productId = formData.get("product_id")
    const caseId = formData.get("case_id") // This comes from our checkout URL
    const purchaserEmail = formData.get("purchaser_email")

    console.log("💰 Gumroad sale data:")
    console.log("- Sale ID:", saleId)
    console.log("- Product ID:", productId)
    console.log("- Case ID:", caseId)
    console.log("- Purchaser Email:", purchaserEmail)

    if (saleId && productId) {
      console.log("✅ Valid Gumroad sale detected")

      if (caseId) {
        console.log("🔍 Processing case ID:", caseId)

        try {
          const caseData = getCaseById(Number.parseInt(caseId))

          if (caseData) {
            console.log("📋 Found case:", caseData.title)
            console.log("🤖 Generating AI verdict...")

            // Test if the AI verdict endpoint is reachable
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
            const verdictUrl = `${baseUrl}/api/generate-verdict`

            console.log("🌐 Calling verdict API at:", verdictUrl)

            const verdictResponse = await fetch(verdictUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                caseTitle: caseData.title,
                caseDescription: caseData.description,
                tone: caseData.tone,
                votes: {
                  plaintiff: caseData.plaintiff_votes,
                  defendant: caseData.defendant_votes,
                  split: caseData.split_votes,
                },
              }),
            })

            console.log("📡 Verdict API response status:", verdictResponse.status)

            if (verdictResponse.ok) {
              const { verdict } = await verdictResponse.json()
              console.log("✅ Verdict generated successfully")
              console.log("📄 Verdict preview:", verdict.substring(0, 100) + "...")

              const success = updateCaseVerdict(Number.parseInt(caseId), verdict)

              if (success) {
                console.log("💾 Verdict saved to database successfully")
              } else {
                console.error("❌ Failed to save verdict to database")
              }
            } else {
              const errorText = await verdictResponse.text()
              console.error("❌ Failed to generate verdict:", verdictResponse.status, errorText)
            }
          } else {
            console.error("❌ Case not found for ID:", caseId)
          }
        } catch (error) {
          console.error("💥 Error processing case:", error)
        }
      } else {
        console.log("⚠️ No case ID provided in webhook data")
      }
    } else {
      console.log("ℹ️ Webhook received but missing sale_id or product_id")
    }

    return NextResponse.json({
      received: true,
      processed: !!saleId && !!productId,
      caseProcessed: !!caseId,
    })
  } catch (error) {
    console.error("💥 Gumroad webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
