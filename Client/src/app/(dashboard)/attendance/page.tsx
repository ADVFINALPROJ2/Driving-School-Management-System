"use client";

import { useEffect, useState, startTransition } from "react";
import { CalendarCheck, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStudents, getAttendanceLogs, createAttendanceLog, type Student } from "@/lib/api";

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [phase, setPhase] = useState("theory");
  const [present, setPresent] = useState(true);
  const [notes, setNotes] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    startTransition(async () => {
      const res = await getStudents();
      if (res.success && res.data) setStudents(res.data);
      setLoading(false);
    });
  }, []);

  const loadLogs = async (studentId: number) => {
    const res = await getAttendanceLogs(studentId);
    if (res.success && res.data) {
      const data = typeof res.data === "object" && "data" in res.data ? (res.data as any).data : res.data;
      setLogs(Array.isArray(data) ? data : []);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStudent) return;
    setSubmitting(true);
    const res = await createAttendanceLog(Number(selectedStudent), {
      phase,
      attendance_date: new Date().toISOString().split("T")[0],
      present,
      notes: notes || undefined,
    });
    if (res.success) {
      setNotes("");
      loadLogs(Number(selectedStudent));
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Attendance Logging</h1>

      <Card>
        <CardHeader><CardTitle>Log Attendance</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Student</label>
            <Select value={selectedStudent} onValueChange={(v) => { setSelectedStudent(v); loadLogs(Number(v)); }}>
              <SelectTrigger><SelectValue placeholder="Select student..." /></SelectTrigger>
              <SelectContent>
                {students.filter((s) => ["theory_in_progress", "practical_in_progress"].includes(s.status)).map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.first_name} {s.middle_name} ({s.student_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Phase</label>
            <Select value={phase} onValueChange={setPhase}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="theory">Theory</SelectItem>
                <SelectItem value="practical">Practical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Present?</label>
            <div className="flex gap-2 mt-1">
              <Button variant={present ? "default" : "outline"} size="sm" onClick={() => setPresent(true)}>
                <Check className="mr-1 h-4 w-4" /> Present
              </Button>
              <Button variant={!present ? "default" : "outline"} size="sm" onClick={() => setPresent(false)}>
                <X className="mr-1 h-4 w-4" /> Absent
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." />
          </div>

          <Button onClick={handleSubmit} disabled={!selectedStudent || submitting}>
            <CalendarCheck className="mr-2 h-4 w-4" />
            {submitting ? "Logging..." : "Log Attendance"}
          </Button>
        </CardContent>
      </Card>

      {selectedStudent && (
        <Card>
          <CardHeader><CardTitle>Recent Attendance</CardTitle></CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-muted-foreground">No attendance records found.</p>
            ) : (
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead><tr className="border-b bg-muted/50">
                    <th className="text-left p-2 text-sm">Date</th>
                    <th className="text-left p-2 text-sm">Phase</th>
                    <th className="text-left p-2 text-sm">Status</th>
                    <th className="text-left p-2 text-sm">Notes</th>
                  </tr></thead>
                  <tbody>
                    {logs.slice(0, 10).map((log: any) => (
                      <tr key={log.id} className="border-b last:border-0">
                        <td className="p-2 text-sm">{log.attendance_date}</td>
                        <td className="p-2 text-sm capitalize">{log.phase}</td>
                        <td className="p-2">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${log.present ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                            {log.present ? "Present" : "Absent"}
                          </span>
                        </td>
                        <td className="p-2 text-sm text-muted-foreground">{log.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
