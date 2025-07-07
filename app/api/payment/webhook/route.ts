import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase"

let _stripe: Stripe | null = null
function getStripe() {
  if (_stripe) return _stripe
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) throw new Error("STRIPE_SECRET_KEY is not set")
  _stripe = new Stripe(secret, { apiVersion: "2024-06-20" })
  return _stripe
}

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = headers()
  const sig = headersList.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const caseId = session.metadata?.caseId

    if (caseId) {
      // Generate and store the AI verdict
      try {
        const { data: caseData } = await supabase.from("cases").select("*").eq("id", caseId).single()

        if (caseData) {
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

          const { verdict } = await verdictResponse.json()

          // Update case with verdict
          await supabase
            .from("cases")
            .update({
              verdict_unlocked: true,
              verdict_text: verdict,
            })
            .eq("id", caseId)
        }
      } catch (error) {
        console.error("Error processing payment:", error)
      }
    }
  }

  return NextResponse.json({ received: true })
}
