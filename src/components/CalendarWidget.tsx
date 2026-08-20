"use client";

import { useMemo, type ChangeEvent } from "react";
import {
  DayPicker,
  type DropdownProps,
  type Formatters,
  type Labels,
} from "@daypicker/react";
import * as Select from "@radix-ui/react-select";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface CalendarWidgetProps {
  minDate?: string;
  maxDate?: string;
  availableDates?: string[];
}

const calendarFormatters = {
  formatMonthDropdown: (date: Date) => `${date.getMonth() + 1}月`,
  formatYearDropdown: (date: Date) => `${date.getFullYear()}年`,
} satisfies Pick<Formatters, "formatMonthDropdown" | "formatYearDropdown">;

const calendarLabels = {
  labelMonthDropdown: () => "月を選択 / 选择月份",
  labelYearDropdown: () => "年を選択 / 选择年份",
} satisfies Pick<Labels, "labelMonthDropdown" | "labelYearDropdown">;

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

function CalendarDropdown({
  options = [],
  value,
  onChange,
  disabled,
  name,
  "aria-label": ariaLabel,
}: DropdownProps) {
  const selectedValue = String(value ?? options[0]?.value ?? "");

  const handleValueChange = (nextValue: string) => {
    onChange?.({
      target: { value: nextValue },
      currentTarget: { value: nextValue },
    } as ChangeEvent<HTMLSelectElement>);
  };

  return (
    <Select.Root
      value={selectedValue}
      onValueChange={handleValueChange}
      disabled={disabled}
      name={name}
    >
      <Select.Trigger
        aria-label={ariaLabel}
        className="group inline-flex h-8 items-center gap-1 rounded-lg px-1.5 text-sm font-bold text-gray-900 outline-none transition-colors hover:bg-gray-100 hover:text-[#008CD2] focus-visible:ring-2 focus-visible:ring-[#008CD2]/40 data-[state=open]:bg-[#008CD2]/10 data-[state=open]:text-[#008CD2] dark:text-white dark:hover:bg-gray-800 dark:data-[state=open]:bg-[#008CD2]/15"
      >
        <Select.Value />
        <Select.Icon asChild>
          <ChevronDown
            aria-hidden="true"
            className="h-3.5 w-3.5 text-gray-400 transition-transform group-data-[state=open]:rotate-180 group-data-[state=open]:text-[#008CD2]"
          />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          align="start"
          sideOffset={6}
          collisionPadding={12}
          className="calendar-select-content z-[100] max-h-[280px] overflow-hidden rounded-xl border border-gray-200 bg-white/95 p-1 shadow-[0_16px_40px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-gray-700 dark:bg-[#16181c]/95 dark:shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
          style={{ minWidth: "var(--radix-select-trigger-width)" }}
        >
          <Select.ScrollUpButton className="flex h-7 items-center justify-center text-gray-400">
            <ChevronUp aria-hidden="true" className="h-4 w-4" />
          </Select.ScrollUpButton>

          <Select.Viewport>
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={String(option.value)}
                disabled={option.disabled}
                className="relative flex h-9 cursor-default select-none items-center rounded-lg px-3 pr-8 text-sm font-medium text-gray-700 outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-30 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-950 data-[state=checked]:bg-[#008CD2]/10 data-[state=checked]:font-bold data-[state=checked]:text-[#008CD2] dark:text-gray-200 dark:data-[highlighted]:bg-gray-800 dark:data-[highlighted]:text-white dark:data-[state=checked]:bg-[#008CD2]/15 dark:data-[state=checked]:text-[#38bdf8]"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-2 inline-flex items-center justify-center">
                  <Check aria-hidden="true" className="h-4 w-4" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>

          <Select.ScrollDownButton className="flex h-7 items-center justify-center text-gray-400">
            <ChevronDown aria-hidden="true" className="h-4 w-4" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
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
  const selectedDateKey = searchParams.get("date")?.substring(0, 10);
  const selectedDate =
    selectedDateKey && availableDateSet.has(selectedDateKey)
      ? parseDateKey(selectedDateKey, maxD)
      : undefined;
  const handleSelect = (date: Date | undefined) => {
    if (!date) return;

    const dateKey = toDateKey(date);
    if (!availableDateSet.has(dateKey)) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("date", dateKey);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  if (availableDateSet.size === 0) return null;

  return (
    <div className="archive-calendar-card relative mb-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#16181c]">
      <CalendarIcon
        aria-hidden="true"
        size={16}
        className="pointer-events-none absolute left-5 top-[34px] z-10 text-[#008CD2]"
      />
      <DayPicker
        key={selectedDateKey ?? maxDate ?? "archive-calendar"}
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
        disabled={(date) => !availableDateSet.has(toDateKey(date))}
        showOutsideDays={false}
        className="archive-calendar"
        aria-label="Tweet archive calendar"
      />
    </div>
  );
}
