import { jsPDF } from "jspdf";
<<<<<<< HEAD
import type { Invoice } from "@/lib/api";

const SCHOOL_NAME = "Driving School Administration System";

export function generateInvoicePDF(invoice: Invoice): void {
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
  const description = invoice.description ?? invoice.type.replace(/_/g, " ");
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
  if (invoice.payment_date) {
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.text(`Paid on: ${new Date(invoice.payment_date).toLocaleDateString()}`, margin, y);
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
=======
import type { StudentInvoice } from "@/lib/api";

export function generateInvoicePDF(invoice: StudentInvoice) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("DSAS - Driving School Management System", pageWidth / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Ethiopia Driving School Management System", pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setDrawColor(200);
  doc.line(20, y, pageWidth - 20, y);
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`INVOICE #${invoice.invoice_number}`, 20, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 20, y);
  doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, pageWidth - 80, y);
  y += 6;
  if (invoice.paid_at) {
    doc.text(`Paid At: ${new Date(invoice.paid_at).toLocaleDateString()}`, pageWidth - 80, y);
    y += 6;
  }
  y += 4;

  doc.setDrawColor(200);
  doc.line(20, y, pageWidth - 20, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Student Information", 20, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Name: ${invoice.student_name || "N/A"}`, 20, y);
  y += 6;
  doc.text(`Student ID: ${invoice.student_id}`, 20, y);
  y += 10;

  doc.setDrawColor(200);
  doc.line(20, y, pageWidth - 20, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Invoice Details", 20, y);
  y += 8;

  const col1 = 20;
  const col2 = 90;
  const col3 = pageWidth - 70;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Description", col1, y);
  doc.text("Type", col2, y);
  doc.text("Amount", col3, y);
  y += 6;

  doc.setDrawColor(200);
  doc.line(20, y, pageWidth - 20, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text(invoice.description || invoice.invoice_type, col1, y);
  doc.text(invoice.invoice_type, col2, y);
  doc.text(`${invoice.amount.toLocaleString()} ETB`, col3, y);
  y += 8;

  doc.setDrawColor(200);
  doc.line(20, y, pageWidth - 20, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total:", col2, y);
  doc.text(`${invoice.amount.toLocaleString()} ETB`, col3, y);
  y += 12;

  doc.setDrawColor(200);
  doc.line(20, y, pageWidth - 20, y);
  y += 10;

  doc.setFontSize(12);
  if (invoice.status === "paid") {
    doc.setTextColor(34, 197, 94);
    doc.text("PAID", pageWidth / 2, y, { align: "center" });
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(100);
    if (invoice.payment_method) doc.text(`Method: ${invoice.payment_method}`, pageWidth / 2, y, { align: "center" });
  } else if (invoice.is_overdue) {
    doc.setTextColor(239, 68, 68);
    doc.text("OVERDUE", pageWidth / 2, y, { align: "center" });
  } else {
    doc.setTextColor(234, 179, 8);
    doc.text("PENDING", pageWidth / 2, y, { align: "center" });
  }

  doc.setTextColor(0);
  y = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.text("Generated by DSAS - Driving School Management System", pageWidth / 2, y, { align: "center" });

  const pdfBlob = doc.output("blob");
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 10000);
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
}
