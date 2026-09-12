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
- **Frontend & UI:** React 19, Tailwind CSS v4, Responsive Navigation Drawer
- **Language:** TypeScript 5 (Strict Mode, 0 compile errors)
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Secure Session Auth)
- **Tooling & Linter:** ESLint 9, Next Turbopack
- **Hosting & Edge Deployment:** Vercel

---

## Key Capabilities

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

### 3. Comprehensive R&D Digital Hub Modules
- **Events & Symposia (`/events`):** Academic conferences, workshops, masterclasses, and open calls for papers.
- **Opportunities & Funding (`/opportunities`):** Faculty research seed grants, postgraduate assistantships, external research grants, and student fellowships.
- **Research Resources (`/resources`):** Institutional research ethics SOPs, Institutional Review Board (IRB) clearance protocols, methodology templates, and academic writing guides.
- **Research Groups & Labs (`/researchers#groups`):** Specialized faculty clusters including Applied AI & Intelligent Systems and Cyber Defense Lab.
- **Institutional Partners (`/partners`):** Strategic academic alliance with London Metropolitan University, enterprise engineering partners, and international research organizations.
- **Announcements & Calls (`/announcements`):** Institutional notices, funding cycles, and symposium schedules.
- **IJMR Journal Gateway (`/ijmr`):** Official gateway for the *Islington Journal of Multidisciplinary Research*, detailing peer-review policies, editorial boards, publication frequency, and manuscript submission criteria.
- **Research Areas (`/discover`):** Interdisciplinary domains categorized by computational and scientific specializations.

### 4. Role-Based Governance & Portals
- **Public Visitors:** Complete open access to search, discover, and trace academic relationships across all public records.
- **Researchers (`/researcher`):** Secure authenticated portal for faculty and students to manage researcher profiles, propose new projects, link publications, and track administrative review status.
- **Administrators (`/admin`):** Comprehensive institutional governance:
  - **Needs Attention Panel:** Identifies pending submissions, draft records, and ongoing projects requiring milestone dates.
  - **Submission Review:** Human-readable structured review of project proposals and researcher profile updates with Approve / Reject workflows.
  - **Content Management:** Full CRUD management across all 6 Hub content domains with Draft / Preview / Publish lifecycle support (`?preview=true`).
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
   npm run typecheck
   npm run lint
   npm run build
   ```

---

## License

Developed for the Islington College Hackathon 2026. All rights reserved.
