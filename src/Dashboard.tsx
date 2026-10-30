import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, Legend 
} from 'recharts';
import { Complaint, Institution, DashboardStats, ComplaintCreateResult } from './types';
import { apiService } from './services/apiService';
import { StatsRibbon } from './components/StatsRibbon';
import { OverlapAlert } from './components/OverlapAlert';
import { ComplaintTable } from './components/ComplaintTable';
import { NewComplaintModal } from './components/NewComplaintModal';
import { RegisterInstitutionModal } from './components/RegisterInstitutionModal';
import { ActionHistoryModal } from './components/ActionHistoryModal';
import { OverlapDetailModal } from './components/OverlapDetailModal';
import { CodeViewerModal } from './components/CodeViewerModal';
import { 
  Search, Filter, Plus, Building2, Code, RotateCcw, 
  Layers, CheckCircle2, ShieldAlert, BarChart3, PieChart as PieIcon 
} from 'lucide-react';

const BUREAU_COLORS: Record<string, string> = {
  RB: '#2563eb',    // Regulation Bureau - Royal Blue
  PGRC: '#9333ea',  // PGRC - Purple
  AB: '#0d9488',    // Approval Bureau - Teal
  LEGAL: '#d97706'  // Legal Bureau - Amber
};

const CATEGORY_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#64748b'];

