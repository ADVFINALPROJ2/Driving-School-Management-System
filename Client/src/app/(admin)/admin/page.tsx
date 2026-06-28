"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  UserCheck,
  DollarSign,
  FileText,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { getStudents, getUsers, type Student, type User } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStudents(), getUsers()]).then(([sRes, uRes]) => {
      if (sRes.success && sRes.data) setStudents(sRes.data);
      if (uRes.success && uRes.data) setUsers(uRes.data);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => ({
    totalUsers: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    instructors: users.filter((u) => u.role === "instructor").length,
    clerks: users.filter((u) => u.role === "clerk").length,
    studentUsers: users.filter((u) => u.role === "student").length,
    totalStudents: students.length,
    underPenalty: students.filter((s) => s.under_penalty).length,
    unverified: students.filter((s) => !s.verified).length,
  }), [students, users]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Admin Overview</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Admin Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">System administration, user management, and financial oversight.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-blue-500" />
        <StatCard icon={UserCheck} label="Instructors" value={stats.instructors} color="bg-violet-500" />
        <StatCard icon={Users} label="Clerks" value={stats.clerks} color="bg-amber-500" />
        <StatCard icon={Activity} label="Students" value={stats.totalStudents} color="bg-emerald-500" />
        <StatCard icon={AlertTriangle} label="Under Penalty" value={stats.underPenalty} color="bg-red-500" />
        <StatCard icon={FileText} label="Unverified" value={stats.unverified} color="bg-orange-500" />
        <StatCard icon={DollarSign} label="Admins" value={stats.admins} color="bg-purple-500" />
        <StatCard icon={Users} label="Student Users" value={stats.studentUsers} color="bg-teal-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <RoleRow label="Admin" count={stats.admins} total={stats.totalUsers} color="bg-purple-500" />
              <RoleRow label="Instructor" count={stats.instructors} total={stats.totalUsers} color="bg-violet-500" />
              <RoleRow label="Clerk" count={stats.clerks} total={stats.totalUsers} color="bg-amber-500" />
              <RoleRow label="Student (User)" count={stats.studentUsers} total={stats.totalUsers} color="bg-teal-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.underPenalty > 0 && (
                <AlertRow icon={AlertTriangle} label="Students under penalty" count={stats.underPenalty} color="text-red-600" />
              )}
              {stats.unverified > 0 && (
                <AlertRow icon={FileText} label="Unverified student records" count={stats.unverified} color="text-orange-600" />
              )}
              {stats.underPenalty === 0 && stats.unverified === 0 && (
                <p className="text-sm text-muted-foreground">No alerts at this time.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </CardContent>
    </Card>
  );
}

function RoleRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
      <div className="flex items-center gap-2">
        <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold text-foreground">{count} ({pct}%)</span>
    </div>
  );
}

function AlertRow({ icon: Icon, label, count, color }: { icon: React.ElementType; label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900 dark:bg-red-950">
      <Icon className={`h-5 w-5 ${color}`} />
      <span className="flex-1 text-sm text-foreground">{label}</span>
      <Badge variant="destructive">{count}</Badge>
    </div>
  );
}
