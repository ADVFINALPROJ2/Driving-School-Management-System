"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, DollarSign, FileText, TrendingUp,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchFinancialSummary, type FinancialSummary } from "@/lib/financial-api";

export default function DashboardPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialSummary().then((res) => {
      if (res.success && res.data) setSummary(res.data);
      setLoading(false);
    });
  }, []);

  const kpiCards = [
    {
      label: "Total Revenue",
      value: summary
        ? `ETB ${summary.total_revenue.toLocaleString()}`
        : "—",
      icon: DollarSign,
      color: "bg-emerald-500",
    },
    {
      label: "Pending Invoices",
      value: summary ? summary.pending_invoices.toLocaleString() : "—",
      icon: FileText,
      color: "bg-amber-500",
    },
    {
      label: "Collections Rate",
      value: summary && summary.total_revenue > 0
        ? `${((summary.total_collections / summary.total_revenue) * 100).toFixed(1)}%`
        : "—",
      icon: TrendingUp,
      color: "bg-violet-500",
    },
  ];

  const quickLinks = [
    { href: "/students", label: "Students", icon: Users, description: "Manage student records" },
    { href: "/financial-reports", label: "Financial Reports", icon: DollarSign, description: "View revenue & collections" },
    { href: "/payroll", label: "Payroll", icon: FileText, description: "Manage staff payroll" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <Button asChild className="bg-primary hover:bg-primary/90" size="lg">
          <Link href="/students/new">
            <Plus className="h-4 w-4" />
            New Student
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {loading ? (
                    <span className="inline-block h-6 w-16 animate-pulse rounded bg-muted-foreground/20" />
                  ) : (
                    value
                  )}
                </p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map(({ href, label, icon: Icon, description }) => (
          <Link key={href} href={href}>
            <Card className="transition-colors hover:bg-accent/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">{label}</CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
