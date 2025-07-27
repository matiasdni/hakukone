export default function ResumesLoading() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-32 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="mb-2 h-3 w-1/2 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
