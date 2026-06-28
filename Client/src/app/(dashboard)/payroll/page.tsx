"use client";

import { useState } from "react";
<<<<<<< HEAD
import { DollarSign, Users, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Mock payroll data — backend endpoint /api/v1/payroll not yet available
type PayrollStaff = {
  id: number;
  name: string;
  role: "instructor" | "receptionist" | "admin";
  base_salary: number;
  hours_this_month: number;
  calculated_pay: number;
  status: "paid" | "pending";
};

const mockPayroll: PayrollStaff[] = [
  {
    id: 1,
    name: "John Instructor",
    role: "instructor",
    base_salary: 15000,
    hours_this_month: 160,
    calculated_pay: 15000,
    status: "pending",
  },
  {
    id: 2,
    name: "Sarah Receptionist",
    role: "receptionist",
    base_salary: 8000,
    hours_this_month: 176,
    calculated_pay: 8000,
    status: "paid",
  },
  {
    id: 3,
    name: "Mike Admin",
    role: "admin",
    base_salary: 20000,
    hours_this_month: 176,
    calculated_pay: 20000,
    status: "pending",
  },
];

export default function PayrollPage() {
  const [payroll, setPayroll] = useState<PayrollStaff[]>(mockPayroll);
  const [roleFilter, setRoleFilter] = useState("");

  const filtered = payroll.filter((staff) => {
    if (roleFilter === "") return true;
    return staff.role === roleFilter;
  });

  const handleMarkPaid = (staffId: number) => {
    // Local-only until POST /api/v1/payroll/:id/mark_paid is available
    setPayroll((prev) =>
      prev.map((staff) =>
        staff.id === staffId ? { ...staff, status: "paid" as const } : staff
      )
    );
    toast.success("Payroll marked as paid");
  };

  return (
    <div className="space-y-6">
      {/* API Pending Banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-semibold">Payroll API pending</p>
        <p className="mt-1">
          This page uses mock data. Connect to /api/v1/payroll when the backend endpoint is available.
        </p>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-[#0f172a]">Payroll</h1>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Roles</SelectItem>
            <SelectItem value="instructor">Instructors</SelectItem>
            <SelectItem value="receptionist">Receptionists</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payroll.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ETB {payroll.reduce((sum, p) => sum + p.calculated_pay, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payroll.filter((p) => p.status === "pending").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Payroll</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Base Salary</th>
                  <th className="px-4 py-3">Hours</th>
=======
import Link from "next/link";
import { AlertTriangle, Eye, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminGuard } from "@/components/admin-guard";
import { mockPayrollStaff, type PayrollStaff } from "@/lib/payroll-mock";

export default function PayrollPage() {
  const [staff, setStaff] = useState<PayrollStaff[]>(mockPayrollStaff);
  const [roleFilter, setRoleFilter] = useState("");

  const filtered = roleFilter
    ? staff.filter((s) => s.role === roleFilter)
    : staff;

  const handleMarkPaid = (id: number) => {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: "paid" as const } : s,
      ),
    );
    toast.success(`Payroll marked as paid`);
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Payroll
          </h1>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Roles</SelectItem>
              <SelectItem value="instructor">Instructor</SelectItem>
              <SelectItem value="receptionist">Receptionist</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mock data banner */}
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800/30 dark:bg-amber-900/20 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm">
            <strong>Payroll API pending</strong> &mdash; this page uses mock data.
            Connect to <code className="rounded bg-amber-100/50 px-1 dark:bg-amber-900/40">GET /api/v1/payroll</code> when the endpoint is available.
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Base Salary</th>
                  <th className="px-4 py-3">Hours This Month</th>
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
                  <th className="px-4 py-3">Calculated Pay</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
<<<<<<< HEAD
                {filtered.map((staff) => (
                  <tr key={staff.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{staff.name}</td>
                    <td className="px-4 py-3 capitalize">{staff.role}</td>
                    <td className="px-4 py-3">ETB {staff.base_salary.toLocaleString()}</td>
                    <td className="px-4 py-3">{staff.hours_this_month}</td>
                    <td className="px-4 py-3 font-medium">
                      ETB {staff.calculated_pay.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={staff.status === "paid" ? "success" : "warning"}>
                        {staff.status === "paid" ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <Clock className="mr-1 h-3 w-3" />
                        )}
                        {staff.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {staff.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkPaid(staff.id)}
                        >
                          Mark as Paid
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
=======
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      No staff found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b last:border-0 transition-colors hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">{s.role}</td>
                      <td className="px-4 py-3">ETB {s.base_salary.toLocaleString()}</td>
                      <td className="px-4 py-3">{s.hours_this_month}</td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        ETB {s.calculated_pay.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={s.status === "paid" ? "success" : "warning"}>
                          {s.status === "paid" ? "Paid" : "Pending"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/payroll/${s.id}`}>
                              <Eye className="h-3 w-3" />
                              View
                            </Link>
                          </Button>
                          {s.status === "pending" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleMarkPaid(s.id)}
                            >
                              <CheckCircle className="h-3 w-3" />
                              Mark Paid
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
    </AdminGuard>
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
  );
}
