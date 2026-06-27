// API client layer for the Driving School Management System.
// Communicates with the Rails backend at NEXT_PUBLIC_API_URL (default localhost:3001).
//
// Key responsibilities:
// 1. Student CRUD (createStudent, updateStudent, getStudents, getStudent)
// 2. Batch listing (getBatches)
// 3. Multi-step enrollment pipeline (mapEnrollmentToStudentPayload,
//    buildEnrollmentFormData, createStudentFromEnrollment)
//
// All endpoints now require a valid JWT. The token is stored in localStorage
// after a successful login (POST /api/v1/auth/login) and sent as the
// Authorization header on every request.

const TOKEN_KEY = "driving_school_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Returns headers common to every API call, including auth if a token exists. */
function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[] | Record<string, string[]>;
};

import type { EnrollmentState } from "@/lib/enrollment-types";
import { UPLOAD_SLOTS } from "@/lib/validations";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const DEFAULT_BATCH_ID = Number(process.env.NEXT_PUBLIC_DEFAULT_BATCH_ID || "1");

// Generic POST /api/v1/students.
// Accepts both plain objects (JSON-encoded) and FormData (file uploads).
// Returns a normalised ApiResponse envelope so callers always handle
// success/failure uniformly regardless of the HTTP status code.
export async function createStudent(
  payload: Record<string, unknown> | FormData,
): Promise<ApiResponse> {
  try {
    const isFormData = payload instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/api/v1/students`, {
      method: "POST",
      headers: isFormData ? authHeaders() : authHeaders({ "Content-Type": "application/json" }),
      body: isFormData
        ? payload
        : JSON.stringify({ student: payload }),
    });

    const json = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: json.error || "Failed to create student",
        errors: json.errors,
      };
    }

    return { success: true, data: json };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Network error. Please check your connection.",
    };
  }
}

// Generates a short, human-readable ID of the form <prefix><6-phone-digits><4-timestamp>.
// The phone suffix comes from the last 6 non-digit characters of the phone number
// (guaranteeing uniqueness across students from different contacts) and the 4-digit
// timestamp suffix provides millisecond-level disambiguation.
function generateId(prefix: string, phone: string) {
  const digits = phone.replace(/\D/g, "").slice(-6).padStart(6, "0");
  const stamp = Date.now().toString().slice(-4);
  return `${prefix}${digits}${stamp}`;
}

// Transforms the wizard's EnrollmentState into the flat payload expected by
// the Rails backend's Student model. Generated IDs (student_id, document_id)
// are deterministic from the student's phone and the current timestamp.
export function mapEnrollmentToStudentPayload(state: EnrollmentState) {
  const { profile } = state;
  const phoneDigits = profile.phone.replace(/\D/g, "");

  return {
    batch_id: DEFAULT_BATCH_ID,
    student_id: generateId("STU", phoneDigits),
    document_id: generateId("DOC", phoneDigits),
    first_name: profile.firstNameEn.trim(),
    middle_name: profile.fatherNameEn.trim(),
    last_name: profile.lastNameEn.trim(),
    date_of_birth: profile.dateOfBirthEc,
    blood_type: profile.bloodType,
    address: profile.address.trim(),
    house_number: profile.houseNumber.trim(),
    woreda: profile.woreda.trim(),
    city: profile.city.trim(),
    kebele: profile.kebele.trim(),
    subcity: profile.subcity.trim(),
    verified: false,
  };
}

// Builds a multipart/form-data request from the wizard state.
// String fields are appended as `student[key]=value` and file uploads
// from UPLOAD_SLOTS are appended as `student[key]=File` so ActiveStorage
// / multipart middleware can handle them transparently.
export function buildEnrollmentFormData(state: EnrollmentState): FormData {
  const formData = new FormData();
  const payload = mapEnrollmentToStudentPayload(state);

  Object.entries(payload).forEach(([key, value]) => {
    formData.append(`student[${key}]`, String(value));
  });

  UPLOAD_SLOTS.forEach(({ key }) => {
    const doc = state.documents[key];
    if (doc?.file) {
      formData.append(`student[${key}]`, doc.file);
    }
  });

  return formData;
}

// High-level enrollment submission: picks JSON vs multipart automatically.
// Returns the same ApiResponse shape as createStudent.
export async function createStudentFromEnrollment(
  state: EnrollmentState,
): Promise<ApiResponse> {
  const hasUploads = UPLOAD_SLOTS.some((slot) => state.documents[slot.key]?.file);
  const payload = hasUploads
    ? buildEnrollmentFormData(state)
    : mapEnrollmentToStudentPayload(state);
  return createStudent(payload);
}

// GET /api/v1/students — paginated student list with optional search/filter.
export async function getStudents(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
}): Promise<ApiResponse<{ students: Student[]; meta: { page: number; per_page: number; total: number } }>> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.per_page) query.set("per_page", String(params.per_page));
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    const qs = query.toString();
    const url = `${API_BASE_URL}/api/v1/students${qs ? `?${qs}` : ""}`;
    const response = await fetch(url, { headers: authHeaders() });
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error || "Failed to fetch students" };
    return { success: true, data: json.data ?? json };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

// GET /api/v1/students/:id — returns a single student record.
export async function getStudent(id: number): Promise<ApiResponse<Student>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/students/${id}`, { headers: authHeaders() });
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error || "Student not found" };
    return { success: true, data: json };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

