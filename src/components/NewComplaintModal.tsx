import React, { useState } from 'react';
import { Institution, ComplaintCreateResult } from '../types';
import { apiService } from '../services/apiService';
import { X, AlertTriangle, Sparkles, Send, ShieldAlert, CheckCircle, Info } from 'lucide-react';

interface NewComplaintModalProps {
  institutions: Institution[];
  onClose: () => void;
  onSuccess: (result: ComplaintCreateResult) => void;
}

const CATEGORIES = [
  "Faculty Salary & Service Conditions",
  "Capitation Fee & Fee Refund Issues",
  "Infrastructure & Lab Deficiencies",
  "Student Harassment & Anti-Ragging",
  "Admission Irregularity",
  "Academic Malpractice & Exam Fraud",
  "Other"
];

const DEMO_SCENARIOS = [
  {
    title: "Scenario 1: Faculty Cadre Overlap (RB ↔ PGRC)",
    instId: 2, // Maharashtra College
    bureau: "PGRC",
    category: "Faculty Salary & Service Conditions",
    desc: "15 senior professors have petitioned regarding non-payment of UGC 7th pay scale allowances for 8 months. Management is violating approved cadre ratio and has blocked gratuity disbursements.",
    badge: "High Overlap (~88%)"
  },
  {
    title: "Scenario 2: Lab & Building Deficiency (RB)",
    instId: 1, // Delhi Institute
    bureau: "RB",
    category: "Infrastructure & Lab Deficiencies",
    desc: "Mechanical and Electrical Engineering laboratories are missing essential safety equipment, and structural inspection notes that fire safety clearance has not been renewed.",
    badge: "Overlaps with Case #101"
  },
  {
    title: "Scenario 3: Unique Student Grievance (Clean)",
    instId: 3, // Southern Apex
    bureau: "PGRC",
    category: "Academic Malpractice & Exam Fraud",
    desc: "Students reported delay in release of 4th semester consolidated marksheet by the autonomous examination cell, preventing enrollment in university campus placements.",
    badge: "Clean (0% Overlap)"
  }
];

