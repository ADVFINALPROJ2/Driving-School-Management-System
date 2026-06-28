"use client";

import { useEffect, useState, useMemo } from "react";
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { getStudents, getExamBookings, type Student, type ExamBooking } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ExamBookingsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [bookings, setBookings] = useState<ExamBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStudents(), getExamBookings()]).then(([sRes, bRes]) => {
      if (sRes.success && sRes.data) setStudents(sRes.data);
      if (bRes.success && bRes.data) setBookings(bRes.data);
      setLoading(false);
    });
  }, []);

  const studentMap = useMemo(() => {
    const map = new Map<number, Student>();
    students.forEach((s) => map.set(s.id, s));
    return map;
  }, [students]);

  const upcoming = useMemo(() => bookings.filter((b) => b.status === "scheduled"), [bookings]);
  const completed = useMemo(() => bookings.filter((b) => b.status === "completed"), [bookings]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Exam Bookings</h1>
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Exam Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Schedule and manage exam appointments.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{bookings.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{upcoming.length}</p>
            </div>
            <Clock className="h-8 w-8 text-amber-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{completed.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </CardContent>
        </Card>
      </div>

      {upcoming.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcoming.map((b) => {
                const s = studentMap.get(b.student_id);
                return (
                  <div key={b.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">{s ? `${s.first_name} ${s.last_name}` : `Student #${b.student_id}`}</p>
                      <p className="text-sm text-muted-foreground">{b.exam_type} exam</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{new Date(b.scheduled_date).toLocaleDateString()}</p>
                      <Badge variant="warning">Scheduled</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No exam bookings found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const s = studentMap.get(b.student_id);
                    return (
                      <tr key={b.id} className="border-b last:border-0">
                        <td className="px-4 py-3 font-medium">
                          {s ? `${s.first_name} ${s.last_name}` : `Student #${b.student_id}`}
                        </td>
                        <td className="px-4 py-3 capitalize">{b.exam_type}</td>
                        <td className="px-4 py-3">{new Date(b.scheduled_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <Badge variant={b.status === "completed" ? "success" : b.status === "scheduled" ? "warning" : "secondary"}>
                            {b.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{b.score ?? "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
