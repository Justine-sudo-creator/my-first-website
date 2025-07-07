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
  Lock,
  Crown,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Loader2,
  AlertCircle,
  Globe,
  Shield,
  ExternalLink,
  Send,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"

export default function CaseDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const isNewCase = searchParams.get("new") === "true"
  const paymentSuccess = searchParams.get("payment") === "success"
  const paymentSource = searchParams.get("source")
  const caseId = params.id as string

  const [hasVoted, setHasVoted] = useState(false)
  const [userVote, setUserVote] = useState<"plaintiff" | "defendant" | "split" | null>(null)
  const [comment, setComment] = useState("")
  const [caseData, setCaseData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [commentLoading, setCommentLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false)

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

  // Auto-refresh when payment is successful
  useEffect(() => {
    if (paymentSuccess && paymentSource === "gumroad") {
      console.log("🎉 Payment successful from Gumroad")
      setShowPaymentInstructions(true)

      // Auto-refresh every 3 seconds to check for verdict
      const interval = setInterval(() => {
        console.log("🔄 Auto-refreshing to check for verdict...")
        fetchCase()
      }, 3000)

      // Stop auto-refresh after 2 minutes
      setTimeout(() => {
        clearInterval(interval)
        console.log("⏰ Stopped auto-refresh after 2 minutes")
      }, 120000)

      return () => clearInterval(interval)
    }
  }, [paymentSuccess, paymentSource])

  // Stop auto-refresh when verdict is unlocked
  useEffect(() => {
    if (caseData?.verdict_unlocked && showPaymentInstructions) {
      setShowPaymentInstructions(false)
      console.log("✅ Verdict unlocked! Stopping auto-refresh.")
    }
  }, [caseData?.verdict_unlocked, showPaymentInstructions])

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

  const handleUnlockVerdict = async () => {
    setPaymentLoading(true)
    setError(null)

    try {
      console.log("🔓 Starting Gumroad payment flow for case:", caseId)

      const response = await fetch("/api/payment/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ caseId: Number.parseInt(caseId) }),
      })

      console.log("💳 Gumroad checkout response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("💥 Checkout error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ Checkout response data:", data)

      if (data.checkoutUrl) {
        console.log("🚀 Redirecting to Gumroad checkout:", data.checkoutUrl)
        // Open in same window for better mobile experience
        window.location.href = data.checkoutUrl
      } else {
        throw new Error("No checkout URL received from server")
      }
    } catch (error) {
      console.error("❌ Payment flow error:", error)
      setError(`Payment failed: ${error.message}`)
    } finally {
      setPaymentLoading(false)
    }
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

        {/* Payment Success Instructions */}
        {showPaymentInstructions && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-blue-800 mb-2">
                    <Gavel className="h-5 w-5" />
                    <span className="font-semibold">Payment successful!</span>
                  </div>
                  <p className="text-blue-700">
                    Your AI verdict is being generated... This usually takes 30-60 seconds.
                  </p>
                  <p className="text-blue-600 text-sm mt-1">
                    Page will auto-refresh, or click the refresh button below.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                  {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
              </div>
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

            {/* AI Verdict */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Official AI Verdict
                </CardTitle>
              </CardHeader>
              <CardContent>
                {caseData.verdict_unlocked && caseData.verdict_text ? (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{caseData.verdict_text}</pre>
                    <div className="mt-4 pt-4 border-t">
                      <Button className="mr-2" onClick={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Verdict
                      </Button>
                      <Button variant="outline">Download PDF</Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Verdict Ready!</h3>
                    <p className="text-gray-600 mb-4">
                      Your AI-generated legal ruling is ready. Unlock it to see the full dramatic verdict.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <p className="text-sm text-blue-800">
                        <strong>Preview:</strong> "After careful deliberation and consuming an unhealthy amount of
                        internet drama, this court finds..."
                      </p>
                    </div>

                    {/* Gumroad Payment Info */}
                    <div className="bg-purple-50 p-4 rounded-lg mb-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-purple-600" />
                        <Globe className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Secure Payment via Gumroad</span>
                      </div>
                      <p className="text-xs text-purple-700">
                        Credit Cards • PayPal • Apple Pay • Google Pay • Bank Transfer
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        🇵🇭 Philippines-friendly • Instant delivery • 30-day money-back guarantee
                      </p>
                      <p className="text-xs text-orange-600 mt-2 font-medium">
                        💡 After payment, return to this page - your verdict will appear automatically!
                      </p>
                    </div>

                    <Button onClick={handleUnlockVerdict} size="lg" disabled={paymentLoading} className="min-w-[200px]">
                      {paymentLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Opening Gumroad...
                        </>
                      ) : (
                        <>
                          Unlock Full Verdict - $3 USD
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">Secure checkout powered by Gumroad</p>
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
                  <Badge variant={caseData.verdict_unlocked ? "default" : "secondary"}>
                    {caseData.verdict_unlocked ? "Unlocked" : "Locked"}
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
