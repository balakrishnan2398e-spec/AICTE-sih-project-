"""
AICTE Integrated Institution Complaint Monitoring & Status Dashboard
FastAPI Backend Application

Endpoints:
- POST /institutions/       : Register a new technical institution
- GET  /institutions/       : List registered institutions
- POST /complaints/         : Log a new complaint with automated AI Overlap Detection
- GET  /complaints/         : Fetch active and filtered grievances
- GET  /complaints/{id}     : Detailed grievance view with audit history
- POST /complaints/{id}/act : Log officer actions and status transitions
- GET  /dashboard/stats     : Aggregated council metrics and cross-bureau analytics
- POST /api/seed            : Seed sample institutional data for testing
"""

import os
import uuid
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_, or_

from backend.database import get_db, init_db
from backend.models import (
    Institution,
    Complaint,
    ActionHistory,
    ComplaintStatus,
    BureauType
)
from backend.schemas import (
    InstitutionCreate,
    InstitutionResponse,
    ComplaintCreate,
    ComplaintResponse,
    ComplaintCreateResult,
    OverlapDetail,
    DashboardStats,
    ActionHistoryCreate,
    ActionHistoryResponse
)
from backend.ai_service import detect_overlap

# Initialize FastAPI App
app = FastAPI(
    title="AICTE Integrated Complaint Monitoring & Overlap Prevention API",
    version="2.0.0",
    description="Centralized council dashboard preventing overlapping grievances across Regulation Bureau (RB) and PGRC."
)

# Enable CORS for frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    """Ensure database schema is initialized on boot."""
    try:
        init_db()
    except Exception as exc:
        print(f"Database initialization notice: {exc}")


# -------------------------------------------------------------------
# Helper: Unique Case ID Generator
# -------------------------------------------------------------------
def generate_case_id(bureau: str, db: Session) -> str:
    """Generates an official AICTE case number e.g. AICTE-2026-PGRC-0104"""
    current_year = datetime.now().year
    count = db.scalar(
        select(func.count(Complaint.id)).where(Complaint.assigned_bureau == bureau)
    ) or 0
    seq = count + 101
    return f"AICTE-{current_year}-{bureau.upper()}-{seq:04d}"