export const Dashboard: React.FC = () => {
  // State from apiService
  const [complaints, setComplaints] = useState<Complaint[]>(() => apiService.getComplaints());
  const [institutions, setInstitutions] = useState<Institution[]>(() => apiService.getInstitutions());
  const [stats, setStats] = useState<DashboardStats>(() => apiService.getStats());

  // Filter States
  const [bureauFilter, setBureauFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [overlapOnly, setOverlapOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Inspection States
  const [showNewComplaintModal, setShowNewComplaintModal] = useState<boolean>(false);
  const [showRegisterInstModal, setShowRegisterInstModal] = useState<boolean>(false);
  const [showCodeViewer, setShowCodeViewer] = useState<boolean>(false);
  const [historyTarget, setHistoryTarget] = useState<Complaint | null>(null);
  const [historyMode, setHistoryMode] = useState<'view' | 'add'>('view');
  
  // Overlap Inspection Target
  const [overlapComparison, setOverlapComparison] = useState<{
    caseIdA: string;
    caseIdB: string;
  } | null>(null);

  // Newly triggered overlap banner
  const [newComplaintOverlapWarning, setNewComplaintOverlapWarning] = useState<{
    case_id: string;
    overlapping_case_id: string;
    similarity_percentage: number;
    assigned_bureau: string;
  } | null>(null);

  // Refresh data helper
  const reloadData = () => {
    setComplaints(apiService.getComplaints());
    setInstitutions(apiService.getInstitutions());
    setStats(apiService.getStats());
  };

  // Filtered complaints computation
  const filteredComplaints = useMemo(() => {
    return apiService.getComplaints({
      bureau: bureauFilter,
      status: statusFilter,
      overlapOnly,
      search: searchQuery
    });
  }, [complaints, bureauFilter, statusFilter, overlapOnly, searchQuery]);

  // Chart data: Cases by Bureau
  const bureauChartData = useMemo(() => {
    return [
      { name: 'Regulation (RB)', bureau: 'RB', count: stats.cases_by_bureau['RB'] || 0 },
      { name: 'Grievance (PGRC)', bureau: 'PGRC', count: stats.cases_by_bureau['PGRC'] || 0 },
      { name: 'Approval (AB)', bureau: 'AB', count: stats.cases_by_bureau['AB'] || 0 },
      { name: 'Legal Cell', bureau: 'LEGAL', count: stats.cases_by_bureau['LEGAL'] || 0 }
    ];
  }, [stats]);

  // Chart data: Cases by Category
  const categoryChartData = useMemo(() => {
    return Object.entries(stats.cases_by_category).map(([name, value]) => ({
      name,
      value
    }));
  }, [stats]);

  // Handlers
  const handleComplaintCreated = (result: ComplaintCreateResult) => {
    setShowNewComplaintModal(false);
    reloadData();

    if (result.warning_flag && result.overlap_analysis) {
      setNewComplaintOverlapWarning({
        case_id: result.complaint.case_id,
        overlapping_case_id: result.overlap_analysis.overlapping_case_id,
        similarity_percentage: result.overlap_analysis.similarity_percentage,
        assigned_bureau: result.overlap_analysis.assigned_bureau
      });
      // Scroll to top to ensure banner visibility
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleInspectOverlap = (caseIdA: string, caseIdB: string) => {
    setOverlapComparison({ caseIdA, caseIdB });
  };

  const handleInitiateJointReview = (caseIdA: string, caseIdB: string) => {
    apiService.addActionHistory(caseIdA, {
      officer_id: "JOINT-COORDINATION-DESK",
      remarks: `Joint hearing coordinated with peer bureau for correlated case ${caseIdB}. Hearing notice dispatched to institute management.`,
      new_status: "Under Process"
    });
    apiService.addActionHistory(caseIdB, {
      officer_id: "JOINT-COORDINATION-DESK",
      remarks: `Consolidated into joint inter-bureau hearing docket with case ${caseIdA}.`,
      new_status: "Under Process"
    });
    setOverlapComparison(null);
    setNewComplaintOverlapWarning(null);
    reloadData();
    alert(`Joint hearing proceedings successfully initiated for ${caseIdA} and ${caseIdB}!`);
  };

  const handleResetData = () => {
    if (confirm("Reset database to initial sample institutions and complaints?")) {
      apiService.resetToDefaults();
      reloadData();
      setNewComplaintOverlapWarning(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Leadership Header Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
              AICTE National Grievance Portal
            </span>
            <span className="text-xs font-mono text-slate-500">
              Live AI Model: gpt-oss-120b
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Integrated Institution Complaint Monitoring Dashboard
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
            Inter-bureau synchronization engine tracking institutional grievances across Regulation Bureau (RB) and Public Grievance Redressal Cell (PGRC).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCodeViewer(true)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Inspect backend models.py, ai_service.py, and main.py"
          >
            <Code className="w-4 h-4 text-slate-600" />
            <span>Code &amp; Architecture</span>
          </button>

          <button
            onClick={() => setShowRegisterInstModal(true)}
            className="px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50/70 text-blue-800 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-blue-700" />
            <span>+ Add Institute</span>
          </button>

          <button
            onClick={() => setShowNewComplaintModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Log New Complaint</span>
          </button>
        </div>
      </div>

      {/* Phase 5 Requirement: Flashing Overlap Alert Component */}
      <OverlapAlert
        recentOverlaps={stats.recent_overlaps}
        newComplaintWarning={newComplaintOverlapWarning}
        onInspectOverlap={handleInspectOverlap}
        onDismissNewWarning={() => setNewComplaintOverlapWarning(null)}
      />

      {/* Phase 5 Requirement: Top Statistics Ribbon */}
      <StatsRibbon
        stats={stats}
        activeStatusFilter={statusFilter}
        onSelectStatusFilter={setStatusFilter}
        overlapOnly={overlapOnly}
        onToggleOverlapOnly={() => setOverlapOnly(!overlapOnly)}
      />

      {/* Visual Analytics Grid: Bureau & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bureau Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Active Grievance Caseload by AICTE Bureau
              </h2>
              <p className="text-xs text-slate-500">
                Direct portfolio split between Regulation (RB), Grievance Redressal (PGRC), and Approval
              </p>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600">
              Total: {stats.total_complaints}
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bureauChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {bureauChartData.map((entry) => (
                    <Cell key={entry.bureau} fill={BUREAU_COLORS[entry.bureau] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-600" />
                Grievance Categorization
              </h2>
              <p className="text-xs text-slate-500">Frequency of grievance allegations</p>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 mt-2 text-[11px] text-slate-600">
            {categoryChartData.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 truncate max-w-[180px]">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="font-mono font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Case ID, Institute, or AICTE ID..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none bg-slate-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Bureau & Status Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Bureau Dropdown */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-semibold">Bureau:</span>
            <select
              value={bureauFilter}
              onChange={(e) => setBureauFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="ALL">All Bureaus</option>
              <option value="RB">RB - Regulation</option>
              <option value="PGRC">PGRC - Grievances</option>
              <option value="AB">AB - Approval</option>
              <option value="LEGAL">LEGAL - Cell</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Under Process">Under Process</option>
              <option value="Disposed">Disposed</option>
            </select>
          </div>

          {/* Overlap Only Toggle */}
          <button
            onClick={() => setOverlapOnly(!overlapOnly)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition cursor-pointer ${
              overlapOnly
                ? 'bg-red-600 text-white border-red-700 shadow-sm'
                : 'bg-white text-slate-700 border-slate-300 hover:border-red-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Overlaps Only</span>
            {stats.total_overlapping > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                overlapOnly ? 'bg-red-800 text-white' : 'bg-red-100 text-red-800'
              }`}>
                {stats.total_overlapping}
              </span>
            )}
          </button>

          {/* Reset Filters / Seed Data */}
          <button
            onClick={handleResetData}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            title="Reset to Initial AICTE Benchmark Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Phase 5 Requirement: Dynamic Data Table Listing Complaints */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-slate-500">
            Showing <strong className="text-slate-800">{filteredComplaints.length}</strong> active complaint records
          </div>
          {(bureauFilter !== 'ALL' || statusFilter !== 'ALL' || overlapOnly || searchQuery) && (
            <button
              onClick={() => {
                setBureauFilter('ALL');
                setStatusFilter('ALL');
                setOverlapOnly(false);
                setSearchQuery('');
              }}
              className="text-xs text-blue-700 hover:underline font-semibold cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
        </div>

        <ComplaintTable
          complaints={filteredComplaints}
          onViewHistory={(c) => {
            setHistoryTarget(c);
            setHistoryMode('view');
          }}
          onAddAction={(c) => {
            setHistoryTarget(c);
            setHistoryMode('add');
          }}
          onInspectOverlap={handleInspectOverlap}
        />
      </div>

      {/* Modals */}
      {showNewComplaintModal && (
        <NewComplaintModal
          institutions={institutions}
          onClose={() => setShowNewComplaintModal(false)}
          onSuccess={handleComplaintCreated}
        />
      )}

      {showRegisterInstModal && (
        <RegisterInstitutionModal
          onClose={() => setShowRegisterInstModal(false)}
          onSuccess={(newInst) => {
            setShowRegisterInstModal(false);
            reloadData();
            alert(`Institution '${newInst.name}' (Permanent ID: ${newInst.aicte_permanent_id}) successfully registered!`);
          }}
        />
      )}

      {historyTarget && (
        <ActionHistoryModal
          complaint={historyTarget}
          initialMode={historyMode}
          onClose={() => setHistoryTarget(null)}
          onUpdated={() => {
            reloadData();
            // Re-fetch target
            const updated = apiService.getComplaintById(historyTarget.case_id);
            if (updated) setHistoryTarget(updated);
          }}
        />
      )}

      {overlapComparison && (
        <OverlapDetailModal
          caseId={overlapComparison.caseIdA}
          overlappingCaseId={overlapComparison.caseIdB}
          onClose={() => setOverlapComparison(null)}
          onInitiateJointReview={handleInitiateJointReview}
        />
      )}

      {showCodeViewer && (
        <CodeViewerModal onClose={() => setShowCodeViewer(false)} />
      )}
    </div>
  );
};