export const NewComplaintModal: React.FC<NewComplaintModalProps> = ({
  institutions,
  onClose,
  onSuccess
}) => {
  const [institutionId, setInstitutionId] = useState<number>(institutions[0]?.id || 1);
  const [bureau, setBureau] = useState<string>("PGRC");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [description, setDescription] = useState<string>("");
  const [expectedDate, setExpectedDate] = useState<string>(
    new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preScreenResult, setPreScreenResult] = useState<any | null>(null);

  const handlePreScreen = () => {
    if (!description.trim()) return;
    const activeComplaints = apiService.getComplaints().filter(
      c => c.institution_id === Number(institutionId) && c.current_status !== 'Disposed'
    );

    if (activeComplaints.length === 0) {
      setPreScreenResult({
        hasOverlap: false,
        message: "No existing active complaints for this institution. Proceed safely."
      });
      return;
    }

    let highest = 0;
    let matched: any = null;
    let detail: any = null;

    for (const active of activeComplaints) {
      const res = apiService.analyzeOverlap(description, active.description);
      if (res.similarity_percentage > highest) {
        highest = res.similarity_percentage;
        matched = active;
        detail = res;
      }
    }

    if (highest >= 55) {
      setPreScreenResult({
        hasOverlap: true,
        similarity: highest,
        matchedCase: matched,
        detail
      });
    } else {
      setPreScreenResult({
        hasOverlap: false,
        similarity: highest,
        message: "AI indicates distinct subject matter. No conflict detected."
      });
    }
  };

  const handleLoadScenario = (sc: typeof DEMO_SCENARIOS[0]) => {
    setInstitutionId(sc.instId);
    setBureau(sc.bureau);
    setCategory(sc.category);
    setDescription(sc.desc);
    setPreScreenResult(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.trim().length < 15) {
      alert("Please provide a grievance description of at least 15 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = apiService.addComplaint({
        institution_id: Number(institutionId),
        category,
        description,
        assigned_bureau: bureau,
        expected_disposal_date: expectedDate
      });
      onSuccess(result);
    } catch (err: any) {
      alert(err.message || "Failed to log complaint.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-blue-700" />
              Log New Institutional Grievance
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated AI cross-referencing checks for multi-bureau duplicate filings
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Quick-Loads */}
        <div className="px-6 py-3 bg-blue-50/60 border-b border-blue-100 flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-700" />
            Quick Test Scenarios (Evaluate AI Overlap Engine)
          </span>
          <div className="flex flex-wrap gap-2">
            {DEMO_SCENARIOS.map((sc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadScenario(sc)}
                className="text-xs px-2.5 py-1 rounded-md bg-white border border-blue-200 text-blue-800 hover:bg-blue-100/60 transition cursor-pointer font-medium flex items-center gap-1.5 shadow-2xs"
              >
                <span>{sc.title}</span>
                <span className="text-[10px] bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded font-bold">
                  {sc.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Institution Selection */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Target Institution *
              </label>
              <select
                value={institutionId}
                onChange={(e) => {
                  setInstitutionId(Number(e.target.value));
                  setPreScreenResult(null);
                }}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none bg-white font-medium"
              >
                {institutions.map((i) => (
                  <option key={i.id} value={i.id}>
                    [{i.aicte_permanent_id}] {i.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned Bureau */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Receiving AICTE Bureau *
              </label>
              <select
                value={bureau}
                onChange={(e) => setBureau(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none bg-white font-medium"
              >
                <option value="PGRC">PGRC - Public & Grievance Redressal Cell</option>
                <option value="RB">RB - Regulation Bureau</option>
                <option value="AB">AB - Approval Bureau</option>
                <option value="LEGAL">LEGAL - Legal & Compliance Bureau</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Grievance Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none bg-white font-medium"
              >
                {CATEGORIES.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Expected Disposal Date */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Target Resolution Date (Citizen Charter)
              </label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none bg-white font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase text-slate-700">
                Detailed Grievance Narrative *
              </label>
              <button
                type="button"
                onClick={handlePreScreen}
                disabled={!description.trim()}
                className="text-[11px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <Sparkles className="w-3 h-3" />
                Test AI Overlap Pre-Screening
              </button>
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setPreScreenResult(null);
              }}
              placeholder="State the detailed factual allegations, specific regulatory violations, employee/student specifics, or financial disputes..."
              className="w-full text-xs rounded-lg border border-slate-300 p-3 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Minimum 15 characters. This text is processed by `gpt-oss-120b` against active institute files.
            </p>
          </div>

          {/* Pre-Screening Feedback Card */}
          {preScreenResult && (
            <div className={`p-3.5 rounded-xl border text-xs ${
              preScreenResult.hasOverlap
                ? 'bg-red-50 border-red-300 text-red-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}>
              <div className="flex items-start gap-2.5">
                {preScreenResult.hasOverlap ? (
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold flex items-center gap-2">
                    {preScreenResult.hasOverlap ? (
                      <>
                        <span>POTENTIAL OVERLAP DETECTED ({preScreenResult.similarity.toFixed(1)}%)</span>
                        <span className="px-1.5 py-0.2 bg-red-200 text-red-900 rounded font-mono text-[10px]">
                          COORDINATION REQUIRED: YES
                        </span>
                      </>
                    ) : (
                      <span>NO SUBSTANTIAL OVERLAP DETECTED</span>
                    )}
                  </div>
                  <p className="text-[11px] mt-1 leading-relaxed">
                    {preScreenResult.hasOverlap
                      ? `Matches active Case ${preScreenResult.matchedCase?.case_id} (${preScreenResult.matchedCase?.assigned_bureau}). Upon lodging, a cross-bureau coordination warning will be appended to the record.`
                      : preScreenResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? "Processing AI Analysis..." : "Log Complaint & Dispatch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
