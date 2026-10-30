import React from 'react';
import { DashboardStats } from '../types';
import { FileText, Clock, RefreshCw, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface StatsRibbonProps {
  stats: DashboardStats;
  activeStatusFilter: string;
  onSelectStatusFilter: (status: string) => void;
  overlapOnly: boolean;
  onToggleOverlapOnly: () => void;
}

export const StatsRibbon: React.FC<StatsRibbonProps> = ({
  stats,
  activeStatusFilter,
  onSelectStatusFilter,
  overlapOnly,
  onToggleOverlapOnly
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Complaints */}
      <div 
        onClick={() => {
          onSelectStatusFilter('ALL');
          if (overlapOnly) onToggleOverlapOnly();
        }}
        className={`cursor-pointer bg-white rounded-xl p-4 border transition-all duration-200 hover:shadow-md ${
          activeStatusFilter === 'ALL' && !overlapOnly
            ? 'border-blue-600 ring-2 ring-blue-100 shadow-sm'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Cases</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{stats.total_complaints}</span>
          <span className="text-xs text-slate-500 font-medium">Logged</span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>AICTE Repositories</span>
          <span className="text-blue-600 font-medium">View All</span>
        </div>
      </div>

      {/* Pending Cases */}
      <div 
        onClick={() => {
          onSelectStatusFilter('Pending');
          if (overlapOnly) onToggleOverlapOnly();
        }}
        className={`cursor-pointer bg-white rounded-xl p-4 border transition-all duration-200 hover:shadow-md ${
          activeStatusFilter === 'Pending' && !overlapOnly
            ? 'border-amber-500 ring-2 ring-amber-100 shadow-sm'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Pending Review</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-600">{stats.total_pending}</span>
          <span className="text-xs text-amber-700 font-medium">Requires initial triage</span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>SLA &lt; 14 Days</span>
          <span className="text-amber-600 font-medium">Filter Pending</span>
        </div>
      </div>

      {/* Under Process */}
      <div 
        onClick={() => {
          onSelectStatusFilter('Under Process');
          if (overlapOnly) onToggleOverlapOnly();
        }}
        className={`cursor-pointer bg-white rounded-xl p-4 border transition-all duration-200 hover:shadow-md ${
          activeStatusFilter === 'Under Process' && !overlapOnly
            ? 'border-indigo-500 ring-2 ring-indigo-100 shadow-sm'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Under Process</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <RefreshCw className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-indigo-700">{stats.total_under_process}</span>
          <span className="text-xs text-indigo-600 font-medium">Inquiry active</span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Hearings & inspections</span>
          <span className="text-indigo-600 font-medium">Filter Active</span>
        </div>
      </div>

      {/* Disposed */}
      <div 
        onClick={() => {
          onSelectStatusFilter('Disposed');
          if (overlapOnly) onToggleOverlapOnly();
        }}
        className={`cursor-pointer bg-white rounded-xl p-4 border transition-all duration-200 hover:shadow-md ${
          activeStatusFilter === 'Disposed' && !overlapOnly
            ? 'border-emerald-500 ring-2 ring-emerald-100 shadow-sm'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Disposed</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-600">{stats.total_disposed}</span>
          <span className="text-xs text-emerald-700 font-medium">Resolved</span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Compliance achieved</span>
          <span className="text-emerald-600 font-medium">History</span>
        </div>
      </div>

      {/* Overlapping Cases - Highlighted with Alert styling */}
      <div 
        onClick={onToggleOverlapOnly}
        className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 hover:shadow-md relative overflow-hidden ${
          overlapOnly
            ? 'bg-red-50 border-red-500 ring-2 ring-red-200 shadow-sm'
            : 'bg-white border-red-200 hover:border-red-400'
        }`}
      >
        {stats.total_overlapping > 0 && (
          <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
          </span>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-700">Overlapping Cases</span>
          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-red-600">{stats.total_overlapping}</span>
          <span className="text-xs text-red-600 font-semibold px-1.5 py-0.5 bg-red-100 rounded">
            Coordination Needed
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-red-100 flex items-center justify-between text-xs text-red-600">
          <span className="flex items-center gap-1 font-medium">
            <Layers className="w-3 h-3" /> RB ↔ PGRC Cross-Link
          </span>
          <span className="underline font-semibold">{overlapOnly ? 'Active Filter' : 'Filter Overlaps'}</span>
        </div>
      </div>
    </div>
  );
};
