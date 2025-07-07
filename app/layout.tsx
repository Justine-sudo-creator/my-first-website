import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PettyCourt - Submit Your Drama, Let Strangers Judge",
  description:
    "Had a petty fight? Get a hilarious AI-generated legal verdict that will either validate you completely or humble you forever. Submit your case now!",
  keywords: "petty disputes, AI judge, internet jury, funny verdicts, relationship drama, roommate problems",
  authors: [{ name: "PettyCourt" }],
  creator: "PettyCourt",
  publisher: "PettyCourt",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pettycourt.com",
    siteName: "PettyCourt",
    title: "PettyCourt - Submit Your Drama, Let Strangers Judge",
    description:
      "Had a petty fight? Get a hilarious AI-generated legal verdict. Submit your case and let the internet jury decide who's right!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PettyCourt - Internet Justice for Petty Disputes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PettyCourt - Submit Your Drama, Let Strangers Judge",
    description: "Had a petty fight? Get a hilarious AI-generated legal verdict. Submit your case now!",
    images: ["/og-image.png"],
    creator: "@pettycourt",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#2563eb",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="google-site-verification" content="your-google-verification-code" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
