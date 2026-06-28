import { jsPDF } from "jspdf";
import type { StudentInvoice } from "@/lib/api";

const SCHOOL_NAME = "Driving School Administration System";

export function generateInvoicePDF(invoice: StudentInvoice): void {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(SCHOOL_NAME, margin, y);

  y += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Official Invoice", margin, y);

  y += 15;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Invoice ${invoice.invoice_number}`, margin, y);

  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, margin, y);
  doc.text(`Due: ${invoice.due_date}`, margin + 80, y);

  y += 15;
  doc.setFont("helvetica", "bold");
  doc.text("Bill To", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(invoice.student_name, margin, y);
  y += 5;
  doc.text(`Student ID: ${invoice.student_id}`, margin, y);

  y += 15;
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y - 5, 170, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.text("Description", margin + 2, y);
  doc.text("Amount (ETB)", margin + 130, y);

  y += 10;
  doc.setFont("helvetica", "normal");
  const description = invoice.description ?? invoice.invoice_type.replace(/_/g, " ");
  doc.text(description.charAt(0).toUpperCase() + description.slice(1), margin + 2, y);
  doc.text(invoice.amount.toLocaleString(), margin + 130, y);

  y += 15;
  doc.setFont("helvetica", "bold");
  doc.text("Total:", margin + 100, y);
  doc.text(`ETB ${invoice.amount.toLocaleString()}`, margin + 130, y);

  y += 20;
  const statusLabel =
    invoice.status === "paid"
      ? "PAID"
      : invoice.status === "overdue"
        ? "OVERDUE"
        : "UNPAID";
  doc.setFontSize(11);
  doc.text(`Status: ${statusLabel}`, margin, y);
  if (invoice.paid_at) {
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.text(`Paid on: ${new Date(invoice.paid_at).toLocaleDateString()}`, margin, y);
    if (invoice.payment_method) {
      y += 5;
      doc.text(`Method: ${invoice.payment_method.replace(/_/g, " ")}`, margin, y);
    }
  }

  y += 20;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Thank you for your payment.", margin, y);

  doc.save(`${invoice.invoice_number}.pdf`);
}
