# InterviewAI System Overview (MVP)

## 1) Service Boundaries

### frontend-web (React)
Owns all user-facing interfaces:
- Auth screens (signup/login)
- Onboarding/profile wizard
- Dashboard (Blueprint, ATS, Feedback summaries)
- Mock interview UI (text-first)
- Practice problem browsing

### backend-api (FastAPI)
Owns core business APIs and orchestration:
- Authentication/session APIs
- Profile and target-role/company APIs
- Resume/JD upload APIs
- Blueprint retrieval APIs
- Interview session state APIs
- Feedback retrieval APIs
- Entitlement/freemium checks

### realtime-service (Node.js + Socket.IO)
Owns real-time interview messaging:
- Session channel management
- Question/answer event streaming
- Typing/presence/session status events
- Bridge for live interview interactions

### ai-worker (Python async worker)
Owns long-running AI and parsing jobs:
- Resume text extraction + structuring
- JD parsing + requirement extraction
- ATS scoring and gap analysis
- Personalized interview blueprint generation
- Post-interview feedback synthesis

## 2) Communication Model

### Synchronous (REST)
Used for deterministic CRUD and reads:
- Auth, profile save/read
- Upload metadata creation
- Dashboard reads
- Interview session creation/fetch

### Asynchronous (Queue)
Used for non-blocking heavy tasks:
- Resume/JD parse jobs
- ATS computation
- Blueprint generation
- Feedback generation

Flow:
1. backend-api enqueues job
2. ai-worker consumes and processes
3. ai-worker persists result
4. frontend polls or receives status update

### Real-time (WebSocket)
Used during active interview sessions:
- AI question emitted to candidate
- Candidate answer streamed back
- Follow-up prompts delivered with low latency

## 3) Data & Storage

### PostgreSQL (primary relational store)
Core entities:
- users
- profiles
- target_roles
- target_company_types
- resumes (metadata)
- job_descriptions
- parsed_artifacts
- ats_scores
- interview_sessions
- interview_messages
- feedback_reports
- subscriptions/entitlements

### Object Storage (S3/GCS equivalent)
Stores binary/unstructured files:
- uploaded resumes
- interview recordings (post-MVP full use)
- exported reports/transcripts (optional)

Store only file references and metadata in PostgreSQL.

## 4) Key Request Lifecycle (Onboarding -> Blueprint)

1. User completes onboarding in frontend-web.
2. frontend-web sends profile + optional JD + resume metadata to backend-api.
3. backend-api stores base records and enqueues parsing/scoring jobs.
4. ai-worker:
   - extracts and parses resume/JD
   - computes ATS-style score
   - generates personalized interview blueprint
5. ai-worker writes outputs to PostgreSQL.
6. frontend-web dashboard fetches computed results via backend-api.
7. User sees:
   - ATS summary
   - detected gaps
   - recommended interview round plan

## 5) MVP Non-Goals (explicit)
Not included in initial architecture deliverable:
- Webcam proctoring pipeline
- Full contest engine with Elo leaderboard
- Deep third-party scraping automation
- Mobile app clients

## 6) Design Principles
- Keep API layer stateless and horizontally scalable.
- Isolate long-running AI work in ai-worker.
- Preserve auditable job status for every AI-generated artifact.
- Prefer explicit versioning for prompts/scoring logic.
- Build entitlement checks in backend-api, not frontend.