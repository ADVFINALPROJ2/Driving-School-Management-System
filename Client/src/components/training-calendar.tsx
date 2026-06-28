"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TrainingSlot = {
  date: number;
  instructor: string;
  signedByStudent: boolean;
  signedByInstructor: boolean;
};

export function TrainingCalendar({ studentName }: { studentName: string }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [slots, setSlots] = useState<TrainingSlot[]>([]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const isBooked = (day: number) => slots.some((s) => s.date === day);
  const getSlot = (day: number) => slots.find((s) => s.date === day);

  const toggleSlot = (day: number) => {
    if (isBooked(day)) {
      setSlots(slots.filter((s) => s.date !== day));
    } else {
      setSlots([...slots, { date: day, instructor: "Self", signedByStudent: false, signedByInstructor: false }]);
    }
  };

  const toggleSign = (day: number, party: "student" | "instructor") => {
    setSlots(slots.map((s) =>
      s.date === day
        ? { ...s, signedByStudent: party === "student" ? !s.signedByStudent : s.signedByStudent,
            signedByInstructor: party === "instructor" ? !s.signedByInstructor : s.signedByInstructor }
        : s
    ));
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);
  for (let d = 1; d <= daysInMonth; d++) {
    const booked = isBooked(d);
    const slot = getSlot(d);
    const fullySigned = slot?.signedByStudent && slot?.signedByInstructor;
    const partialSigned = slot?.signedByStudent || slot?.signedByInstructor;
    days.push(
      <button
        key={d}
        onClick={() => toggleSlot(d)}
        disabled={d < new Date().getDate() && month === new Date().getMonth()}
        className={cn(
          "flex h-10 w-full items-center justify-center rounded-md text-sm transition-colors",
          booked
            ? fullySigned
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400"
              : partialSigned
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400"
            : "hover:bg-accent",
          d < new Date().getDate() && month === new Date().getMonth() ? "cursor-not-allowed opacity-40" : "cursor-pointer"
        )}
      >
        {d}
      </button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Practical Training Calendar — {studentName}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-center font-semibold">{monthNames[month]} {year}</p>
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">{days}</div>

        {slots.length > 0 && (
          <div className="mt-4 space-y-2 border-t pt-4">
            <p className="text-sm font-medium">Selected Slots</p>
            {slots.map((s) => (
              <div key={s.date} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                <span>{monthNames[month]} {s.date}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleSign(s.date, "student")} className="flex items-center gap-1">
                    <UserCheck className={cn("h-4 w-4", s.signedByStudent ? "text-emerald-600" : "text-muted-foreground")} />
                    <span className="text-xs">{s.signedByStudent ? "Student ✓" : "Student"}</span>
                  </button>
                  <button onClick={() => toggleSign(s.date, "instructor")} className="flex items-center gap-1">
                    <UserCheck className={cn("h-4 w-4", s.signedByInstructor ? "text-emerald-600" : "text-muted-foreground")} />
                    <span className="text-xs">{s.signedByInstructor ? "Instructor ✓" : "Instructor"}</span>
                  </button>
                  <Badge variant={s.signedByStudent && s.signedByInstructor ? "success" : "warning"}>
                    {s.signedByStudent && s.signedByInstructor ? "Confirmed" : "Pending"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-blue-100" /> Booked</span>
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-amber-100" /> Partially Signed</span>
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-emerald-100" /> Confirmed</span>
        </div>
      </CardContent>
    </Card>
  );
}
