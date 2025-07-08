"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gavel, Trophy, Crown, Star, ArrowLeft, Medal, Award } from "lucide-react"
import Link from "next/link"

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([])
  const [userStats, setUserStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [leaderboardRes, userRes] = await Promise.all([fetch("/api/leaderboard"), fetch("/api/user/stats")])

        if (leaderboardRes.ok) {
          const data = await leaderboardRes.json()
          setLeaderboard(data.leaderboard)
        }

        if (userRes.ok) {
          const data = await userRes.json()
          setUserStats(data.user)
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>
    }
  }

  const getLevelColor = (level: number) => {
    if (level >= 8) return "bg-purple-100 text-purple-800"
    if (level >= 5) return "bg-blue-100 text-blue-800"
    if (level >= 3) return "bg-green-100 text-green-800"
    return "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    )
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
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-12 w-12 text-yellow-500" />
            <Crown className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Judge Leaderboard</h1>
          <p className="text-gray-600 text-lg">The most honorable petty judges in the land</p>
        </div>

        {/* Your Stats */}
        {userStats && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-600" />
                Your Judge Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userStats.karma_points}</div>
                  <div className="text-sm text-gray-600">Karma Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">Lv.{userStats.level}</div>
                  <div className="text-sm text-gray-600">{userStats.title}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userStats.cases_voted}</div>
                  <div className="text-sm text-gray-600">Cases Judged</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{userStats.badges.length}</div>
                  <div className="text-sm text-gray-600">Badges Earned</div>
                </div>
              </div>
              {userStats.badges.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Your Badges:</h4>
                  <div className="flex flex-wrap gap-2">
                    {userStats.badges.map((badge: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Judges
            </CardTitle>
            <CardDescription>Ranked by karma points and judicial excellence</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard.map((judge: any) => (
                <div
                  key={judge.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    judge.rank <= 3 ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12">{getRankIcon(judge.rank)}</div>
                    <div>
                      <div className="font-semibold text-lg">{judge.id}</div>
                      <Badge className={getLevelColor(judge.level)}>
                        Lv.{judge.level} {judge.title}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{judge.karma_points}</div>
                    <div className="text-sm text-gray-500">karma points</div>
                  </div>
                </div>
              ))}
            </div>

            {leaderboard.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No judges yet. Be the first to start judging cases!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* How to Earn Karma */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Earn Karma & Level Up</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold">Karma Actions:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Vote on a case</span>
                    <Badge variant="outline">+1 karma</Badge>
                  </li>
                  <li className="flex justify-between">
                    <span>Submit a case</span>
                    <Badge variant="outline">+5 karma</Badge>
                  </li>
                  <li className="flex justify-between">
                    <span>Comment on a case</span>
                    <Badge variant="outline">+2 karma</Badge>
                  </li>
                  <li className="flex justify-between">
                    <span>Create viral case (100+ votes)</span>
                    <Badge variant="outline">+10 karma</Badge>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Judge Levels:</h4>
                <ul className="space-y-1 text-sm">
                  <li>Lv.1 Court Jester (0 karma)</li>
                  <li>Lv.2 Petty Plaintiff (10 karma)</li>
                  <li>Lv.3 Jury Duty Dodger (25 karma)</li>
                  <li>Lv.4 Armchair Attorney (50 karma)</li>
                  <li>Lv.5 Bar Exam Dropout (100 karma)</li>
                  <li>Lv.10 The Honorable Roaster (1000 karma)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-8">
          <Button asChild size="lg">
            <Link href="/cases">Start Judging Cases</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
