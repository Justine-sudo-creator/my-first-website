"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Gavel,
  Users,
  Trophy,
  Scale,
  Zap,
  Bell,
  Plus,
  Vote,
  Crown,
  Star,
  TrendingUp,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [userStats, setUserStats] = useState(null)
  const [featuredCases, setFeaturedCases] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, casesRes, leaderboardRes, notificationsRes] = await Promise.all([
          fetch("/api/user/stats"),
          fetch("/api/cases?limit=3&sortBy=trending"),
          fetch("/api/leaderboard?limit=5"),
          fetch("/api/notifications"),
        ])

        if (userRes.ok) {
          const data = await userRes.json()
          setUserStats(data.user)
        }

        if (casesRes.ok) {
          const data = await casesRes.json()
          setFeaturedCases(data.cases || [])
        }

        if (leaderboardRes.ok) {
          const data = await leaderboardRes.json()
          setLeaderboard(data.leaderboard || [])
        }

        if (notificationsRes.ok) {
          const data = await notificationsRes.json()
          setNotifications(data.notifications || [])
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getTotalVotes = (votes: any) => votes.plaintiff + votes.defendant + votes.split
  const getPlaintiffPercentage = (votes: any) => {
    const total = getTotalVotes(votes)
    return total > 0 ? Math.round((votes.plaintiff / total) * 100) : 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gavel className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">PettyCourt</h1>
            </div>

            {/* User Profile Section */}
            {userStats && (
              <div className="flex items-center gap-4">
                <Link href="/notifications" className="relative">
                  <Button variant="ghost" size="sm">
                    <Bell className="h-4 w-4" />
                    {notifications.filter((n) => !n.read).length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notifications.filter((n) => !n.read).length}
                      </span>
                    )}
                  </Button>
                </Link>

                <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 shadow-sm">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{userStats.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <div className="font-semibold">{userStats.username}</div>
                    <div className="text-gray-500 flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {userStats.karma_points} karma
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Lv.{userStats.level}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Hero Section */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Scale className="h-12 w-12 text-blue-600" />
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Submit Your Pettiest Drama.
                <br />
                <span className="text-blue-600">Let Real Judges Decide.</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Get hilarious, human-written verdicts from our community of verified judges. No AI, just pure petty
                justice.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button asChild className="h-20 flex-col gap-2">
                <Link href="/submit">
                  <Plus className="h-6 w-6" />
                  Submit Case
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Link href="/cases">
                  <Vote className="h-6 w-6" />
                  Vote on Cases
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Link href="/judge/dashboard">
                  <Gavel className="h-6 w-6" />
                  Judge Cases
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Link href="/leaderboard">
                  <Trophy className="h-6 w-6" />
                  Leaderboard
                </Link>
              </Button>
            </div>

            {/* Featured Cases */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Trending Cases
                  </CardTitle>
                  <Button variant="ghost" asChild>
                    <Link href="/cases">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {featuredCases.map((case_: any) => (
                    <div key={case_.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1">{case_.title}</h3>
                        <Badge variant={case_.status === "Verdict Ready" ? "default" : "secondary"}>
                          {case_.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">{case_.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {getTotalVotes(case_.votes)} votes
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {case_.comments} comments
                          </span>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/case/${case_.id}`}>
                            {case_.status === "Verdict Ready" ? "Read Verdict" : "Vote Now"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Stats Card */}
            {userStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Your Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <Avatar className="h-16 w-16 mx-auto mb-2">
                      <AvatarFallback className="text-2xl">{userStats.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="font-semibold">{userStats.username}</div>
                    <Badge className="mt-1">{userStats.title}</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Karma Points</span>
                      <span className="font-semibold">{userStats.karma_points}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cases Voted</span>
                      <span className="font-semibold">{userStats.cases_voted}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cases Submitted</span>
                      <span className="font-semibold">{userStats.cases_submitted}</span>
                    </div>
                    {userStats.is_judge && (
                      <div className="flex justify-between text-sm">
                        <span>Verdicts Written</span>
                        <span className="font-semibold">{userStats.verdicts_written}</span>
                      </div>
                    )}
                  </div>

                  {userStats.badges.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold mb-2">Recent Badges</div>
                      <div className="flex flex-wrap gap-1">
                        {userStats.badges.slice(0, 3).map((badge: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {!userStats.is_judge && userStats.karma_points >= 50 && (
                    <Button asChild className="w-full">
                      <Link href="/judge/apply">
                        <Gavel className="mr-2 h-4 w-4" />
                        Apply to be a Judge
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Mini Leaderboard */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Top Judges
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/leaderboard">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.slice(0, 5).map((judge: any, index: number) => (
                    <div key={judge.id} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-sm font-semibold">
                        {index + 1}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-sm">{judge.avatar || "👨‍⚖️"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{judge.username}</div>
                        <div className="text-xs text-gray-500">{judge.karma_points} karma</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Notifications */}
            {notifications.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notifications
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/notifications">View All</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map((notification: any) => (
                      <div
                        key={notification.id}
                        className={`p-2 rounded text-sm ${!notification.read ? "bg-blue-50" : ""}`}
                      >
                        <div className="font-semibold">{notification.title}</div>
                        <div className="text-gray-600 text-xs">{notification.message}</div>
                      </div>
                    ))}
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
