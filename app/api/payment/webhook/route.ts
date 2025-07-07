import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { getCaseById, updateCaseVerdict } from "@/lib/data"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()

    console.log("🎣 Gumroad webhook received")
    console.log("📨 Raw body:", body)

    // Gumroad sends form-encoded data, not JSON
    const formData = new URLSearchParams(body)
    const saleId = formData.get("sale_id")
    const productId = formData.get("product_id")
    const caseId = formData.get("case_id") // This comes from our checkout URL

    console.log("💰 Gumroad sale data:")
    console.log("- Sale ID:", saleId)
    console.log("- Product ID:", productId)
    console.log("- Case ID:", caseId)

    if (saleId && productId && caseId) {
      console.log("✅ Valid Gumroad sale for case:", caseId)

      try {
        const caseData = getCaseById(Number.parseInt(caseId))

        if (caseData) {
          console.log("🤖 Generating AI verdict for case:", caseData.title)

          // Generate verdict using AI
          const verdictResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/generate-verdict`, {
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

          if (verdictResponse.ok) {
            const { verdict } = await verdictResponse.json()
            const success = updateCaseVerdict(Number.parseInt(caseId), verdict)

            if (success) {
              console.log("✅ Verdict generated and saved successfully")
            } else {
              console.error("❌ Failed to save verdict to database")
            }
          } else {
            console.error("❌ Failed to generate verdict:", await verdictResponse.text())
          }
        } else {
          console.error("❌ Case not found:", caseId)
        }
      } catch (error) {
        console.error("💥 Error processing Gumroad payment:", error)
      }
    } else {
      console.log("ℹ️ Webhook received but missing required data")
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("💥 Gumroad webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
