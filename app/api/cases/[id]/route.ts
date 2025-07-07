import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const caseId = Number.parseInt(params.id)

    const { data: caseData, error } = await supabase.from("cases").select("*").eq("id", caseId).single()

    if (error) throw error

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Get comments for this case
    const { data: comments } = await supabase
      .from("comments")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false })

    // Format the response to match frontend expectations
    const formattedCase = {
      id: caseData.id,
      title: caseData.title,
      description: caseData.description,
      tone: caseData.tone,
      submittedAt: new Date(caseData.created_at).toLocaleDateString(),
      votes: {
        plaintiff: caseData.plaintiff_votes,
        defendant: caseData.defendant_votes,
        split: caseData.split_votes,
      },
      comments:
        comments?.map((comment) => ({
          id: comment.id,
          vote: comment.vote_type,
          text: comment.content,
          likes: comment.likes,
          timestamp: new Date(comment.created_at).toLocaleDateString(),
        })) || [],
      evidence:
        caseData.evidence_urls?.map((url: string, index: number) => ({
          type: "image",
          name: `evidence_${index + 1}.jpg`,
          description: "Uploaded evidence",
          url,
        })) || [],
      verdict_unlocked: caseData.verdict_unlocked,
      verdict_text: caseData.verdict_text,
    }

    return NextResponse.json({ case: formattedCase })
  } catch (error) {
    console.error("Error fetching case:", error)
    return NextResponse.json({ error: "Failed to fetch case" }, { status: 500 })
  }
}
