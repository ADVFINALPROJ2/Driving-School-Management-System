"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Phone,
  Mail,
  DollarSign,
  User,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminGuard } from "@/components/admin-guard";
import { mockPayrollStaff, type PayrollStaff } from "@/lib/payroll-mock";

export default function PayrollDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);
  const staff: PayrollStaff | undefined = mockPayrollStaff.find(
    (s) => s.id === id,
  );

  if (!staff) {
    return (
      <AdminGuard>
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <p className="text-lg font-medium text-foreground">
            Staff member not found
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            Go back
          </Button>
        </div>
      </AdminGuard>
    );
  }

  const grossPay = staff.base_salary;
  const netPay = staff.calculated_pay;

  const downloadPayslip = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(18);
      doc.text("PAYSLIP", pageWidth / 2, 20, { align: "center" });

      doc.setFontSize(10);
      doc.text(
        "Driving School Administration System",
        pageWidth / 2,
        28,
        { align: "center" },
      );

      doc.setFontSize(11);
      doc.text(`Date: ${new Date().toISOString().slice(0, 10)}`, 14, 40);

      doc.setFontSize(13);
      doc.text("Employee Details", 14, 55);
      doc.setFontSize(10);
      doc.text(`Name: ${staff.name}`, 14, 64);
      doc.text(
        `Role: ${staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}`,
        14,
        71,
      );
      doc.text(`Email: ${staff.email}`, 14, 78);
      doc.text(`Phone: ${staff.phone}`, 14, 85);

      doc.setFontSize(13);
      doc.text("Salary Breakdown", 14, 100);
      doc.setFontSize(10);
      doc.text(
        `Base Salary: ETB ${staff.base_salary.toLocaleString()}`,
        14,
        109,
      );
      doc.text(`Hours Worked: ${staff.hours_this_month} hrs`, 14, 116);
      doc.text(`Hourly Rate: ETB ${staff.hourly_rate.toFixed(2)}`, 14, 123);
      doc.text(`Gross Pay: ETB ${grossPay.toLocaleString()}`, 14, 130);
      doc.text(
        `Deductions: ETB ${staff.deductions.toLocaleString()}`,
        14,
        137,
      );
      doc.setFontSize(12);
      doc.text(`Net Pay: ETB ${netPay.toLocaleString()}`, 14, 148);

      doc.setFontSize(10);
      doc.text("Status: Paid", 14, 158);

      doc.save(
        `payslip-${staff.name.replace(/\s+/g, "-").toLowerCase()}.pdf`,
      );
      toast.success("Payslip downloaded");
    } catch {
      toast.error("Failed to generate payslip PDF");
    }
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
              {staff.name}
            </h1>
          </div>
          <Button onClick={downloadPayslip}>
            <Download className="h-4 w-4" />
            Download Payslip PDF
          </Button>
        </div>

        {/* Staff Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Staff Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground">
                    {staff.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">
                    {staff.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge
                    variant={staff.status === "paid" ? "success" : "warning"}
                  >
                    {staff.status === "paid" ? "Paid" : "Pending"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Salary Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Salary Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Salary</span>
                <span className="font-medium text-foreground">
                  ETB {staff.base_salary.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Hours This Month
                </span>
                <span className="font-medium text-foreground">
                  {staff.hours_this_month} hours
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hourly Rate</span>
                <span className="font-medium text-foreground">
                  ETB {staff.hourly_rate.toFixed(2)}/hr
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Pay</span>
                <span className="font-medium text-foreground">
                  ETB {grossPay.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-destructive">
                <span className="text-muted-foreground">Deductions</span>
                <span className="font-medium">
                  -ETB {staff.deductions.toLocaleString()}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Net Pay</span>
                  <span className="text-primary">
                    ETB {netPay.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {staff.payment_history.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No payment history yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.payment_history.map((p) => (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="px-4 py-3 text-muted-foreground">
                          {p.date}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          ETB {p.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {p.method}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              p.status === "completed" ? "success" : "warning"
                            }
                          >
                            {p.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
}
