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
        className="group inline-flex control-size items-center gap-1 rounded-lg px-2 text-sm font-bold text-foreground outline-none transition-colors hover:bg-muted hover:text-accent focus-visible:ring-2 focus-visible:ring-accent/40 data-[state=open]:bg-accent/10 data-[state=open]:text-accent dark:text-white dark:hover:bg-muted dark:data-[state=open]:bg-accent/15"
      >
        <Select.Value />
        <Select.Icon asChild>
          <ChevronDown
            aria-hidden="true"
            className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 group-data-[state=open]:text-accent"
          />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          align="start"
          sideOffset={6}
          collisionPadding={12}
          className="calendar-select-content z-[120] max-h-[280px] overflow-hidden rounded-xl border border-border bg-card p-1 shadow-sm dark:border-border dark:bg-card"
          style={{ minWidth: "var(--radix-select-trigger-width)" }}
        >
          <Select.ScrollUpButton className="flex h-7 items-center justify-center text-muted-foreground">
            <ChevronUp aria-hidden="true" className="h-4 w-4" />
          </Select.ScrollUpButton>

          <Select.Viewport>
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={String(option.value)}
                disabled={option.disabled}
                className="relative flex control-size cursor-default select-none items-center rounded-lg px-3 pr-8 text-sm font-medium text-foreground outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-30 data-[highlighted]:bg-muted data-[highlighted]:text-foreground data-[state=checked]:bg-accent/10 data-[state=checked]:font-bold data-[state=checked]:text-accent dark:text-foreground dark:data-[highlighted]:bg-muted dark:data-[highlighted]:text-white dark:data-[state=checked]:bg-accent/15 dark:data-[state=checked]:text-accent"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-2 inline-flex items-center justify-center">
                  <Check aria-hidden="true" className="h-4 w-4" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>

          <Select.ScrollDownButton className="flex h-7 items-center justify-center text-muted-foreground">
            <ChevronDown aria-hidden="true" className="h-4 w-4" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
