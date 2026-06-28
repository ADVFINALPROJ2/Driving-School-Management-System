<<<<<<< HEAD
// Dashboard home page — the root route of the authenticated area.
// Displays summary KPI cards and quick links to main sections.

"use client";

import { useEffect, useState } from "react";
=======
"use client";

import { useEffect, useState, useMemo, startTransition } from "react";
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
import Link from "next/link";
import {
  Plus,
  Users,
<<<<<<< HEAD
  DollarSign,
  FileText,
  TrendingUp,
  ArrowRight,
  UserPlus,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildActivityFeed,
  getFinancialSummary,
  getInvoices,
  getStudents,
  type ActivityItem,
  type FinancialSummary,
  type Student,
} from "@/lib/api";
import { MOCK_FINANCIAL_SUMMARY, MOCK_INVOICES } from "@/lib/fallback-data";

const activityIcons = {
  student_registered: UserPlus,
  invoice_paid: CreditCard,
  invoice_created: FileText,
};

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>(MOCK_FINANCIAL_SUMMARY);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [sRes, fRes, iRes] = await Promise.all([
        getStudents(),
        getFinancialSummary(),
        getInvoices(),
      ]);

      const studentList = sRes.success && sRes.data ? sRes.data : [];
      const invoiceList =
        iRes.success && iRes.data && iRes.data.length > 0 ? iRes.data : MOCK_INVOICES;

      if (sRes.success && sRes.data) setStudents(sRes.data);
      if (fRes.success && fRes.data) setSummary(fRes.data);

      setActivities(buildActivityFeed(studentList, invoiceList));
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalStudents = students.length;
  const graduatedStudents = students.filter((s) => s.status === "graduated").length;
  const totalRevenue = summary.total_revenue;
  const pendingInvoices = summary.outstanding.pending_count;
  const collectionsRate = Math.round(summary.collections.collection_rate);

  const quickLinks = [
    { label: "Students", href: "/students", icon: Users, color: "bg-blue-500" },
    { label: "Invoices", href: "/invoices", icon: FileText, color: "bg-violet-500" },
    { label: "Financial Reports", href: "/financial-reports", icon: TrendingUp, color: "bg-emerald-500" },
    { label: "Payroll", href: "/payroll", icon: DollarSign, color: "bg-amber-500" },
  ];
=======
  Layers,
  BookOpen,
  GraduationCap,
  ClipboardList,
  FileText,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStudents, getBatches, type Student, type Batch } from "@/lib/api";
import { cn } from "@/lib/utils";

const statCards = [
  { label: "Total Students", key: "totalStudents" as const, icon: Users, color: "bg-blue-500" },
  { label: "Active Batches", key: "totalBatches" as const, icon: Layers, color: "bg-violet-500" },
  { label: "Currently Learning", key: "currentlyLearning" as const, icon: BookOpen, color: "bg-amber-500" },
  { label: "Graduated", key: "graduated" as const, icon: GraduationCap, color: "bg-emerald-500" },
];

const quickActions = [
  {
    label: "New Student Enrollment",
    description: "Register a new student into the program",
    href: "/students/new",
    icon: Plus,
    color: "bg-blue-500",
  },
  {
    label: "View All Students",
    description: "Browse, search, and manage student records",
    href: "/students",
    icon: ClipboardList,
    color: "bg-violet-500",
  },
  {
    label: "Exam Bookings",
    description: "Schedule and manage exam appointments",
    href: "/exam-bookings",
    icon: CalendarCheck,
    color: "bg-amber-500",
  },
  {
    label: "Reports",
    description: "View aggregate reports and analytics",
    href: "/reports",
    icon: FileText,
    color: "bg-emerald-500",
  },
];

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [sRes, bRes] = await Promise.all([getStudents(), getBatches()]);
    if (sRes.success && sRes.data) setStudents(sRes.data);
    if (bRes.success && bRes.data) setBatches(bRes.data);
    setLoading(false);
  };

  useEffect(() => {
    startTransition(() => {
      fetchData();
    });
  }, []);

  const stats = useMemo(() => ({
    totalStudents: students.length,
    totalBatches: batches.length,
    currentlyLearning: students.filter((s) => s.status !== "graduated" && s.status !== "exam_eligible").length,
    graduated: students.filter((s) => s.status === "graduated").length,
    examReady: students.filter((s) => s.status === "exam_eligible").length,
    theoryInProgress: students.filter((s) => s.status === "theory_in_progress").length,
    practicalInProgress: students.filter((s) => s.status === "practical_in_progress").length,
  }), [students, batches]);
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
<<<<<<< HEAD
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
=======
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of the Driving School Administration System
          </p>
        </div>
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
        <Button asChild className="bg-primary hover:bg-primary/90" size="lg">
          <Link href="/students/new">
            <Plus className="h-4 w-4" />
            New Student
          </Link>
        </Button>
      </div>

