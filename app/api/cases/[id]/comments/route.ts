import { type NextRequest, NextResponse } from "next/server"
import { getCommentsForCase } from "@/lib/data"

// Add comment functionality to data.ts first
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { content, voteType } = await request.json()
    const caseId = Number.parseInt(params.id)
    const clientIP = request.headers.get("x-forwarded-for") || "unknown"

    if (!content || !voteType) {
      return NextResponse.json({ error: "Content and vote type are required" }, { status: 400 })
    }

    if (content.length > 500) {
      return NextResponse.json({ error: "Comment too long (max 500 characters)" }, { status: 400 })
    }

    // Import the addComment function we'll create
    const { addComment } = await import("@/lib/data")

    const comment = await addComment(caseId, content, voteType, clientIP)

    if (!comment) {
      return NextResponse.json({ error: "Failed to add comment" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        vote: comment.vote_type,
        text: comment.content,
        likes: comment.likes,
        timestamp: new Date(comment.created_at).toLocaleDateString(),
      },
    })
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const caseId = Number.parseInt(params.id)
    const comments = getCommentsForCase(caseId)

    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      vote: comment.vote_type,
      text: comment.content,
      likes: comment.likes,
      timestamp: new Date(comment.created_at).toLocaleDateString(),
    }))

    return NextResponse.json({ comments: formattedComments })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}
