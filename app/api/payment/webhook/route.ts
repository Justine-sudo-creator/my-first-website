import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { getCaseById, updateCaseVerdict } from "@/lib/data"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()

    console.log("🎣 Gumroad webhook received")

    // Parse the webhook data
    const webhookData = JSON.parse(body)
    console.log("📨 Webhook data:", webhookData)

    // Gumroad sends different event types
    if (webhookData.sale_id && webhookData.product_id) {
      const caseId = webhookData.custom_fields?.case_id || webhookData.case_id

      console.log("💰 Gumroad sale completed for case:", caseId)
      console.log("🛒 Sale ID:", webhookData.sale_id)
      console.log("📦 Product ID:", webhookData.product_id)

      if (caseId) {
        try {
          const caseData = getCaseById(Number.parseInt(caseId))

          if (caseData) {
            console.log("🤖 Generating AI verdict...")

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
              updateCaseVerdict(Number.parseInt(caseId), verdict)
              console.log("✅ Verdict generated and saved")
            } else {
              console.error("❌ Failed to generate verdict")
            }
          }
        } catch (error) {
          console.error("💥 Error processing Gumroad payment:", error)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("💥 Gumroad webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