<<<<<<< HEAD
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {loading ? "Loading..." : `${graduatedStudents} graduated`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ETB {loading ? "..." : totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collections Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : `${collectionsRate}%`}</div>
            <p className="text-xs text-muted-foreground">Payment collection</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <div className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${link.color}`}
                  >
                    <link.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{link.label}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
=======
      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, key, icon: Icon, color }) => {
          const card = (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {loading ? (
                    <span className="inline-block h-6 w-12 animate-pulse rounded bg-muted-foreground/20" />
                  ) : (
                    stats[key]
                  )}
                </p>
              </div>
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg", color)}>
                <Icon className="h-5 w-5 text-white" />
              </div>
            </div>
          );
          return key === "totalBatches" ? (
            <Link key={label} href="/batches" className="rounded-xl border bg-card p-5 shadow-sm block transition-colors hover:bg-accent">
              {card}
            </Link>
          ) : (
            <div key={label} className="rounded-xl border bg-card p-5 shadow-sm">{card}</div>
          );
        })}
      </div>

      {/* Status Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Student Status Overview */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-foreground">
            Student Status Overview
          </h2>
          <div className="mt-4 space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="inline-block h-4 w-32 animate-pulse rounded bg-muted-foreground/20" />
                  <span className="inline-block h-4 w-8 animate-pulse rounded bg-muted-foreground/20" />
                </div>
              ))
            ) : (
              <>
                <StatusRow
                  label="Registered"
                  count={students.filter((s) => s.status === "registered").length}
                  color="bg-slate-400"
                />
                <StatusRow
                  label="Theory in Progress"
                  count={stats.theoryInProgress}
                  color="bg-amber-400"
                />
                <StatusRow
                  label="Practical in Progress"
                  count={stats.practicalInProgress}
                  color="bg-orange-400"
                />
                <StatusRow
                  label="Exam Ready"
                  count={stats.examReady}
                  color="bg-blue-400"
                />
                <StatusRow
                  label="Graduated"
                  count={stats.graduated}
                  color="bg-emerald-400"
                />
                {students.filter((s) => s.under_penalty).length > 0 && (
                  <StatusRow
                    label="Under Penalty"
                    count={students.filter((s) => s.under_penalty).length}
                    color="bg-red-400"
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-foreground">
            Quick Actions
          </h2>
          <div className="mt-4 grid gap-3">
            {quickActions.map(({ label, description, href, icon: Icon, color }) => (
              <Link
                key={label}
                href={href}
                className={cn(
                  "flex items-center gap-4 rounded-lg border p-4 transition-colors",
                  href === "#"
                    ? "cursor-not-allowed opacity-60"
                    : "hover:bg-accent",
                )}
                onClick={(e) => { if (href === "#") e.preventDefault(); }}
              >
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", color)}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{label}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
                </div>
              </Link>
            ))}
          </div>
<<<<<<< HEAD
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">Loading activity...</p>
          ) : activities.length === 0 ? (
            <p className="text-slate-500">No recent activity.</p>
          ) : (
            <ul className="divide-y">
              {activities.map((item) => {
                const Icon = activityIcons[item.type];
                return (
                  <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                      <Icon className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#0f172a]">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.description}</p>
                    </div>
                    <time className="shrink-0 text-xs text-slate-400">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </time>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
=======
        </div>
      </div>
    </div>
  );
}

function StatusRow({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
      <div className="flex items-center gap-2">
        <div className={cn("h-2.5 w-2.5 rounded-full", color)} />
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold text-foreground">{count}</span>
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
    </div>
  );
}
