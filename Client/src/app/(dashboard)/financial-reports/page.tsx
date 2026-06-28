"use client";

<<<<<<< HEAD
import { useCallback, useEffect, useState } from "react";
import { DollarSign, TrendingUp, AlertCircle, Download, RefreshCw } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/date-range-picker";
import { toast } from "sonner";
import {
  exportFinancialReport,
  getFinancialCollections,
  getFinancialRevenue,
  getFinancialSummary,
  getMonthlyComparison,
  reconcilePayments,
  type CollectionsReport,
  type FinancialSummary,
  type MonthlyComparison,
  type RevenueTrend,
} from "@/lib/api";
import {
  MOCK_COLLECTIONS,
  MOCK_FINANCIAL_SUMMARY,
  MOCK_MONTHLY_COMPARISON,
  MOCK_REVENUE_TRENDS,
} from "@/lib/fallback-data";

function defaultStartDate() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split("T")[0];
}

export default function FinancialReportsPage() {
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [summary, setSummary] = useState<FinancialSummary>(MOCK_FINANCIAL_SUMMARY);
  const [revenueTrends, setRevenueTrends] = useState<RevenueTrend[]>(MOCK_REVENUE_TRENDS);
  const [collections, setCollections] = useState<CollectionsReport>(MOCK_COLLECTIONS);
  const [monthlyComparison, setMonthlyComparison] = useState<MonthlyComparison[]>(
    MOCK_MONTHLY_COMPARISON,
  );

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const [summaryRes, revenueRes, collectionsRes, monthlyRes] = await Promise.all([
      getFinancialSummary(startDate, endDate),
      getFinancialRevenue(startDate, endDate),
      getFinancialCollections(startDate, endDate),
      getMonthlyComparison(startDate, endDate),
    ]);

    const anySuccess =
      summaryRes.success || revenueRes.success || collectionsRes.success || monthlyRes.success;

    if (anySuccess) {
      if (summaryRes.success && summaryRes.data) setSummary(summaryRes.data);
      if (revenueRes.success && revenueRes.data?.trends?.length)
        setRevenueTrends(revenueRes.data.trends);
      if (collectionsRes.success && collectionsRes.data) setCollections(collectionsRes.data);
      if (monthlyRes.success && monthlyRes.data?.length) setMonthlyComparison(monthlyRes.data);
      setUsingFallback(false);
    } else {
      setSummary(MOCK_FINANCIAL_SUMMARY);
      setRevenueTrends(MOCK_REVENUE_TRENDS);
      setCollections(MOCK_COLLECTIONS);
      setMonthlyComparison(MOCK_MONTHLY_COMPARISON);
      setUsingFallback(true);
    }

    setLoading(false);
  }, [startDate, endDate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleExport = async () => {
    const res = await exportFinancialReport(startDate, endDate);
    if (res.success && res.data) {
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `financial_report_${startDate}_to_${endDate}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Report exported successfully");
      return;
    }

    if (usingFallback) {
      toast.error("Export unavailable in offline mode");
      return;
    }

    toast.error(res.error || "Failed to export report");
=======
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
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
  };

  const handleReconcile = async () => {
    setReconciling(true);
<<<<<<< HEAD
    const res = await reconcilePayments();
    setReconciling(false);

    if (res.success) {
      toast.success("Payment reconciliation completed");
      fetchReports();
      return;
    }

    if (usingFallback) {
      toast.success("Reconciliation simulated (offline mode)");
      return;
    }

    toast.error(res.error || "Failed to reconcile payments");
  };

  const chartTrends = revenueTrends.map((t) => ({
    date: new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    amount: t.amount,
  }));

  return (
    <div className="space-y-6">
      {usingFallback && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Showing sample financial data — API unavailable.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-[#0f172a]">
          Financial Reports
        </h1>
        <div className="flex flex-wrap items-end gap-3">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          <Button variant="outline" onClick={handleExport} disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            className="bg-[#2563eb] hover:bg-[#1d4ed8]"
            onClick={handleReconcile}
            disabled={reconciling || loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${reconciling ? "animate-spin" : ""}`} />
            {reconciling ? "Reconciling..." : "Reconcile"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ETB {summary.total_revenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{summary.invoice_count} invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collections</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.collections.collection_rate}%</div>
            <p className="text-xs text-muted-foreground">
              ETB {summary.collections.total_collected.toLocaleString()} collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ETB {summary.collections.pending_amount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.outstanding.pending_count} pending invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ETB {summary.collections.overdue_amount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.outstanding.overdue_count} overdue invoices
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          {chartTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`ETB ${value.toLocaleString()}`, "Revenue"]} />
                <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500">No revenue data for the selected period.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Collections Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Metric</th>
                  <th className="px-4 py-3">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-3 text-slate-500">Total Issued</td>
                  <td className="px-4 py-3 font-medium">
                    ETB {collections.collection_summary.total_issued.toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3 text-slate-500">Total Collected</td>
                  <td className="px-4 py-3 font-medium">
                    ETB {collections.collection_summary.total_collected.toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3 text-slate-500">Collection Rate</td>
                  <td className="px-4 py-3 font-medium">
                    {collections.collection_summary.collection_rate}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3 text-slate-500">Outstanding</td>
                  <td className="px-4 py-3 font-medium">
                    ETB {collections.outstanding_summary.total_outstanding?.toLocaleString() ?? "0"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyComparison.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[...monthlyComparison].reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `ETB ${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="total_issued" name="Issued" fill="#94a3b8" />
                <Bar dataKey="total_collected" name="Collected" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500">No monthly comparison data available.</p>
          )}
        </CardContent>
      </Card>
    </div>
=======
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
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
  );
}
