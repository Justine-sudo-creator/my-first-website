import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const { caseId } = await request.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `AI Verdict for Case #${caseId}`,
              description: "Unlock your personalized AI-generated legal ruling",
              images: ["https://your-domain.com/verdict-icon.png"],
            },
            unit_amount: 300, // $3.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/case/${caseId}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/case/${caseId}?payment=cancelled`,
      metadata: {
        caseId: caseId.toString(),
      },
    })

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
