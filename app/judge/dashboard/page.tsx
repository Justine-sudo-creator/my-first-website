"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Gavel, ArrowLeft, Clock, Users, Star, Send, Eye, CheckCircle, AlertCircle, Crown } from "lucide-react"
import Link from "next/link"

export default function JudgeDashboard() {
  const [userStats, setUserStats] = useState(null)
  const [pendingCases, setPendingCases] = useState([])
  const [selectedCase, setSelectedCase] = useState(null)
  const [verdictText, setVerdictText] = useState("")
  const [verdictTone, setVerdictTone] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, casesRes] = await Promise.all([fetch("/api/user/stats"), fetch("/api/judge/pending-cases")])

        if (userRes.ok) {
          const data = await userRes.json()
          setUserStats(data.user)
        }

        if (casesRes.ok) {
          const data = await casesRes.json()
          setPendingCases(data.cases || [])
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleTakeCase = async (caseId: number) => {
    try {
      const response = await fetch(`/api/judge/take-case`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId }),
      })

      if (response.ok) {
        // Refresh pending cases
        const casesRes = await fetch("/api/judge/pending-cases")
        if (casesRes.ok) {
          const data = await casesRes.json()
          setPendingCases(data.cases || [])
        }
      }
    } catch (error) {
      console.error("Failed to take case:", error)
    }
  }

  const handleSubmitVerdict = async () => {
    if (!selectedCase || !verdictText.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch("/api/judge/submit-verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: selectedCase.id,
          verdictText: verdictText.trim(),
        }),
      })

      if (response.ok) {
        setSelectedCase(null)
        setVerdictText("")
        setVerdictTone("")

        // Refresh pending cases
        const casesRes = await fetch("/api/judge/pending-cases")
        if (casesRes.ok) {
          const data = await casesRes.json()
          setPendingCases(data.cases || [])
        }

        alert("Verdict submitted successfully!")
      } else {
        alert("Failed to submit verdict")
      }
    } catch (error) {
      console.error("Failed to submit verdict:", error)
      alert("Failed to submit verdict")
    } finally {
      setSubmitting(false)
    }
  }

  const getTotalVotes = (votes: any) => votes.plaintiff + votes.defendant + votes.split
  const getWinningVote = (votes: any) => {
    if (votes.plaintiff > votes.defendant && votes.plaintiff > votes.split) return "plaintiff"
    if (votes.defendant > votes.plaintiff && votes.defendant > votes.split) return "defendant"
    return "split"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Gavel className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading judge dashboard...</p>
        </div>
      </div>
    )
  }

  if (!userStats?.is_judge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Judge Access Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">You need to be a verified judge to access this dashboard.</p>
            {userStats?.karma_points >= 50 ? (
              <Button asChild className="w-full">
                <Link href="/judge/apply">Apply to be a Judge</Link>
              </Button>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-2">
                  You need at least 50 karma points to apply. Current: {userStats?.karma_points || 0}
                </p>
                <Button asChild className="w-full bg-transparent" variant="outline">
                  <Link href="/cases">Vote on Cases to Earn Karma</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Gavel className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Judge Dashboard</h1>
            </Link>

            {userStats && (
              <div className="flex items-center gap-3 bg-purple-50 rounded-lg px-3 py-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{userStats.avatar}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-semibold flex items-center gap-1">
                    <Crown className="h-3 w-3 text-purple-600" />
                    {userStats.username}
                  </div>
                  <div className="text-gray-500">{userStats.verdicts_written} verdicts written</div>
                </div>
              </div>
            )}
          </div>

          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Cases */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Cases Awaiting Judgment ({pendingCases.length})
                </CardTitle>
                <CardDescription>
                  Select a case to write your verdict. Remember to match the requested tone!
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingCases.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No cases pending judgment right now.</p>
                    <p className="text-sm">Check back later for new cases!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingCases.map((case_: any) => (
                      <div key={case_.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{case_.title}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="capitalize">
                                {case_.tone}
                              </Badge>
                              {case_.theme && <Badge variant="secondary">{case_.theme.replace("_", " ")}</Badge>}
                              <span className="text-sm text-gray-500">Case #{case_.id}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500 mb-1">{getTotalVotes(case_.votes)} votes</div>
                            <Badge
                              variant={
                                getWinningVote(case_.votes) === "plaintiff"
                                  ? "default"
                                  : getWinningVote(case_.votes) === "defendant"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {getWinningVote(case_.votes) === "plaintiff"
                                ? "Plaintiff Leading"
                                : getWinningVote(case_.votes) === "defendant"
                                  ? "Defendant Leading"
                                  : "Split Decision"}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4 line-clamp-3">{case_.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Submitted {case_.submittedAt}</span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {case_.votes.plaintiff}P / {case_.votes.defendant}D / {case_.votes.split}S
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedCase(case_)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Review Case
                            </Button>
                            {case_.verdict_status === "pending" && (
                              <Button size="sm" onClick={() => handleTakeCase(case_.id)}>
                                <Gavel className="mr-2 h-4 w-4" />
                                Take Case
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Judge Stats & Verdict Writer */}
          <div className="space-y-6">
            {/* Judge Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Your Judge Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Judge Level</span>
                  <Badge>Level {userStats.judge_level}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verdicts Written</span>
                  <span className="font-semibold">{userStats.verdicts_written}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Judge Rating</span>
                  <span className="font-semibold">{userStats.judge_rating}/5.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Karma</span>
                  <span className="font-semibold">{userStats.karma_points}</span>
                </div>
              </CardContent>
            </Card>

            {/* Verdict Writer */}
            {selectedCase && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gavel className="h-5 w-5" />
                    Write Verdict
                  </CardTitle>
                  <CardDescription>
                    Case #{selectedCase.id} - {selectedCase.tone} tone requested
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">{selectedCase.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{selectedCase.description}</p>
                    <div className="text-xs text-gray-500">
                      Votes: {selectedCase.votes.plaintiff}P / {selectedCase.votes.defendant}D /{" "}
                      {selectedCase.votes.split}S
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Verdict</label>
                    <Textarea
                      placeholder={`Write your ${selectedCase.tone} verdict here... Include case number, summary, ruling, and your judge signature!`}
                      value={verdictText}
                      onChange={(e) => setVerdictText(e.target.value)}
                      rows={8}
                      className="resize-none"
                    />
                    <div className="text-xs text-gray-500 mt-1">{verdictText.length}/2000 characters</div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmitVerdict}
                      disabled={!verdictText.trim() || submitting}
                      className="flex-1"
                    >
                      {submitting ? (
                        "Submitting..."
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Verdict
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedCase(null)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
