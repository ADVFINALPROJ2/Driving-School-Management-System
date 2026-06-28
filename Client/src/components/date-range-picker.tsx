"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<<<<<<< HEAD
interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  return (
    <div className="flex items-end gap-3">
      <div className="space-y-2">
        <Label htmlFor="start-date">From</Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="end-date">To</Label>
        <Input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
=======
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
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
        />
      </div>
    </div>
  );
}
