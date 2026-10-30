/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Dashboard } from './Dashboard';
import { CodeViewerModal } from './components/CodeViewerModal';
import { 
  ShieldCheck, Landmark, FileText, Layers, 
  HelpCircle, Code, ExternalLink, CheckCircle2 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'rb' | 'pgrc' | 'ab'>('overview');
  const [showCodeModal, setShowCodeModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* Top AICTE Gov Banner */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        {/* Government of India / Council Masthead */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-semibold tracking-wider text-[11px] uppercase">
              Ministry of Education • Government of India
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
              Citizen Grievance &amp; Inter-Bureau Redressal Framework
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI Overlap Engine Active
            </span>
            <button
              onClick={() => setShowCodeModal(true)}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Full Codebase</span>
            </button>
          </div>
        </div>

        {/* Council Main Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            {/* AICTE Stylized Council Emblem */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 p-0.5 shadow-md flex-shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-amber-400 font-black text-xl">
                <Landmark className="w-6 h-6" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                  AICTE Integrated Grievance Portal
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Dual-Bureau Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                अखिल भारतीय तकनीकी शिक्षा परिषद • All India Council for Technical Education
              </p>
            </div>
          </div>

          {/* Quick Nav Bureau Pills */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              All Bureaus
            </button>
            <button
              onClick={() => setActiveTab('rb')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'rb'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Regulation (RB)
            </button>
            <button
              onClick={() => setActiveTab('pgrc')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'pgrc'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Grievance (PGRC)
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Dashboard />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-bold text-slate-200">
              AICTE Integrated Institution Complaint Monitoring &amp; Status Dashboard
            </p>
            <p className="text-[11px] text-slate-400">
              Automated cross-bureau overlap detection running on custom <span className="font-mono text-amber-400">gpt-oss-120b</span> inference clusters.
            </p>
            <p className="text-[11px] text-slate-500">
              Nelson Mandela Marg, Vasant Kunj, New Delhi-110070 • Statutory AICTE Regulations 2026
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setShowCodeModal(true)}
              className="text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
              Backend Architecture Code
            </button>
            <span>•</span>
            <span className="text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              SLA Compliant (45 Days)
            </span>
          </div>
        </div>
      </footer>

      {showCodeModal && (
        <CodeViewerModal onClose={() => setShowCodeModal(false)} />
      )}
    </div>
  );
}
