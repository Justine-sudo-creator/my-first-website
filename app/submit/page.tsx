"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Gavel, Upload, ArrowLeft, Send, X, DollarSign, Globe } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SubmitCasePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tone: "",
  })
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Upload evidence files first
      const evidenceUrls: string[] = []

      if (evidenceFiles.length > 0) {
        setUploadingFiles(true)

        for (const file of evidenceFiles) {
          const formData = new FormData()
          formData.append("file", file)

          const uploadResponse = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
            method: "POST",
            body: file,
          })

          if (uploadResponse.ok) {
            const { url } = await uploadResponse.json()
            evidenceUrls.push(url)
          }
        }

        setUploadingFiles(false)
      }

      // Submit the case
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          tone: formData.tone,
          evidenceUrls,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/case/${data.case.id}?new=true`)
      } else {
        alert(data.error || "Failed to submit case")
      }
    } catch (error) {
      console.error("Failed to submit case:", error)
      alert("Failed to submit case")
    } finally {
      setIsSubmitting(false)
      setUploadingFiles(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setEvidenceFiles((prev) => [...prev, ...files].slice(0, 3)) // Max 3 files
    }
  }

  const removeFile = (index: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index))
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

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Submit Your Case</h1>
          <p className="text-gray-600 text-lg">Time to air your grievances. The internet jury awaits.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Case Details</CardTitle>
            <CardDescription>Fill out the details of your petty dispute. Be as dramatic as you want.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Case Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Case Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., He ate MY leftovers AGAIN"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  maxLength={100}
                />
                <p className="text-sm text-gray-500">{formData.title.length}/100 characters</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">What Happened? *</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us the full story. Don't hold back on the drama..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  required
                  rows={6}
                  maxLength={1000}
                />
                <p className="text-sm text-gray-500">{formData.description.length}/1000 characters</p>
              </div>

              {/* Tone Selection */}
              <div className="space-y-2">
                <Label>Verdict Tone *</Label>
                <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, tone: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your vibe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="serious">
                      <div className="flex items-center gap-2">
                        🧑‍⚖️ <span>Serious</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="satirical">
                      <div className="flex items-center gap-2">
                        😂 <span>Satirical</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="unhinged">
                      <div className="flex items-center gap-2">
                        💀 <span>Unhinged</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  <div className="text-sm text-gray-600">
                    <strong>🧑‍⚖️ Serious:</strong> Professional legal language with subtle humor
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>😂 Satirical:</strong> Witty and sarcastic with meme references
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>💀 Unhinged:</strong> Completely chaotic and over-the-top
                  </div>
                </div>
              </div>

              {/* Evidence Upload */}
              <div className="space-y-2">
                <Label htmlFor="evidence">Evidence (Optional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    id="evidence"
                    type="file"
                    accept="image/*,audio/*,.txt,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                  />
                  <label htmlFor="evidence" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Click to upload screenshots, audio, or documents</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Images, audio files, text, or PDF (max 3 files, 10MB each)
                    </p>
                  </label>
                </div>

                {/* Show uploaded files */}
                {evidenceFiles.length > 0 && (
                  <div className="space-y-2">
                    {evidenceFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{file.name}</Badge>
                          <span className="text-sm text-gray-500">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pricing Info */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-900">What happens next?</h3>
                </div>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Your case goes live immediately for jury voting</li>
                  <li>• Free preview of your AI verdict after 24 hours</li>
                  <li>• Unlock full verdict + shareable ruling for $3 USD</li>
                  <li>• Secure payment via Gumroad (Philippines-friendly)</li>
                  <li>• Cases with 100+ votes get priority AI attention</li>
                </ul>
                <div className="mt-3 p-2 bg-purple-100 rounded text-xs text-purple-700">
                  <DollarSign className="h-3 w-3 inline mr-1" />
                  Payment processed securely by Gumroad • Credit cards, PayPal, Apple Pay accepted
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!formData.title || !formData.description || !formData.tone || isSubmitting || uploadingFiles}
              >
                {uploadingFiles ? (
                  "Uploading Evidence..."
                ) : isSubmitting ? (
                  "Submitting to Court..."
                ) : (
                  <>
                    Submit Case <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Pro Tips for Maximum Drama</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                • <strong>Be specific:</strong> "He ate my leftover pizza" is better than "He ate my food"
              </li>
              <li>
                • <strong>Include context:</strong> How long has this been going on? What's the history?
              </li>
              <li>
                • <strong>Show evidence:</strong> Screenshots, photos, or recordings make cases more compelling
              </li>
              <li>
                • <strong>Pick the right tone:</strong> Match your personality - serious cases can be just as funny
              </li>
              <li>
                • <strong>Share widely:</strong> More votes = better AI verdicts
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
