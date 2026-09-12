# Islington R&D Connect

Islington R&D Connect is an institutional Research & Development Digital Hub designed for Islington College. It bridges the gap between academic research, faculty investigators, student innovators, and external stakeholders by transforming isolated departmental silos into an interconnected, searchable academic knowledge graph.

The platform provides a centralized, relational gateway to explore faculty researchers, active and completed research projects, peer-reviewed publications, academic conferences, grant funding opportunities, research ethics protocols, and institutional partnership alliances.

---

## Live Demo

**Live Demo:** [https://zero-day-livid.vercel.app](https://zero-day-livid.vercel.app)

*Evaluators and invigilators can access the live production deployment directly using the link above.*

---

## Repository

- **GitHub Repository:** [https://github.com/ritik27-D/Zero-Day](https://github.com/ritik27-D/Zero-Day)
- **Branch:** `main`

---

## Technology Stack

- **Framework:** Next.js 16 (App Router, Server Components, Server Actions)
- **Frontend & UI:** React 19, Tailwind CSS v4, Responsive Desktop Dropdown Navigation & Mobile Slideout Drawer
- **Language:** TypeScript 5 (Strict Mode, 0 compile errors)
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Secure Session Auth)
- **Tooling & Linter:** ESLint 9, Next Turbopack
- **Hosting & Edge Deployment:** Vercel

---

## Handbook Information Architecture (12 Canonical Domains)

The platform is structured in full alignment with the official Hackathon Handbook specification, featuring responsive dropdown menus on desktop and expandable accordions on mobile:

1. **HOME (`/`):** High-level overview, live research KPI metrics, highlights carousel, and unified discovery entry point.
2. **ABOUT R&D (`/about`):** Institutional mission & vision, governance structure, academic leadership, advisory board, research teams (`research_groups`), and strategic partners (`partners`).
3. **RESEARCH (`/research`):** Core research areas (`research_areas`), specialized interest groups/labs, active/completed projects, research compute facilities, and measurable academic impact metrics.
4. **PEOPLE (`/people` | alias `/researchers`):** Academic faculty and researcher directory, profiles, department filters (Computing, AI, Networking), area specializations, and affiliated lab clusters.
5. **PROJECTS (`/projects`):** Project portfolio categorized by status: All Projects, Active Projects (`ongoing`), Completed Projects (`completed`), and Project Archive.
6. **PUBLICATIONS (`/publications`):** Scholarly publications filtered by output type: Journal Articles, Conference Papers, Institutional Reports, and Other Outputs, with a dedicated callout to the IJMR Gateway (`/ijmr`).
7. **CONFERENCES & EVENTS (`/events`):** Academic events filtered by category: Upcoming Events, Conferences, Seminars, Workshops, Calls for Papers, Proceedings, and Past Events.
8. **GRANTS & FUNDING (`/funding`):** Research funding portal covering Current Opportunities, Internal Faculty Seed Grants, External Grants & Industry Sponsorships, Funding Guidelines & SOPs, and Previous Funded Projects.
9. **RESEARCH SUPPORT (`/research-support`):** Comprehensive scholarly support covering Methodology Guidance, Resources Directory (`/resources`), Institutional Templates (LaTeX/Word), Publication Support & APC waivers, Academic Writing workshops, and Research Compute Tools.
10. **ETHICS & INTEGRITY (`/ethics`):** Research Ethics framework, Research Ethics Committee (REC) charter, step-by-step Ethics Application workflow, Research Integrity codes, Data Protection (GDPR/Nepal Privacy Act), AI Ethics standards, and downloadable SOPs.
11. **OPPORTUNITIES (`/opportunities`):** Targeted research calls filtered by Student Opportunities, Faculty Opportunities, Research Assistantships, Grants, Conferences, and Calls for Papers.
12. **SEARCH (`/discover`):** Unified multi-entity search labeled "Search Islington Research", allowing full-text cross-entity discovery across researchers, projects, publications, events, opportunities, and resources.

---

## Key Platform Capabilities

### 1. Connected Research Trail (Interactive Knowledge Graph)
A relational flow demonstrating the full research lineage in real time:
`Research Field` &rarr; `Lead Investigators` &rarr; `Research Project` &rarr; `Peer-Reviewed Publication & DOI`

### 2. Multi-Entity Unified Discovery (`/discover`)
A unified academic search engine that queries across:
- Faculty Researchers & Bios
- Active and Planned Projects
- Scholarly Publications & Digital Object Identifiers (DOIs)
- Academic Events & Symposia
- Grant Funding & Research Assistantship Calls
- Ethical Guidelines & SOP Toolkits

### 3. Role-Based Governance & Portals
- **Public Visitors:** Complete open access to search, discover, and trace academic relationships across all public records.
- **Researchers (`/researcher`):** Secure authenticated portal for faculty and students to manage researcher profiles, propose new projects, link publications, and track administrative review status.
- **Administrators (`/admin`):** Comprehensive institutional governance:
  - **Needs Attention Panel:** Identifies pending submissions, draft records, and ongoing projects requiring milestone dates.
  - **Submission Review:** Human-readable structured review of project proposals and researcher profile updates with Approve / Reject workflows.
  - **Content Management:** Full CRUD management across all Hub content domains with Draft / Preview / Publish lifecycle support (`?preview=true`).
  - **Bulk Administrative Actions:** Multi-item selection for batch status transitions (Draft, Published, Archived).
  - **Activity Audit Trail:** Real-time audit log tracking administrative updates and submissions.

---

## Demo Data Disclaimer

The platform is seeded with curated demonstration data representing Islington College faculty, ongoing projects, publications, and upcoming 2026 events. All demo entities are clearly marked with an institutional demo badge or prototype indicator in the UI.

---

## Local Development Setup

### Prerequisites
- Node.js 20+ or 24+
- npm 10+
- A Supabase project with database migrations applied

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ritik27-D/Zero-Day.git
   cd Zero-Day
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```
   *(Never commit `.env.local` or disclose secret service-role keys).*

4. **Apply database schema:**
   Execute migrations from `supabase/migrations/` sequentially in your Supabase SQL Editor:
   - `0001_initial_schema.sql`
   - `0002_user_profiles_and_rbac.sql`
   - `0003_researcher_submissions.sql`
   - `0004_digital_hub_expansion.sql`

5. **Start development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Verify build and type checks:**
   ```bash
   npx tsc --noEmit
   npm run lint
   npm run build
   ```

---

## License

Developed for the Islington College Hackathon 2026. All rights reserved.
