"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getInvoices, markInvoicePaid, type Invoice } from "@/lib/api";
import { MOCK_INVOICES } from "@/lib/fallback-data";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
  { value: "overdue", label: "Overdue" },
];

const typeOptions = [
  { value: "", label: "All Types" },
  { value: "registration", label: "Registration" },
  { value: "milestone_1", label: "Milestone 1" },
  { value: "milestone_2", label: "Milestone 2" },
  { value: "penalty", label: "Penalty" },
];

const statusBadge: Record<string, "success" | "warning" | "destructive"> = {
  paid: "success",
  unpaid: "warning",
  overdue: "destructive",
};

const statusLabels: Record<string, string> = {
  paid: "Paid",
  unpaid: "Unpaid",
  overdue: "Overdue",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const apiStatus = statusFilter === "unpaid" ? "pending" : statusFilter;
    const res = await getInvoices({
      status: apiStatus || undefined,
      invoice_type: typeFilter || undefined,
    });

    if (res.success && res.data && res.data.length > 0) {
      setInvoices(res.data);
      setUsingFallback(false);
    } else if (res.success && res.data) {
      setInvoices(res.data);
      setUsingFallback(false);
    } else {
      setInvoices(MOCK_INVOICES);
      setUsingFallback(true);
    }
    setLoading(false);
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const filtered = invoices.filter((invoice) => {
    const matchesSearch =
      search === "" ||
      invoice.student_name.toLowerCase().includes(search.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "" || invoice.status === statusFilter;
    const matchesType = typeFilter === "" || invoice.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleMarkPaid = async (invoiceId: number) => {
    const res = await markInvoicePaid(invoiceId, { payment_method: "cash" });
    if (res.success && res.data) {
      setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? res.data! : inv)));
      toast.success("Invoice marked as paid");
      return;
    }

    if (usingFallback) {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoiceId
            ? { ...inv, status: "paid" as const, payment_date: new Date().toISOString().split("T")[0] }
            : inv,
        ),
      );
      toast.success("Invoice marked as paid (offline mode)");
      return;
    }

    toast.error(res.error || "Failed to mark invoice as paid");
  };

  return (
    <div className="space-y-6">
      {usingFallback && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Showing sample invoice data — API unavailable or returned no results.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-[#0f172a]">Invoices</h1>
        {/* Create invoice UI pending backend POST /api/v1/invoices endpoint */}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by student name or invoice #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b last:border-0">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <span className="inline-block h-4 w-full animate-pulse rounded bg-slate-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    {search || statusFilter || typeFilter
                      ? "No invoices match your filters."
                      : "No invoices found."}
                  </td>
                </tr>
              ) : (
                filtered.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b last:border-0 transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#0f172a]">{invoice.student_name}</td>
                    <td className="px-4 py-3 capitalize text-slate-500">
                      {invoice.type.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#0f172a]">
                      ETB {invoice.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadge[invoice.status] ?? "secondary"}>
                        {statusLabels[invoice.status] ?? invoice.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{invoice.due_date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/invoices/${invoice.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                        {invoice.status !== "paid" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkPaid(invoice.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
