import React, { useState } from 'react';
import { AlertOctagon, ArrowRight, X, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Complaint } from '../types';

interface OverlapAlertProps {
  recentOverlaps: Array<{
    case_id: string;
    institution_name: string;
    assigned_bureau: string;
    overlapping_case_id: string;
    overlap_score: number;
    category: string;
    date_received: string;
  }>;
  newComplaintWarning?: {
    case_id: string;
    overlapping_case_id: string;
    similarity_percentage: number;
    assigned_bureau: string;
  } | null;
  onInspectOverlap: (caseId: string, overlappingCaseId: string) => void;
  onDismissNewWarning?: () => void;
}

export const OverlapAlert: React.FC<OverlapAlertProps> = ({
  recentOverlaps,
  newComplaintWarning,
  onInspectOverlap,
  onDismissNewWarning
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!newComplaintWarning && recentOverlaps.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Newly Logged Complaint Overlap Flash Warning */}
      {newComplaintWarning && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-0.5 shadow-xl animate-flash-glow">
          <div className="rounded-[10px] bg-red-950/95 backdrop-blur-md px-5 py-4 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-red-600 text-white shadow-lg shadow-red-900/50 flex-shrink-0 animate-bounce">
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider px-2 py-0.5 bg-red-500/40 text-red-200 border border-red-400/50 rounded">
                      CRITICAL INTER-BUREAU ALERT
                    </span>
                    <span className="text-xs text-amber-300 font-mono flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> AI Engine (gpt-oss-120b) Match: {newComplaintWarning.similarity_percentage}%
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white mt-1 tracking-tight">
                    Potential Overlapping Cases – Coordination Required
                  </h3>
                  <p className="text-sm text-red-100/90 mt-0.5 max-w-2xl leading-relaxed">
                    Newly lodged grievance <span className="font-mono font-bold text-amber-300 bg-red-900/80 px-1.5 py-0.5 rounded">{newComplaintWarning.case_id}</span> substantially overlaps with active case <span className="font-mono font-bold text-amber-300 bg-red-900/80 px-1.5 py-0.5 rounded">{newComplaintWarning.overlapping_case_id}</span> ({newComplaintWarning.assigned_bureau}). Independent proceedings may create conflicting orders.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0 self-end md:self-center">
                <button
                  onClick={() => onInspectOverlap(newComplaintWarning.case_id, newComplaintWarning.overlapping_case_id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-red-900 hover:bg-amber-50 font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all duration-150 cursor-pointer active:scale-95"
                >
                  Inspect Overlap Matrix
                  <ArrowRight className="w-4 h-4" />
                </button>
                {onDismissNewWarning && (
                  <button
                    onClick={onDismissNewWarning}
                    className="p-1.5 text-red-300 hover:text-white rounded-lg hover:bg-red-800/60 transition-colors"
                    title="Dismiss temporary banner"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Active Overlaps Banner if any exist and no new alert is currently covering */}
      {!newComplaintWarning && recentOverlaps.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/90 shadow-sm overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b border-amber-200/70 bg-amber-100/60">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-600"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                Potential Overlapping Cases – Coordination Required ({recentOverlaps.length} Active Cross-Links)
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-amber-800 hover:text-amber-950 text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              {isExpanded ? (
                <>Collapse <ChevronUp className="w-3.5 h-3.5" /></>
              ) : (
                <>View Alerts <ChevronDown className="w-3.5 h-3.5" /></>
              )}
            </button>
          </div>

          {isExpanded && (
            <div className="p-3 divide-y divide-amber-200/60">
              {recentOverlaps.map((item, idx) => (
                <div key={idx} className="py-2.5 first:pt-1 last:pb-1 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800">{item.institution_name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-mono font-medium text-[11px]">
                        Overlap: {item.overlap_score.toFixed(1)}%
                      </span>
                      <span className="text-slate-500">Bureau {item.assigned_bureau}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                      <span className="font-bold text-red-700 bg-red-100 px-1 rounded">{item.case_id}</span>
                      <span className="text-slate-400">overlaps with</span>
                      <span className="font-bold text-indigo-800 bg-indigo-50 px-1 rounded">{item.overlapping_case_id}</span>
                      <span className="text-slate-500 font-sans">• {item.category}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onInspectOverlap(item.case_id, item.overlapping_case_id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-amber-600 text-white font-medium hover:bg-amber-700 transition cursor-pointer self-start md:self-center"
                  >
                    Compare Cases
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
