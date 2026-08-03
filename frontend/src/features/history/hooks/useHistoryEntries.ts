import { useEffect, useMemo, useState } from "react";
import { historyService, type HistoryEntry, type HistoryFilters, type HistorySort } from "../../../services/historyService";
import { settingsService, type OcrEngine } from "../../../services/settingsService";
import { ocrWorkspaceService, type Evaluation } from "../../../services/ocrWorkspaceService";

export function useHistoryEntries() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [engines, setEngines] = useState<OcrEngine[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
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
        setSelectedEntryId((current) => {
          if (current && historyItems.some((entry) => entry.id === current)) {
            return current;
          }
          return historyItems[0]?.id ?? null;
        });
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

  useEffect(() => {
    let active = true;

    if (!selectedEntryId) {
      setSelectedEvaluation(null);
      return;
    }

    async function loadSelectedEvaluation() {
      try {
        const evaluation = await ocrWorkspaceService.getEvaluation(selectedEntryId);
        if (!active) return;
        setSelectedEvaluation(evaluation);
      } catch (loadError) {
        if (!active) return;
        setIsError(true);
        setErrorMessage(loadError instanceof Error ? loadError.message : "Unable to load evaluation details.");
      }
    }

    void loadSelectedEvaluation();
    return () => {
      active = false;
    };
  }, [selectedEntryId]);

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.id === selectedEntryId) ?? entries[0] ?? null,
    [entries, selectedEntryId]
  );

  const accuracySummary = useMemo(() => {
    if (selectedEvaluation) {
      return {
        correct: selectedEvaluation.correct_count ?? 0,
        incorrect: selectedEvaluation.incorrect_count ?? 0,
        missing: selectedEvaluation.missing_count ?? 0,
        additional: selectedEvaluation.additional_count ?? 0,
      };
    }

    const selectedEntryAccuracy = selectedEntry?.accuracy ?? 0;
    return {
      correct: selectedEntryAccuracy >= 70 ? 1 : 0,
      incorrect: selectedEntryAccuracy >= 40 && selectedEntryAccuracy < 70 ? 1 : 0,
      missing: selectedEntryAccuracy < 40 ? 1 : 0,
      additional: 0,
    };
  }, [selectedEntry, selectedEvaluation]);

  const downloadEntry = async (evaluationId: number) => {
    const entry = entries.find((item) => item.id === evaluationId);
    if (!entry) return;

    try {
      await ocrWorkspaceService.downloadEvaluationFile(evaluationId, entry.file_name || "evaluation");
    } catch (downloadError) {
      setIsError(true);
      setErrorMessage(downloadError instanceof Error ? downloadError.message : "Unable to download history entry.");
    }
  };

  const removeEntry = async (evaluationId: number) => {
    try {
      await historyService.remove(evaluationId);
      setEntries((current) => {
        const nextEntries = current.filter((entry) => entry.id !== evaluationId);
        if (selectedEntryId === evaluationId) {
          setSelectedEntryId(nextEntries[0]?.id ?? null);
        }
        return nextEntries;
      });
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
    selectedEvaluation,
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
    downloadEntry,
    removeEntry,
  };
}
