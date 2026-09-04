"use client";

import type { ChangeEvent } from "react";
import type { DropdownProps, Formatters, Labels } from "@daypicker/react";
import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

export const calendarFormatters = {
  formatMonthDropdown: (date: Date) => `${date.getMonth() + 1}月`,
  formatYearDropdown: (date: Date) => `${date.getFullYear()}年`,
} satisfies Pick<Formatters, "formatMonthDropdown" | "formatYearDropdown">;

export const calendarLabels = {
  labelMonthDropdown: () => "月を選択 / 选择月份",
  labelYearDropdown: () => "年を選択 / 选择年份",
} satisfies Pick<Labels, "labelMonthDropdown" | "labelYearDropdown">;

export default function CalendarDropdown({
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
          className="calendar-select-content z-[120] max-h-[280px] overflow-hidden rounded-xl border border-gray-200 bg-white/95 p-1 shadow-[0_16px_40px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-gray-700 dark:bg-[#16181c]/95 dark:shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
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