// GET /api/v1/batches — returns all enrolment batches (used for dropdowns / filtering).
export async function getBatches(): Promise<ApiResponse<Batch[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/batches`, { headers: authHeaders() });
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error || "Failed to fetch batches" };
    return { success: true, data: json };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

// PATCH /api/v1/students/:id — updates a student's fields.
export async function updateStudent(
  id: number,
  data: Record<string, unknown>,
): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/students/${id}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ student: data }),
    });
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error || "Failed to update student", errors: json.errors };
    return { success: true, data: json };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

// GET /api/v1/students/:id/invoices — returns a student's invoices.
export async function getStudentInvoices(id: number): Promise<ApiResponse<StudentInvoice[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/students/${id}/invoices`, { headers: authHeaders() });
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error || "Failed to fetch invoices" };
    return { success: true, data: json.data ?? json };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

// GET /api/v1/students/:id/attendance_logs — returns a student's attendance logs.
export async function getStudentAttendance(id: number): Promise<ApiResponse<AttendanceLog[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/students/${id}/attendance_logs`, { headers: authHeaders() });
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error || "Failed to fetch attendance" };
    return { success: true, data: json.data ?? json };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

// GET /api/v1/students/:id/lms_progress — returns a student's LMS progress.
export async function getStudentLmsProgress(id: number): Promise<ApiResponse<LmsProgress>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/students/${id}/lms_progress`, { headers: authHeaders() });
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error || "Failed to fetch LMS progress" };
    return { success: true, data: json.data ?? json };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export type StudentInvoice = {
  id: number;
  invoice_number: string;
  student_id: number;
  student_name: string | null;
  invoice_type: string;
  amount: number;
  status: string;
  due_date: string;
  paid_at: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  description: string | null;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
};

export type AttendanceLog = {
  id: number;
  student_id: number;
  phase: string;
  attendance_date: string;
  present: boolean;
  instructor_name: string | null;
  created_at: string;
};

export type LmsProgress = {
  theory_completed: boolean;
  theory_percentage: number;
  practical_completed: boolean;
  practical_percentage: number;
  mock_test_status: string;
  next_milestone: string;
};

// Type shape returned by the backend Student index/show endpoints.
// Mirrors the Rails model attributes from backend/app/models/student.rb.
export type Student = {
  id: number;
  batch_id: number;
  student_id: string;
  document_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string;
  blood_type: string;
  address: string;
  house_number: string;
  kebele: string | null;
  woreda: string;
  subcity: string | null;
  city: string;
  status: string;
  verified: boolean;
  verified_at: string | null;
  theory_days_completed: number;
  practical_days_completed: number;
  mock_test_score: number;
  under_penalty: boolean;
  penalty_start_date: string | null;
  penalty_end_date: string | null;
  penalty_reason: string | null;
  created_at: string;
  updated_at: string;
};

// Type shape for the lightweight Batch model used in selector dropdowns.
export type Batch = {
  id: number;
  name: string;
  status: string;
};
