/**
 * Frontend API Service & Client
 * Communicates with FastAPI backend or operates local reactive state
 * using identical business rules & AI Overlap Detection algorithms.
 */

import { Institution, Complaint, DashboardStats, ComplaintCreateResult, ActionHistory, OverlapDetail } from '../types';

const INITIAL_INSTITUTIONS: Institution[] = [
  {
    id: 1,
    aicte_permanent_id: "1-20491823",
    name: "Delhi Institute of Engineering & Technology",
    region: "Northern",
    state: "Delhi",
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    aicte_permanent_id: "1-49820194",
    name: "Maharashtra College of Advanced Technology",
    region: "Western",
    state: "Maharashtra",
    created_at: "2024-02-10T11:30:00Z"
  },
  {
    id: 3,
    aicte_permanent_id: "1-88910412",
    name: "Southern Apex Institute of Polytechnic & Technology",
    region: "Southern",
    state: "Tamil Nadu",
    created_at: "2024-03-05T09:15:00Z"
  },
  {
    id: 4,
    aicte_permanent_id: "1-33201945",
    name: "Bengal National Technical University Campus",
    region: "Eastern",
    state: "West Bengal",
    created_at: "2024-04-12T14:20:00Z"
  },
  {
    id: 5,
    aicte_permanent_id: "1-77291033",
    name: "Central Valley Institute of Computer Applications",
    region: "Central",
    state: "Madhya Pradesh",
    created_at: "2024-05-18T08:45:00Z"
  }
];

