import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

// Define allowed tones and corresponding system prompts
const tonePrompts: Record<string, string> = {
  serious: `You are a satirical judge writing a mock-serious legal verdict for a petty dispute. Use professional legal language with subtle humor. Reference the jury vote percentages and maintain a court-like tone.`,
  satirical: `You are a witty, sarcastic judge writing a satirical legal verdict for a petty dispute. Use meme references, internet culture, and over-the-top legal language. Keep it structured like a court ruling, but make it funny.`,
  unhinged: `You are a completely chaotic judge writing an unhinged legal verdict. Be dramatic, absurd, and loud. Use all caps where needed and exaggerate everything while still producing a structured verdict.`,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { caseTitle, caseDescription, tone, votes } = body

    // 🛡 Input validation
    if (
      !caseTitle || typeof caseTitle !== "string" || caseTitle.length < 5 ||
      !caseDescription || typeof caseDescription !== "string" || caseDescription.length < 10 ||
      !votes || typeof votes !== "object"
    ) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 })
    }

    const allowedTones = Object.keys(tonePrompts)
    const selectedTone = allowedTones.includes(tone) ? tone : "serious"

    const { plaintiff = 0, defendant = 0, split = 0 } = votes
    const totalVotes = plaintiff + defendant + split

    if (totalVotes === 0) {
      return NextResponse.json({ error: "No votes received" }, { status: 400 })
    }

    // 🔢 Calculate percentages
    const percent = (v: number) => Math.round((v / totalVotes) * 100)
    const plaintiffPct = percent(plaintiff)
    const defendantPct = percent(defendant)
    const splitPct = 100 - plaintiffPct - defendantPct

    // 🧠 Build prompt
    const prompt = `
Case Title: ${caseTitle}
Case Description: ${caseDescription}
Jury Results: ${plaintiffPct}% voted for the plaintiff, ${defendantPct}% for the defendant, and ${splitPct}% said both are wrong.
Total Votes: ${totalVotes}

Write a full legal verdict that:
1. Includes a case header and number
2. Summarizes arguments or events
3. Analyzes the votes
4. Issues a dramatic or funny final ruling
5. Prescribes a ridiculous or ironic "sentence"
6. Ends with a judge's name and signature

Tone: ${selectedTone}
`

    // 🤖 Call OpenAI via ai-sdk
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: tonePrompts[selectedTone],
      prompt,
    })

    return NextResponse.json({ verdict: text })
  } catch (err) {
    console.error("❌ Verdict generation failed:", err)
    return NextResponse.json({ error: "Verdict generation failed" }, { status: 500 })
  }
}
