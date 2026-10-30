"""
AICTE Integrated Institution Complaint Monitoring & Status Dashboard
Database Models using SQLAlchemy 2.0 ORM

Defines schemas for:
- Institution (Permanent AICTE ID, Region, Name)
- Complaint (Case ID, Bureau Assignment, Status, Expected Disposal)
- ActionHistory (Audit Trail of Officer Remarks & Status Transitions)
"""

import enum
from datetime import datetime, date
from typing import List, Optional
from sqlalchemy import (
    String,
    Text,
    Date,
    DateTime,
    ForeignKey,
    Enum as SQLEnum,
    Index,
    func
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship
)


class Base(DeclarativeBase):
    """Base declarative class for all SQLAlchemy 2.0 models."""
    pass


class ComplaintStatus(str, enum.Enum):
    """Allowed lifecycle states for an AICTE complaint."""
    PENDING = "Pending"
    UNDER_PROCESS = "Under Process"
    DISPOSED = "Disposed"


class BureauType(str, enum.Enum):
    """AICTE Bureaus responsible for grievance resolution."""
    RB = "RB"          # Regulation Bureau (Approval, affiliation compliance)
    PGRC = "PGRC"      # Public & Grievance Redressal Cell (Student/Faculty grievances)
    LEGAL = "LEGAL"    # Legal Bureau (Litigations and court orders)
    APPROVAL = "AB"    # Approval Bureau (Deficiencies and seat matrix disputes)


class ComplaintCategory(str, enum.Enum):
    """Standardized grievance categories in AICTE."""
    FACULTY_SALARY_SERVICE = "Faculty Salary & Service Conditions"
    CAPITATION_FEE_REFUND = "Capitation Fee & Fee Refund Issues"
    INFRASTRUCTURE_DEFICIENCY = "Infrastructure & Lab Deficiencies"
    HARASSMENT_RAGGING = "Student Harassment & Anti-Ragging"
    ADMISSION_IRREGULARITY = "Admission Irregularity"
    ACADEMIC_MALPRACTICE = "Academic Malpractice & Exam Fraud"
    OTHER = "Other"


class Institution(Base):
    """
    Institution Model:
    Represents an AICTE approved technical institute or polytechnic.
    The aicte_permanent_id is unique and indexed for fast grievance correlation.
    """
    __tablename__ = "institutions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    aicte_permanent_id: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        index=True,
        nullable=False,
        comment="Unique AICTE Permanent ID e.g., 1-102938481"
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    region: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="AICTE Regional Office e.g., Northern, Western, South-Western"
    )
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationships
    complaints: Mapped[List["Complaint"]] = relationship(
        "Complaint",
        back_populates="institution",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Institution(id={self.id}, aicte_id='{self.aicte_permanent_id}', name='{self.name}')>"


class Complaint(Base):
    """
    Complaint Model:
    Centralized case tracking record. Tracks assigned bureau (RB, PGRC, etc.)
    and maintains expected disposal dates to comply with statutory resolution timelines.
    """
    __tablename__ = "complaints"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    case_id: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        index=True,
        nullable=False,
        comment="Unique Case Identifier e.g., AICTE-2026-RB-00421"
    )
    institution_id: Mapped[int] = mapped_column(
        ForeignKey("institutions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    category: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        comment="Grievance classification"
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Detailed grievance narrative used by AI Overlap Engine"
    )
    current_status: Mapped[ComplaintStatus] = mapped_column(
        SQLEnum(ComplaintStatus, native_enum=False, length=50),
        default=ComplaintStatus.PENDING,
        nullable=False,
        index=True
    )
    assigned_bureau: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
        comment="Bureau handling the case (RB, PGRC, AB, LEGAL)"
    )
    expected_disposal_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
        comment="Mandated Citizen's Charter resolution deadline"
    )
    date_received: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )

    # Overlap detection tracking flags
    has_potential_overlap: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
        comment="Flag indicating AI identified high similarity with another case"
    )
    overlapping_case_id: Mapped[Optional[str]] = mapped_column(
        String(64),
        nullable=True,
        comment="Case ID of the most relevant overlapping complaint"
    )
    overlap_score: Mapped[Optional[float]] = mapped_column(
        nullable=True,
        comment="Similarity percentage score from 0.0 to 100.0"
    )

    # Relationships
    institution: Mapped["Institution"] = relationship(
        "Institution",
        back_populates="complaints"
    )
    action_history: Mapped[List["ActionHistory"]] = relationship(
        "ActionHistory",
        back_populates="complaint",
        cascade="all, delete-orphan",
        order_by="ActionHistory.action_date.desc()",
        lazy="selectin"
    )

    # Composite Index for institution status lookups
    __table_args__ = (
        Index("idx_institution_status", "institution_id", "current_status"),
    )

    def __repr__(self) -> str:
        return f"<Complaint(id={self.id}, case_id='{self.case_id}', bureau='{self.assigned_bureau}', status='{self.current_status}')>"


class ActionHistory(Base):
    """
    ActionHistory Model:
    Audit trail recording every bureau officer intervention, review hearing,
    remarks, and status transition.
    """
    __tablename__ = "action_history"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    complaint_id: Mapped[int] = mapped_column(
        ForeignKey("complaints.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    action_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    officer_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Officer identifier e.g., DIR-RB-04, RO-CRO-02"
    )
    remarks: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Official remarks, inspection findings, or hearing decisions"
    )
    previous_status: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True
    )
    new_status: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    # Relationships
    complaint: Mapped["Complaint"] = relationship(
        "Complaint",
        back_populates="action_history"
    )

    def __repr__(self) -> str:
        return f"<ActionHistory(id={self.id}, complaint_id={self.complaint_id}, officer='{self.officer_id}')>"
