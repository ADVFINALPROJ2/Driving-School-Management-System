"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, FileText, Calendar, MapPin, Phone, Mail, CheckCircle, XCircle, User, Droplets, BookOpen, Car, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getStudent,
  getStudentInvoices,
  getStudentAttendanceLogs,
  getStudentLMSProgress,
  type Student,
  type Invoice,
  type AttendanceLog,
  type LMSProgress,
} from "@/lib/api";
import { MOCK_ATTENDANCE_LOGS, MOCK_INVOICES, MOCK_LMS_PROGRESS } from "@/lib/fallback-data";

export default function StudentDetailPage() {
  const params = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "invoices" | "attendance" | "lms">("overview");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [lmsProgress, setLmsProgress] = useState<LMSProgress | null>(null);
  const [tabLoading, setTabLoading] = useState(false);
  const [tabFallback, setTabFallback] = useState(false);

  const studentId = Number(params.id);

  useEffect(() => {
    if (isNaN(studentId)) {
      setError("Invalid student ID");
      setLoading(false);
      return;
    }

    const fetchStudent = async () => {
      setLoading(true);
      setError(null);
      const res = await getStudent(studentId);
      if (res.success && res.data) {
        setStudent(res.data);
      } else {
        setError(res.error || "Failed to load student");
      }
      setLoading(false);
    };

    fetchStudent();
  }, [studentId]);

  useEffect(() => {
    if (!student || activeTab === "overview") return;

    const fetchTabData = async () => {
      setTabLoading(true);
      setTabFallback(false);

      if (activeTab === "invoices") {
        const res = await getStudentInvoices(studentId);
        if (res.success && res.data) {
          setInvoices(res.data);
        } else {
          setInvoices(MOCK_INVOICES.filter((inv) => inv.student_id === studentId));
          setTabFallback(true);
        }
      }

      if (activeTab === "attendance") {
        const res = await getStudentAttendanceLogs(studentId);
        if (res.success && res.data && res.data.length > 0) {
          setAttendanceLogs(res.data);
        } else if (res.success && res.data) {
          setAttendanceLogs(res.data);
        } else {
          setAttendanceLogs(MOCK_ATTENDANCE_LOGS);
          setTabFallback(true);
        }
      }

      if (activeTab === "lms") {
        const res = await getStudentLMSProgress(studentId);
        if (res.success && res.data) {
          setLmsProgress(res.data);
        } else {
          setLmsProgress(MOCK_LMS_PROGRESS);
          setTabFallback(true);
        }
      }

      setTabLoading(false);
    };

    fetchTabData();
  }, [activeTab, studentId, student]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">Loading…</div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-slate-500">{error || "Student not found"}</p>
        <Link href="/students">
          <Button variant="outline" className="mt-4">
            Back to Students
          </Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "invoices" as const, label: "Invoices" },
    { id: "attendance" as const, label: "Attendance" },
    { id: "lms" as const, label: "LMS Progress" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/students">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#0f172a]">
              {student.first_name} {student.middle_name} {student.last_name}
            </h1>
            <p className="text-sm text-slate-500">Student ID: {student.student_id}</p>
          </div>
        </div>
        <Button asChild className="bg-[#2563eb] hover:bg-[#1d4ed8]">
          <Link href={`/students/${student.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Student
          </Link>
        </Button>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <Badge variant={student.verified ? "success" : "warning"}>
          {student.verified ? (
            <CheckCircle className="mr-1 h-3 w-3" />
          ) : (
            <XCircle className="mr-1 h-3 w-3" />
          )}
          {student.verified ? "Verified" : "Unverified"}
        </Badge>
        <Badge variant="secondary">{student.status.replace(/_/g, " ")}</Badge>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-[#2563eb] text-[#2563eb]"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Info */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-[#0f172a]">Personal Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Full Name:</span>
                <span className="font-medium">
                  {student.first_name} {student.middle_name} {student.last_name}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Date of Birth:</span>
                <span className="font-medium">{student.date_of_birth}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Droplets className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Blood Type:</span>
                <span className="font-medium">{student.blood_type}</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-[#0f172a]">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Address:</span>
                <span className="font-medium">{student.address}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Phone:</span>
                <span className="font-medium">+251 {student.phone_number || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Email:</span>
                <span className="font-medium">{student.email || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Enrollment Info */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-[#0f172a]">Enrollment Details</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Document ID:</span>
                <span className="font-medium">{student.document_id}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Enrolled:</span>
                <span className="font-medium">{new Date(student.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Batch ID:</span>
                <span className="font-medium">{student.batch_id}</span>
              </div>
            </div>
          </div>

          {/* Progress Info */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-[#0f172a]">Training Progress</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <BookOpen className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Theory Days:</span>
                <span className="font-medium">{student.theory_days_completed} completed</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Car className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Practical Days:</span>
                <span className="font-medium">{student.practical_days_completed} completed</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Award className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Mock Test Score:</span>
                <span className="font-medium">{student.mock_test_score}/100</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "invoices" && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          {tabFallback && (
            <p className="mb-4 text-sm text-amber-700">Showing sample data — API unavailable.</p>
          )}
          {tabLoading ? (
            <p className="text-slate-500">Loading invoices...</p>
          ) : invoices.length === 0 ? (
            <p className="text-slate-500">No invoices found for this student.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-2 py-2">Invoice #</th>
                    <th className="px-2 py-2">Type</th>
                    <th className="px-2 py-2">Amount</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b last:border-0">
                      <td className="px-2 py-2">
                        <Link href={`/invoices/${inv.id}`} className="text-[#2563eb] hover:underline">
                          {inv.invoice_number}
                        </Link>
                      </td>
                      <td className="px-2 py-2 capitalize">{inv.type.replace(/_/g, " ")}</td>
                      <td className="px-2 py-2">ETB {inv.amount.toLocaleString()}</td>
                      <td className="px-2 py-2 capitalize">{inv.status}</td>
                      <td className="px-2 py-2">{inv.due_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "attendance" && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          {tabFallback && (
            <p className="mb-4 text-sm text-amber-700">Showing sample data — API unavailable.</p>
          )}
          {tabLoading ? (
            <p className="text-slate-500">Loading attendance...</p>
          ) : attendanceLogs.length === 0 ? (
            <p className="text-slate-500">No attendance records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-2 py-2">Date</th>
                    <th className="px-2 py-2">Phase</th>
                    <th className="px-2 py-2">Present</th>
                    <th className="px-2 py-2">Instructor</th>
                    <th className="px-2 py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceLogs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0">
                      <td className="px-2 py-2">{log.attendance_date}</td>
                      <td className="px-2 py-2 capitalize">{log.phase}</td>
                      <td className="px-2 py-2">
                        <Badge variant={log.present ? "success" : "destructive"}>
                          {log.present ? "Present" : "Absent"}
                        </Badge>
                      </td>
                      <td className="px-2 py-2">{log.instructor_name ?? "—"}</td>
                      <td className="px-2 py-2">{log.notes ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "lms" && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          {tabFallback && (
            <p className="mb-4 text-sm text-amber-700">Showing sample data — API unavailable.</p>
          )}
          {tabLoading ? (
            <p className="text-slate-500">Loading LMS progress...</p>
          ) : !lmsProgress ? (
            <p className="text-slate-500">No LMS progress data available.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-semibold">Theory Progress</h3>
                <p className="text-sm text-slate-600">
                  {lmsProgress.theory.days_completed} / {lmsProgress.theory.days_required} days (
                  {lmsProgress.theory.percentage}%)
                </p>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-[#2563eb]"
                    style={{ width: `${Math.min(lmsProgress.theory.percentage, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Practical Progress</h3>
                <p className="text-sm text-slate-600">
                  {lmsProgress.practical.days_completed} / {lmsProgress.practical.days_required} days (
                  {lmsProgress.practical.percentage}%)
                </p>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${Math.min(lmsProgress.practical.percentage, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Mock Test</h3>
                <p className="text-sm text-slate-600">
                  Score: {lmsProgress.mock_test.score} / {lmsProgress.mock_test.required}{" "}
                  {lmsProgress.mock_test.passed ? "(Passed)" : "(Not passed)"}
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Next Milestone</h3>
                <p className="text-sm text-slate-600">{lmsProgress.next_milestone}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

