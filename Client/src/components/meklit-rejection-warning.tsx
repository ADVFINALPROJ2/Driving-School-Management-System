"use client";

import { AlertTriangle, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RejectedStudent = {
  id: number;
  studentId: string;
  name: string;
  reason: string;
};

export function MeklitRejectionWarning({
  rejectedStudents,
  onRescan,
}: {
  rejectedStudents: RejectedStudent[];
  onRescan?: (studentId: string) => void;
}) {
  if (rejectedStudents.length === 0) return null;

  return (
    <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-400">
          <AlertTriangle className="h-5 w-5" />
          Meklit Rejection Alert — {rejectedStudents.length} student{rejectedStudents.length > 1 ? "s" : ""} rejected
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-red-700 dark:text-red-300">
          The following student profiles were rejected by the Meklit portal. Please re-scan and upload certified hardcopies.
        </p>
        {rejectedStudents.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-lg border border-red-200 bg-white p-3 dark:border-red-800 dark:bg-red-950/50"
          >
            <div>
              <p className="font-medium text-foreground">{s.name}</p>
              <p className="text-xs text-muted-foreground">ID: {s.studentId}</p>
              <p className="text-xs text-red-600">{s.reason}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-100"
              onClick={() => onRescan?.(s.studentId)}
            >
              <Upload className="mr-1 h-4 w-4" />
              Re-scan
            </Button>
          </div>
        ))}
        <div className="rounded-md bg-red-100 p-3 dark:bg-red-900/30">
          <p className="text-xs text-red-700 dark:text-red-300">
            <strong>Action Required:</strong> Manually verify original documents, re-scan certified copies, and upload them to re-submit to the Meklit portal.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
