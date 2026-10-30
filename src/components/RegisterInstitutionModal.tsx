import React, { useState } from 'react';
import { Institution } from '../types';
import { apiService } from '../services/apiService';
import { X, Building2, Plus, CheckCircle } from 'lucide-react';

interface RegisterInstitutionModalProps {
  onClose: () => void;
  onSuccess: (institution: Institution) => void;
}

const REGIONS = [
  "Northern (Delhi / Haryana / Punjab / HP / J&K)",
  "Western (Mumbai / Maharashtra / Goa)",
  "Eastern (Kolkata / WB / Odisha / Bihar / Jharkhand)",
  "Southern (Chennai / TN / Kerala)",
  "South-Western (Bengaluru / Karnataka)",
  "Central (Bhopal / MP / Chhattisgarh)",
  "North-Western (Chandigarh)",
  "North-Eastern (Guwahati / Assam)"
];

export const RegisterInstitutionModal: React.FC<RegisterInstitutionModalProps> = ({
  onClose,
  onSuccess
}) => {
  const [aicteId, setAicteId] = useState("");
  const [name, setName] = useState("");
  const [region, setRegion] = useState(REGIONS[0]);
  const [state, setState] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aicteId.trim() || !name.trim()) {
      setError("Please fill in both AICTE Permanent ID and Institution Name.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const simplifiedRegion = region.split(" ")[0];
      const newInst = apiService.addInstitution({
        aicte_permanent_id: aicteId.trim(),
        name: name.trim(),
        region: simplifiedRegion,
        state: state.trim() || "N/A"
      });
      onSuccess(newInst);
    } catch (err: any) {
      setError(err.message || "Failed to register institution.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-700" />
              Register Technical Institution
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add technical campus to the central AICTE verification registry
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              AICTE Permanent Institute ID *
            </label>
            <input
              type="text"
              required
              value={aicteId}
              onChange={(e) => setAicteId(e.target.value)}
              placeholder="e.g. 1-928104812"
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 font-mono focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">
              Must match AICTE Approval Bureau Permanent ID for index correlation.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Official Institution Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Indian Institute of Information Technology, Allahabad"
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                AICTE Regional Office *
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none bg-white"
              >
                {REGIONS.map((r, idx) => (
                  <option key={idx} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                State / UT
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Uttar Pradesh"
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
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
              <Plus className="w-4 h-4" />
              Register Campus
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
