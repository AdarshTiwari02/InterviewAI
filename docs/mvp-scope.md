# InterviewAI MVP Scope

## Goal
Deliver a usable end-to-end interview prep flow:
Profile setup -> AI blueprint -> one mock interview -> feedback -> targeted practice.

## In Scope (MVP)

### 1. Authentication & Onboarding
- Email/password signup and login
- Basic profile setup wizard:
  - Experience level
  - Target roles
  - Target company types
  - Resume upload (PDF/DOCX)
  - Optional JD input (company, title, JD text)

### 2. AI Preparation Blueprint
- Resume + JD parsing (v1)
- Skill extraction and basic gap analysis
- ATS-style score (v1)
- Personalized interview blueprint card on dashboard

### 3. Mock Interview Simulator (v1)
- Text-first interview experience
- Round flow: ask question -> user answer -> follow-up
- One technical + one behavioral template flow
- Transcript capture

### 4. Coding Practice (v1)
- Problem bank with:
  - Topic tags
  - Difficulty tags
  - Company tags
- Problem detail page with editor area placeholder
- Save attempt metadata (without full contest engine)

### 5. Feedback Dashboard (v1)
- Overall score
- Strengths
- Weaknesses
- Recommended next topics
- Interview transcript view

### 6. Freemium Gating (basic)
- Free tier: limited interviews/problems
- Premium flags in backend for future unlock

## Out of Scope (Post-MVP)

- Live video avatar interviewer
- Advanced voice pipeline (real-time low-latency STT/TTS)
- Webcam proctoring (eye movement / multi-face detection)
- Full coding contest engine + Elo leaderboard
- Deep LinkedIn scraping automation
- Advanced GitHub contribution intelligence
- Mobile apps (React Native/Flutter)
- Enterprise analytics/benchmarking

## MVP Success Criteria
- User can onboard and submit profile/resume
- System generates a meaningful interview blueprint
- User can complete at least one mock interview session
- User receives structured feedback and next-step recommendations
- User can solve/browse practice questions tied to weak areas