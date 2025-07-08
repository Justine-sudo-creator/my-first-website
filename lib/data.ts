// Enhanced data store with clean human judge verdict system

export interface Case {
  id: number
  title: string
  description: string
  tone: "serious" | "satirical" | "unhinged"
  theme?: string
  evidence_urls: string[]
  plaintiff_votes: number
  defendant_votes: number
  split_votes: number
  status: "voting" | "awaiting_verdict" | "decided"
  submitter_id: string
  created_at: string
  updated_at: string
  is_featured: boolean
  boost_expires?: string
  judge_id?: string // NEW – set when a judge takes the case
}

export interface Verdict {
  id: number
  case_id: number
  judge_id: string
  verdict_text: string
  likes: number
  tips_received: number
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  ip_address: string
  username: string
  avatar: string
  karma_points: number
  level: number
  title: string
  badges: string[]
  cases_voted: number
  cases_submitted: number
  verdicts_written: number
  is_judge: boolean
  judge_level: number
  judge_rating: number
  created_at: string
  last_active: string
  premium_expires?: string
}

export interface Vote {
  id: number
  case_id: number
  vote_type: "plaintiff" | "defendant" | "split"
  user_id: string
  created_at: string
}

export interface Comment {
  id: number
  case_id: number
  content: string
  vote_type: "plaintiff" | "defendant" | "split"
  likes: number
  user_id: string
  created_at: string
}

export interface Notification {
  id: number
  user_id: string
  type: "verdict_ready" | "badge_earned" | "case_viral" | "judge_application" | "case_awaiting_verdict"
  title: string
  message: string
  read: boolean
  created_at: string
}

// Constants
const VERDICT_THRESHOLD = 10 // votes needed before case can be judged

// In-memory storage
const cases: Case[] = [
  {
    id: 1,
    title: "My roommate ate my leftover pizza AGAIN",
    description:
      "I clearly labeled it with my name and put it in the fridge. This is the third time this month. I'm considering legal action (not really but I'm mad).",
    tone: "satirical",
    theme: "roommate_wars",
    evidence_urls: [],
    plaintiff_votes: 47,
    defendant_votes: 12,
    split_votes: 8,
    status: "decided",
    submitter_id: "192.168.1.100",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    is_featured: true,
  },
  {
    id: 2,
    title: "Ex won't return my Netflix password",
    description:
      "We broke up 3 months ago and they're still using MY Netflix account. I pay for it, they should give me the password back so I can change it. This is theft!",
    tone: "unhinged",
    theme: "relationship_drama",
    evidence_urls: [],
    plaintiff_votes: 89,
    defendant_votes: 23,
    split_votes: 15,
    status: "decided",
    submitter_id: "192.168.1.101",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    is_featured: false,
  },
  {
    id: 3,
    title: "Neighbor's dog barks at exactly 6 AM every day",
    description:
      "Their dog has an internal alarm clock set for 6 AM sharp. Every. Single. Day. Including weekends. I've tried talking to them but they say 'dogs will be dogs.' HELP.",
    tone: "serious",
    theme: "neighbor_disputes",
    evidence_urls: [],
    plaintiff_votes: 15,
    defendant_votes: 3,
    split_votes: 2,
    status: "awaiting_verdict",
    submitter_id: "192.168.1.102",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    is_featured: false,
  },
  {
    id: 4,
    title: "Friend always orders the most expensive thing when I'm paying",
    description:
      "Every time we go out and I offer to pay (birthdays, celebrations), they suddenly develop expensive taste. When they pay, they suggest McDonald's. This is calculated!",
    tone: "satirical",
    theme: "friendship_drama",
    evidence_urls: [],
    plaintiff_votes: 5,
    defendant_votes: 2,
    split_votes: 1,
    status: "voting",
    submitter_id: "192.168.1.103",
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    is_featured: false,
  },
]

