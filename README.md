# AICTE Integrated Institution Complaint Monitoring & Status Dashboard

> Centralized, AI-powered multi-bureau grievance monitoring and automated overlap prevention engine for the All India Council for Technical Education (AICTE). Built for the Smart India Hackathon (SIH).

---

## 🏛️ Executive Summary

In technical education governance, institutional grievances (e.g., faculty salary non-payment, capitation fee demands, infrastructure and laboratory deficiencies, or admission irregularities) are frequently lodged simultaneously with multiple bureaus:
* **Regulation Bureau (RB)**: Manages institute approval compliance, land & building norms, affiliation standards, and faculty cadre ratios.
* **Public Grievance Redressal Cell (PGRC)**: Investigates student welfare, faculty pay disputes, harassment petitions, and fee refund compliance.
* **Approval Bureau (AB)**: Manages annual Extension of Approval (EoA) and intake matrices.
* **Legal Cell**: Handles High Court writs and compliance affidavits.

Without cross-bureau visibility, conflicting show-cause notices or duplicated hearings occur. This system introduces an **AI Overlap Engine** (`gpt-oss-120b`) that analyzes incoming grievances against all active cases for the same institute, calculating semantic overlap and appending mandatory coordination directives.

---

## 📂 Monorepo Architecture

```
AICTE-sih-project/
├── docker-compose.yml             # Orchestration for PostgreSQL, FastAPI, and Vite/React
├── README.md                      # Documentation & setup guide
├── .gitignore                     # Git ignore rules for Node and Python
├── .env.example                   # Environment configuration template
│
├── backend/                       # Python FastAPI Backend
│   ├── Dockerfile
│   ├── requirements.txt           # fastapi, sqlalchemy, psycopg2-binary, openai, pydantic
│   ├── database.py                # SQLAlchemy 2.0 Engine, sessionmaker, and get_db()
│   ├── models.py                  # Phase 2: Institution, Complaint, ActionHistory ORM
│   ├── schemas.py                 # Pydantic v2 schemas for request validation & responses
│   ├── ai_service.py              # Phase 3: OpenAI SDK client + gpt-oss-120b overlap engine
│   └── main.py                    # Phase 4: FastAPI REST API endpoints
│
└── frontend/                      # React.js + Tailwind CSS + Recharts
    ├── Dockerfile.frontend
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.tsx
        ├── index.css              # Custom styling & flash-glow alert keyframes
        ├── App.tsx / App.jsx      # Phase 5: Council layout, masthead & navigation
        ├── Dashboard.tsx / .jsx   # Phase 5: Statistics ribbon, Recharts, and Table
        ├── types.ts               # TypeScript interfaces matching backend models
        ├── components/
        │   ├── StatsRibbon.tsx    # Top metrics (Total, Pending, Overlapping)
        │   ├── OverlapAlert.tsx   # Flashing "Potential Overlapping Cases" banner
        │   ├── ComplaintTable.tsx # Dynamic table with search and bureau filter chips
        │   ├── NewComplaintModal.tsx   # Grievance logging with live AI pre-screening
        │   ├── OverlapDetailModal.tsx  # Side-by-side grievance comparison matrix
        │   ├── ActionHistoryModal.tsx  # Chronological hearing minutes & audit trail
        │   └── CodeViewerModal.tsx     # In-app architecture inspector
        └── services/
            └── apiService.ts      # API client & local reactive state engine
```

---

## 🚀 Quick Start Guide

### Option 1: Docker Compose (Recommended)

Run the entire stack (PostgreSQL + FastAPI + React UI) with a single command:

```bash
docker-compose up --build
```

Services will be accessible at:
* **Frontend UI**: [http://localhost:3000](http://localhost:3000)
* **FastAPI Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **PostgreSQL Database**: `localhost:5432` (`aicte_complaints`)

---

### Option 2: Manual Local Setup

#### 1. Backend Setup (FastAPI & PostgreSQL)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment variables
export DATABASE_URL="postgresql+psycopg2://postgres:postgrespassword@localhost:5432/aicte_complaints"
export OPENAI_API_KEY="placeholder_api_key_aicte_oss_120b"
export OPENAI_BASE_URL="https://api.custom-ai-gateway.aicte.gov.in/v1"
export AI_MODEL_NAME="gpt-oss-120b"

# Start the API server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend Setup (React + Vite)

```bash
npm install
npm run dev
```

The frontend will run on [http://localhost:3000](http://localhost:3000).

---

## 🧠 Core System Capabilities

### 1. Dual-Bureau Automated Overlap Detection (`gpt-oss-120b`)
When a complaint is logged, the backend queries active cases (Pending or Under Process) for that `institution_id`. The narratives are analyzed by the AI Engine to extract:
* Semantic similarity percentage (0.0% to 100.0%)
* Coordination directive: `"YES"` or `"NO"`
* Specific allegation overlap points (e.g. "faculty cadre non-compliance", "capitation fee collection")
* Executive synthesis for AICTE bureau directors

### 2. High-Visibility Flashing Inter-Bureau Alert
If an overlap is detected, the frontend activates the `OverlapAlert` component with an animated alert box flashing:
> **"Potential Overlapping Cases – Coordination Required"**

Bureau officers can click **"Inspect Overlap Matrix"** to compare allegations side-by-side and execute **"Initiate Joint Bureau Review"**, updating both cases synchronously in the audit trail.

### 3. Chronological Audit Trail (`ActionHistory`)
Maintains an immutable record of officer actions (`officer_id`, timestamps, remarks, status transitions), complying with statutory Citizen Charter SLAs (45 days).

---

## 📜 License
Apache-2.0 License. Developed for AICTE Smart India Hackathon (SIH).
