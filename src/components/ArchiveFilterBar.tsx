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
      "rounded-2xl border border-border bg-white p-3 shadow-sm dark:border-border dark:bg-card sm:p-4",
      isRail
        ? "mb-0 rounded-none border-0 bg-transparent p-0 shadow-none dark:bg-transparent sm:p-0"
        : "mb-4",
      className,
    )}>
      {isRail ? (
        <div className="mb-3 px-1">
          <h2 className="text-base font-bold text-foreground">筛选与排序</h2>
        </div>
      ) : null}
      <div className={cn("flex w-full flex-col items-stretch gap-2", !isRail && "sm:flex-row sm:items-center")}>
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
              className={`inline-flex control-size min-w-0 flex-1 items-center gap-2 rounded-xl border px-3 text-sm font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/40 ${
                filters.from || filters.to
                  ? "border-accent/30 bg-accent/10 text-accent dark:bg-accent/15"
                  : "border-border bg-muted text-foreground hover:border-accent/30 hover:text-accent dark:border-border dark:bg-black/20 dark:text-foreground"
              }`}
              aria-label="选择日期范围"
              title={getRangeLabel(filters)}
            >
              <CalendarDays size={16} aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-left">{getRangeLabel(filters)}</span>
              <ChevronDown
                size={16}
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
              className="archive-filter-popover z-[110] w-[min(340px,calc(100vw-24px))] rounded-2xl border border-border bg-card p-3 text-foreground shadow-sm outline-none dark:border-border dark:bg-card dark:text-white"
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
              <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-3 dark:border-border">
                <button
                  type="button"
                  onClick={() => setDraftRange(undefined)}
                  className="control-size rounded-lg px-3 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-muted dark:hover:text-white"
                >
                  清除日期
                </button>
                <button
                  type="button"
                  onClick={applyRange}
                  className="control-size rounded-lg bg-accent-solid px-4 py-2 text-sm font-bold text-media-foreground transition-colors hover:bg-accent-solid/90"
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
            className="group inline-flex control-size w-full sm:w-[128px] shrink-0 items-center justify-between gap-1 rounded-xl border border-border bg-muted px-3 text-sm font-bold text-foreground outline-none transition-colors hover:border-accent/30 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent/40 data-[state=open]:border-accent/30 data-[state=open]:text-accent dark:border-border dark:bg-black/20 dark:text-foreground"
          >
            <span className="inline-flex items-center gap-2">
              {filters.order === "asc" ? (
                <ArrowUpNarrowWide size={16} aria-hidden="true" />
              ) : (
                <ArrowDownWideNarrow size={16} aria-hidden="true" />
              )}
              {filters.order === "asc" ? "日期升序" : "日期降序"}
            </span>
            <Select.Icon asChild>
              <ChevronDown size={16} aria-hidden="true" className="text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content
              position="popper"
              align="end"
              sideOffset={6}
              collisionPadding={12}
              className="calendar-select-content z-[120] min-w-[132px] overflow-hidden rounded-xl border border-border bg-card p-1 shadow-sm dark:border-border dark:bg-card"
            >
              <Select.Viewport>
                <Select.Item value="desc" className="relative flex control-size cursor-default select-none items-center gap-2 rounded-lg px-3 pr-8 text-sm font-bold text-foreground outline-none data-[highlighted]:bg-muted data-[highlighted]:text-foreground data-[state=checked]:bg-accent/10 data-[state=checked]:text-accent dark:text-foreground dark:data-[highlighted]:bg-muted dark:data-[highlighted]:text-white">
                  <ArrowDownWideNarrow size={16} aria-hidden="true" />
                  <Select.ItemText>日期降序</Select.ItemText>
                  <Select.ItemIndicator className="absolute right-2"><Check size={16} aria-hidden="true" /></Select.ItemIndicator>
                </Select.Item>
                <Select.Item value="asc" className="relative flex control-size cursor-default select-none items-center gap-2 rounded-lg px-3 pr-8 text-sm font-bold text-foreground outline-none data-[highlighted]:bg-muted data-[highlighted]:text-foreground data-[state=checked]:bg-accent/10 data-[state=checked]:text-accent dark:text-foreground dark:data-[highlighted]:bg-muted dark:data-[highlighted]:text-white">
                  <ArrowUpNarrowWide size={16} aria-hidden="true" />
                  <Select.ItemText>日期升序</Select.ItemText>
                  <Select.ItemIndicator className="absolute right-2"><Check size={16} aria-hidden="true" /></Select.ItemIndicator>
                </Select.Item>
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {isPending || hasCustomFilters ? (
        <div className="mt-2 flex min-h-8 items-center justify-end gap-2 px-1 text-xs font-medium text-muted-foreground">
          {isPending ? <Loader2 size={16} className="animate-spin text-accent" aria-label="正在更新" /> : null}
          {hasCustomFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex control-size items-center gap-1 rounded-lg px-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-muted dark:hover:text-white"
            >
              <RotateCcw size={16} aria-hidden="true" />
              重置
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
