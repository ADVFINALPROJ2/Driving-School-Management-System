import { jsPDF } from "jspdf";

type PayslipData = {
  name: string;
  role: string;
  period: string;
  base_salary: number;
  overtime_pay: number;
  deductions: number;
  net_pay: number;
};

const SCHOOL_NAME = "Driving School Administration System";

export function generatePayslipPDF(data: PayslipData): void {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(SCHOOL_NAME, margin, y);

  y += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Payslip", margin, y);

  y += 15;
  doc.setFont("helvetica", "bold");
  doc.text(data.name, margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(`Role: ${data.role}`, margin, y);
  y += 5;
  doc.text(`Period: ${data.period}`, margin, y);

  y += 15;
  const rows = [
    ["Base Salary", data.base_salary],
    ["Overtime Pay", data.overtime_pay],
    ["Deductions", -data.deductions],
    ["Net Pay", data.net_pay],
  ];

  rows.forEach(([label, amount]) => {
    doc.text(String(label), margin, y);
    doc.text(`ETB ${Number(amount).toLocaleString()}`, margin + 120, y);
    y += 8;
  });

  doc.save(`payslip_${data.name.replace(/\s+/g, "_").toLowerCase()}.pdf`);
}
