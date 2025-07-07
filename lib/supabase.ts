import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database schema types
export interface Case {
  id: number
  title: string
  description: string
  tone: "serious" | "satirical" | "unhinged"
  evidence_urls: string[]
  plaintiff_votes: number
  defendant_votes: number
  split_votes: number
  created_at: string
  verdict_unlocked: boolean
  verdict_text?: string
}

export interface Vote {
  id: number
  case_id: number
  vote_type: "plaintiff" | "defendant" | "split"
  ip_address: string
  created_at: string
}

export interface Comment {
  id: number
  case_id: number
  content: string
  vote_type: "plaintiff" | "defendant" | "split"
  likes: number
  created_at: string
}
