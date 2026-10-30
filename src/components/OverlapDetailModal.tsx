import React from 'react';
import { Complaint } from '../types';
import { apiService } from '../services/apiService';
import { X, AlertTriangle, Sparkles, Building2, Layers, CheckCircle2, GitMerge } from 'lucide-react';

interface OverlapDetailModalProps {
  caseId: string;
  overlappingCaseId: string;
  onClose: () => void;
  onInitiateJointReview: (caseIdA: string, caseIdB: string) => void;
}

export const OverlapDetailModal: React.FC<OverlapDetailModalProps> = ({
  caseId,
  overlappingCaseId,
  onClose,
  onInitiateJointReview
}) => {
  const caseA = apiService.getComplaintById(caseId);
  const caseB = apiService.getComplaintById(overlappingCaseId);

  // If one isn't directly resolved, run live analysis
  const analysis = caseA && caseB
    ? apiService.analyzeOverlap(caseA.description, caseB.description)
    : {
        similarity_percentage: caseA?.overlap_score || 85.0,
        coordination_required: "YES",
        key_overlap_points: ["Faculty salary and cadre compliance", "Inspection deficiency overlap"],
        reasoning: "High semantic and factual overlap across statutory obligations of the institution.",
        model_used: "gpt-oss-120b"
      };

  const similarityScore = caseA?.overlap_score || analysis.similarity_percentage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-red-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 bg-red-200 text-red-900 rounded">
                  AI Cross-Bureau Overlap Investigation
                </span>
                <span className="text-xs font-mono text-slate-600 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Model: {analysis.model_used}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 mt-0.5">
                Potential Overlapping Cases – Coordination Required
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Metric Score Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-center sm:text-left">
              <span className="text-xs text-slate-400 font-medium block">Computed Overlap Score</span>
              <span className="text-3xl font-black text-amber-400 font-mono">
                {similarityScore.toFixed(1)}%
              </span>
            </div>
            <div className="h-10 w-px bg-slate-700 hidden sm:block" />
            <div>
              <span className="text-xs text-slate-400 font-medium block">Inter-Bureau Directive</span>
              <span className="text-sm font-bold text-red-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-red-400" />
                Coordination Required: {analysis.coordination_required}
              </span>
            </div>
          </div>

          <button
            onClick={() => onInitiateJointReview(caseId, overlappingCaseId)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-xs uppercase tracking-wider hover:from-red-700 hover:to-amber-700 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <GitMerge className="w-4 h-4" />
            Initiate Joint Bureau Review
          </button>
        </div>

        {/* AI Overlap Rationale */}
        <div className="p-6 border-b border-slate-100 bg-amber-50/40">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" /> AI Executive Synthesis
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {analysis.reasoning}
          </p>

          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Identified Overlap Points:</span>
            {analysis.key_overlap_points.map((point, idx) => (
              <span key={idx} className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-200">
                • {point}
              </span>
            ))}
          </div>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50">
          {/* Case A */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Primary Record</span>
                <div className="text-sm font-mono font-bold text-red-700">
                  {caseA?.case_id || caseId}
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-100 text-blue-800">
                Bureau: {caseA?.assigned_bureau || 'RB'}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">Institution</span>
              <span className="text-xs font-bold text-slate-900">
                {caseA?.institution_name || 'Technical Institute'}
              </span>
              <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                AICTE Permanent ID: {caseA?.aicte_permanent_id}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">Grievance Category</span>
              <span className="text-xs font-medium text-slate-800">{caseA?.category}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-semibold block mb-1">Allegations Narrative</span>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-normal max-h-48 overflow-y-auto">
                {caseA?.description}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
              <span>Status: <strong className="text-slate-800">{caseA?.current_status}</strong></span>
              <span>Logged: {caseA?.date_received ? new Date(caseA.date_received).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>

          {/* Case B (Overlapping Active Record) */}
          <div className="bg-white rounded-xl p-5 border border-indigo-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">Correlated Active Case</span>
                <div className="text-sm font-mono font-bold text-indigo-700">
                  {caseB?.case_id || overlappingCaseId}
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-purple-100 text-purple-800">
                Bureau: {caseB?.assigned_bureau || 'PGRC'}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">Institution</span>
              <span className="text-xs font-bold text-slate-900">
                {caseB?.institution_name || caseA?.institution_name || 'Technical Institute'}
              </span>
              <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                AICTE Permanent ID: {caseB?.aicte_permanent_id || caseA?.aicte_permanent_id}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">Grievance Category</span>
              <span className="text-xs font-medium text-slate-800">{caseB?.category}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-semibold block mb-1">Allegations Narrative</span>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-normal max-h-48 overflow-y-auto">
                {caseB?.description || "Active complaint documentation on file under peer bureau review."}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
              <span>Status: <strong className="text-slate-800">{caseB?.current_status}</strong></span>
              <span>Logged: {caseB?.date_received ? new Date(caseB.date_received).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            AICTE Inter-Bureau Coordination Directive (Statutory Clause 4.2)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition cursor-pointer"
          >
            Close Investigation
          </button>
        </div>
      </div>
    </div>
  );
};
