"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Users, Layers, BookOpen, GraduationCap, ChevronLeft, ChevronRight, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StudentDetailModal } from "@/components/student-detail-modal";
import { getStudents, getBatches, type Student, type Batch } from "@/lib/api";
import { DataTable, type Column } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "registered", label: "Registered" },
  { value: "theory_in_progress", label: "Theory in Progress" },
  { value: "practical_in_progress", label: "Practical in Progress" },
  { value: "exam_eligible", label: "Exam Eligible" },
  { value: "graduated", label: "Graduated" },
];

const statusBadgeVariant: Record<string, "secondary" | "warning" | "success" | "default"> = {
  registered: "secondary",
  theory_in_progress: "warning",
  practical_in_progress: "warning",
  exam_eligible: "success",
  graduated: "default",
};

const statusLabels: Record<string, string> = {
  registered: "Registered",
  theory_in_progress: "Theory",
  practical_in_progress: "Practical",
  exam_eligible: "Exam Ready",
  graduated: "Graduated",
};

export default function StudentsPage() {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const perPage = 20;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    Promise.all([getStudents({ page: 1, per_page: 10000 }), getBatches()]).then(([sRes, bRes]) => {
      if (sRes.success && sRes.data) {
        const items = Array.isArray(sRes.data) ? sRes.data : (sRes.data as { students?: Student[] }).students ?? [];
        setAllStudents(items);
      }
      if (bRes.success && bRes.data) setBatches(bRes.data);
      setLoading(false);
    });
  }, []);

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = allStudents;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (s) =>
          s.student_id.toLowerCase().includes(q) ||
          s.first_name.toLowerCase().includes(q) ||
          s.middle_name.toLowerCase().includes(q) ||
          s.last_name.toLowerCase().includes(q),
      );
    }
    if (statusFilter) list = list.filter((s) => s.status === statusFilter);
    return list;
  }, [allStudents, debouncedSearch, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  const stats = useMemo(() => ({
    total: allStudents.length,
    batches: batches.length,
    learning: allStudents.filter((s) => s.status !== "graduated").length,
    graduated: allStudents.filter((s) => s.status === "graduated").length,
  }), [allStudents, batches]);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  const columns: Column<Student>[] = useMemo(() => [
    {
      header: "Student ID",
      accessorKey: "student_id",
      className: "font-mono text-xs text-slate-600",
    },
    {
      header: "Name",
      cell: (s) => (
        <span className="font-medium text-[#0f172a]">
          {s.first_name} {s.middle_name} {s.last_name}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (s) => (
        <Badge variant={statusBadgeVariant[s.status] ?? "secondary"}>
          {statusLabels[s.status] ?? s.status}
        </Badge>
      ),
    },
    {
      header: "Enrollment Date",
      cell: (s) => (
        <span className="text-slate-500">
          {new Date(s.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (s) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/students/${s.id}`}>
              <Eye className="h-4 w-4" />
              View
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/students/${s.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      ),
    },
  ], []);

  const statCards = [
    { label: "Total Students", value: stats.total, icon: Users, color: "bg-blue-500" },
    { label: "Total Batches", value: stats.batches, icon: Layers, color: "bg-violet-500" },
    { label: "Currently Learning", value: stats.learning, icon: BookOpen, color: "bg-amber-500" },
    { label: "Graduated", value: stats.graduated, icon: GraduationCap, color: "bg-emerald-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-[#0f172a]">Students</h1>
        <Button asChild className="bg-[#2563eb] hover:bg-[#1d4ed8]" size="lg">
          <Link href="/students/new">
            <Plus className="h-4 w-4" />
            New Student
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-[#0f172a]">
                  {loading ? (
                    <span className="inline-block h-6 w-12 animate-pulse rounded bg-slate-200" />
                  ) : (
                    value
                  )}
                </p>
              </div>
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg", color)}>
                <Icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={paginated}
        loading={loading}
        emptyMessage={
          debouncedSearch || statusFilter
            ? "No students match your filters."
            : "No students found."
        }
      />

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          {pageNumbers.map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Detail Modal (quick-view from other parts of the app) */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          open={true}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}
