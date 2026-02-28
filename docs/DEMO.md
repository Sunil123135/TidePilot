# TidePilot Demo Script

## Persona
**Role:** Senior supply chain leader building thought leadership  
**Goal:** 2 posts/week + engagement flywheel  
**Pain:** Inconsistent voice, generic content, no system for engagement

---

## Demo Flow (10-12 minutes)

### 1. Hook (30 sec)
"Most tools generate content. TidePilot runs your personal brand as an operating system. Let me show you how."

### 2. Voice Lab (2 min)
- **Show:** 5 writing samples (LinkedIn posts, emails, notes)
- **Action:** Click "Generate Voice Profile"
- **Show:** 
  - Signature moves: "Short sentences. Concrete examples. One clear CTA."
  - Forbidden phrases: "synergy", "leverage", "disrupt"
  - Example paragraph in their voice
- **Narrative:** "This is your voice, extracted and operationalized."

### 3. Studio (3 min)
- **Open:** A rough draft (status: Idea)
- **Action:** Click "Quality check"
- **Show:** Scores (hook: 60%, clarity: 70%, specificity: 65%) + "Too generic" warning
- **Action:** Click "Rewrite to Voice"
- **Show:** Diff view (original vs rewritten) with changes highlighted
- **Action:** Click "Accept"
- **Show:** Voice score improved to 90%
- **Action:** Change status to "Ready"
- **Narrative:** "From idea to ready in one flow. No more generic content."

### 4. Engagement Cockpit (2 min)
- **Show:** Inbound comments (10 pending)
- **Action:** Click "Suggest replies" on one comment
- **Show:** 3 variants (warm, concise, bold) with voice match scores (85%, 90%, 88%)
- **Action:** Pick one, mark as "Replied"
- **Narrative:** "Every reply matches your voice. No more tone drift."

### 5. Operator Brief (2 min)
- **Show:** Latest weekly brief
- **Show:** 
  - Insights: "Question hooks performed 2x better"
  - Actions checklist (with one checked off)
  - Post suggestions: "Why we say no to 90% of feature requests"
- **Action:** Click "Create draft" from a post suggestion
- **Show:** New draft opens in Studio, pre-filled with LinkedIn channel
- **Narrative:** "Your weekly decision engine. No more guessing what to post."

### 6. Analytics (1-2 min)
- **Show:** Engagement volume chart (last 7 days)
- **Show:** Goals page with progress bars:
  - Posts: 1/2 (50%)
  - Comments: 3/5 (60%)
  - Conversations: 2/3 (67%)
- **Narrative:** "Measurable outcomes. You can see what's working."

### 7. Close (30 sec)
"This is measurable behavior change: fewer edits, stronger hooks, and consistent engagement. Your brand as an operating system."

---

## Key Talking Points

- **Voice consistency:** Show before/after voice scores
- **Reduced edits:** Diff view shows exactly what changed
- **Systematic engagement:** No more ad-hoc replies
- **Data-driven:** Analytics show what works
- **No scraping:** Manual import model (privacy-first)

---

## Demo Checklist

- [ ] Seed data loaded (5 samples, 10 drafts, 30 engagement items, 4 briefs)
- [ ] Voice profile generated
- [ ] At least one draft in "Idea" status
- [ ] At least one draft in "Ready" status
- [ ] Post suggestions visible on home
- [ ] Engagement items with pending status
- [ ] Analytics chart showing data
- [ ] Goals page showing progress

---

## Troubleshooting

- **No post suggestions:** Check seed has `postSuggestions` in WeeklyBrief
- **No engagement data:** Check seed created 30 EngagementItems
- **Chart empty:** Check EngagementItems have `createdAt` dates within last 7 days
- **Voice profile missing:** Run "Generate Voice Profile" in Voice Lab
