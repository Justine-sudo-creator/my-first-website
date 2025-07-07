import { Gavel, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

        <div className="prose max-w-none text-gray-700 space-y-6">
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using PettyCourt ("the Service"), you accept and agree to be bound by the terms and
              provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p>
              PettyCourt is an entertainment platform where users can submit petty disputes for community voting and
              receive AI-generated satirical legal verdicts. This service is for entertainment purposes only and does
              not constitute actual legal advice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Content</h2>
            <p>Users are responsible for all content they submit. By submitting content, you grant PettyCourt:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>A non-exclusive, worldwide, royalty-free license to use, display, and distribute your content</li>
              <li>The right to moderate, edit, or remove content that violates our guidelines</li>
              <li>Permission to use your content for promotional purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Prohibited Content</h2>
            <p>Users may not submit content that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contains hate speech, harassment, or threats</li>
              <li>Violates privacy rights or contains personal information of others</li>
              <li>Is defamatory, false, or misleading</li>
              <li>Contains explicit sexual content or violence</li>
              <li>Violates any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Payment Terms</h2>
            <p>
              Certain features require payment. All payments are processed securely through Stripe. Payments for AI
              verdicts are final and non-refundable once the verdict is generated.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Privacy</h2>
            <p>
              We collect minimal personal information. IP addresses are used for rate limiting and spam prevention. See
              our Privacy Policy for full details on data collection and usage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Disclaimer</h2>
            <p className="font-semibold">
              PETTYCOURT IS FOR ENTERTAINMENT ONLY. AI-generated verdicts are satirical and do not constitute legal
              advice. Do not use this service for actual legal disputes requiring professional counsel.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p>
              PettyCourt shall not be liable for any indirect, incidental, special, consequential, or punitive damages
              resulting from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Users will be notified of significant changes via
              the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact</h2>
            <p>For questions about these terms, contact us at legal@pettycourt.com</p>
          </section>
        </div>
      </div>
    </div>
  )
}