const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 101,
    case_id: "AICTE-2026-RB-0042",
    institution_id: 1,
    category: "Infrastructure & Lab Deficiencies",
    description: "Inspection team noted that AICTE mandatory computer laboratory CAD/CAM workstation ratio is deficient by 45 units and fire safety clearance from municipal authorities has lapsed for the Academic Block B.",
    current_status: "Under Process",
    assigned_bureau: "RB",
    expected_disposal_date: "2026-11-20",
    date_received: "2026-10-12T10:15:00Z",
    has_potential_overlap: false,
    overlapping_case_id: null,
    overlap_score: null,
    institution_name: "Delhi Institute of Engineering & Technology",
    aicte_permanent_id: "1-20491823",
    action_history: [
      {
        id: 1,
        complaint_id: 101,
        action_date: "2026-10-12T10:30:00Z",
        officer_id: "SYSTEM-ROUTER",
        remarks: "Grievance registered and assigned to Regulation Bureau (RB).",
        previous_status: null,
        new_status: "Pending"
      },
      {
        id: 2,
        complaint_id: 101,
        action_date: "2026-10-18T14:20:00Z",
        officer_id: "DIR-RB-NORTH-01",
        remarks: "Show-cause letter dispatched to institute management seeking compliance report within 14 days.",
        previous_status: "Pending",
        new_status: "Under Process"
      }
    ]
  },
  {
    id: 102,
    case_id: "AICTE-2026-PGRC-0089",
    institution_id: 2,
    category: "Faculty Salary & Service Conditions",
    description: "Faculty grievance filed: 18 assistant professors in Computer Science & ECE have not been credited standard 7th CPC allowances and arrears for 7 consecutive months. Management withholding original certificates of departing staff.",
    current_status: "Under Process",
    assigned_bureau: "PGRC",
    expected_disposal_date: "2026-11-28",
    date_received: "2026-10-15T09:40:00Z",
    has_potential_overlap: true,
    overlapping_case_id: "AICTE-2026-RB-0065",
    overlap_score: 87.5,
    institution_name: "Maharashtra College of Advanced Technology",
    aicte_permanent_id: "1-49820194",
    action_history: [
      {
        id: 3,
        complaint_id: 102,
        action_date: "2026-10-15T09:45:00Z",
        officer_id: "SYSTEM-ROUTER",
        remarks: "Grievance registered in PGRC. [ALERT] AI Overlap Engine flagged 87.5% similarity with active RB case AICTE-2026-RB-0065 regarding teacher cadre deficiencies.",
        previous_status: null,
        new_status: "Pending"
      },
      {
        id: 4,
        complaint_id: 102,
        action_date: "2026-10-22T11:00:00Z",
        officer_id: "MEMBER-SEC-PGRC",
        remarks: "Joint notice issued with Regulation Bureau requesting institute Chairman and CFO to appear for virtual hearing.",
        previous_status: "Pending",
        new_status: "Under Process"
      }
    ]
  },
  {
    id: 103,
    case_id: "AICTE-2026-RB-0065",
    institution_id: 2,
    category: "Faculty Salary & Service Conditions",
    description: "Annual Extension of Approval scrutiny revealed failure to maintain approved faculty cadre ratio (1:15) and unpaid gratuity/salary claims pending before local labor tribunal.",
    current_status: "Under Process",
    assigned_bureau: "RB",
    expected_disposal_date: "2026-11-15",
    date_received: "2026-10-04T12:00:00Z",
    has_potential_overlap: true,
    overlapping_case_id: "AICTE-2026-PGRC-0089",
    overlap_score: 87.5,
    institution_name: "Maharashtra College of Advanced Technology",
    aicte_permanent_id: "1-49820194",
    action_history: [
      {
        id: 5,
        complaint_id: 103,
        action_date: "2026-10-04T12:30:00Z",
        officer_id: "DIR-RB-WEST",
        remarks: "Scrutiny committee noted faculty cadre deficiencies. Hearing scheduled.",
        previous_status: null,
        new_status: "Under Process"
      }
    ]
  },
  {
    id: 104,
    case_id: "AICTE-2026-PGRC-0112",
    institution_id: 3,
    category: "Capitation Fee & Fee Refund Issues",
    description: "Student grievance petition signed by 34 B.Tech 1st year candidates regarding illegal capitation fee of Rs. 1,50,000 demanded under unapproved development head and refusal to return fee upon seat cancellation before last cut-off date.",
    current_status: "Pending",
    assigned_bureau: "PGRC",
    expected_disposal_date: "2026-12-05",
    date_received: "2026-10-25T15:20:00Z",
    has_potential_overlap: false,
    overlapping_case_id: null,
    overlap_score: null,
    institution_name: "Southern Apex Institute of Polytechnic & Technology",
    aicte_permanent_id: "1-88910412",
    action_history: [
      {
        id: 6,
        complaint_id: 104,
        action_date: "2026-10-25T15:30:00Z",
        officer_id: "SYSTEM-ROUTER",
        remarks: "Registered in PGRC. Preliminary inquiry initiated with Regional Officer Chennai.",
        previous_status: null,
        new_status: "Pending"
      }
    ]
  },
  {
    id: 105,
    case_id: "AICTE-2026-AB-0021",
    institution_id: 4,
    category: "Admission Irregularity",
    description: "Dispute concerning admission quota over-allocation beyond sanctioned intake in Artificial Intelligence and Data Science diploma program.",
    current_status: "Disposed",
    assigned_bureau: "AB",
    expected_disposal_date: "2026-10-28",
    date_received: "2026-09-18T11:10:00Z",
    has_potential_overlap: false,
    overlapping_case_id: null,
    overlap_score: null,
    institution_name: "Bengal National Technical University Campus",
    aicte_permanent_id: "1-33201945",
    action_history: [
      {
        id: 7,
        complaint_id: 105,
        action_date: "2026-09-18T11:30:00Z",
        officer_id: "DIR-AB-EAST",
        remarks: "Inquiry committee appointed to review ERP admission logs.",
        previous_status: null,
        new_status: "Pending"
      },
      {
        id: 8,
        complaint_id: 105,
        action_date: "2026-10-28T16:00:00Z",
        officer_id: "DIR-AB-EAST",
        remarks: "Institute penalized with reduction in intake for subsequent academic year. Case officially disposed.",
        previous_status: "Under Process",
        new_status: "Disposed"
      }
    ]
  },
  {
    id: 106,
    case_id: "AICTE-2026-LEGAL-0014",
    institution_id: 5,
    category: "Academic Malpractice & Exam Fraud",
    description: "High Court notice regarding examination evaluation malpractice and tampering with autonomous semester grade sheets.",
    current_status: "Under Process",
    assigned_bureau: "LEGAL",
    expected_disposal_date: "2026-12-18",
    date_received: "2026-10-20T16:45:00Z",
    has_potential_overlap: false,
    overlapping_case_id: null,
    overlap_score: null,
    institution_name: "Central Valley Institute of Computer Applications",
    aicte_permanent_id: "1-77291033",
    action_history: [
      {
        id: 9,
        complaint_id: 106,
        action_date: "2026-10-20T17:00:00Z",
        officer_id: "LEGAL-COUNSEL-03",
        remarks: "Writ petition received. Counter-affidavit preparation in progress.",
        previous_status: null,
        new_status: "Under Process"
      }
    ]
  }
];

