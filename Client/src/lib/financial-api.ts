// Typed API client for Financial Reports endpoints.
// All endpoints live under GET/POST /api/v1/financial_reports/*

import { getToken } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type FinancialSummary = {
  total_revenue: number;
  total_collections: number;
  pending_invoices: number;
  monthly_change: number;
};

export type RevenueItem = {
  date: string;
  amount: number;
};

export type CollectionItem = {
  date: string;
  student: string;
  invoice_id: string;
  amount: number;
  status: string;
};

export type MonthlyComparison = {
  month: string;
  revenue: number;
  collections: number;
};

function buildUrl(path: string, params?: Record<string, string | undefined>) {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
  }
  return url.toString();
}

async function fetchJson<T>(path: string, params?: Record<string, string | undefined>): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(buildUrl(path, params), { headers: authHeaders() });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.error || `Request failed (${res.status})` };
    return { success: true, data: json as T };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export async function fetchFinancialSummary(
  startDate?: string,
  endDate?: string,
): Promise<ApiResponse<FinancialSummary>> {
  return fetchJson<FinancialSummary>("/api/v1/financial_reports/summary", {
    start_date: startDate,
    end_date: endDate,
  });
}

export async function fetchRevenue(
  startDate?: string,
  endDate?: string,
): Promise<ApiResponse<RevenueItem[]>> {
  return fetchJson<RevenueItem[]>("/api/v1/financial_reports/revenue", {
    start_date: startDate,
    end_date: endDate,
  });
}

export async function fetchCollections(
  startDate?: string,
  endDate?: string,
): Promise<ApiResponse<CollectionItem[]>> {
  return fetchJson<CollectionItem[]>("/api/v1/financial_reports/collections", {
    start_date: startDate,
    end_date: endDate,
  });
}

export async function fetchMonthlyComparison(
  startDate?: string,
  endDate?: string,
): Promise<ApiResponse<MonthlyComparison[]>> {
  return fetchJson<MonthlyComparison[]>("/api/v1/financial_reports/monthly_comparison", {
    start_date: startDate,
    end_date: endDate,
  });
}

export async function exportFinancialCSV(startDate?: string, endDate?: string): Promise<void> {
  const url = buildUrl("/api/v1/financial_reports/export", {
    start_date: startDate,
    end_date: endDate,
  });
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to export CSV");
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="?(.+?)"?$/);
  const filename = match?.[1] ?? `financial-report-${new Date().toISOString().slice(0, 10)}.csv`;
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

export async function reconcileFinancials(): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/financial_reports/reconcile`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.error || "Reconciliation failed" };
    return { success: true, data: json };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}
