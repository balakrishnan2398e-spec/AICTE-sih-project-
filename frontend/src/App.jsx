import React, { useState } from 'react';
import Dashboard from './Dashboard';
import { Landmark, ShieldCheck, Code } from 'lucide-react';

export default function App() {
  const [activeBureau, setActiveBureau] = useState('ALL');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* Top AICTE Gov Banner */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-semibold tracking-wider text-[11px] uppercase">
              Ministry of Education • Government of India
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
              AICTE Inter-Bureau Grievance Redressal Framework
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI Overlap Engine Active (gpt-oss-120b)
            </span>
          </div>
        </div>

        {/* Council Main Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
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
              Automated cross-bureau overlap detection running on custom gpt-oss-120b inference clusters.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>SLA Compliance Guaranteed</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
