"use client"

import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Gavel,
  Users,
  MessageCircle,
  Share2,
  ArrowLeft,
  Crown,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Loader2,
  AlertCircle,
  Send,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"

export default function CaseDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const isNewCase = searchParams.get("new") === "true"
  const caseId = params.id as string

  const [hasVoted, setHasVoted] = useState(false)
  const [userVote, setUserVote] = useState<"plaintiff" | "defendant" | "split" | null>(null)
  const [comment, setComment] = useState("")
  const [caseData, setCaseData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCase = async () => {
    try {
      setError(null)
      const response = await fetch(`/api/cases/${caseId}`)
      const data = await response.json()

      if (response.ok) {
        setCaseData(data.case)
      } else {
        setError(data.error || "Failed to load case")
      }
    } catch (error) {
      console.error("Failed to fetch case:", error)
      setError("Failed to load case")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCase()
  }, [caseId])

  const handleVote = async (vote: "plaintiff" | "defendant" | "split") => {
    if (!hasVoted) {
      try {
        const response = await fetch(`/api/cases/${caseId}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vote }),
        })

        if (response.ok) {
          setUserVote(vote)
          setHasVoted(true)
          fetchCase() // Refresh to show updated vote counts
        } else {
          const error = await response.json()
          alert(error.error || "Failed to vote")
        }
      } catch (error) {
        console.error("Failed to vote:", error)
        alert("Failed to vote")
      }
    }
  }

  const handlePostComment = async () => {
    if (!comment.trim() || !userVote || commentLoading) return

    setCommentLoading(true)
    try {
      const response = await fetch(`/api/cases/${caseId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: comment.trim(),
          voteType: userVote,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Add the new comment to the case data
        setCaseData((prev: any) => ({
          ...prev,
          comments: [data.comment, ...prev.comments],
        }))
        setComment("") // Clear the comment input
      } else {
        const error = await response.json()
        alert(error.error || "Failed to post comment")
      }
    } catch (error) {
      console.error("Failed to post comment:", error)
      alert("Failed to post comment")
    } finally {
      setCommentLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchCase()
  }

  const handleShare = async () => {
    const shareData = {
      title: `${caseData.title} - PettyCourt`,
      text: `Check out this petty dispute and cast your vote!`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href)
        alert("Link copied to clipboard!")
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Gavel className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading case details...</p>
        </div>
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || "Case Not Found"}</h1>
          <p className="text-gray-600 mb-4">{error || "This case doesn't exist or has been removed."}</p>
          <Button asChild>
            <Link href="/cases">Browse Other Cases</Link>
          </Button>
        </div>
      </div>
    )
  }

  const totalVotes = caseData.votes.plaintiff + caseData.votes.defendant + caseData.votes.split
  const plaintiffPercentage = totalVotes > 0 ? Math.round((caseData.votes.plaintiff / totalVotes) * 100) : 0
  const defendantPercentage = totalVotes > 0 ? Math.round((caseData.votes.defendant / totalVotes) * 100) : 0
  const splitPercentage = totalVotes > 0 ? Math.round((caseData.votes.split / totalVotes) * 100) : 0

  const getTotalVotes = (votes: any) => {
    return votes.plaintiff + votes.defendant + votes.split
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Gavel className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">PettyCourt</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share Case
            </Button>
            <Button variant="outline" asChild>
              <Link href="/cases">
                <ArrowLeft className="mr-2 h-4 w-4" />
                All Cases
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Success Alerts */}
        {isNewCase && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-800">
                <Crown className="h-5 w-5" />
                <span className="font-semibold">Case submitted successfully!</span>
              </div>
              <p className="text-green-700 mt-1">
                Your case is now live. Share the link to get more votes and a better AI verdict!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error Alert */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Error</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Case Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{caseData.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Case #{caseData.id}</span>
                      <span>•</span>
                      <span>Submitted {caseData.submittedAt}</span>
                      <Badge variant="outline" className="capitalize">
                        {caseData.tone}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{caseData.description}</p>
                </div>

                {/* Evidence */}
                {caseData.evidence && caseData.evidence.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Evidence</h4>
                    <div className="space-y-2">
                      {caseData.evidence.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Badge variant="secondary">{item.type}</Badge>
                          <span className="text-sm">{item.name}</span>
                          <span className="text-xs text-gray-500">- {item.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Voting Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Jury Verdict ({totalVotes.toLocaleString()} votes)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {totalVotes > 0 ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-green-700">Plaintiff is Right</span>
                      <span className="font-bold">{plaintiffPercentage}%</span>
                    </div>
                    <Progress value={plaintiffPercentage} className="h-3" />

                    <div className="flex justify-between items-center">
                      <span className="font-medium text-red-700">Defendant is Right</span>
                      <span className="font-bold">{defendantPercentage}%</span>
                    </div>
                    <Progress value={defendantPercentage} className="h-3" />

                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Both Are Wrong</span>
                      <span className="font-bold">{splitPercentage}%</span>
                    </div>
                    <Progress value={splitPercentage} className="h-3" />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No votes yet. Be the first to cast your verdict!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verdict Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Official Verdict
                </CardTitle>
              </CardHeader>
              <CardContent>
                {caseData.verdict ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                        {caseData.verdict.text}
                      </pre>
                    </div>

                    {/* Judge Attribution */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{caseData.verdict.judge.avatar}</div>
                        <div>
                          <div className="font-semibold">Judged by {caseData.verdict.judge.username}</div>
                          <div className="text-sm text-gray-500">{caseData.verdict.judge.title}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <ThumbsUp className="mr-2 h-4 w-4" />
                          {caseData.verdict.likes}
                        </Button>
                        <Button variant="outline" size="sm">
                          💰 Tip Judge
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Verdict
                      </Button>
                      <Button variant="outline">Download PDF</Button>
                    </div>
                  </div>
                ) : caseData.status === "awaiting_verdict" ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Verdict Coming Soon!</h3>
                    <p className="text-gray-600 mb-4">
                      This case has reached {getTotalVotes(caseData.votes)} votes and is now awaiting judgment from our
                      verified judges.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Estimated time:</strong> 24-48 hours for a human-written verdict
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Still Collecting Votes</h3>
                    <p className="text-gray-600 mb-4">
                      This case needs {10 - getTotalVotes(caseData.votes)} more votes before it can be judged.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Share this case to get more votes and unlock the verdict faster!
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Jury Comments ({caseData.comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {caseData.comments.length > 0 ? (
                  caseData.comments.map((comment: any) => (
                    <div key={comment.id} className="border-l-4 border-gray-200 pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={
                            comment.vote === "plaintiff"
                              ? "default"
                              : comment.vote === "defendant"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {comment.vote === "plaintiff"
                            ? "Team Plaintiff"
                            : comment.vote === "defendant"
                              ? "Team Defendant"
                              : "Team Split"}
                        </Badge>
                        <span className="text-sm text-gray-500">{comment.timestamp}</span>
                      </div>
                      <p className="text-gray-700 mb-2">{comment.text}</p>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {comment.likes}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No comments yet. Vote and share your thoughts!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vote Panel */}
            {!hasVoted ? (
              <Card>
                <CardHeader>
                  <CardTitle>Cast Your Vote</CardTitle>
                  <CardDescription>Who do you think is right in this dispute?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={() => handleVote("plaintiff")} variant="outline" className="w-full justify-start">
                    <ThumbsUp className="mr-2 h-4 w-4 text-green-600" />
                    Plaintiff is Right
                  </Button>
                  <Button onClick={() => handleVote("defendant")} variant="outline" className="w-full justify-start">
                    <ThumbsDown className="mr-2 h-4 w-4 text-red-600" />
                    Defendant is Right
                  </Button>
                  <Button onClick={() => handleVote("split")} variant="outline" className="w-full justify-start">
                    <Meh className="mr-2 h-4 w-4 text-gray-600" />
                    Both Are Wrong
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Your Vote</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="mb-4">
                    You voted:{" "}
                    {userVote === "plaintiff"
                      ? "Plaintiff is Right"
                      : userVote === "defendant"
                        ? "Defendant is Right"
                        : "Both Are Wrong"}
                  </Badge>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <Label htmlFor="comment">Add a comment (optional)</Label>
                    <Textarea
                      id="comment"
                      placeholder="Share your thoughts on this case..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{comment.length}/500 characters</span>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={handlePostComment}
                      disabled={!comment.trim() || commentLoading}
                    >
                      {commentLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Post Comment
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Case Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Case Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Votes</span>
                  <span className="font-semibold">{totalVotes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Comments</span>
                  <span className="font-semibold">{caseData.comments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Evidence</span>
                  <span className="font-semibold">{caseData.evidence?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verdict Status</span>
                  <Badge
                    variant={
                      caseData.status === "decided"
                        ? "default"
                        : caseData.status === "awaiting_verdict"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {caseData.status === "decided"
                      ? "Complete"
                      : caseData.status === "awaiting_verdict"
                        ? "Pending"
                        : "Voting"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Submit Your Own Case */}
            <Card>
              <CardHeader>
                <CardTitle>Got Your Own Drama?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Submit your petty dispute and let the internet decide who's right!
                </p>
                <Button asChild className="w-full">
                  <Link href="/submit">Submit Your Case</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
