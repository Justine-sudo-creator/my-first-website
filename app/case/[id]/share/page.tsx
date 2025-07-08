"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gavel, Share2, Twitter, Facebook, Copy, ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function ShareCasePage() {
  const params = useParams()
  const caseId = params.id as string
  const [caseData, setCaseData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchCase() {
      try {
        const response = await fetch(`/api/cases/${caseId}`)
        const data = await response.json()

        if (response.ok) {
          setCaseData(data.case)
        }
      } catch (error) {
        console.error("Failed to fetch case:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCase()
  }, [caseId])

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/case/${caseId}`
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTwitterShare = () => {
    const text = `Check out this petty court case: "${caseData.title}" - The internet jury has spoken! 🏛️⚖️`
    const url = `${window.location.origin}/case/${caseId}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=PettyCourt,InternetJustice`
    window.open(twitterUrl, "_blank")
  }

  const handleFacebookShare = () => {
    const url = `${window.location.origin}/case/${caseId}`
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    window.open(facebookUrl, "_blank")
  }

  if (loading || !caseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Gavel className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading case...</p>
        </div>
      </div>
    )
  }

  const totalVotes = caseData.votes.plaintiff + caseData.votes.defendant + caseData.votes.split
  const plaintiffPercentage = totalVotes > 0 ? Math.round((caseData.votes.plaintiff / totalVotes) * 100) : 0
  const defendantPercentage = totalVotes > 0 ? Math.round((caseData.votes.defendant / totalVotes) * 100) : 0
  const splitPercentage = totalVotes > 0 ? Math.round((caseData.votes.split / totalVotes) * 100) : 0

  const getWinner = () => {
    if (caseData.votes.plaintiff > caseData.votes.defendant && caseData.votes.plaintiff > caseData.votes.split) {
      return { winner: "Plaintiff", percentage: plaintiffPercentage, color: "text-green-600" }
    } else if (caseData.votes.defendant > caseData.votes.plaintiff && caseData.votes.defendant > caseData.votes.split) {
      return { winner: "Defendant", percentage: defendantPercentage, color: "text-red-600" }
    } else {
      return { winner: "Both Are Wrong", percentage: splitPercentage, color: "text-gray-600" }
    }
  }

  const winner = getWinner()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Gavel className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">PettyCourt</h1>
          </Link>
          <Button variant="outline" asChild>
            <Link href={`/case/${caseId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Case
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Shareable Case Card */}
        <Card className="mb-8 border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-2 mb-2">
              <Gavel className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">PETTY COURT VERDICT</span>
            </div>
            <CardTitle className="text-xl">{caseData.title}</CardTitle>
            <CardDescription className="line-clamp-3">{caseData.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Verdict Result */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">THE INTERNET JURY HAS SPOKEN</div>
                <div className={`text-2xl font-bold ${winner.color}`}>{winner.winner} Wins!</div>
                <div className="text-lg text-gray-700">
                  {winner.percentage}% of {totalVotes.toLocaleString()} votes
                </div>
              </div>

              {/* Vote Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-green-700">Plaintiff is Right</span>
                  <span className="font-bold">{plaintiffPercentage}%</span>
                </div>
                <Progress value={plaintiffPercentage} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="font-medium text-red-700">Defendant is Right</span>
                  <span className="font-bold">{defendantPercentage}%</span>
                </div>
                <Progress value={defendantPercentage} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Both Are Wrong</span>
                  <span className="font-bold">{splitPercentage}%</span>
                </div>
                <Progress value={splitPercentage} className="h-2" />
              </div>

              {/* Case Info */}
              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                <div className="flex items-center gap-4">
                  <span>Case #{caseData.id}</span>
                  <Badge variant="outline" className="capitalize">
                    {caseData.tone}
                  </Badge>
                </div>
                <span>{caseData.submittedAt}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share This Case
            </CardTitle>
            <CardDescription>Let the world see this petty justice in action!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={handleTwitterShare} className="w-full bg-transparent" variant="outline">
                <Twitter className="mr-2 h-4 w-4" />
                Share on Twitter
              </Button>
              <Button onClick={handleFacebookShare} className="w-full bg-transparent" variant="outline">
                <Facebook className="mr-2 h-4 w-4" />
                Share on Facebook
              </Button>
            </div>

            <Button onClick={handleCopyLink} className="w-full bg-transparent" variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              {copied ? "Link Copied!" : "Copy Link"}
            </Button>

            <div className="text-center pt-4">
              <Button asChild>
                <Link href="/submit">
                  Submit Your Own Case
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Verdict Preview */}
        {caseData.verdict_unlocked && caseData.verdict_text && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Official Verdict</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                  {caseData.verdict_text.substring(0, 300)}...
                </pre>
                <div className="mt-4">
                  <Button asChild variant="outline">
                    <Link href={`/case/${caseId}`}>Read Full Verdict</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
