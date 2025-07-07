import { Gavel, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
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

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <div className="prose max-w-none text-gray-700 space-y-6">
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            <h3 className="text-lg font-semibold mb-2">Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Case submissions (titles, descriptions, evidence files)</li>
              <li>Comments and votes on cases</li>
              <li>Payment information (processed by Stripe, not stored by us)</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2 mt-4">Information We Automatically Collect</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>IP addresses (for rate limiting and spam prevention)</li>
              <li>Browser type and device information</li>
              <li>Usage analytics (pages visited, time spent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and improve our services</li>
              <li>To prevent spam and abuse</li>
              <li>To process payments for premium features</li>
              <li>To generate AI verdicts based on case content</li>
              <li>To analyze usage patterns and improve user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
            <p>We do not sell or rent your personal information. We may share information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>With service providers (Stripe for payments, Vercel for hosting)</li>
              <li>When required by law or to protect our rights</li>
              <li>In anonymized, aggregated form for analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Public Content</h2>
            <p>
              Case submissions, votes, and comments are public by design. Do not include personal information you don't
              want to be publicly visible. We may feature popular cases in marketing materials.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your information. However, no internet transmission
              is 100% secure. Use the service at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to improve user experience and prevent duplicate voting. You can
              disable cookies in your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Request deletion of your submitted cases (contact us)</li>
              <li>Opt out of analytics tracking</li>
              <li>Request information about data we have collected</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
            <p>
              Our service is not intended for users under 13. We do not knowingly collect information from children
              under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Privacy Policy</h2>
            <p>We may update this privacy policy. Significant changes will be announced on the platform.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
            <p>For privacy-related questions, contact us at privacy@pettycourt.com</p>
          </section>
        </div>
      </div>
    </div>
  )
}
