import React from 'react';
import { Complaint } from '../types';
import { AlertTriangle, Clock, Eye, MessageSquarePlus, Building2, Calendar, FileText } from 'lucide-react';

interface ComplaintTableProps {
  complaints: Complaint[];
  onViewHistory: (complaint: Complaint) => void;
  onAddAction: (complaint: Complaint) => void;
  onInspectOverlap: (caseId: string, overlappingCaseId: string) => void;
}

export const ComplaintTable: React.FC<ComplaintTableProps> = ({
  complaints,
  onViewHistory,
  onAddAction,
  onInspectOverlap
}) => {
  const getBureauBadge = (bureau: string) => {
    switch (bureau.toUpperCase()) {
      case 'RB':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PGRC':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'AB':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'LEGAL':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
      case 'Under Process':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold';
      case 'Disposed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 font-medium';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <th className="py-3 px-4">Case ID</th>
              <th className="py-3 px-4">Institution & AICTE ID</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-center">Bureau</th>
              <th className="py-3 px-4">Date Received</th>
              <th className="py-3 px-4">Expected Disposal</th>
              <th className="py-3 px-4 text-center">Current Status</th>
              <th className="py-3 px-4 text-center">AI Overlap Flag</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {complaints.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-medium text-slate-600">No complaints match the specified filters</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Try clearing your search query or bureau filter.</p>
                </td>
              </tr>
            ) : (
              complaints.map((c) => (
                <tr 
                  key={c.id} 
                  className={`hover:bg-slate-50/80 transition-colors ${
                    c.has_potential_overlap ? 'bg-red-50/30' : ''
                  }`}
                >
                  {/* Case ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                    {c.case_id}
                  </td>

                  {/* Institution */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-slate-900 truncate" title={c.institution_name}>
                      {c.institution_name}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      ID: {c.aicte_permanent_id}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 max-w-[200px]">
                    <span className="text-slate-700 font-medium line-clamp-1" title={c.category}>
                      {c.category}
                    </span>
                    <span className="text-[11px] text-slate-400 block line-clamp-1 mt-0.5" title={c.description}>
                      {c.description}
                    </span>
                  </td>

                  {/* Bureau */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-md border ${getBureauBadge(c.assigned_bureau)}`}>
                      {c.assigned_bureau}
                    </span>
                  </td>

                  {/* Date Received */}
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                    {formatDate(c.date_received)}
                  </td>

                  {/* Expected Disposal */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px]">
                    <div className="flex items-center gap-1 text-slate-700">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatDate(c.expected_disposal_date)}
                    </div>
                  </td>

                  {/* Current Status */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-0.5 text-[11px] rounded-full border ${getStatusBadge(c.current_status)}`}>
                      {c.current_status}
                    </span>
                  </td>

                  {/* Overlap Flag */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {c.has_potential_overlap ? (
                      <button
                        onClick={() => onInspectOverlap(c.case_id, c.overlapping_case_id || '')}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 font-bold text-[10px] hover:bg-red-200 transition cursor-pointer"
                        title={`Click to inspect ${c.overlap_score ? `${c.overlap_score.toFixed(1)}%` : ''} similarity with ${c.overlapping_case_id}`}
                      >
                        <AlertTriangle className="w-3 h-3 text-red-600 flex-shrink-0" />
                        <span>OVERLAP ({c.overlap_score ? `${c.overlap_score.toFixed(0)}%` : 'YES'})</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">None</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewHistory(c)}
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                        title="View Chronological Action History"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onAddAction(c)}
                        className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition"
                        title="Add Officer Hearing Remark / Update Status"
                      >
                        <MessageSquarePlus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
