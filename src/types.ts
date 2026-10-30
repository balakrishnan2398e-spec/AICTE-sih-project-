export interface Institution {
  id: number;
  aicte_permanent_id: string;
  name: string;
  region: string;
  state?: string;
  created_at?: string;
}

export type ComplaintStatus = 'Pending' | 'Under Process' | 'Disposed';

export type BureauType = 'RB' | 'PGRC' | 'AB' | 'LEGAL';

export interface ActionHistory {
  id: number;
  complaint_id: number;
  action_date: string;
  officer_id: string;
  remarks: string;
  previous_status?: string | null;
  new_status: string;
}

export interface Complaint {
  id: number;
  case_id: string;
  institution_id: number;
  category: string;
  description: string;
  current_status: ComplaintStatus;
  assigned_bureau: BureauType | string;
  expected_disposal_date?: string;
  date_received: string;
  has_potential_overlap: boolean;
  overlapping_case_id?: string | null;
  overlap_score?: number | null;
  institution_name?: string;
  aicte_permanent_id?: string;
  action_history?: ActionHistory[];
}

export interface OverlapDetail {
  overlapping_case_id: string;
  similarity_percentage: number;
  coordination_required: 'YES' | 'NO';
  assigned_bureau: string;
  key_overlap_points: string[];
  reasoning: string;
  model_used: string;
}

export interface ComplaintCreateResult {
  complaint: Complaint;
  warning_flag: boolean;
  warning_message?: string | null;
  overlap_analysis?: OverlapDetail | null;
}

export interface DashboardStats {
  total_complaints: number;
  total_pending: number;
  total_under_process: number;
  total_disposed: number;
  total_overlapping: number;
  cases_by_bureau: Record<string, number>;
  cases_by_status: Record<string, number>;
  cases_by_category: Record<string, number>;
  recent_overlaps: Array<{
    case_id: string;
    institution_name: string;
    assigned_bureau: string;
    overlapping_case_id: string;
    overlap_score: number;
    category: string;
    date_received: string;
  }>;
}
