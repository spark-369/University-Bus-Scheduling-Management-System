'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Surface the error for observability tooling.
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 text-center shadow-lg ring-1 ring-slate-800 animate-slide-up">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-red-500/15 text-red-400">
          !
        </div>
        <h1 className="mb-2 text-xl font-bold text-slate-100">
          Something went wrong
        </h1>
        <p className="mb-6 text-sm text-slate-400">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-500"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
