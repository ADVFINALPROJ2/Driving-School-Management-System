"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Banknote, Clock, RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminGuard } from "@/components/admin-guard";
import { DateRangePicker } from "@/components/date-range-picker";
import { AsyncWrapper } from "@/components/async-state";
import {
  fetchFinancialSummary,
  fetchRevenue,
  fetchCollections,
  fetchMonthlyComparison,
  exportFinancialCSV,
  reconcileFinancials,
  type FinancialSummary,
  type RevenueItem,
  type CollectionItem,
  type MonthlyComparison,
} from "@/lib/financial-api";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}
function getMonthAgo() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}

export default function FinancialReportsPage() {
  const [from, setFrom] = useState(getMonthAgo());
  const [to, setTo] = useState(getToday());
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueItem[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reconciling, setReconciling] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [s, r, c, m] = await Promise.all([
      fetchFinancialSummary(from, to),
      fetchRevenue(from, to),
      fetchCollections(from, to),
      fetchMonthlyComparison(from, to),
    ]);
    if (s.success && s.data) setSummary(s.data);
    else if (s.error) setError(s.error);
    if (r.success && r.data) setRevenueData(r.data);
    if (c.success && c.data) setCollections(c.data);
    if (m.success && m.data) setMonthlyData(m.data);
    setLoading(false);
  }, [from, to]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const handleExport = async () => {
    try {
      await exportFinancialCSV(from, to);
      toast.success("CSV exported successfully");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  const handleReconcile = async () => {
    setReconciling(true);
    const res = await reconcileFinancials();
    if (res.success) {
      toast.success("Reconciliation completed");
      loadData();
    } else {
      toast.error(res.error || "Reconciliation failed");
    }
    setReconciling(false);
  };

  const summaryCards = summary
    ? [
        {
          label: "Total Revenue",
          value: `ETB ${summary.total_revenue.toLocaleString()}`,
          icon: DollarSign,
          color: "bg-emerald-500",
        },
        {
          label: "Collections",
          value: `ETB ${summary.total_collections.toLocaleString()}`,
          icon: Banknote,
          color: "bg-blue-500",
        },
        {
          label: "Pending Invoices",
          value: summary.pending_invoices.toLocaleString(),
          icon: Clock,
          color: "bg-amber-500",
        },
        {
          label: "Monthly Change",
          value: `${summary.monthly_change >= 0 ? "+" : ""}${summary.monthly_change.toFixed(1)}%`,
          icon: summary.monthly_change >= 0 ? TrendingUp : TrendingDown,
          color: summary.monthly_change >= 0 ? "bg-violet-500" : "bg-red-500",
        },
      ]
    : [];

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Financial Reports
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <DateRangePicker from={from} to={to} onRangeChange={(f, t) => { setFrom(f); setTo(t); }} />
          </div>
        </div>

        <AsyncWrapper isLoading={loading} error={error} onRetry={loadData}>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-xs text-muted-foreground" />
                      <YAxis className="text-xs text-muted-foreground" />
                      <Tooltip />
                      <Bar dataKey="amount" fill="var(--color-primary, #2563eb)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs text-muted-foreground" />
                      <YAxis className="text-xs text-muted-foreground" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="var(--color-primary, #2563eb)" radius={[4, 4, 0, 0]} name="Revenue" />
                      <Bar dataKey="collections" fill="#10b981" radius={[4, 4, 0, 0]} name="Collections" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Collections Table */}
          <Card>
            <CardHeader>
              <CardTitle>Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Invoice #</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collections.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                          No collections found.
                        </td>
                      </tr>
                    ) : (
                      collections.map((c, i) => (
                        <tr key={i} className="border-b last:border-0 transition-colors hover:bg-muted/50">
                          <td className="px-4 py-3 text-muted-foreground">{c.date}</td>
                          <td className="px-4 py-3 font-medium text-foreground">{c.student}</td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.invoice_id}</td>
                          <td className="px-4 py-3">ETB {c.amount.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <Badge variant={c.status === "completed" ? "success" : "warning"}>
                              {c.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={handleReconcile} disabled={reconciling}>
              <RefreshCw className={`h-4 w-4 ${reconciling ? "animate-spin" : ""}`} />
              {reconciling ? "Reconciling..." : "Reconcile"}
            </Button>
          </div>
        </AsyncWrapper>
      </div>
    </AdminGuard>
  );
}
