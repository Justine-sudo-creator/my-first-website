import { type NextRequest, NextResponse } from "next/server"
import { getCaseById, getVerdictByCaseId, getCommentsForCase, getOrCreateUser } from "@/lib/data"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const caseId = Number.parseInt(params.id)

    const caseData = getCaseById(caseId)
    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    const verdict = getVerdictByCaseId(caseId)
    const comments = getCommentsForCase(caseId)

    // Get judge info if verdict exists
    let judgeInfo = null
    if (verdict) {
      const judge = getOrCreateUser(verdict.judge_id)
      judgeInfo = {
        username: judge.username,
        avatar: judge.avatar,
        title: judge.title,
        rating: judge.judge_rating,
      }
    }

    const formattedCase = {
      id: caseData.id,
      title: caseData.title,
      description: caseData.description,
      tone: caseData.tone,
      theme: caseData.theme,
      submittedAt: new Date(caseData.created_at).toLocaleDateString(),
      votes: {
        plaintiff: caseData.plaintiff_votes,
        defendant: caseData.defendant_votes,
        split: caseData.split_votes,
      },
      status: caseData.status,
      comments: comments.map((c) => ({
        id: c.id,
        vote: c.vote_type,
        text: c.content,
        likes: c.likes,
        timestamp: new Date(c.created_at).toLocaleDateString(),
      })),
      evidence: Array.isArray(caseData.evidence_urls)
        ? caseData.evidence_urls.map((url, i) => ({
            type: "image",
            name: `evidence_${i + 1}`,
            description: "Uploaded evidence",
            url,
          }))
        : [],
      verdict: verdict
        ? {
            text: verdict.verdict_text,
            judge: judgeInfo,
            likes: verdict.likes,
            tips_received: verdict.tips_received,
            created_at: verdict.created_at,
          }
        : null,
    }

    return NextResponse.json({ case: formattedCase })
  } catch (err) {
    console.error("Error fetching case:", err)
    return NextResponse.json({ error: "Failed to fetch case" }, { status: 500 })
  }
}
