"use client";

import { useMemo } from "react";
import { DayPicker } from "@daypicker/react";
import { Calendar as CalendarIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import CalendarDropdown, { calendarFormatters, calendarLabels } from "./CalendarDropdown";

interface CalendarWidgetProps {
  minDate?: string;
  maxDate?: string;
  availableDates?: string[];
}

function parseDateKey(value: string | undefined, fallback: Date) {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return fallback;

  // Noon local time prevents a date-only archive key crossing midnight when
  // the browser and Cloudflare Worker run in different time zones.
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function CalendarWidget({
  minDate,
  maxDate,
  availableDates = [],
}: CalendarWidgetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = useMemo(() => new Date(), []);
  const minD = useMemo(
    () => parseDateKey(minDate, new Date(2016, 0, 1, 12)),
    [minDate],
  );
  const maxD = useMemo(
    () => parseDateKey(maxDate, today),
    [maxDate, today],
  );
  const availableDateSet = useMemo(
    () => new Set(availableDates),
    [availableDates],
  );
  const fromDateKey = searchParams.get("from")?.substring(0, 10) ?? "";
  const toDateKeyFilter = searchParams.get("to")?.substring(0, 10) ?? "";
  const selectableDateSet = useMemo(() => new Set(
    availableDates.filter((date) => (
      (!fromDateKey || date >= fromDateKey)
      && (!toDateKeyFilter || date <= toDateKeyFilter)
    )),
  ), [availableDates, fromDateKey, toDateKeyFilter]);
  const selectedDateKey = searchParams.get("date")?.substring(0, 10);
  const selectedDate =
    selectedDateKey && selectableDateSet.has(selectedDateKey)
      ? parseDateKey(selectedDateKey, maxD)
      : undefined;
  const handleSelect = (date: Date | undefined) => {
    if (!date) return;

    const dateKey = toDateKey(date);
    if (!selectableDateSet.has(dateKey)) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("date", dateKey);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  if (availableDateSet.size === 0) return null;

  return (
    <div className="relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#16181c]">
      <CalendarIcon
        aria-hidden="true"
        size={16}
        className="pointer-events-none absolute left-5 top-[34px] z-10 text-[#008CD2]"
      />
      <DayPicker
        key={`${selectedDateKey ?? maxDate ?? "archive-calendar"}:${fromDateKey}:${toDateKeyFilter}`}
        mode="single"
        defaultMonth={selectedDate ?? maxD}
        selected={selectedDate}
        onSelect={handleSelect}
        startMonth={minD}
        endMonth={maxD}
        captionLayout="dropdown"
        navLayout="after"
        formatters={calendarFormatters}
        labels={calendarLabels}
        components={{ Dropdown: CalendarDropdown }}
        disabled={(date) => !selectableDateSet.has(toDateKey(date))}
        showOutsideDays={false}
        className="archive-calendar"
        aria-label="Tweet archive calendar"
      />
    </div>
  );
}