const verdicts: Verdict[] = [
  {
    id: 1,
    case_id: 1,
    judge_id: "judge_karen_001",
    verdict_text: `🍕 THE HONORABLE JUDGE KAREN'S RULING 🍕

Case #2024-PETTY-001: The Great Pizza Heist

After reviewing the evidence and the overwhelming jury vote (70% for plaintiff), this court finds the defendant GUILTY of Leftover Larceny in the First Degree.

VERDICT: Plaintiff is absolutely right! Eating clearly labeled food is a crime against roommate-kind.

SENTENCE: Defendant must:
1. Buy plaintiff a whole pizza of their choice
2. Write "I will not eat Sarah's food" 100 times on the fridge
3. Do dishes for a week

The audacity! The disrespect! Justice has been served! 

⚖️ Judge Karen
"Keeping roommates accountable since 2024"`,
    likes: 23,
    tips_received: 150,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    case_id: 2,
    judge_id: "judge_chaos_666",
    verdict_text: `💀 JUDGE CHAOS HAS ENTERED THE CHAT 💀

YOOOOO this is PEAK petty energy and I am LIVING for it!!!

Your ex really said "we may be done but The Office isn't" and kept your Netflix like it's community property! THE AUDACITY! THE DISRESPECT!

VERDICT: PLAINTIFF IS RIGHT AND DESERVES JUSTICE!

SENTENCE: Ex must immediately:
- Log out of Netflix RIGHT NOW
- Delete their profile 
- Pay for their own subscription
- Send you $20 for emotional damages
- BANNED from using anyone's streaming passwords for 6 months

This court has SPOKEN! Don't let anyone freeload on your Netflix! 

🔥 Judge Chaos
"Bringing unhinged justice to your petty problems"`,
    likes: 45,
    tips_received: 75,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const users: Map<string, User> = new Map([
  [
    "192.168.1.100",
    {
      id: "192.168.1.100",
      ip_address: "192.168.1.100",
      username: "PizzaVictim",
      avatar: "🍕",
      karma_points: 25,
      level: 3,
      title: "Jury Duty Dodger",
      badges: ["First Case", "Viral Case Creator"],
      cases_voted: 15,
      cases_submitted: 1,
      verdicts_written: 0,
      is_judge: false,
      judge_level: 0,
      judge_rating: 0,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      last_active: new Date().toISOString(),
    },
  ],
  [
    "judge_karen_001",
    {
      id: "judge_karen_001",
      ip_address: "judge_karen_001",
      username: "Judge Karen",
      avatar: "👩‍⚖️",
      karma_points: 150,
      level: 6,
      title: "Roast Prosecutor",
      badges: ["Verified Judge", "50 Verdicts", "Roommate Specialist"],
      cases_voted: 45,
      cases_submitted: 3,
      verdicts_written: 52,
      is_judge: true,
      judge_level: 3,
      judge_rating: 4.8,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      last_active: new Date().toISOString(),
    },
  ],
  [
    "judge_chaos_666",
    {
      id: "judge_chaos_666",
      ip_address: "judge_chaos_666",
      username: "Judge Chaos",
      avatar: "💀",
      karma_points: 200,
      level: 7,
      title: "Drama Magistrate",
      badges: ["Verified Judge", "Unhinged Specialist", "100 Verdicts"],
      cases_voted: 67,
      cases_submitted: 5,
      verdicts_written: 103,
      is_judge: true,
      judge_level: 4,
      judge_rating: 4.9,
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      last_active: new Date().toISOString(),
    },
  ],
])

const votes: Vote[] = []
const comments: Comment[] = []
const notifications: Notification[] = []

let nextCaseId = 5
let nextVerdictId = 3
let nextVoteId = 1
let nextCommentId = 1
let nextNotificationId = 1

// Karma and leveling system
const KARMA_ACTIONS = {
  VOTE: 1,
  SUBMIT_CASE: 5,
  COMMENT: 2,
  WRITE_VERDICT: 15,
  CASE_GOES_VIRAL: 10,
  VERDICT_LIKED: 3,
}

const LEVELS = [
  { level: 1, title: "Court Jester", karma_required: 0 },
  { level: 2, title: "Petty Plaintiff", karma_required: 10 },
  { level: 3, title: "Jury Duty Dodger", karma_required: 25 },
  { level: 4, title: "Armchair Attorney", karma_required: 50 },
  { level: 5, title: "Bar Exam Dropout", karma_required: 100 },
  { level: 6, title: "Roast Prosecutor", karma_required: 200 },
  { level: 7, title: "Drama Magistrate", karma_required: 350 },
  { level: 8, title: "Chaos Judge", karma_required: 500 },
  { level: 9, title: "Supreme Roaster", karma_required: 750 },
  { level: 10, title: "The Honorable Roaster", karma_required: 1000 },
]

// Helper functions
export function getOrCreateUser(ipAddress: string): User {
  if (!users.has(ipAddress)) {
    const randomAvatars = ["😎", "🤓", "😤", "🙄", "😏", "🤔", "😮‍💨", "🫠"]
    const newUser: User = {
      id: ipAddress,
      ip_address: ipAddress,
      username: `Judge${ipAddress.slice(-4)}`,
      avatar: randomAvatars[Math.floor(Math.random() * randomAvatars.length)],
      karma_points: 0,
      level: 1,
      title: "Court Jester",
      badges: [],
      cases_voted: 0,
      cases_submitted: 0,
      verdicts_written: 0,
      is_judge: false,
      judge_level: 0,
      judge_rating: 0,
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
    }
    users.set(ipAddress, newUser)
  }
  return users.get(ipAddress)!
}

export function addKarma(userId: string, action: keyof typeof KARMA_ACTIONS, bonus = 0): User {
  const user = getOrCreateUser(userId)
  const karmaGain = KARMA_ACTIONS[action] + bonus

  user.karma_points += karmaGain
  user.last_active = new Date().toISOString()

  // Check for level up
  const newLevel = LEVELS.reduce((maxLevel, level) => {
    return user.karma_points >= level.karma_required ? level : maxLevel
  }, LEVELS[0])

  if (newLevel.level > user.level) {
    user.level = newLevel.level
    user.title = newLevel.title
    addNotification(userId, "badge_earned", "Level Up!", `You've reached ${newLevel.title}!`)
  }

  users.set(userId, user)
  return user
}

export function addNotification(userId: string, type: Notification["type"], title: string, message: string): void {
  const notification: Notification = {
    id: nextNotificationId++,
    user_id: userId,
    type,
    title,
    message,
    read: false,
    created_at: new Date().toISOString(),
  }
  notifications.push(notification)
}

export function getAllCases(filter?: { status?: string; theme?: string; sortBy?: string }): Case[] {
  let filteredCases = [...cases]

  if (filter?.status) {
    filteredCases = filteredCases.filter((c) => c.status === filter.status)
  }

  if (filter?.theme) {
    filteredCases = filteredCases.filter((c) => c.theme === filter.theme)
  }

  // Sort cases
  switch (filter?.sortBy) {
    case "trending":
      filteredCases.sort((a, b) => {
        const totalA = a.plaintiff_votes + a.defendant_votes + a.split_votes
        const totalB = b.plaintiff_votes + b.defendant_votes + b.split_votes
        return totalB - totalA
      })
      break
    case "recent":
    default:
      filteredCases.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  return filteredCases
}

export function getCaseById(id: number): Case | undefined {
  return cases.find((c) => c.id === id)
}

export function getVerdictByCaseId(caseId: number): Verdict | undefined {
  return verdicts.find((v) => v.case_id === caseId)
}

export function getVerdictsByJudgeId(judgeId: string): Verdict[] {
  return verdicts.filter((v) => v.judge_id === judgeId)
}

export function createCase(
  data: Omit<
    Case,
    "id" | "created_at" | "updated_at" | "plaintiff_votes" | "defendant_votes" | "split_votes" | "status"
  >,
): Case {
  const newCase: Case = {
    ...data,
    id: nextCaseId++,
    plaintiff_votes: 0,
    defendant_votes: 0,
    split_votes: 0,
    status: "voting",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_featured: false,
  }
  cases.push(newCase)

  // Award karma for case submission
  addKarma(data.submitter_id, "SUBMIT_CASE")

  return newCase
}

export function addVote(caseId: number, voteType: "plaintiff" | "defendant" | "split", userId: string): boolean {
  // Check if user already voted
  const existingVote = votes.find((v) => v.case_id === caseId && v.user_id === userId)
  if (existingVote) return false

  // Add vote
  const vote: Vote = {
    id: nextVoteId++,
    case_id: caseId,
    vote_type: voteType,
    user_id: userId,
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

    // Check if case should move to awaiting verdict
    const totalVotes = case_.plaintiff_votes + case_.defendant_votes + case_.split_votes
    if (totalVotes >= VERDICT_THRESHOLD && case_.status === "voting") {
      case_.status = "awaiting_verdict"

      // Notify submitter
      addNotification(
        case_.submitter_id,
        "case_awaiting_verdict",
        "Your Case is Ready for Judgment!",
        `Case "${case_.title}" has reached ${VERDICT_THRESHOLD} votes and is now awaiting a judge's verdict.`,
      )
    }
  }

  // Award karma for voting
  const user = addKarma(userId, "VOTE")
  user.cases_voted++
  users.set(userId, user)

  return true
}

export function submitVerdict(caseId: number, judgeId: string, verdictText: string): boolean {
  const case_ = cases.find((c) => c.id === caseId)
  const judge = users.get(judgeId)

  if (case_ && judge && judge.is_judge && case_.status === "awaiting_verdict") {
    // Create verdict
    const verdict: Verdict = {
      id: nextVerdictId++,
      case_id: caseId,
      judge_id: judgeId,
      verdict_text: verdictText,
      likes: 0,
      tips_received: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    verdicts.push(verdict)

    // Update case status
    case_.status = "decided"
    case_.updated_at = new Date().toISOString()

    // Award karma to judge
    addKarma(judgeId, "WRITE_VERDICT")
    judge.verdicts_written++
    users.set(judgeId, judge)

    // Notify case submitter
    addNotification(
      case_.submitter_id,
      "verdict_ready",
      "Your Verdict is Ready!",
      `Case "${case_.title}" has been judged by ${judge.username}!`,
    )

    return true
  }
  return false
}

export function getCasesAwaitingVerdict(): Case[] {
  return cases.filter((c) => c.status === "awaiting_verdict")
}

export function applyToBeJudge(userId: string): boolean {
  const user = getOrCreateUser(userId)

  if (!user.is_judge && user.karma_points >= 50) {
    user.is_judge = true
    user.judge_level = 1
    user.badges.push("Verified Judge")
    users.set(userId, user)

    addNotification(userId, "judge_application", "Welcome Judge!", "Your application has been approved!")
    return true
  }
  return false
}

export function getLeaderboard(type: "karma" | "judges" | "voters" = "karma", limit = 10): User[] {
  let sortedUsers = Array.from(users.values())

  switch (type) {
    case "judges":
      sortedUsers = sortedUsers.filter((u) => u.is_judge).sort((a, b) => b.verdicts_written - a.verdicts_written)
      break
    case "voters":
      sortedUsers = sortedUsers.sort((a, b) => b.cases_voted - a.cases_voted)
      break
    default:
      sortedUsers = sortedUsers.sort((a, b) => b.karma_points - a.karma_points)
  }

  return sortedUsers.slice(0, limit)
}

export function getUserNotifications(userId: string): Notification[] {
  return notifications
    .filter((n) => n.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function hasUserVoted(caseId: number, userId: string): boolean {
  return votes.some((v) => v.case_id === caseId && v.user_id === userId)
}

export function getUserVoteType(caseId: number, userId: string): "plaintiff" | "defendant" | "split" | null {
  const vote = votes.find((v) => v.case_id === caseId && v.user_id === userId)
  return vote ? vote.vote_type : null
}

export function getCommentsForCase(caseId: number): Comment[] {
  return comments
    .filter((c) => c.case_id === caseId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function addComment(
  caseId: number,
  content: string,
  voteType: "plaintiff" | "defendant" | "split",
  userId: string,
): Comment | null {
  const case_ = cases.find((c) => c.id === caseId)
  if (!case_) return null

  const comment: Comment = {
    id: nextCommentId++,
    case_id: caseId,
    content: content.trim(),
    vote_type: voteType,
    likes: 0,
    user_id: userId,
    created_at: new Date().toISOString(),
  }

  comments.push(comment)
  addKarma(userId, "COMMENT")
  return comment
}

/* ------------------------------------------------------------------*/
/* Compatibility helpers for existing routes & UI                    */
/* ------------------------------------------------------------------*/

/**
 * A judge “takes” a case before writing the verdict.
 * Returns true if assignment succeeded.
 */
export function assignCaseToJudge(caseId: number, judgeId: string): boolean {
  const case_ = cases.find((c) => c.id === caseId)
  const judge = users.get(judgeId)

  if (
    case_ &&
    judge &&
    judge.is_judge &&
    case_.status === "awaiting_verdict" &&
    (!case_.judge_id || case_.judge_id === judgeId)
  ) {
    case_.judge_id = judgeId
    case_.updated_at = new Date().toISOString()
    return true
  }
  return false
}

/**
 * Used by the (legacy) webhook to store an already-generated verdict.
 * Also marks the case decided. Returns true on success.
 */
export function updateCaseVerdict(caseId: number, verdictText: string): boolean {
  const case_ = cases.find((c) => c.id === caseId)
  if (!case_ || case_.status === "decided") return false

  // Save verdict through the regular helper so karma / notifications fire
  return submitVerdict(caseId, "system_webhook", verdictText)
}

/**
 * Lightweight stats summary for a user profile panel.
 */
export function getUserStats(userId: string) {
  const user = getOrCreateUser(userId)
  return {
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    karma_points: user.karma_points,
    level: user.level,
    title: user.title,
    badges: user.badges,
    cases_voted: user.cases_voted,
    cases_submitted: user.cases_submitted,
    verdicts_written: user.verdicts_written,
    is_judge: user.is_judge,
    judge_level: user.judge_level,
    judge_rating: user.judge_rating,
  }
}
