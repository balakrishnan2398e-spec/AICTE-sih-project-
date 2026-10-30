"""
Pydantic v2 schemas for request validation and API serialization.
"""

from datetime import datetime, date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


# -------------------------------------------------------------
# Institution Schemas
# -------------------------------------------------------------
class InstitutionBase(BaseModel):
    aicte_permanent_id: str = Field(..., example="1-20491823", description="Unique AICTE Permanent ID")
    name: str = Field(..., example="Delhi Technological University", description="Official Institute Name")
    region: str = Field(..., example="Northern", description="AICTE Regional Jurisdiction")
    state: Optional[str] = Field(None, example="Delhi", description="State / UT")


class InstitutionCreate(InstitutionBase):
    pass


class InstitutionResponse(InstitutionBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# Action History Schemas
# -------------------------------------------------------------
class ActionHistoryCreate(BaseModel):
    officer_id: str = Field(..., example="DIR-PGRC-01")
    remarks: str = Field(..., example="Virtual hearing conducted with Principal and complainant.")
    new_status: str = Field(..., example="Under Process")
    previous_status: Optional[str] = Field(None, example="Pending")


class ActionHistoryResponse(BaseModel):
    id: int
    complaint_id: int
    action_date: datetime
    officer_id: str
    remarks: str
    previous_status: Optional[str]
    new_status: str

    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# AI Overlap Engine Schemas
# -------------------------------------------------------------
class OverlapDetail(BaseModel):
    overlapping_case_id: str
    similarity_percentage: float
    coordination_required: str  # "YES" or "NO"
    assigned_bureau: str
    key_overlap_points: List[str] = []
    reasoning: str
    model_used: str = "gpt-oss-120b"


# -------------------------------------------------------------
# Complaint Schemas
# -------------------------------------------------------------
class ComplaintCreate(BaseModel):
    institution_id: int = Field(..., description="Foreign key to institutions table")
    category: str = Field(..., example="Faculty Salary & Service Conditions")
    description: str = Field(..., min_length=15, example="Faculty members have not been paid UGC pay scale increments for 6 months and mandatory PF contributions have lapsed.")
    assigned_bureau: str = Field("PGRC", example="PGRC", description="Bureau code: RB, PGRC, AB, LEGAL")
    expected_disposal_date: Optional[date] = Field(None, description="Citizen's charter deadline")


class ComplaintResponse(BaseModel):
    id: int
    case_id: str
    institution_id: int
    category: str
    description: str
    current_status: str
    assigned_bureau: str
    expected_disposal_date: Optional[date]
    date_received: datetime
    has_potential_overlap: bool
    overlapping_case_id: Optional[str] = None
    overlap_score: Optional[float] = None
    institution_name: Optional[str] = None
    aicte_permanent_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ComplaintCreateResult(BaseModel):
    complaint: ComplaintResponse
    warning_flag: bool = Field(False, description="True if AI detected overlapping complaint with active cases")
    warning_message: Optional[str] = None
    overlap_analysis: Optional[OverlapDetail] = None


# -------------------------------------------------------------
# Dashboard Statistics Schema
# -------------------------------------------------------------
class DashboardStats(BaseModel):
    total_complaints: int
    total_pending: int
    total_under_process: int
    total_disposed: int
    total_overlapping: int
    cases_by_bureau: Dict[str, int]
    cases_by_status: Dict[str, int]
    cases_by_category: Dict[str, int]
    recent_overlaps: List[Dict[str, Any]] = []
