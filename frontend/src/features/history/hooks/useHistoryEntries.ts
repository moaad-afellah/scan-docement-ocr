import { useEffect, useMemo, useState } from "react";
import { historyService, type HistoryEntry, type HistoryFilters, type HistorySort } from "../../../services/historyService";
import { settingsService, type OcrEngine } from "../../../services/settingsService";

export function useHistoryEntries() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [engines, setEngines] = useState<OcrEngine[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [engineId, setEngineId] = useState<number | "all">("all");
  const [sort, setSort] = useState<HistorySort>("date_desc");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestFilters = useMemo<HistoryFilters>(() => {
    const filters: HistoryFilters = {
      sort,
      search: search.trim() || undefined,
    };

    if (engineId !== "all") {
      filters.engine_id = engineId;
    }

    return filters;
  }, [engineId, search, sort]);

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage(null);

      try {
        const [engineList, historyItems] = await Promise.all([
          settingsService.listEngines(),
          historyService.list(requestFilters),
        ]);

        if (!active) return;

        setEngines(engineList);
        setEntries(historyItems);
        setSelectedEntryId((current) => current ?? historyItems[0]?.id ?? null);
      } catch (loadError) {
        if (!active) return;
        setIsError(true);
        setErrorMessage(loadError instanceof Error ? loadError.message : "Unable to load history.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadOptions();
    return () => {
      active = false;
    };
  }, [requestFilters]);

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.id === selectedEntryId) ?? entries[0] ?? null,
    [entries, selectedEntryId]
  );

  const accuracySummary = useMemo(() => {
    const totals = entries.reduce(
      (accumulator, entry) => {
        const accuracy = entry.accuracy ?? 0;
        if (accuracy >= 70) accumulator.correct += 1;
        else if (accuracy >= 40) accumulator.mismatch += 1;
        else accumulator.missing += 1;
        return accumulator;
      },
      { correct: 0, mismatch: 0, missing: 0 }
    );

    return totals;
  }, [entries]);

  const removeEntry = async (evaluationId: number) => {
    try {
      await historyService.remove(evaluationId);
      setEntries((current) => current.filter((entry) => entry.id !== evaluationId));

      if (selectedEntryId === evaluationId) {
        setSelectedEntryId(null);
      }
    } catch (removeError) {
      setIsError(true);
      setErrorMessage(removeError instanceof Error ? removeError.message : "Unable to delete history entry.");
    }
  };

  return {
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
  };
}
