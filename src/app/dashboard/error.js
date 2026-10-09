'use client';

export default function DashboardError({ error, reset }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="max-w-md w-full bg-slate-900 rounded-lg shadow-md p-6 text-center ring-1 ring-slate-800">
        <h2 className="text-lg font-semibold text-slate-100 mb-2">
          Failed to load this page
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          {error?.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
