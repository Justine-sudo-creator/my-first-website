import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("🧪 Running test verdict generation...")

    const testCase = {
      caseTitle: "Test Case: My roommate ate my pizza",
      caseDescription: "I clearly labeled it with my name and they ate it anyway. This is the third time!",
      tone: "satirical",
      votes: {
        plaintiff: 45,
        defendant: 15,
        split: 10,
      },
    }

    const total = testCase.votes.plaintiff + testCase.votes.defendant + testCase.votes.split
    const pPct = Math.round((testCase.votes.plaintiff / total) * 100)
    const dPct = Math.round((testCase.votes.defendant / total) * 100)
    const sPct = 100 - pPct - dPct

    const systemPrompt = `You are a sarcastic judge writing a legal-style verdict with meme culture and internet satire.`

    const prompt = `
Case Title: ${testCase.caseTitle}
Case Description: ${testCase.caseDescription}
Jury Results: ${pPct}% for plaintiff, ${dPct}% for defendant, ${sPct}% said both are wrong

Write a satirical legal verdict with:
- a dramatic intro
- summary of arguments
- analysis of jury results
- a final ruling with ironic punishment
- a judge’s signature
`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt,
    })

    return NextResponse.json({
      success: true,
      verdict: text,
      testData: testCase,
    })
  } catch (err) {
    console.error("❌ Error generating verdict:", err)
    return NextResponse.json({ success: false, error: "Verdict test failed" }, { status: 500 })
  }
}
