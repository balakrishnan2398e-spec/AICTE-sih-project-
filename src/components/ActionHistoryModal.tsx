import React, { useState } from 'react';
import { Complaint } from '../types';
import { apiService } from '../services/apiService';
import { X, Clock, UserCheck, ShieldCheck, MessageSquarePlus, Building2, Calendar } from 'lucide-react';

interface ActionHistoryModalProps {
  complaint: Complaint;
  initialMode?: 'view' | 'add';
  onClose: () => void;
  onUpdated: () => void;
}

export const ActionHistoryModal: React.FC<ActionHistoryModalProps> = ({
  complaint,
  initialMode = 'view',
  onClose,
  onUpdated
}) => {
  const [officerId, setOfficerId] = useState("DIR-PGRC-HQ-01");
  const [newStatus, setNewStatus] = useState(complaint.current_status);
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(initialMode === 'add');

  const history = complaint.action_history || [];

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarks.trim()) {
      alert("Please provide official remarks for the case record.");
      return;
    }

    setIsSubmitting(true);
    try {
      apiService.addActionHistory(complaint.case_id, {
        officer_id: officerId.trim(),
        remarks: remarks.trim(),
        new_status: newStatus
      });
      setIsSubmitting(false);
      setRemarks("");
      setShowAddForm(false);
      onUpdated();
    } catch (err: any) {
      alert(err.message || "Failed to update action history.");
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                {complaint.case_id}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full border bg-slate-100 font-semibold text-slate-700">
                Bureau: {complaint.assigned_bureau}
              </span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 mt-1">
              Case Inquiry & Action History Audit Trail
            </h2>
            <p className="text-xs text-slate-500 truncate max-w-md">
              {complaint.institution_name} ({complaint.aicte_permanent_id})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Case Summary Strip */}
        <div className="bg-slate-50/70 px-6 py-2.5 border-b border-slate-200/60 text-xs text-slate-600 flex items-center justify-between flex-wrap gap-2">
          <span>
            <strong className="text-slate-800">Category:</strong> {complaint.category}
          </span>
          <span>
            <strong className="text-slate-800">Status:</strong>{' '}
            <span className="font-bold text-indigo-700">{complaint.current_status}</span>
          </span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            {showAddForm ? 'Hide Update Form' : '+ Record Officer Action'}
          </button>
        </div>

        {/* Action Form if toggled */}
        {showAddForm && (
          <form onSubmit={handleAddAction} className="bg-blue-50/40 p-4 border-b border-blue-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Record New Bureau Hearing or Status Transition
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Officer ID *</label>
                <input
                  type="text"
                  required
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  placeholder="e.g. DIR-RB-02"
                  className="w-full rounded-md border border-slate-300 p-2 font-mono text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Transition Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full rounded-md border border-slate-300 p-2 text-xs bg-white font-medium"
                >
                  <option value="Pending">Pending (Awaiting documents)</option>
                  <option value="Under Process">Under Process (Inspection / Hearing)</option>
                  <option value="Disposed">Disposed (Resolved / Penalized)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Official Remarks / Directive *</label>
              <textarea
                required
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter hearing outcome, inspection order, or cross-bureau sync note..."
                className="w-full rounded-md border border-slate-300 p-2 text-xs bg-white"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200/50 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded transition shadow-2xs"
              >
                {isSubmitting ? "Saving..." : "Commit Action"}
              </button>
            </div>
          </form>
        )}

        {/* Chronological History List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No previous audit records found.
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
              {history.map((item, idx) => (
                <div key={item.id || idx} className="relative pl-6">
                  {/* Timeline dot */}
                  <div className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                  
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 flex-wrap gap-1">
                      <div className="flex items-center gap-1.5 font-mono font-medium text-slate-700">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>{item.officer_id}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(item.action_date)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                      {item.remarks}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-2 text-[11px]">
                      <span className="text-slate-400 font-medium">Status Transition:</span>
                      {item.previous_status ? (
                        <>
                          <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                            {item.previous_status}
                          </span>
                          <span className="text-slate-400">→</span>
                        </>
                      ) : null}
                      <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                        {item.new_status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>AICTE Statutory Compliance Audit System</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
