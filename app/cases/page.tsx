"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Gavel, Search, TrendingUp, Clock, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CasesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("trending")
  const [filterBy, setFilterBy] = useState("all")

  // Mock cases data
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCases() {
      try {
        const params = new URLSearchParams({
          limit: "20",
          sortBy: sortBy,
          ...(searchTerm && { search: searchTerm }),
        })

        const response = await fetch(`/api/cases?${params}`)
        const data = await response.json()
        setCases(data.cases || [])
      } catch (error) {
        console.error("Failed to fetch cases:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCases()
  }, [sortBy, searchTerm])

  const filteredCases = cases.filter((case_) => {
    const matchesSearch =
      case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filterBy === "all" ||
      (filterBy === "verdict-ready" && case_.status === "Verdict Ready") ||
      (filterBy === "voting" && case_.status === "Jury Voting") ||
      (filterBy === "tone" && case_.tone.toLowerCase() === filterBy)

    return matchesSearch && matchesFilter
  })

  const sortedCases = [...filteredCases].sort((a, b) => {
    const totalVotesA = a.votes.plaintiff + a.votes.defendant + a.votes.split
    const totalVotesB = b.votes.plaintiff + b.votes.defendant + b.votes.split

    switch (sortBy) {
      case "trending":
        return totalVotesB - totalVotesA
      case "recent":
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      case "comments":
        return b.comments - a.comments
      default:
        return 0
    }
  })

  const getTotalVotes = (votes: any) => votes.plaintiff + votes.defendant + votes.split
  const getPlaintiffPercentage = (votes: any) => Math.round((votes.plaintiff / getTotalVotes(votes)) * 100)

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
            <Button asChild>
              <Link href="/submit">Submit Case</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse All Cases</h1>
          <p className="text-gray-600 text-lg">Dive into the drama. Vote on disputes. Witness justice.</p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </div>
              </SelectItem>
              <SelectItem value="recent">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Most Recent
                </div>
              </SelectItem>
              <SelectItem value="comments">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Most Comments
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cases</SelectItem>
              <SelectItem value="verdict-ready">Verdict Ready</SelectItem>
              <SelectItem value="voting">Jury Voting</SelectItem>
              <SelectItem value="serious">Serious Tone</SelectItem>
              <SelectItem value="satirical">Satirical Tone</SelectItem>
              <SelectItem value="unhinged">Unhinged Tone</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{cases.length}</div>
                <div className="text-sm text-gray-600">Total Cases</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {cases.filter((c) => c.status === "Verdict Ready").length}
                </div>
                <div className="text-sm text-gray-600">Verdicts Ready</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {cases.filter((c) => c.status === "Jury Voting").length}
                </div>
                <div className="text-sm text-gray-600">Active Voting</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {cases.reduce((sum, c) => sum + getTotalVotes(c.votes), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Votes</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCases.map((case_) => (
            <Card key={case_.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {case_.title}
                  </CardTitle>
                  <Badge variant={case_.status === "Verdict Ready" ? "default" : "secondary"}>{case_.status}</Badge>
                </div>
                <CardDescription className="line-clamp-3">{case_.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Tone:</span>
                    <Badge variant="outline">{case_.tone}</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Plaintiff Leading</span>
                      <span className="font-medium">{getPlaintiffPercentage(case_.votes)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${getPlaintiffPercentage(case_.votes)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{getTotalVotes(case_.votes).toLocaleString()} votes</span>
                    <span>{case_.comments} comments</span>
                    <span>{case_.submittedAt}</span>
                  </div>

                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href={`/case/${case_.id}`}>
                      {case_.status === "Verdict Ready" ? "Read Verdict" : "Cast Your Vote"}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Cases
          </Button>
        </div>
      </div>
    </div>
  )
}
