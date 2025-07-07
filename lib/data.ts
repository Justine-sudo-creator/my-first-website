// Simple in-memory data store for demo purposes
// In production, you'd use a real database

export interface Case {
  id: number
  title: string
  description: string
  tone: "serious" | "satirical" | "unhinged"
  evidence_urls: string[]
  plaintiff_votes: number
  defendant_votes: number
  split_votes: number
  verdict_unlocked: boolean
  verdict_text?: string
  ip_address?: string
  created_at: string
  updated_at: string
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
  ip_address?: string
  created_at: string
}

// In-memory storage (resets on server restart)
const cases: Case[] = [
  {
    id: 1,
    title: "My roommate ate my leftover pizza AGAIN",
    description:
      "I clearly labeled it with my name and put it in the fridge. This is the third time this month. I'm considering legal action (not really but I'm mad).",
    tone: "satirical",
    evidence_urls: [],
    plaintiff_votes: 47,
    defendant_votes: 12,
    split_votes: 8,
    verdict_unlocked: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    title: "Ex won't return my Netflix password",
    description:
      "We broke up 3 months ago and they're still using MY Netflix account. I pay for it, they should give me the password back so I can change it. This is theft!",
    tone: "unhinged",
    evidence_urls: [],
    plaintiff_votes: 89,
    defendant_votes: 23,
    split_votes: 15,
    verdict_unlocked: true,
    verdict_text: `CASE NO. 2024-PETTY-002
THE HONORABLE JUDGE AI PRESIDING

IN THE MATTER OF: Netflix Password Custody Dispute

WHEREAS the plaintiff has presented evidence of continued unauthorized streaming activity on their premium Netflix account, and WHEREAS the defendant has been binge-watching "The Office" for the 47th time on someone else's dime...

THIS COURT FINDS that sharing Netflix passwords is the modern equivalent of borrowing someone's car and never returning it, except worse because now you can't watch your shows.

VERDICT: Plaintiff is RIGHT. The defendant must immediately cease all Netflix activities and return the password within 24 hours.

SENTENCE: Defendant is hereby sentenced to watch only free YouTube videos for 30 days as penance.

So ordered this day,
The Honorable Judge AI`,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    title: "Neighbor's dog barks at exactly 6 AM every day",
    description:
      "Their dog has an internal alarm clock set for 6 AM sharp. Every. Single. Day. Including weekends. I've tried talking to them but they say 'dogs will be dogs.' HELP.",
    tone: "serious",
    evidence_urls: [],
    plaintiff_votes: 156,
    defendant_votes: 34,
    split_votes: 21,
    verdict_unlocked: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const votes: Vote[] = []
const comments: Comment[] = [
  {
    id: 1,
    case_id: 1,
    content: "This is why I live alone. Roommates are the worst!",
    vote_type: "plaintiff",
    likes: 12,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    case_id: 2,
    content: "Change the password and move on with your life lol",
    vote_type: "split",
    likes: 8,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

let nextCaseId = 4
let nextVoteId = 1
let nextCommentId = 3

// Helper functions
export function getAllCases(): Case[] {
  return [...cases].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function getCaseById(id: number): Case | undefined {
  return cases.find((c) => c.id === id)
}

export function createCase(
  data: Omit<
    Case,
    "id" | "created_at" | "updated_at" | "plaintiff_votes" | "defendant_votes" | "split_votes" | "verdict_unlocked"
  >,
): Case {
  const newCase: Case = {
    ...data,
    id: nextCaseId++,
    plaintiff_votes: 0,
    defendant_votes: 0,
    split_votes: 0,
    verdict_unlocked: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  cases.push(newCase)
  return newCase
}

export function addVote(caseId: number, voteType: "plaintiff" | "defendant" | "split", ipAddress: string): boolean {
  // Check if IP already voted
  const existingVote = votes.find((v) => v.case_id === caseId && v.ip_address === ipAddress)
  if (existingVote) return false

  // Add vote
  const vote: Vote = {
    id: nextVoteId++,
    case_id: caseId,
    vote_type: voteType,
    ip_address: ipAddress,
    created_at: new Date().toISOString(),
  }
  votes.push(vote)

  // Update case vote counts
  const case_ = cases.find((c) => c.id === caseId)
  if (case_) {
    if (voteType === "plaintiff") case_.plaintiff_votes++
    else if (voteType === "defendant") case_.defendant_votes++
    else if (voteType === "split") case_.split_votes++
    case_.updated_at = new Date().toISOString()
  }

  return true
}

export function addComment(
  caseId: number,
  content: string,
  voteType: "plaintiff" | "defendant" | "split",
  ipAddress: string,
): Comment | null {
  // Check if case exists
  const case_ = cases.find((c) => c.id === caseId)
  if (!case_) return null

  // Create new comment
  const comment: Comment = {
    id: nextCommentId++,
    case_id: caseId,
    content: content.trim(),
    vote_type: voteType,
    likes: 0,
    ip_address: ipAddress,
    created_at: new Date().toISOString(),
  }

  comments.push(comment)
  return comment
}

export function getCommentsForCase(caseId: number): Comment[] {
  return comments
    .filter((c) => c.case_id === caseId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function updateCaseVerdict(caseId: number, verdictText: string): boolean {
  const case_ = cases.find((c) => c.id === caseId)
  if (case_) {
    case_.verdict_unlocked = true
    case_.verdict_text = verdictText
    case_.updated_at = new Date().toISOString()
    return true
  }
  return false
}

export function hasUserVoted(caseId: number, ipAddress: string): boolean {
  return votes.some((v) => v.case_id === caseId && v.ip_address === ipAddress)
}

export function getUserVoteType(caseId: number, ipAddress: string): "plaintiff" | "defendant" | "split" | null {
  const vote = votes.find((v) => v.case_id === caseId && v.ip_address === ipAddress)
  return vote ? vote.vote_type : null
}
