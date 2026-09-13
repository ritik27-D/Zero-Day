# Islington R&D Connect

> **A Connected Institutional Research & Development Digital Hub for Islington College**

Islington R&D Connect transforms fragmented institutional research records into a living, interconnected academic ecosystem. Rather than isolating faculty, projects, publications, events, funding calls, and student supervision into disjointed pages and static documents, the platform links related entities into a searchable knowledge network. A single inquiry for a research domain simultaneously surfaces associated researchers, active projects, and scholarly outputs, establishing a continuous pathway from **Discovery** to **Collaboration**, **Documentation**, and **Governance**.

---

## Live Deployment & Repository

- **Production Deployment:** [https://zero-day-livid.vercel.app](https://zero-day-livid.vercel.app)
- **GitHub Repository:** [https://github.com/ritik27-D/Zero-Day](https://github.com/ritik27-D/Zero-Day)
- **Branch:** `main`
- **Hackathon Track:** Islington Hackathon 2026 — R&D Digital Hub
- **Team:** Zero-Day (*Bijay Kumar Yadav, Rupesh Kumar Nayak, Nitisha Nepal, Ritik Madhuman*)

---

## The Problem & The Solution

### The Institutional Challenge: Research Fragmentation
In traditional institutional web setups, academic research assets exist in disconnected departmental silos:
- **Faculty directories** act as flat contact lists without links to active projects or publications.
- **Research projects** are documented on standalone pages or PDFs without links to supervising researchers or grants.
- **Publications & Journals** are housed in separate repositories without reciprocal author attributions.
- **Conferences & Funding calls** are shared via unindexed noticeboards or buried departmental emails.
- **Student Supervision** is tracked using paper-based meeting sheets with zero institutional audit trails.

This fragmentation leads to difficult discovery, missed interdisciplinary collaborations, and administrative blind spots.

### The Solution: An Interconnected Research Ecosystem
Islington R&D Connect unifies the entire research lifecycle into a single relational platform:
1. **Discover:** Search any research topic to surface all interrelated faculty, projects, and papers together.
2. **Connect:** Navigate reciprocal entity links to inspect full research portfolios without dead ends.
3. **Collaborate:** Authenticated researchers initiate 1-on-1 direct messaging and cross-disciplinary group channels with live message delivery.
4. **Document:** Faculty log student dissertation and mentoring sessions digitally, generating formal compliance PDF reports on-the-fly.
5. **Govern:** Administrators oversee academic integrity through dedicated review queues for project proposals, supervision logs, and faculty account provisioning.

```
                    ┌────────────────────────────────────────┐
                    │       CONNECTED KNOWLEDGE GRAPH       │
                    └───────────────────┬────────────────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
      ┌─────────────┐            ┌─────────────┐            ┌─────────────┐
      │ Researchers │◀──────────▶│  Projects   │◀──────────▶│Publications │
      └──────┬──────┘            └──────┬──────┘            └──────┬──────┘
             │                          │                          │
             ▼                          ▼                          ▼
      ┌─────────────┐            ┌─────────────┐            ┌─────────────┐
      │ Supervision │            │ Opportunities│           │IJMR Gateway │
      │  & PDF Log  │            │  & Grants   │            │   Archive   │
      └──────┬──────┘            └─────────────┘            └─────────────┘
             │
             ▼
      ┌─────────────┐
      │ Realtime DM │
      │ & Channels  │
      └─────────────┘
```

---

## Core Unique Selling Propositions (USPs)

### 1. Connected Research Discovery
Unlike conventional search bars that return isolated page matches, querying a domain like *"Artificial Intelligence"* executes a multi-entity relational search. The platform simultaneously clusters and displays matching Faculty Researchers, Ongoing Projects, Academic Publications, and Specialized Research Areas with reciprocal links, transforming search into an exploratory journey.

### 2. Relationship-Aware Knowledge Network
Entities in the database are not isolated CRUD records; they maintain explicit relational foreign keys:
- A **Researcher** links to their research areas, active projects, published papers, and co-investigators.
- A **Project** links to the principal investigators, collaborating faculty, research clusters, and resulting publications.
- A **Publication** links to authors, originating projects, and the Islington Journal of Multidisciplinary Research (IJMR).

### 3. Discovery-to-Collaboration Workflow
Discovery leads directly to peer engagement. Authenticated researchers can view a peer's profile, click **Message**, and immediately launch a direct one-to-one conversation or convene a multi-faculty group project channel powered by live Supabase Realtime websocket subscriptions.

### 4. Digital Supervision & Client-Side PDF Generation
Introduced in build `3a041dd`, faculty can digitally record student mentoring sessions, dissertation progress, duration, attendance, and meeting format (Physical/Online). Researchers can compile an official institutional activity report directly in the browser via `pdf-lib` with zero server compute overhead, generating an immediate, download-ready PDF document for compliance and departmental appraisals.

---

## Role-Based Access Control (RBAC) & User Roles

The platform implements three distinct access tiers secured by Next.js middleware, server actions, and Supabase Row Level Security (RLS):

| Role | Access Level | Primary Capabilities & Boundaries |
| :--- | :--- | :--- |
| **Public Visitor** | Read-Only | Browse all 12 R&D hubs, perform connected discovery searches, inspect researcher profiles, view project/publication details, explore grants, and test interactive event registration. No login required. |
| **Researcher** | Authenticated Workspace | Secure access to `/researcher`: personalized dashboard, personal profile management, project proposal submissions, digital student supervision logging (`/researcher/log`), instant PDF export, direct/group messaging (`/researcher/messages`), and real-time activity notification center. |
| **Administrator** | Protected Governance | Secure access to `/admin`: executive metrics overview, project submission review queue (`?tab=submissions`), supervision log audit queue (`?tab=logs`), researcher credential provisioning (`?tab=accounts`), and full content management across all 12 institutional hubs. |

*Unauthorized attempts to access protected `/admin` or `/researcher` routes automatically trigger security guards and redirect with explanatory access-denied handling.*

---

## Handbook Information Architecture (12 Canonical Domains)

The platform is structured in strict alignment with Islington College's official Research & Development Directorate handbook:

| Hub / Route | Canonical Role & Contents |
| :--- | :--- |
| **1. Home (`/`)** | Central entry point, high-level institutional metrics, featured research clusters, and unified search prompt. |
| **2. About R&D (`/about`)** | Directorate mission and vision, organizational leadership, advisory board, research groups (`/about#groups`), and strategic partners (`/partners`). |
| **3. Research (`/research`)** | Core research disciplines (`research_areas`), specialized laboratory facilities, active project highlights, and measurable impact indicators. |
| **4. People (`/people` \| `/researchers`)** | Searchable faculty directory with department filters (Computing, AI, Networking, Cyber Security) and deep links to individual relational profiles. |
| **5. Projects (`/projects`)** | Institutional research portfolio categorized by status: All, Ongoing (`ongoing`), and Completed (`completed`), detailing principal investigators, objectives, and linked papers. |
| **6. Publications (`/publications`)** | Academic repository of peer-reviewed papers, conference proceedings, and technical reports, featuring a dedicated gateway to the IJMR journal. |
| **7. Conferences & Events (`/events`)** | Academic events calendar covering symposia, research workshops, seminars, and calls for papers, with an interactive event participation modal. |
| **8. Grants & Funding (`/funding`)** | Funding portal detailing internal faculty seed grants, student research stipends, external partnerships, and grant application guidelines. |
| **9. Research Support (`/research-support`)** | Institutional support resources, methodology guidelines, Word/LaTeX templates, APC publication fee waivers, and research computing tools (`/resources`). |
| **10. Ethics & Integrity (`/ethics`)** | Research Ethics Committee (REC) charter, ethics application review workflow, data protection protocols, AI ethics standards, and downloadable SOPs. |
| **11. Opportunities (`/opportunities`)** | Active calls for student research assistantships, faculty grants, conference travel stipends, and collaborative initiatives. |
| **12. Search & Discovery (`/discover`)** | Full-featured multi-entity discovery engine that queries across researchers, projects, publications, events, opportunities, and resources simultaneously. |

### Dedicated Portals & Gateways
- **IJMR Journal Gateway (`/ijmr`):** Dedicated portal for the *Islington Journal of Multidisciplinary Research*, featuring journal aims, editorial scope, author guidelines, indexing information, and published volumes.
- **Researcher Workspace (`/researcher`):** Personal dashboard, supervision logging (`/researcher/log`), messaging (`/researcher/messages`), and submissions tracker (`/researcher/submissions`).
- **Admin Governance Portal (`/admin`):** Multi-queue institutional administration with tabs for content, submissions, supervision audit logs, and account provisioning.

---

## Communication & Operations Architecture

### Real-Time Researcher Messaging (`/researcher/messages`)
- **1-on-1 Direct Messaging:** Verified faculty search peers by name or department and exchange messages in real time.
- **Group Research Channels:** Faculty create multi-member channels for collaborative project teams and interdisciplinary grants.
- **Websocket Delivery:** Powered by Supabase Realtime channels (`messages` table subscriptions) with instant delivery and presence indication.
- **Duplicate Prevention:** Automated checks prevent duplicate direct conversation threads between the same two researchers.

### Real-Time Notification Center
- Integrated notifications dropdown in both the Researcher Workspace and Admin Portal.
- Real-time alerts for incoming direct messages, group mentions, administrative submission approvals, and platform events.
- Unread badge counters update dynamically without requiring page refreshes.

### Digital Supervision & Institutional PDF Generation (`/researcher/log`)
- Faculty record student mentoring sessions: Project Name, Mentee Name, Session Date, Duration, Mentor Attendance, Student Attendance, and Physical/Online Mode.
- Submissions are recorded to `researcher_activity_logs` in PostgreSQL and queued for administrative audit.
- **Client-Side PDF Engine:** Built using `pdf-lib` to render official institutional activity reports in the browser, providing instant downloads with zero server overhead.

### Event Registration Modal Workflow (`/events`)
- An interactive modal on each event card allows attendees to submit participation interest.
- Validates user name, institutional email, role (Student / Faculty / External), and department.
- Generates an immediate institutional confirmation code (`ISL-XXXXX-XXXX`) for user feedback.
- *Note:* This interaction provides client-side validation and interface feedback; it does not persist into a database ticketing system or interface with external payment gateways.

---

## Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                  │
│   Next.js 16 (App Router)  •  React 19  •  TypeScript 5  •  Tailwind 4 │
│   Lucide Icons  •  Responsive Desktop Megamenu  •  Mobile Slideout     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                        CLIENT-SIDE PROCESSING                          │
│         pdf-lib (Browser-Compiled Institutional Activity Reports)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Server Actions & RLS
┌───────────────────────────────────▼────────────────────────────────────┐
│                         BACKEND & DATABASE                             │
│                  Supabase (Managed PostgreSQL 15+)                     │
│   Row Level Security (RLS)  •  Edge Authentication  •  Server Actions  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                           REALTIME LAYER                               │
│      Supabase Realtime Websockets (Direct & Group Collaboration)        │
└────────────────────────────────────────────────────────────────────────┘
```

- **Framework:** Next.js 16.3.5 (App Router, React Server Components, Server Actions)
- **Frontend Library:** React 19.2.8 & React DOM 19.2.8
- **Language:** TypeScript 5 (Strict mode, zero compile errors)
- **Styling:** Tailwind CSS v4 with `@tailwindcss/postcss`
- **Database:** PostgreSQL (hosted on Supabase)
- **Authentication:** Supabase Auth (JWT tokens, secure HTTP-only cookies)
- **Realtime Pub/Sub:** Supabase Realtime websocket subscriptions
- **Document Generation:** `pdf-lib` (v1.17.1) for client-side vector PDF generation
- **Code Quality & Tooling:** ESLint 9 (`eslint-config-next`), Next Turbopack

---

## Database Schema & Migrations

The relational schema is managed through 12 sequential SQL migrations in `supabase/migrations/`:

```
supabase/migrations/
├── 0001_initial_schema.sql                  # Core entities: researchers, projects, publications
├── 0002_public_read_relationships.sql       # Foreign keys & junction table read access
├── 0003_three_role_rbac_and_submissions.sql  # user_profiles, submissions, roles (public/researcher/admin)
├── 0004_digital_hub_expansion.sql           # Events, opportunities, resources, partners, announcements
├── 0005_researcher_messaging_system.sql     # conversations, conversation_members, messages
├── 0006_repair_digital_hub_schema.sql       # Schema repairs and relationship constraints
├── 0007_public_portal_read_policies.sql     # RLS policies for unauthenticated discovery access
├── 0008_realistic_hub_content.sql          # Seed data for Islington College departments
├── 0009_replace_placeholder_partners.sql    # Authentic academic and corporate partners
├── 0010_replace_placeholder_resources.sql   # Research templates, methodology SOPs, tools
├── 0011_researcher_activity_logs.sql        # researcher_activity_logs table & RLS policies
└── 0012_researcher_log_review.sql          # Admin audit columns (review_status, reviewer_notes)
```

### Key Relational Entities
- `researchers` ↔ `researcher_research_areas` ↔ `research_areas`
- `researchers` ↔ `project_members` ↔ `projects`
- `researchers` ↔ `publication_authors` ↔ `publications`
- `projects` ↔ `project_publications` ↔ `publications`
- `conversations` ↔ `conversation_members` ↔ `messages`
- `user_profiles` ↔ `researchers` (Auth identity binding)
- `researcher_activity_logs` (Supervision sessions, duration, attendance, review status)
- `researcher_submissions` (Project/profile change proposals, approval lifecycle)

---

## Project Directory Structure

```
.
├── hackathon-evidence/                     # Screenshot audits, pitch deck, and official DOCX docs
│   ├── 01_home/ ... 14_other_unique_features/ # 46 high-res evidence captures
│   ├── HACKATHON_FEATURE_AND_SCREENSHOT_AUDIT.md
│   ├── Islington R&D Connect - Final Documentation.docx
│   └── Islington_R&D_Connect_Final_Pitch_Deck.pptx
├── public/
│   ├── images/                             # Official branding logos (islington-rd, ijmr)
│   └── uploads/                            # Uploaded profile photos and media
├── src/
│   ├── app/                                # Next.js App Router route handlers & pages
│   │   ├── about/                          # About R&D Hub & Leadership
│   │   ├── admin/                          # Admin Governance Portal (?tab=submissions|logs|accounts)
│   │   │   ├── actions.ts                  # Admin moderation & account provisioning actions
│   │   │   ├── login/                      # Dedicated Admin authentication portal
│   │   │   └── page.tsx                    # Admin executive dashboard & multi-queue view
│   │   ├── announcements/                  # Institutional news & calls
│   │   ├── discover/                       # Multi-entity unified research discovery
│   │   ├── ethics/                         # Research ethics guidelines & application steps
│   │   ├── events/                         # Symposia, conferences & event registration modal
│   │   ├── funding/                        # Research grants & seed funding portal
│   │   ├── ijmr/                           # Flagship IJMR Journal Gateway
│   │   ├── login/                          # Researcher authentication portal
│   │   ├── opportunities/                  # Student & faculty research opportunities
│   │   ├── partners/                       # Academic & industry collaborative alliances
│   │   ├── people/                         # Faculty & researcher directory
│   │   ├── projects/                       # Relational research projects portfolio
│   │   ├── publications/                   # Scholarly publications & peer-reviewed archive
│   │   ├── research/                       # Research disciplines & laboratory clusters
│   │   ├── research-support/               # Research methodology, SOPs & toolkits
│   │   ├── researcher/                     # Authenticated Faculty Workspace
│   │   │   ├── actions.ts                  # Researcher submission & supervision actions
│   │   │   ├── layout.tsx                  # Workspace shell & unread notification polling
│   │   │   ├── log/                        # Digital Supervision Log & Client-Side PDF generator
│   │   │   ├── messages/                   # Real-time 1-on-1 and Group Messaging
│   │   │   ├── profile/                    # Profile information management
│   │   │   ├── projects/                   # Project proposal manager
│   │   │   ├── publications/               # Publication link manager
│   │   │   └── submissions/                # Proposal status tracking (Pending/Approved/Rejected)
│   │   ├── resources/                      # Downloadable templates & computing resources
│   │   ├── layout.tsx                      # Global root layout & navigation header
│   │   └── page.tsx                        # Homepage entry point
│   ├── components/
│   │   ├── event-register-modal.tsx        # Event participation modal
│   │   ├── layout-shell.tsx                # Universal institutional header & megamenu
│   │   └── notifications-dropdown.tsx      # Real-time activity notifications component
│   └── lib/
│       ├── auth-actions.ts                 # Sign in / Sign out server actions
│       ├── auth.ts                         # Session validation & RBAC route guards
│       ├── hub-data.ts                     # Canonical cached database getters across all hubs
│       ├── messaging.ts                    # Relational conversation & message handlers
│       ├── notifications.ts                # Notification dispatch and query handlers
│       ├── researcher-images.ts            # Avatar helpers & fallbacks
│       ├── researcher-logs.ts              # Supervision log database mutations & queries
│       ├── submissions.ts                  # Content proposal submission logic
│       └── supabase/                       # Supabase client & server factories
└── supabase/
    └── migrations/                         # 12 sequential PostgreSQL schema migrations
```

---

## Local Development & Setup

### Prerequisites
- **Node.js:** v20.x or v22.x LTS
- **npm:** v10.x+
- **Supabase Account:** Free or Pro project with PostgreSQL database

### 1. Clone the Repository
```bash
git clone https://github.com/ritik27-D/Zero-Day.git
cd Zero-Day
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
```

> **Security Note:** Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` to client-side code. The service role key is strictly utilized in server-side actions for administrative operations and RBAC management.

### 4. Apply Database Migrations
In your Supabase Dashboard, open the **SQL Editor** and execute the migration files from `supabase/migrations/` sequentially from `0001` through `0012`.

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Code Quality & Verification Commands

The codebase enforces strict TypeScript typing and ESLint rules. All commands complete cleanly with zero errors:

```bash
# Run TypeScript compilation check
npm run typecheck

# Run ESLint validation
npm run lint

# Compile production build
npm run build

# Start production build locally
npm run start
```

---

## Demo & Prototype Data Notice

To facilitate immediate evaluation during the Islington Hackathon 2026:
- The platform is populated with **curated demonstration data** representing Islington College faculty, research clusters, active initiatives, publications, and upcoming 2026 events.
- All demo records are tagged with an institutional demo indicator to maintain full transparency.
- Full campus-wide production rollout will involve integrating authoritative institutional databases and migrating verified historical records.

---

## Future Roadmap (Planned Scope)

The following architectural extensions are planned for post-hackathon institutional deployment:
1. **Institutional Single Sign-On (SSO):** Integration with campus Active Directory / SAML 2.0 / OAuth2 credentials.
2. **Authoritative HR & SIS Synchronization:** Automated synchronization with college student management systems.
3. **AI-Powered Semantic Recommendations:** Utilizing PostgreSQL `pgvector` embeddings for semantic paper matching and automated researcher matchmaking.
4. **Persistent Conference Ticketing:** Integration with institutional calendar feeds and digital ticket issuance for campus symposia.
5. **Progressive Web App (PWA):** Offline publication caching and native push notifications for faculty mobile devices.

---

## Team & Credits

Developed by **Team Zero-Day** for the **Islington Hackathon 2026**:
- **Bijay Kumar Yadav** — Frontend Development & Research Discovery Interface
- **Rupesh Kumar Nayak** — Backend Development & Database Architecture
- **Nitisha Nepal** — UI/UX Design & Research Ecosystem Design
- **Ritik Madhuman** — Testing, Quality Assurance & System Integration

*Developed for Islington College. All rights reserved.*
