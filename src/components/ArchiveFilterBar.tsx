"use client";

import { useMemo, useState, useTransition } from "react";
import { DayPicker, type DateRange } from "@daypicker/react";
import * as Popover from "@radix-ui/react-popover";
import * as Select from "@radix-ui/react-select";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  CalendarDays,
  Check,
  ChevronDown,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  appendArchiveFilters,
  normalizeArchiveFilters,
  type ArchiveFilters,
  type ArchiveSortOrder,
} from "@/lib/archive-filters";
import { cn } from "@/lib/utils";
import CalendarDropdown, { calendarFormatters, calendarLabels } from "./CalendarDropdown";

interface ArchiveFilterBarProps {
  filters: ArchiveFilters;
  minDate?: string;
  maxDate?: string;
  className?: string;
  layout?: "inline" | "rail";
}

function parseDateKey(value: string | undefined) {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return undefined;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(value: string) {
  return value.replaceAll("-", "/");
}

function getRangeLabel(filters: ArchiveFilters) {
  if (filters.from && filters.to) {
    return filters.from === filters.to
      ? formatDateLabel(filters.from)
      : `${formatDateLabel(filters.from)} – ${formatDateLabel(filters.to)}`;
  }
  if (filters.from) return `${formatDateLabel(filters.from)} 之后`;
  if (filters.to) return `${formatDateLabel(filters.to)} 之前`;
  return "全部日期";
}

export default function ArchiveFilterBar({
  filters,
  minDate,
  maxDate,
  className,
  layout = "inline",
}: ArchiveFilterBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const appliedRange = useMemo<DateRange | undefined>(() => {
    const from = parseDateKey(filters.from);
    const to = parseDateKey(filters.to);
    return from || to ? { from, to } : undefined;
  }, [filters.from, filters.to]);
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(appliedRange);
  const startMonth = parseDateKey(minDate);
  const endMonth = parseDateKey(maxDate);
  const hasCustomFilters = Boolean(filters.from || filters.to || filters.order === "asc");
  const isRail = layout === "rail";

  const navigateWithFilters = (nextFilters: ArchiveFilters) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("date");
    params.delete("from");
    params.delete("to");
    params.delete("order");
    appendArchiveFilters(params, nextFilters);
    const query = params.toString();
    startTransition(() => {
      router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    });
  };

  const setOrder = (order: ArchiveSortOrder) => {
    if (order === filters.order) return;
    navigateWithFilters({ ...filters, order });
  };

  const applyRange = () => {
    const from = draftRange?.from ? toDateKey(draftRange.from) : "";
    const to = draftRange?.to
      ? toDateKey(draftRange.to)
      : from;
    navigateWithFilters(normalizeArchiveFilters({ ...filters, from, to }));
    setIsCalendarOpen(false);
  };

  const clearFilters = () => {
    setDraftRange(undefined);
    navigateWithFilters(normalizeArchiveFilters({}));
  };

  return (
    <div className={cn(
      "rounded-2xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-[#16181c] sm:p-4",
      isRail
        ? "mb-0 rounded-none border-0 bg-transparent p-0 shadow-none dark:bg-transparent sm:p-0"
        : "mb-4",
      className,
    )}>
      {isRail ? (
        <div className="mb-3 px-1">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">筛选与排序</h2>
        </div>
      ) : null}
      <div className="flex w-full items-center gap-2">
        <Popover.Root
          open={isCalendarOpen}
          onOpenChange={(open) => {
            if (open) setDraftRange(appliedRange);
            setIsCalendarOpen(open);
          }}
        >
          <Popover.Trigger asChild>
            <button
              type="button"
              className={`inline-flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border px-3 text-sm font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#008CD2]/40 ${
                filters.from || filters.to
                  ? "border-[#008CD2]/30 bg-[#008CD2]/10 text-[#008CD2] dark:bg-[#008CD2]/15"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:border-[#008CD2]/30 hover:text-[#008CD2] dark:border-gray-700 dark:bg-black/20 dark:text-gray-200"
              }`}
              aria-label="选择日期范围"
            >
              <CalendarDays size={17} aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-left">{getRangeLabel(filters)}</span>
              <ChevronDown
                size={15}
                aria-hidden="true"
                className={`transition-transform ${isCalendarOpen ? "rotate-180" : ""}`}
              />
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              align={isRail ? "end" : "start"}
              sideOffset={8}
              collisionPadding={12}
              className="archive-filter-popover z-[110] w-[min(340px,calc(100vw-24px))] rounded-2xl border border-gray-200 bg-white/95 p-3 text-gray-900 shadow-[0_20px_60px_rgba(15,23,42,0.2)] outline-none backdrop-blur-xl dark:border-gray-700 dark:bg-[#16181c]/95 dark:text-white dark:shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
            >
              <DayPicker
                mode="range"
                selected={draftRange}
                onSelect={setDraftRange}
                defaultMonth={draftRange?.from ?? endMonth}
                startMonth={startMonth}
                endMonth={endMonth}
                captionLayout="dropdown"
                navLayout="after"
                formatters={calendarFormatters}
                labels={calendarLabels}
                components={{ Dropdown: CalendarDropdown }}
                disabled={[
                  ...(startMonth ? [{ before: startMonth }] : []),
                  ...(endMonth ? [{ after: endMonth }] : []),
                ]}
                showOutsideDays={false}
                className="archive-calendar archive-filter-calendar"
                aria-label="Archive date range"
              />
              <div className="mt-2 flex items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setDraftRange(undefined)}
                  className="rounded-lg px-3 py-2 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  清除日期
                </button>
                <button
                  type="button"
                  onClick={applyRange}
                  className="rounded-lg bg-[#008CD2] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#007bb9]"
                >
                  应用
                </button>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <Select.Root value={filters.order} onValueChange={(value) => setOrder(value as ArchiveSortOrder)}>
          <Select.Trigger
            aria-label="排序方式"
            className="group inline-flex min-h-10 w-[112px] shrink-0 items-center justify-between gap-1 rounded-xl border border-gray-200 bg-gray-50 px-2.5 text-xs font-bold text-gray-700 outline-none transition-colors hover:border-[#008CD2]/30 hover:text-[#008CD2] focus-visible:ring-2 focus-visible:ring-[#008CD2]/40 data-[state=open]:border-[#008CD2]/30 data-[state=open]:text-[#008CD2] dark:border-gray-700 dark:bg-black/20 dark:text-gray-200"
          >
            <span className="inline-flex items-center gap-1.5">
              {filters.order === "asc" ? (
                <ArrowUpNarrowWide size={15} aria-hidden="true" />
              ) : (
                <ArrowDownWideNarrow size={15} aria-hidden="true" />
              )}
              {filters.order === "asc" ? "日期升序" : "日期降序"}
            </span>
            <Select.Icon asChild>
              <ChevronDown size={14} aria-hidden="true" className="text-gray-400 transition-transform group-data-[state=open]:rotate-180" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content
              position="popper"
              align="end"
              sideOffset={6}
              collisionPadding={12}
              className="calendar-select-content z-[120] min-w-[132px] overflow-hidden rounded-xl border border-gray-200 bg-white/95 p-1 shadow-[0_16px_40px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-gray-700 dark:bg-[#16181c]/95"
            >
              <Select.Viewport>
                <Select.Item value="desc" className="relative flex h-9 cursor-default select-none items-center gap-2 rounded-lg px-2.5 pr-8 text-xs font-bold text-gray-700 outline-none data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-950 data-[state=checked]:bg-[#008CD2]/10 data-[state=checked]:text-[#008CD2] dark:text-gray-200 dark:data-[highlighted]:bg-gray-800 dark:data-[highlighted]:text-white">
                  <ArrowDownWideNarrow size={15} aria-hidden="true" />
                  <Select.ItemText>日期降序</Select.ItemText>
                  <Select.ItemIndicator className="absolute right-2"><Check size={14} aria-hidden="true" /></Select.ItemIndicator>
                </Select.Item>
                <Select.Item value="asc" className="relative flex h-9 cursor-default select-none items-center gap-2 rounded-lg px-2.5 pr-8 text-xs font-bold text-gray-700 outline-none data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-950 data-[state=checked]:bg-[#008CD2]/10 data-[state=checked]:text-[#008CD2] dark:text-gray-200 dark:data-[highlighted]:bg-gray-800 dark:data-[highlighted]:text-white">
                  <ArrowUpNarrowWide size={15} aria-hidden="true" />
                  <Select.ItemText>日期升序</Select.ItemText>
                  <Select.ItemIndicator className="absolute right-2"><Check size={14} aria-hidden="true" /></Select.ItemIndicator>
                </Select.Item>
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {isPending || hasCustomFilters ? (
        <div className="mt-2 flex min-h-8 items-center justify-end gap-2 px-1 text-xs font-medium text-gray-400">
          {isPending ? <Loader2 size={15} className="animate-spin text-[#008CD2]" aria-label="正在更新" /> : null}
          {hasCustomFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <RotateCcw size={14} aria-hidden="true" />
              重置
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
