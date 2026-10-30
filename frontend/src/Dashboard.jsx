import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  FileText, Clock, RefreshCw, CheckCircle2, AlertTriangle, 
  Search, ShieldAlert, ArrowRight, Building2, Plus 
} from 'lucide-react';

const BUREAU_COLORS = {
  RB: '#2563eb',    // Regulation Bureau
  PGRC: '#9333ea',  // Public Grievance Redressal Cell
  AB: '#0d9488',    // Approval Bureau
  LEGAL: '#d97706'  // Legal Bureau
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_complaints: 0,
    total_pending: 0,
    total_under_process: 0,
    total_disposed: 0,
    total_overlapping: 0,
    cases_by_bureau: { RB: 0, PGRC: 0, AB: 0, LEGAL: 0 },
    recent_overlaps: []
  });

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bureauFilter, setBureauFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [overlapOnly, setOverlapOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [overlapAlert, setOverlapAlert] = useState(null);

  // Fetch Stats and Complaints from FastAPI Backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      
      const statsRes = await fetch(`${baseUrl}/dashboard/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      let url = `${baseUrl}/complaints/?`;
      if (bureauFilter !== 'ALL') url += `bureau=${bureauFilter}&`;
      if (statusFilter !== 'ALL') url += `status=${statusFilter}&`;
      if (overlapOnly) url += `overlap_only=true&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const compRes = await fetch(url);
      if (compRes.ok) {
        const compData = await compRes.json();
        setComplaints(compData);
      }
    } catch (err) {
      console.warn("Backend not running locally or CORS restricted; using sample dataset fallback.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [bureauFilter, statusFilter, overlapOnly, search]);

  const bureauChartData = [
    { name: 'Regulation (RB)', bureau: 'RB', count: stats.cases_by_bureau.RB || 0 },
    { name: 'Grievance (PGRC)', bureau: 'PGRC', count: stats.cases_by_bureau.PGRC || 0 },
    { name: 'Approval (AB)', bureau: 'AB', count: stats.cases_by_bureau.AB || 0 },
    { name: 'Legal Cell', bureau: 'LEGAL', count: stats.cases_by_bureau.LEGAL || 0 }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Flashing Overlap Alert Component */}
      {(overlapAlert || stats.total_overlapping > 0) && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-amber-600 p-0.5 shadow-xl animate-pulse">
          <div className="rounded-[10px] bg-red-950/95 px-5 py-4 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-red-600 text-white flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-red-500/40 text-red-200 border border-red-400/50 rounded">
                    INTER-BUREAU SYNCHRONIZATION ALERT
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-1">
                    Potential Overlapping Cases – Coordination Required
                  </h3>
                  <p className="text-xs text-red-100/90 mt-0.5">
                    AI Overlap Engine (gpt-oss-120b) identified correlated active grievances across Regulation Bureau (RB) and PGRC for identical institutions.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setOverlapOnly(true)}
                className="px-4 py-2 bg-white text-red-900 font-bold text-xs uppercase tracking-wider rounded-lg shadow-md hover:bg-amber-50 transition cursor-pointer flex items-center gap-1.5 self-start sm:self-center"
              >
                Inspect Overlap Records
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top Statistics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Cases */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Cases</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{stats.total_complaints}</div>
          <div className="mt-1 text-xs text-slate-400">All registered institutional complaints</div>
        </div>

        {/* Pending Cases */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">{stats.total_pending}</div>
          <div className="mt-1 text-xs text-amber-700">Awaiting bureau triage</div>
        </div>

        {/* Under Process */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Under Process</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-700">{stats.total_under_process}</div>
          <div className="mt-1 text-xs text-indigo-600">Hearings & inquiry active</div>
        </div>

        {/* Disposed */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Disposed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">{stats.total_disposed}</div>
          <div className="mt-1 text-xs text-emerald-700">Resolved / Penalized</div>
        </div>

        {/* Overlapping Cases Ribbon */}
        <div 
          onClick={() => setOverlapOnly(!overlapOnly)}
          className={`cursor-pointer rounded-xl p-4 border transition ${
            overlapOnly ? 'bg-red-50 border-red-500 ring-2 ring-red-200' : 'bg-white border-red-200 hover:border-red-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700">Overlapping Cases</span>
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600">{stats.total_overlapping}</div>
          <div className="mt-1 text-xs text-red-600 font-semibold">
            {overlapOnly ? 'Active Filter: Showing Overlaps' : 'Click to Filter Overlaps'}
          </div>
        </div>
      </div>

      {/* 3. Recharts Caseload by Bureau */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-1">Grievance Distribution by AICTE Bureau</h2>
        <div className="h-48 w-full mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bureauChartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={45}>
                {bureauChartData.map((entry) => (
                  <Cell key={entry.bureau} fill={BUREAU_COLORS[entry.bureau]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Dynamic Data Table Listing Active Complaints */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Case ID or Institution..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={bureauFilter}
              onChange={(e) => setBureauFilter(e.target.value)}
              className="border border-slate-300 text-xs rounded-lg px-2.5 py-1.5 bg-white"
            >
              <option value="ALL">All Bureaus</option>
              <option value="RB">RB - Regulation</option>
              <option value="PGRC">PGRC - Grievances</option>
              <option value="AB">AB - Approval</option>
              <option value="LEGAL">LEGAL</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 text-xs rounded-lg px-2.5 py-1.5 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Under Process">Under Process</option>
              <option value="Disposed">Disposed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Bureau</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">AI Overlap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No active complaints matching current criteria.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.id} className={c.has_potential_overlap ? 'bg-red-50/40' : ''}>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.case_id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{c.institution_name}</td>
                    <td className="py-3 px-4 text-slate-600">{c.category}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-blue-100 text-blue-800">
                        {c.assigned_bureau}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] bg-slate-100 text-slate-700">
                        {c.current_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {c.has_potential_overlap ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 font-bold text-[10px] inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          OVERLAP ({c.overlap_score ? `${c.overlap_score.toFixed(0)}%` : 'YES'})
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
