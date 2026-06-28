"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
<<<<<<< HEAD
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
=======
import {
  ArrowLeft,
  Download,
  DollarSign,
  Calendar,
  Hash,
  User,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaymentRecordModal } from "@/components/payment-record-modal";
import { getInvoice, type StudentInvoice } from "@/lib/api";
import { generateInvoicePDF } from "@/lib/invoice-pdf";

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [invoice, setInvoice] = useState<StudentInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    getInvoice(id).then((res) => {
      if (res.success && res.data) {
        setInvoice(res.data);
      } else {
        setError(res.error || "Failed to load invoice");
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-48 animate-pulse rounded-xl bg-slate-200" />
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
      </div>
    );
  }

<<<<<<< HEAD
  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-slate-500">Invoice not found</p>
        <Link href="/invoices">
          <Button variant="outline" className="mt-4">
            Back to Invoices
          </Button>
        </Link>
=======
  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-slate-500">{error || "Invoice not found"}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/invoices">Back to Invoices</Link>
        </Button>
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
      </div>
    );
  }

<<<<<<< HEAD
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
=======
  const statusVariant: "success" | "warning" | "destructive" =
    invoice.status === "paid" ? "success" : invoice.is_overdue ? "destructive" : "warning";

  return (
    <div className="space-y-6">
      <Link href="/invoices" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Back to Invoices
      </Link>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
              <ReceiptIcon className="h-6 w-6 text-slate-500" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-serif text-2xl font-bold text-[#0f172a]">
                  Invoice #{invoice.invoice_number}
                </h1>
                <Badge variant={statusVariant}>{invoice.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500">{invoice.invoice_type}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {invoice.status !== "paid" && (
              <Button className="bg-[#2563eb] hover:bg-[#1d4ed8]" onClick={() => setShowPaymentModal(true)}>
                <DollarSign className="h-4 w-4" />
                Mark as Paid
              </Button>
            )}
            <Button variant="outline" onClick={() => generateInvoicePDF(invoice)}>
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-[#0f172a]">Invoice Details</h2>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b last:border-0">
                    <td className="px-4 py-3 text-slate-600">
                      {invoice.description || invoice.invoice_type}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#0f172a]">
                      {invoice.amount.toLocaleString()} ETB
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t bg-slate-50 font-semibold">
                    <td className="px-4 py-3 text-[#0f172a]">Total</td>
                    <td className="px-4 py-3 text-[#0f172a]">
                      {invoice.amount.toLocaleString()} ETB
                    </td>
                  </tr>
                </tfoot>
              </table>
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
            </div>
          </div>
        </div>

<<<<<<< HEAD
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
=======
        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-[#0f172a]">Student Info</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Name:</span>
                <span className="font-medium text-[#0f172a]">
                  {invoice.student_name || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Student ID:</span>
                <span className="font-medium text-[#0f172a]">{invoice.student_id}</span>
              </div>
              <Button variant="outline" size="sm" asChild className="mt-2">
                <Link href={`/students/${invoice.student_id}`}>View Student</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-[#0f172a]">Payment Info</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Due Date:</span>
                <span className="font-medium text-[#0f172a]">
                  {new Date(invoice.due_date).toLocaleDateString()}
                </span>
              </div>
              {invoice.paid_at ? (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="text-slate-500">Paid At:</span>
                    <span className="font-medium text-[#0f172a]">
                      {new Date(invoice.paid_at).toLocaleString()}
                    </span>
                  </div>
                  {invoice.payment_method && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-500">Method:</span>
                      <span className="font-medium text-[#0f172a] capitalize">
                        {invoice.payment_method.replace(/_/g, " ")}
                      </span>
                    </div>
                  )}
                  {invoice.payment_reference && (
                    <div className="flex items-center gap-2 text-sm">
                      <Hash className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-500">Reference:</span>
                      <span className="font-medium text-[#0f172a]">
                        {invoice.payment_reference}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-amber-600">Not yet paid</p>
              )}
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
            </div>
          </div>
        </div>
      </div>

<<<<<<< HEAD
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
=======
      {showPaymentModal && (
        <PaymentRecordModal
          invoice={invoice}
          open={true}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            getInvoice(id).then((res) => {
              if (res.success && res.data) setInvoice(res.data);
            });
          }}
        />
      )}
    </div>
  );
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M8 15h5" />
    </svg>
  );
}
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
