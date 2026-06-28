"use client";

import { useState } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QualifiedStudent = {
  id: number;
  studentId: string;
  name: string;
  isQualified: boolean;
};

export function ExamGatekeepingToggle({
  students,
  onToggle,
}: {
  students: QualifiedStudent[];
  onToggle?: (studentId: string, qualified: boolean) => void;
}) {
  const [qualified, setQualified] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    students.forEach((s) => { map[s.studentId] = s.isQualified; });
    return map;
  });

  const toggle = (studentId: string) => {
    const next = !qualified[studentId];
    setQualified((prev) => ({ ...prev, [studentId]: next }));
    onToggle?.(studentId, next);
  };

  if (students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Practical Exam Gatekeeping</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No students ready for practical exam qualification.</p>
        </CardContent>
      </Card>
    );
  }

  const qualifiedCount = Object.values(qualified).filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Practical Exam Gatekeeping</span>
          <Badge variant={qualifiedCount === students.length ? "success" : "warning"}>
            {qualifiedCount}/{students.length} Qualified
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Toggle qualification status for each student. Only qualified students can be scheduled for practical exams.
        </p>
        {students.map((s) => (
          <div
            key={s.id}
            className={cn(
              "flex items-center justify-between rounded-lg border p-3 transition-colors",
              qualified[s.studentId]
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
                : "border-muted bg-card"
            )}
          >
            <div className="flex items-center gap-3">
              {qualified[s.studentId] ? (
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              ) : (
                <ShieldOff className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-foreground">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.studentId}</p>
              </div>
            </div>
            <Button
              variant={qualified[s.studentId] ? "default" : "outline"}
              size="sm"
              onClick={() => toggle(s.studentId)}
              className={qualified[s.studentId] ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              {qualified[s.studentId] ? "Qualified" : "Not Qualified"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
