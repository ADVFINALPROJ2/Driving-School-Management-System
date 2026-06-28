"use client";

import { useEffect, useState, useMemo } from "react";
import { BookOpen, Users, ClipboardCheck, DollarSign, CheckCircle, AlertCircle } from "lucide-react";
import { getStudents, type Student } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function InstructorPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudents().then((res) => {
      if (res.success && res.data) setStudents(res.data);
      setLoading(false);
    });
  }, []);

  const myStudents = useMemo(
    () => students.filter((s) => ["theory_in_progress", "practical_in_progress", "exam_eligible"].includes(s.status)),
    [students],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Instructor Overview</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Instructor Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Student progress tracking, attendance, and lesson management.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Active Students</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{myStudents.length}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Theory in Progress</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{myStudents.filter((s) => s.status === "theory_in_progress").length}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Practical in Progress</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{myStudents.filter((s) => s.status === "practical_in_progress").length}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500">
              <ClipboardCheck className="h-5 w-5 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Students</CardTitle>
        </CardHeader>
        <CardContent>
          {myStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active students assigned.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Student ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Theory Days</th>
                    <th className="px-4 py-3">Practical Days</th>
                    <th className="px-4 py-3">Mock Score</th>
                  </tr>
                </thead>
                <tbody>
                  {myStudents.map((s) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.student_id}</td>
                      <td className="px-4 py-3 font-medium">{s.first_name} {s.last_name}</td>
                      <td className="px-4 py-3">
                        <Badge variant={s.status === "exam_eligible" ? "success" : "secondary"}>
                          {s.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{s.theory_days_completed}</td>
                      <td className="px-4 py-3">{s.practical_days_completed}</td>
                      <td className="px-4 py-3">{s.mock_test_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Exam Ready Students</CardTitle>
          </CardHeader>
          <CardContent>
            {myStudents.filter((s) => s.status === "exam_eligible").length === 0 ? (
              <p className="text-sm text-muted-foreground">No students ready for exam.</p>
            ) : (
              <div className="space-y-2">
                {myStudents.filter((s) => s.status === "exam_eligible").map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-md bg-emerald-50 px-3 py-2 dark:bg-emerald-950">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium">{s.first_name} {s.last_name}</span>
                    <Badge variant="success">Exam Ready</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students Under Penalty</CardTitle>
          </CardHeader>
          <CardContent>
            {students.filter((s) => s.under_penalty).length === 0 ? (
              <p className="text-sm text-muted-foreground">No students under penalty.</p>
            ) : (
              <div className="space-y-2">
                {students.filter((s) => s.under_penalty).map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-md bg-red-50 px-3 py-2 dark:bg-red-950">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium">{s.first_name} {s.last_name}</span>
                    <Badge variant="destructive">Penalty</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
