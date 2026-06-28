"use client";

import { useEffect, useState, useMemo } from "react";
import { BookOpen, ClipboardCheck, Award, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getStudentByUserId, type Student } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [myRecord, setMyRecord] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getStudentByUserId(user.id).then((res) => {
      if (res.success && res.data) setMyRecord(res.data);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">My Progress</h1>
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!myRecord) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">My Progress</h1>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">No student record found. Contact the school administration.</CardContent>
        </Card>
      </div>
    );
  }

  const theoryPct = Math.min(100, Math.round((myRecord.theory_days_completed / 35) * 100));
  const practicalPct = Math.min(100, Math.round((myRecord.practical_days_completed / 52) * 100));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">My Progress</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {myRecord.first_name} {myRecord.last_name} &mdash; {myRecord.student_id}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="mt-1 text-lg font-bold text-foreground capitalize">{myRecord.status.replace(/_/g, " ")}</p>
              </div>
              <Badge variant={myRecord.status === "graduated" ? "success" : myRecord.status === "exam_eligible" ? "default" : "secondary"}>
                {myRecord.status.replace(/_/g, " ")}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">License Category</p>
                <p className="mt-1 text-lg font-bold text-foreground">{myRecord.license_category || "Not set"}</p>
              </div>
              <Award className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verification</p>
                <p className="mt-1 text-lg font-bold text-foreground">{myRecord.verified ? "Verified" : "Pending"}</p>
              </div>
              {myRecord.verified ? (
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              ) : (
                <AlertCircle className="h-8 w-8 text-amber-500" />
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mock Test Score</p>
                <p className="mt-1 text-lg font-bold text-foreground">{myRecord.mock_test_score}/100</p>
              </div>
              <Badge variant={myRecord.mock_test_score > 37 ? "success" : "warning"}>
                {myRecord.mock_test_score > 37 ? "Passed" : "Remedial"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Theory Training
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={theoryPct} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{myRecord.theory_days_completed} of 35 days completed</span>
              <span className="font-semibold">{theoryPct}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-emerald-500" />
              Practical Training
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={practicalPct} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{myRecord.practical_days_completed} of 52 days completed</span>
              <span className="font-semibold">{practicalPct}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {myRecord.under_penalty && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-center gap-3 p-5">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <p className="font-semibold text-red-800 dark:text-red-400">Under Penalty</p>
              <p className="text-sm text-red-600 dark:text-red-300">{myRecord.penalty_reason}</p>
            </div>
            <Badge variant="destructive" className="ml-auto">
              Until {myRecord.penalty_end_date ? new Date(myRecord.penalty_end_date).toLocaleDateString() : "N/A"}
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
