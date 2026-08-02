import { Search, SlidersHorizontal } from "lucide-react";
import { HistoryTable } from "./components/HistoryTable";
import { HistoryDetailPanel } from "./components/HistoryDetailPanel";
import { useHistoryEntries } from "./hooks/useHistoryEntries";

export function HistoryPage() {
  const {
    entries,
    engines,
    selectedEntry,
    selectedEntryId,
    setSelectedEntryId,
    search,
    setSearch,
    engineId,
    setEngineId,
    sort,
    setSort,
    isLoading,
    isError,
    errorMessage,
    accuracySummary,
    removeEntry,
  } = useHistoryEntries();

  return (
    <div className="space-y-6 text-white">
      <div className="mb-4">
        <h1 className="text-4xl font-semibold tracking-tight">History</h1>
        <p className="mt-1 text-sm text-[#9ca3af]">Search, review, and export saved evaluations</p>
      </div>

      {isError ? (
        <div className="rounded-xl border border-[#442436] bg-[#26121d] px-4 py-3 text-sm text-rose-200">
          {errorMessage ?? "Unable to load history."}
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#222334] bg-[#10111a] p-4">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.7fr_0.7fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b8494]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by file name"
              className="w-full rounded-xl border border-[#282a3b] bg-[#141822] py-3 pl-11 pr-3 text-sm text-white outline-none"
            />
          </div>

          <div className="relative">
            <select
              value={engineId}
              onChange={(event) => setEngineId(event.target.value === "all" ? "all" : Number(event.target.value))}
              className="w-full appearance-none rounded-xl border border-[#282a3b] bg-[#141822] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="all">All engines</option>
              {engines.map((engine) => (
                <option key={engine.id} value={engine.id}>
                  {engine.name}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b8494]" />
          </div>

          <div className="relative">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as typeof sort)}
              className="w-full appearance-none rounded-xl border border-[#282a3b] bg-[#141822] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="date_desc">Newest first</option>
              <option value="date_asc">Oldest first</option>
              <option value="accuracy_desc">Accuracy high to low</option>
              <option value="accuracy_asc">Accuracy low to high</option>
            </select>
            <SlidersHorizontal className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b8494]" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-[#222334] bg-[#10111a] p-8 text-sm text-[#9ca3af]">
          Loading history…
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <HistoryTable
            entries={entries}
            selectedEntryId={selectedEntryId}
            onSelectEntry={setSelectedEntryId}
            onDelete={removeEntry}
          />

          <HistoryDetailPanel entry={selectedEntry} accuracySummary={accuracySummary} />
        </div>
      )}
    </div>
  );
}
