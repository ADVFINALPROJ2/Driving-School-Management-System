"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DateRangePickerProps = {
  from: string;
  to: string;
  onRangeChange: (from: string, to: string) => void;
};

export function DateRangePicker({ from, to, onRangeChange }: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="date-from">From</Label>
        <Input
          id="date-from"
          type="date"
          value={from}
          onChange={(e) => onRangeChange(e.target.value, to)}
          className="w-40"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="date-to">To</Label>
        <Input
          id="date-to"
          type="date"
          value={to}
          onChange={(e) => onRangeChange(from, e.target.value)}
          className="w-40"
        />
      </div>
    </div>
  );
}
