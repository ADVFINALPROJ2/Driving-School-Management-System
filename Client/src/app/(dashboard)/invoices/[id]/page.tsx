"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, CheckCircle, FileText, Calendar, DollarSign, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getInvoice, markInvoicePaid, type Invoice } from "@/lib/api";
import { MOCK_INVOICES } from "@/lib/fallback-data";
import { generateInvoicePDF } from "@/lib/invoice-pdf";
import { PaymentRecordModal } from "@/components/payment-record-modal";

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

export default function InvoiceDetailPage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const invoiceId = Number(params.id);

  useEffect(() => {
    if (isNaN(invoiceId)) {
      setLoading(false);
      return;
    }

    const fetchInvoice = async () => {
      setLoading(true);
      const res = await getInvoice(invoiceId);
      if (res.success && res.data) {
        setInvoice(res.data);
        setUsingFallback(false);
      } else {
        const fallback = MOCK_INVOICES.find((inv) => inv.id === invoiceId) ?? MOCK_INVOICES[0];
        setInvoice(fallback);
        setUsingFallback(true);
      }
      setLoading(false);
    };

    fetchInvoice();
  }, [invoiceId]);

  const handleMarkPaid = async (paymentDetails?: {
    amount?: number;
    payment_method?: string;
    payment_date?: string;
    notes?: string;
  }) => {
    const res = await markInvoicePaid(invoiceId, {
      payment_method: paymentDetails?.payment_method ?? "cash",
      payment_reference: paymentDetails?.notes,
    });

    if (res.success && res.data) {
      setInvoice(res.data);
      toast.success("Invoice marked as paid");
      return;
    }

    if (usingFallback && invoice) {
      setInvoice({
        ...invoice,
        status: "paid",
        payment_date: paymentDetails?.payment_date ?? new Date().toISOString().split("T")[0],
        payment_method: paymentDetails?.payment_method,
      });
      toast.success("Invoice marked as paid (offline mode)");
      return;
    }

    toast.error(res.error || "Failed to mark invoice as paid");
  };

  const handleDownloadPDF = () => {
    if (!invoice) return;
    generateInvoicePDF(invoice);
    toast.success("Invoice PDF downloaded");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">Loading…</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-slate-500">Invoice not found</p>
        <Link href="/invoices">
          <Button variant="outline" className="mt-4">
            Back to Invoices
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {usingFallback && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Showing sample invoice data — API unavailable for this invoice.
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#0f172a]">
              {invoice.invoice_number}
            </h1>
            <p className="text-sm text-slate-500">
              Created on {new Date(invoice.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          {invoice.status !== "paid" && (
            <Button
              className="bg-[#2563eb] hover:bg-[#1d4ed8]"
              onClick={() => setPaymentModalOpen(true)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#0f172a]">
            <User className="h-5 w-5" />
            Student Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-500">Name:</span>
              <span className="font-medium">{invoice.student_name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-500">Student ID:</span>
              <span className="font-medium">{invoice.student_id}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#0f172a]">
            <FileText className="h-5 w-5" />
            Invoice Details
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-500">Type:</span>
              <span className="font-medium capitalize">{invoice.type.replace(/_/g, " ")}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-500">Status:</span>
              <Badge variant={statusBadge[invoice.status] ?? "secondary"}>
                {statusLabels[invoice.status] ?? invoice.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#0f172a]">
            <DollarSign className="h-5 w-5" />
            Payment Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-500">Amount:</span>
              <span className="text-2xl font-bold text-[#0f172a]">
                ETB {invoice.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-500">Due Date:</span>
              <span className="font-medium">{invoice.due_date}</span>
            </div>
            {invoice.payment_date && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-500">Paid On:</span>
                <span className="font-medium text-green-600">
                  {new Date(invoice.payment_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#0f172a]">
            <Calendar className="h-5 w-5" />
            Important Dates
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-500">Created:</span>
              <span className="font-medium">
                {new Date(invoice.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-500">Due:</span>
              <span className="font-medium">{invoice.due_date}</span>
            </div>
          </div>
        </div>
      </div>

      <PaymentRecordModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        invoiceId={invoice.id}
        invoiceAmount={invoice.amount}
        onSubmit={(data) =>
          handleMarkPaid({
            amount: Number(data.amount),
            payment_method: data.payment_method,
            payment_date: data.payment_date,
            notes: data.notes,
          })
        }
      />
    </div>
  );
}
