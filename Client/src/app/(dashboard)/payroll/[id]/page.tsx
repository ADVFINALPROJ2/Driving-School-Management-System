"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, User, DollarSign, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { generatePayslipPDF } from "@/lib/payroll-pdf";

// Mock payroll detail — backend endpoint /api/v1/payroll/:id not yet available
type PayrollDetail = {
  id: number;
  name: string;
  role: "instructor" | "receptionist" | "admin";
  email: string;
  phone: string;
  base_salary: number;
  hours_this_month: number;
  hourly_rate: number;
  overtime_hours: number;
  overtime_pay: number;
  deductions: number;
  net_pay: number;
  status: "paid" | "pending";
  payment_date?: string;
};

const mockPayrollDetail: PayrollDetail = {
  id: 1,
  name: "John Instructor",
  role: "instructor",
  email: "john@driving-school.com",
  phone: "+251911000002",
  base_salary: 15000,
  hours_this_month: 160,
  hourly_rate: 93.75,
  overtime_hours: 10,
  overtime_pay: 937.5,
  deductions: 500,
  net_pay: 15437.5,
  status: "pending",
};

type PaymentHistory = {
  id: number;
  period: string;
  amount: number;
  status: string;
  paid_date: string;
};

const mockPaymentHistory: PaymentHistory[] = [
  {
    id: 1,
    period: "December 2023",
    amount: 15000,
    status: "paid",
    paid_date: "2023-12-31",
  },
  {
    id: 2,
    period: "November 2023",
    amount: 15000,
    status: "paid",
    paid_date: "2023-11-30",
  },
];

export default function PayrollDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [payroll, setPayroll] = useState<PayrollDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const staffId = Number(params.id);

  useEffect(() => {
    // Uses mock data until GET /api/v1/payroll/:id is available
    setPayroll(mockPayrollDetail);
    setLoading(false);
  }, [staffId]);

  const handleDownloadPayslip = () => {
    if (!payroll) return;
    generatePayslipPDF({
      name: payroll.name,
      role: payroll.role,
      period: new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" }),
      base_salary: payroll.base_salary,
      overtime_pay: payroll.overtime_pay,
      deductions: payroll.deductions,
      net_pay: payroll.net_pay,
    });
    toast.success("Payslip downloaded");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">Loading…</div>
      </div>
    );
  }

  if (!payroll) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-slate-500">Payroll record not found</p>
        <Link href="/payroll">
          <Button variant="outline" className="mt-4">
            Back to Payroll
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/payroll">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#0f172a]">
              {payroll.name}
            </h1>
            <p className="text-sm text-slate-500 capitalize">{payroll.role}</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleDownloadPayslip}>
          <Download className="mr-2 h-4 w-4" />
          Download Payslip
        </Button>
      </div>

      {/* Staff Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Staff Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-medium">{payroll.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Phone</p>
              <p className="font-medium">{payroll.phone}</p>
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
              <span className="text-slate-500">Base Salary</span>
              <span className="font-medium">ETB {payroll.base_salary.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Hours This Month</span>
              <span className="font-medium">{payroll.hours_this_month} hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Hourly Rate</span>
              <span className="font-medium">ETB {payroll.hourly_rate.toFixed(2)}/hr</span>
            </div>
            {payroll.overtime_hours > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500">Overtime Hours</span>
                  <span className="font-medium">{payroll.overtime_hours} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Overtime Pay</span>
                  <span className="font-medium">ETB {payroll.overtime_pay.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-red-600">
              <span className="text-slate-500">Deductions</span>
              <span className="font-medium">-ETB {payroll.deductions.toLocaleString()}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Net Pay</span>
                <span className="text-[#2563eb]">ETB {payroll.net_pay.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Payment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Current Status</p>
              <Badge variant={payroll.status === "paid" ? "success" : "warning"}>
                {payroll.status}
              </Badge>
            </div>
            {payroll.payment_date && (
              <div>
                <p className="text-sm text-slate-500">Paid On</p>
                <p className="font-medium">{payroll.payment_date}</p>
              </div>
            )}
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Paid Date</th>
                </tr>
              </thead>
              <tbody>
                {mockPaymentHistory.map((payment) => (
                  <tr key={payment.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{payment.period}</td>
                    <td className="px-4 py-3 font-medium">
                      ETB {payment.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="success">{payment.status}</Badge>
                    </td>
                    <td className="px-4 py-3">{payment.paid_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