# -------------------------------------------------------------------
# Phase 4.1: Institution Management
# -------------------------------------------------------------------
@app.post(
    "/institutions/",
    response_model=InstitutionResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Institutions"]
)
def create_institution(
    payload: InstitutionCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new AICTE approved institution into the centralized directory.
    Validates uniqueness of the AICTE Permanent ID.
    """
    # Check if institution already exists
    existing = db.scalar(
        select(Institution).where(
            Institution.aicte_permanent_id == payload.aicte_permanent_id.strip()
        )
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Institution with AICTE Permanent ID '{payload.aicte_permanent_id}' is already registered."
        )

    inst = Institution(
        aicte_permanent_id=payload.aicte_permanent_id.strip(),
        name=payload.name.strip(),
        region=payload.region.strip(),
        state=payload.state.strip() if payload.state else None
    )
    db.add(inst)
    db.commit()
    db.refresh(inst)
    return inst


@app.get(
    "/institutions/",
    response_model=List[InstitutionResponse],
    tags=["Institutions"]
)
def list_institutions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all registered AICTE institutions with their unique IDs."""
    stmt = select(Institution).offset(skip).limit(limit).order_by(Institution.name.asc())
    return db.scalars(stmt).all()


# -------------------------------------------------------------------
# Phase 4.2: Complaint Logging & AI Overlap Detection
# -------------------------------------------------------------------
@app.post(
    "/complaints/",
    response_model=ComplaintCreateResult,
    status_code=status.HTTP_201_CREATED,
    tags=["Complaints"]
)
def create_complaint(
    payload: ComplaintCreate,
    db: Session = Depends(get_db)
):
    """
    Logs a new complaint against an institution.
    
    CRITICAL WORKFLOW:
    1. Fetches any existing active complaints (Pending or Under Process) for the same institution.
    2. Runs each active complaint description through the AI Overlap Engine (gpt-oss-120b).
    3. If overlap is detected (similarity >= 60% or coordination_required == 'YES'):
       - Sets `has_potential_overlap = True` on the new complaint.
       - Appends a prominent warning flag and coordination directives in the response.
    4. Automatically logs the initial case record in ActionHistory.
    """
    # 1. Verify institution exists
    inst = db.get(Institution, payload.institution_id)
    if not inst:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Institution with ID {payload.institution_id} not found."
        )

    # 2. Query active complaints for this institution (exclude Disposed)
    active_complaints_stmt = select(Complaint).where(
        and_(
            Complaint.institution_id == payload.institution_id,
            Complaint.current_status.in_([ComplaintStatus.PENDING, ComplaintStatus.UNDER_PROCESS])
        )
    )
    active_complaints = db.scalars(active_complaints_stmt).all()

    # 3. Perform AI Overlap Detection across active records
    overlap_detected = False
    highest_similarity = 0.0
    matched_complaint: Optional[Complaint] = None
    overlap_report: Optional[Dict[str, Any]] = None

    for existing_case in active_complaints:
        analysis = detect_overlap(
            new_complaint_desc=payload.description,
            existing_complaint_desc=existing_case.description
        )
        sim = analysis.get("similarity_percentage", 0.0)
        coord = analysis.get("coordination_required", "NO")

        if sim > highest_similarity:
            highest_similarity = sim

        if coord == "YES" or sim >= 60.0:
            overlap_detected = True
            matched_complaint = existing_case
            overlap_report = analysis
            break

    # 4. Generate Case ID and calculate expected disposal date if omitted
    case_id = generate_case_id(payload.assigned_bureau, db)
    disposal_date = payload.expected_disposal_date or (date.today() + timedelta(days=45))

    # 5. Create Complaint entity
    complaint = Complaint(
        case_id=case_id,
        institution_id=payload.institution_id,
        category=payload.category,
        description=payload.description.strip(),
        current_status=ComplaintStatus.PENDING,
        assigned_bureau=payload.assigned_bureau.upper(),
        expected_disposal_date=disposal_date,
        has_potential_overlap=overlap_detected,
        overlapping_case_id=matched_complaint.case_id if matched_complaint else None,
        overlap_score=highest_similarity if overlap_detected else None
    )
    db.add(complaint)
    db.flush()

    # 6. Record Initial Audit History
    initial_remark = (
        f"Grievance registered and assigned to {payload.assigned_bureau.upper()}."
    )
    if overlap_detected and matched_complaint:
        initial_remark += (
            f" [ALERT] AI Overlap Engine flagged {highest_similarity}% similarity with active case "
            f"{matched_complaint.case_id} ({matched_complaint.assigned_bureau}). Multi-Bureau Joint Review triggered."
        )

    action = ActionHistory(
        complaint_id=complaint.id,
        officer_id="SYSTEM-ROUTER",
        remarks=initial_remark,
        previous_status=None,
        new_status=ComplaintStatus.PENDING.value
    )
    db.add(action)
    db.commit()
    db.refresh(complaint)

    # 7. Construct Response with Warning Flag if overlap detected
    complaint_resp = ComplaintResponse(
        id=complaint.id,
        case_id=complaint.case_id,
        institution_id=complaint.institution_id,
        category=complaint.category,
        description=complaint.description,
        current_status=complaint.current_status.value,
        assigned_bureau=complaint.assigned_bureau,
        expected_disposal_date=complaint.expected_disposal_date,
        date_received=complaint.date_received,
        has_potential_overlap=complaint.has_potential_overlap,
        overlapping_case_id=complaint.overlapping_case_id,
        overlap_score=complaint.overlap_score,
        institution_name=inst.name,
        aicte_permanent_id=inst.aicte_permanent_id
    )

    warning_flag = overlap_detected
    warning_message = None
    overlap_detail = None

    if overlap_detected and matched_complaint and overlap_report:
        warning_message = (
            f"Potential Overlapping Cases – Coordination Required! This grievance matches {highest_similarity}% "
            f"with active case {matched_complaint.case_id} assigned to Bureau '{matched_complaint.assigned_bureau}'."
        )
        overlap_detail = OverlapDetail(
            overlapping_case_id=matched_complaint.case_id,
            similarity_percentage=highest_similarity,
            coordination_required="YES",
            assigned_bureau=matched_complaint.assigned_bureau,
            key_overlap_points=overlap_report.get("key_overlap_points", []),
            reasoning=overlap_report.get("reasoning", "High overlap detected in grievance substance.")
        )

    return ComplaintCreateResult(
        complaint=complaint_resp,
        warning_flag=warning_flag,
        warning_message=warning_message,
        overlap_analysis=overlap_detail
    )


