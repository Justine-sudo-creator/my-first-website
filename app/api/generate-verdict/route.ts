import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { caseTitle, caseDescription, tone, votes } = await request.json()

    const totalVotes = votes.plaintiff + votes.defendant + votes.split
    const plaintiffPercentage = Math.round((votes.plaintiff / totalVotes) * 100)
    const defendantPercentage = Math.round((votes.defendant / totalVotes) * 100)

    let systemPrompt = ""

    switch (tone) {
      case "serious":
        systemPrompt = `You are a satirical judge writing a mock-serious legal verdict for a petty dispute. Use professional legal language but with subtle humor. Reference the jury vote percentages and make it feel like a real court ruling while being entertaining.`
        break
      case "satirical":
        systemPrompt = `You are a witty, sarcastic judge writing a satirical legal verdict for a petty dispute. Use meme references, internet culture, and over-the-top legal language. Make it funny but still structured like a court ruling.`
        break
      case "unhinged":
        systemPrompt = `You are a completely chaotic judge writing an unhinged legal verdict for a petty dispute. Be dramatic, over-the-top, and absolutely ridiculous while still maintaining the structure of a court ruling. Use ALL CAPS for emphasis and be as extra as possible.`
        break
      default:
        systemPrompt = `You are a satirical judge writing a mock legal verdict for a petty dispute.`
    }

    const prompt = `
Case Title: ${caseTitle}
Case Description: ${caseDescription}
Jury Results: ${plaintiffPercentage}% voted for plaintiff, ${defendantPercentage}% voted for defendant, ${Math.round((votes.split / totalVotes) * 100)}% said both are wrong
Total Votes: ${totalVotes}

Write a complete legal verdict that:
1. Has a proper case header with case number
2. Addresses the evidence and arguments
3. References the jury vote percentages
4. Delivers a final ruling
5. Includes appropriate "sentences" or remedies
6. Ends with a judicial signature

Make it entertaining while following the ${tone} tone requested.
`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: prompt,
    })

    return NextResponse.json({ verdict: text })
  } catch (error) {
    console.error("Error generating verdict:", error)
    return NextResponse.json({ error: "Failed to generate verdict" }, { status: 500 })
  }
}
