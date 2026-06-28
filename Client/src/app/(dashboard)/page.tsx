// Dashboard home page — the root route of the authenticated area.
// Displays summary KPI cards and quick links to main sections.

"use client";

import { useEffect, useState, useMemo, startTransition } from "react";
import Link from "next/link";
import {
  Plus,
  Users,
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
  getInvoices,
  getStudents,
  type Student,
  type StudentInvoice,
} from "@/lib/api";
import { MOCK_FINANCIAL_SUMMARY, MOCK_INVOICES, type FinancialSummary } from "@/lib/fallback-data";

type ActivityItem = {
  id: string;
  type: "student_registered" | "invoice_paid" | "invoice_created";
  title: string;
  description: string;
  timestamp: string;
};

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
      const [sRes, iRes] = await Promise.all([
        getStudents(),
        getInvoices(),
      ]);

      const studentList = sRes.success && sRes.data ? sRes.data : [];
      const invoiceList =
        iRes.success && iRes.data
          ? (iRes.data as { invoices: StudentInvoice[] }).invoices ?? []
          : MOCK_INVOICES;

      if (sRes.success && sRes.data) setStudents(sRes.data);

      const feed: ActivityItem[] = [
        ...studentList.slice(0, 5).map((s) => ({
          id: `student-${s.id}`,
          type: "student_registered" as const,
          title: "New Student Registered",
          description: `${s.first_name} ${s.last_name}`,
          timestamp: s.created_at || new Date().toISOString(),
        })),
        ...(Array.isArray(invoiceList) ? invoiceList.slice(0, 5).map((inv) => ({
          id: `invoice-${inv.id}`,
          type: (inv.status === "paid" ? "invoice_paid" : "invoice_created") as "invoice_paid" | "invoice_created",
          title: inv.status === "paid" ? "Invoice Paid" : "Invoice Created",
          description: `#${inv.id} — ${inv.student_name || "N/A"}`,
          timestamp: inv.created_at || new Date().toISOString(),
        })) : []),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setActivities(feed);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <Button asChild className="bg-primary hover:bg-primary/90" size="lg">
          <Link href="/students/new">
            <Plus className="h-4 w-4" />
            New Student
          </Link>
        </Button>
      </div>

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
                </div>
              </Link>
            ))}
          </div>
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
    </div>
  );
}
