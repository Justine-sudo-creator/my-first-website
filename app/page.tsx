"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gavel, Users, Trophy, ArrowRight, Scale, Zap } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function HomePage() {
  // Add this at the top of the component
  const [featuredCases, setFeaturedCases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCases() {
      try {
        const response = await fetch("/api/cases?limit=3&sortBy=trending")
        if (!response.ok) {
          const text = await response.text()
          throw new Error(text || "Failed to fetch")
        }
        const data = await response.json()
        setFeaturedCases(data.cases || [])
      } catch (error) {
        console.error("Failed to fetch cases:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCases()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gavel className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">PettyCourt</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/cases" className="text-gray-600 hover:text-gray-900">
              Browse Cases
            </Link>
            <Link href="/submit" className="text-gray-600 hover:text-gray-900">
              Submit Case
            </Link>
            <Button>Get Started</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Scale className="h-12 w-12 text-blue-600" />
            <Zap className="h-8 w-8 text-yellow-500" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Submit Your Dumbest Drama.
            <br />
            <span className="text-blue-600">Let Strangers Judge.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Had a petty fight with your friend, roommate, or ex? Get a hilarious AI-generated legal verdict that will
            either validate you completely or humble you forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/submit">
                Submit Your Case <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent" asChild>
              <Link href="/cases">Browse Drama</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <Gavel className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">2,847</h3>
              <p className="text-gray-600">Cases Judged</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">45,293</h3>
              <p className="text-gray-600">Jury Votes Cast</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-yellow-100 p-4 rounded-full mb-4">
                <Trophy className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">89%</h3>
              <p className="text-gray-600">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cases */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Top Petty Cases This Week</h2>
            <p className="text-gray-600">The internet has spoken. These are the most dramatic disputes.</p>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading cases...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCases.map((case_) => (
                <Card key={case_.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{case_.title}</CardTitle>
                      <Badge variant={case_.status === "Verdict Ready" ? "default" : "secondary"}>{case_.status}</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{case_.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Tone:</span>
                        <Badge variant="outline">{case_.tone}</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Plaintiff</span>
                          <span className="font-medium">{case_.votes.plaintiff} votes</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${(case_.votes.plaintiff / (case_.votes.plaintiff + case_.votes.defendant + case_.votes.split)) * 100}%`,
                            }}
                          ></div>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span>Defendant</span>
                          <span className="font-medium">{case_.votes.defendant} votes</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{
                              width: `${(case_.votes.defendant / (case_.votes.plaintiff + case_.votes.defendant + case_.votes.split)) * 100}%`,
                            }}
                          ></div>
                        </div>
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
          )}

          <div className="text-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link href="/cases">View All Cases</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600">Justice in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Submit Your Drama</h3>
              <p className="text-gray-600">Tell us about your petty dispute. Upload evidence. Choose your tone.</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Let Strangers Judge</h3>
              <p className="text-gray-600">The internet jury votes on who's right. Comments optional but encouraged.</p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-yellow-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Your Verdict</h3>
              <p className="text-gray-600">Receive a hilarious AI-generated legal ruling. Share your vindication.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Justice?</h2>
          <p className="text-xl mb-8 text-blue-100">Your petty drama deserves a proper ruling. Submit your case now.</p>
          <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
            <Link href="/submit">
              Submit Your Case <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Gavel className="h-6 w-6" />
                <span className="text-xl font-bold">PettyCourt</span>
              </div>
              <p className="text-gray-400">Justice for your pettiest disputes.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/cases" className="hover:text-white">
                    Browse Cases
                  </Link>
                </li>
                <li>
                  <Link href="/submit" className="hover:text-white">
                    Submit Case
                  </Link>
                </li>
                <li>
                  <Link href="/leaderboard" className="hover:text-white">
                    Leaderboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/guidelines" className="hover:text-white">
                    Community Guidelines
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white">
                    About
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PettyCourt. All rights reserved. Not actual legal advice.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
