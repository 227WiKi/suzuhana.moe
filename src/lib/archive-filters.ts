export type ArchiveSortOrder = "desc" | "asc";

export interface ArchiveFilters {
  from: string;
  to: string;
  order: ArchiveSortOrder;
}

interface ArchiveFilterInput {
  from?: string | null;
  to?: string | null;
  order?: string | null;
}

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const DEFAULT_ARCHIVE_FILTERS: ArchiveFilters = {
  from: "",
  to: "",
  order: "desc",
};

function normalizeDateKey(value: string | null | undefined) {
  const candidate = value?.substring(0, 10) ?? "";
  if (!DATE_KEY_PATTERN.test(candidate)) return "";

  const [year, month, day] = candidate.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day
    ? candidate
    : "";
}

export function normalizeArchiveFilters(input: ArchiveFilterInput): ArchiveFilters {
  let from = normalizeDateKey(input.from);
  let to = normalizeDateKey(input.to);

  if (from && to && from > to) {
    [from, to] = [to, from];
  }

  return {
    from,
    to,
    order: input.order === "asc" ? "asc" : "desc",
  };
}

export function applyArchiveFilters<T>(
  items: readonly T[],
  filters: ArchiveFilters,
  getDate: (item: T) => string,
  getSortKey: (item: T) => string = getDate,
) {
  const filtered = items.filter((item) => {
    const date = getDate(item).substring(0, 10);
    return (!filters.from || date >= filters.from)
      && (!filters.to || date <= filters.to);
  });

  filtered.sort((left, right) => {
    const comparison = getSortKey(left).localeCompare(getSortKey(right));
    return filters.order === "asc" ? comparison : -comparison;
  });

  return filtered;
}

export function appendArchiveFilters(params: URLSearchParams, filters: ArchiveFilters) {
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.order === "asc") params.set("order", "asc");
  return params;
}

export function getArchiveFilterKey(filters: ArchiveFilters) {
  return `${filters.from || "start"}:${filters.to || "end"}:${filters.order}`;
}

export function getArchiveDateBounds<T>(items: readonly T[], getDate: (item: T) => string) {
  let minDate = "";
  let maxDate = "";

  for (const item of items) {
    const date = normalizeDateKey(getDate(item));
    if (!date) continue;
    if (!minDate || date < minDate) minDate = date;
    if (!maxDate || date > maxDate) maxDate = date;
  }

  return {
    minDate: minDate || undefined,
    maxDate: maxDate || undefined,
  };
}
