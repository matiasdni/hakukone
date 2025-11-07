export default function ResumeEditorLoading() {
  return (
    <div className="flex h-screen">
      {/* Left panel skeleton */}
      <div className="w-1/2 overflow-auto border-r border-slate-200 p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="h-8 w-8 animate-pulse rounded bg-slate-200" />
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 h-5 w-24 animate-pulse rounded bg-slate-200" />
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel skeleton */}
      <div className="w-1/2 bg-slate-50 p-6">
        <div className="aspect-[8.5/11] animate-pulse rounded-xl bg-white shadow-lg" />
      </div>
    </div>
  );
}