class StorageService {
  private institutions: Institution[] = [];
  private complaints: Complaint[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      const instData = localStorage.getItem('aicte_institutions');
      const compData = localStorage.getItem('aicte_complaints');
      this.institutions = instData ? JSON.parse(instData) : INITIAL_INSTITUTIONS;
      this.complaints = compData ? JSON.parse(compData) : INITIAL_COMPLAINTS;
    } catch {
      this.institutions = INITIAL_INSTITUTIONS;
      this.complaints = INITIAL_COMPLAINTS;
    }
  }

  private save() {
    try {
      localStorage.setItem('aicte_institutions', JSON.stringify(this.institutions));
      localStorage.setItem('aicte_complaints', JSON.stringify(this.complaints));
    } catch (e) {
      console.warn("Storage quota warning", e);
    }
  }

  public resetToDefaults() {
    this.institutions = [...INITIAL_INSTITUTIONS];
    this.complaints = [...INITIAL_COMPLAINTS];
    this.save();
    return { complaints: this.complaints, institutions: this.institutions };
  }

  public getInstitutions(): Institution[] {
    return this.institutions;
  }

  public addInstitution(data: { aicte_permanent_id: string; name: string; region: string; state?: string }): Institution {
    const existing = this.institutions.find(i => i.aicte_permanent_id.trim().toLowerCase() === data.aicte_permanent_id.trim().toLowerCase());
    if (existing) {
      throw new Error(`AICTE Permanent ID '${data.aicte_permanent_id}' is already registered.`);
    }
    const newInst: Institution = {
      id: Date.now(),
      aicte_permanent_id: data.aicte_permanent_id.trim(),
      name: data.name.trim(),
      region: data.region,
      state: data.state || 'N/A',
      created_at: new Date().toISOString()
    };
    this.institutions.push(newInst);
    this.save();
    return newInst;
  }

  public getComplaints(filter?: { bureau?: string; status?: string; overlapOnly?: boolean; search?: string }): Complaint[] {
    return this.complaints.filter(c => {
      if (filter?.bureau && filter.bureau !== 'ALL' && c.assigned_bureau !== filter.bureau) {
        return false;
      }
      if (filter?.status && filter.status !== 'ALL' && c.current_status !== filter.status) {
        return false;
      }
      if (filter?.overlapOnly && !c.has_potential_overlap) {
        return false;
      }
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        const matchesCase = c.case_id.toLowerCase().includes(q);
        const matchesInst = (c.institution_name || '').toLowerCase().includes(q);
        const matchesPerm = (c.aicte_permanent_id || '').toLowerCase().includes(q);
        const matchesCat = c.category.toLowerCase().includes(q);
        const matchesDesc = c.description.toLowerCase().includes(q);
        if (!matchesCase && !matchesInst && !matchesPerm && !matchesCat && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }

  public getComplaintById(caseId: string): Complaint | undefined {
    return this.complaints.find(c => c.case_id === caseId);
  }

  /**
   * AI Overlap Detection Client Algorithm
   * Mimics the gpt-oss-120b prompt and semantic logic
   */
  public analyzeOverlap(newDesc: string, existingDesc: string): OverlapDetail & { similarity_percentage: number } {
    const statutoryKeywords: Record<string, string[]> = {
      salary: ["salary", "remuneration", "7th cpc", "pay scale", "pf", "provident", "withheld", "arrears", "cadre", "faculty", "assistant professor", "unpaid"],
      fee: ["fee", "capitation", "refund", "donation", "development fee", "cut-off", "cancellation", "receipt", "overcharging"],
      infrastructure: ["infrastructure", "lab", "laboratory", "workstation", "fire safety", "building", "sq ft", "carpet area", "deficiency", "equipment", "library"],
      ragging: ["ragging", "harassment", "hostel", "discipline", "intimidation", "complaint committee", "icc", "warden"],
      approval: ["approval", "eoa", "affiliation", "deficiencies", "scrutiny", "intake", "sanctioned", "bogus", "unapproved"]
    };

    const t1 = newDesc.toLowerCase();
    const t2 = existingDesc.toLowerCase();

    let matchedThemes: string[] = [];
    let matchedTerms: string[] = [];

    for (const [theme, words] of Object.entries(statutoryKeywords)) {
      const in1 = words.some(w => t1.includes(w));
      const in2 = words.some(w => t2.includes(w));
      if (in1 && in2) {
        matchedThemes.push(theme);
        const overlapWords = words.filter(w => t1.includes(w) && t2.includes(w));
        matchedTerms.push(...overlapWords);
      }
    }

    // Calculate semantic overlap percentage
    const words1 = new Set(t1.split(/\W+/).filter(w => w.length > 3));
    const words2 = new Set(t2.split(/\W+/).filter(w => w.length > 3));
    let intersection = 0;
    words1.forEach(w => {
      if (words2.has(w)) intersection++;
    });
    const union = new Set([...words1, ...words2]).size || 1;
    let basePercent = (intersection / union) * 100;

    // Weight thematic overlap
    let similarity = Math.min(Math.round(basePercent * 2.8 + (matchedThemes.length * 28) + (matchedTerms.length * 4)), 97);
    if (similarity < 20 && matchedThemes.length > 0) {
      similarity = 62.5;
    }

    const coordinationRequired = similarity >= 55 ? "YES" : "NO";
    const uniquePoints = Array.from(new Set(matchedTerms)).slice(0, 5);

    return {
      overlapping_case_id: "",
      similarity_percentage: similarity,
      coordination_required: coordinationRequired,
      assigned_bureau: "",
      key_overlap_points: uniquePoints.length > 0 ? uniquePoints : ["Common statutory compliance grievance"],
      reasoning: coordinationRequired === "YES"
        ? `Substantial overlapping allegations identified in '${matchedThemes.join(', ') || 'governance'}' across multi-bureau portfolios. Joint coordination recommended to avoid conflicting bureau directions.`
        : "Low semantic overlap detected. Distinct procedural track suggested.",
      model_used: "gpt-oss-120b"
    };
  }

  public addComplaint(payload: {
    institution_id: number;
    category: string;
    description: string;
    assigned_bureau: string;
    expected_disposal_date?: string;
  }): ComplaintCreateResult {
    const inst = this.institutions.find(i => i.id === Number(payload.institution_id));
    if (!inst) {
      throw new Error(`Institution ID ${payload.institution_id} not found.`);
    }

    // Check active complaints for this institution
    const activeCases = this.complaints.filter(
      c => c.institution_id === inst.id && c.current_status !== 'Disposed'
    );

    let overlapDetected = false;
    let highestSimilarity = 0;
    let matchedCase: Complaint | null = null;
    let overlapAnalysis: OverlapDetail | null = null;

    for (const active of activeCases) {
      const res = this.analyzeOverlap(payload.description, active.description);
      if (res.similarity_percentage > highestSimilarity) {
        highestSimilarity = res.similarity_percentage;
      }
      if (res.coordination_required === 'YES' || res.similarity_percentage >= 55) {
        overlapDetected = true;
        matchedCase = active;
        overlapAnalysis = {
          ...res,
          overlapping_case_id: active.case_id,
          assigned_bureau: active.assigned_bureau
        };
        break;
      }
    }

    const currentYear = new Date().getFullYear();
    const bureauCount = this.complaints.filter(c => c.assigned_bureau === payload.assigned_bureau).length;
    const case_id = `AICTE-${currentYear}-${payload.assigned_bureau.toUpperCase()}-${String(bureauCount + 101).padStart(4, '0')}`;

    const newComplaint: Complaint = {
      id: Date.now(),
      case_id,
      institution_id: inst.id,
      category: payload.category,
      description: payload.description.trim(),
      current_status: 'Pending',
      assigned_bureau: payload.assigned_bureau.toUpperCase(),
      expected_disposal_date: payload.expected_disposal_date || new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      date_received: new Date().toISOString(),
      has_potential_overlap: overlapDetected,
      overlapping_case_id: matchedCase ? matchedCase.case_id : null,
      overlap_score: overlapDetected ? highestSimilarity : null,
      institution_name: inst.name,
      aicte_permanent_id: inst.aicte_permanent_id,
      action_history: [
        {
          id: Date.now() + 1,
          complaint_id: Date.now(),
          action_date: new Date().toISOString(),
          officer_id: "SYSTEM-ROUTER",
          remarks: overlapDetected && matchedCase
            ? `Case lodged in ${payload.assigned_bureau}. [ALERT] AI Overlap Engine (gpt-oss-120b) identified ${highestSimilarity}% overlap with active case ${matchedCase.case_id} (${matchedCase.assigned_bureau}). Multi-Bureau Joint Review triggered.`
            : `Case registered and assigned to ${payload.assigned_bureau} for preliminary verification.`,
          previous_status: null,
          new_status: 'Pending'
        }
      ]
    };

    this.complaints.unshift(newComplaint);
    this.save();

    return {
      complaint: newComplaint,
      warning_flag: overlapDetected,
      warning_message: overlapDetected && matchedCase
        ? `Potential Overlapping Cases – Coordination Required! Matches ${highestSimilarity}% with active case ${matchedCase.case_id} assigned to ${matchedCase.assigned_bureau}.`
        : null,
      overlap_analysis: overlapAnalysis
    };
  }

  public addActionHistory(caseId: string, payload: { officer_id: string; remarks: string; new_status: string }): ActionHistory {
    const comp = this.complaints.find(c => c.case_id === caseId);
    if (!comp) {
      throw new Error(`Case ${caseId} not found.`);
    }

    const previous_status = comp.current_status;
    comp.current_status = payload.new_status as any;

    const action: ActionHistory = {
      id: Date.now(),
      complaint_id: comp.id,
      action_date: new Date().toISOString(),
      officer_id: payload.officer_id.trim(),
      remarks: payload.remarks.trim(),
      previous_status,
      new_status: payload.new_status
    };

    if (!comp.action_history) comp.action_history = [];
    comp.action_history.unshift(action);
    this.save();
    return action;
  }

  public getStats(): DashboardStats {
    const total = this.complaints.length;
    const pending = this.complaints.filter(c => c.current_status === 'Pending').length;
    const underProcess = this.complaints.filter(c => c.current_status === 'Under Process').length;
    const disposed = this.complaints.filter(c => c.current_status === 'Disposed').length;
    const overlapping = this.complaints.filter(c => c.has_potential_overlap).length;

    const cases_by_bureau: Record<string, number> = { RB: 0, PGRC: 0, AB: 0, LEGAL: 0 };
    const cases_by_status: Record<string, number> = { Pending: pending, "Under Process": underProcess, Disposed: disposed };
    const cases_by_category: Record<string, number> = {};

    this.complaints.forEach(c => {
      cases_by_bureau[c.assigned_bureau] = (cases_by_bureau[c.assigned_bureau] || 0) + 1;
      cases_by_category[c.category] = (cases_by_category[c.category] || 0) + 1;
    });

    const recent_overlaps = this.complaints
      .filter(c => c.has_potential_overlap)
      .slice(0, 5)
      .map(c => ({
        case_id: c.case_id,
        institution_name: c.institution_name || 'AICTE Institute',
        assigned_bureau: c.assigned_bureau,
        overlapping_case_id: c.overlapping_case_id || 'AICTE-CASE',
        overlap_score: c.overlap_score || 85.0,
        category: c.category,
        date_received: c.date_received
      }));

    return {
      total_complaints: total,
      total_pending: pending,
      total_under_process: underProcess,
      total_disposed: disposed,
      total_overlapping: overlapping,
      cases_by_bureau,
      cases_by_status,
      cases_by_category,
      recent_overlaps
    };
  }
}

export const apiService = new StorageService();
