"use client";

import { useState } from "react";
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
                  <th className="px-4 py-3">Calculated Pay</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
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
  );
}
