"use client";

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
  };

  const handleReconcile = async () => {
    setReconciling(true);
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
  );
}