@app.get(
    "/complaints/",
    response_model=List[ComplaintResponse],
    tags=["Complaints"]
)
def list_complaints(
    bureau: Optional[str] = Query(None, description="Filter by Bureau (RB, PGRC, AB, LEGAL)"),
    status: Optional[str] = Query(None, description="Filter by status (Pending, Under Process, Disposed)"),
    overlap_only: bool = Query(False, description="Filter only cases with overlap warning"),
    search: Optional[str] = Query(None, description="Search term for case ID, institute name or permanent ID"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Dynamic retrieval of institutional complaints with filtering and search."""
    stmt = (
        select(Complaint, Institution.name, Institution.aicte_permanent_id)
        .join(Institution, Complaint.institution_id == Institution.id)
    )

    if bureau and bureau.upper() != "ALL":
        stmt = stmt.where(Complaint.assigned_bureau == bureau.upper())

    if status and status.upper() != "ALL":
        stmt = stmt.where(Complaint.current_status == status)

    if overlap_only:
        stmt = stmt.where(Complaint.has_potential_overlap == True)

    if search:
        search_fmt = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(
                Complaint.case_id.ilike(search_fmt),
                Institution.name.ilike(search_fmt),
                Institution.aicte_permanent_id.ilike(search_fmt),
                Complaint.category.ilike(search_fmt)
            )
        )

    stmt = stmt.order_by(Complaint.date_received.desc()).offset(skip).limit(limit)
    rows = db.execute(stmt).all()

    results = []
    for comp, inst_name, perm_id in rows:
        results.append(
            ComplaintResponse(
                id=comp.id,
                case_id=comp.case_id,
                institution_id=comp.institution_id,
                category=comp.category,
                description=comp.description,
                current_status=comp.current_status.value,
                assigned_bureau=comp.assigned_bureau,
                expected_disposal_date=comp.expected_disposal_date,
                date_received=comp.date_received,
                has_potential_overlap=comp.has_potential_overlap,
                overlapping_case_id=comp.overlapping_case_id,
                overlap_score=comp.overlap_score,
                institution_name=inst_name,
                aicte_permanent_id=perm_id
            )
        )
    return results


@app.get(
    "/complaints/{case_id}",
    tags=["Complaints"]
)
def get_complaint_detail(
    case_id: str,
    db: Session = Depends(get_db)
):
    """Retrieve full details of a complaint including chronological action history."""
    complaint = db.scalar(
        select(Complaint).where(Complaint.case_id == case_id)
    )
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with Case ID '{case_id}' not found."
        )

    return {
        "complaint": complaint,
        "institution": complaint.institution,
        "action_history": complaint.action_history
    }


@app.post(
    "/complaints/{case_id}/actions",
    response_model=ActionHistoryResponse,
    tags=["Complaints"]
)
def add_complaint_action(
    case_id: str,
    payload: ActionHistoryCreate,
    db: Session = Depends(get_db)
):
    """
    Log an official inquiry, hearing minutes, or status update by an AICTE officer.
    Updates the complaint's current_status accordingly.
    """
    complaint = db.scalar(select(Complaint).where(Complaint.case_id == case_id))
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint '{case_id}' not found."
        )

    previous_status = complaint.current_status.value
    # Update complaint status
    complaint.current_status = ComplaintStatus(payload.new_status)

    action = ActionHistory(
        complaint_id=complaint.id,
        officer_id=payload.officer_id.strip(),
        remarks=payload.remarks.strip(),
        previous_status=previous_status,
        new_status=payload.new_status
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    return action


# -------------------------------------------------------------------
# Phase 4.3: Aggregated Dashboard Statistics
# -------------------------------------------------------------------
@app.get(
    "/dashboard/stats",
    response_model=DashboardStats,
    tags=["Dashboard"]
)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Computes high-level aggregated metrics for the leadership dashboard:
    - Total complaints received
    - Total pending cases
    - Total under process
    - Total disposed cases
    - Total cases flagged for potential cross-bureau overlap
    - Bureau distribution (RB vs PGRC vs Approval Bureau vs Legal)
    - Grievance Category distribution
    - Recent overlap warnings
    """
    # Total counts by status
    total_all = db.scalar(select(func.count(Complaint.id))) or 0
    total_pending = db.scalar(
        select(func.count(Complaint.id)).where(Complaint.current_status == ComplaintStatus.PENDING)
    ) or 0
    total_process = db.scalar(
        select(func.count(Complaint.id)).where(Complaint.current_status == ComplaintStatus.UNDER_PROCESS)
    ) or 0
    total_disposed = db.scalar(
        select(func.count(Complaint.id)).where(Complaint.current_status == ComplaintStatus.DISPOSED)
    ) or 0
    total_overlapping = db.scalar(
        select(func.count(Complaint.id)).where(Complaint.has_potential_overlap == True)
    ) or 0

    # Cases grouped by Bureau
    bureau_rows = db.execute(
        select(Complaint.assigned_bureau, func.count(Complaint.id)).group_by(Complaint.assigned_bureau)
    ).all()
    cases_by_bureau = {bureau: count for bureau, count in bureau_rows}
    # Ensure standard bureaus appear even if 0
    for b in ["RB", "PGRC", "AB", "LEGAL"]:
        if b not in cases_by_bureau:
            cases_by_bureau[b] = 0

    # Cases grouped by Category
    cat_rows = db.execute(
        select(Complaint.category, func.count(Complaint.id)).group_by(Complaint.category)
    ).all()
    cases_by_category = {cat: count for cat, count in cat_rows}

    # Recent overlapping alerts for the banner
    recent_overlaps_stmt = (
        select(Complaint, Institution.name)
        .join(Institution, Complaint.institution_id == Institution.id)
        .where(Complaint.has_potential_overlap == True)
        .order_by(Complaint.date_received.desc())
        .limit(5)
    )
    overlap_rows = db.execute(recent_overlaps_stmt).all()
    recent_overlaps = [
        {
            "case_id": c.case_id,
            "institution_name": inst_name,
            "assigned_bureau": c.assigned_bureau,
            "overlapping_case_id": c.overlapping_case_id,
            "overlap_score": c.overlap_score or 82.5,
            "category": c.category,
            "date_received": c.date_received.isoformat()
        }
        for c, inst_name in overlap_rows
    ]

    return DashboardStats(
        total_complaints=total_all,
        total_pending=total_pending,
        total_under_process=total_process,
        total_disposed=total_disposed,
        total_overlapping=total_overlapping,
        cases_by_bureau=cases_by_bureau,
        cases_by_status={
            "Pending": total_pending,
            "Under Process": total_process,
            "Disposed": total_disposed
        },
        cases_by_category=cases_by_category,
        recent_overlaps=recent_overlaps
    )
