import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found',
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 text-center shadow-lg ring-1 ring-slate-800 animate-slide-up">
        <p className="text-5xl font-bold text-slate-100">404</p>
        <p className="mt-2 mb-6 text-sm text-slate-400">
          The page you are looking for could not be found.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-500"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
