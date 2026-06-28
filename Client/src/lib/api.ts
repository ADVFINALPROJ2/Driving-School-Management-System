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

import type { EnrollmentState, EnrollmentFormData } from "@/lib/enrollment-types";
import { UPLOAD_SLOTS } from "@/lib/validations";
import type { UserRole } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const DEFAULT_BATCH_ID = Number(process.env.NEXT_PUBLIC_DEFAULT_BATCH_ID || "1");

/** Generic fetch wrapper that auto-attaches the JWT and normalises the response. */
export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { ...authHeaders(options?.headers as Record<string, string>), ...options?.headers },
    });
    const json = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: json.error || "Request failed",
        errors: json.errors,
      };
    }
    return { success: true, data: json as T };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

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
        error: json.error?.message || json.error || "Failed to create student",
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

// ---------------------------------------------------------------------------
// New simplified EnrollmentFormData pipeline
// ---------------------------------------------------------------------------

// Maps the simplified EnrollmentFormData into the flat payload the backend
// expects.  Extra fields (email, phone, license_category, payment_method)
// are included so the backend can permit them later.
export function mapEnrollmentFormDataToPayload(data: EnrollmentFormData) {
  return {
    batch_id: DEFAULT_BATCH_ID,
    student_id: generateId("STU", data.phone),
    document_id: generateId("DOC", data.phone),
    first_name: data.firstName.trim(),
    last_name: data.lastName.trim(),
    date_of_birth: data.dateOfBirth,
    address: data.address.trim(),
    // Extra fields — the backend may permit these in future
    email: data.email.trim(),
    phone: data.phone.trim(),
    license_category: data.licenseCategory,
    payment_method: data.paymentMethod,
    payment_notes: data.paymentNotes?.trim() ?? "",
  };
}

// Builds a multipart/form-data request from the simplified form data.
// String fields are appended as `student[key]=value` and files are
// appended as `student[profile_photo]`, `student[yellow_card]`, etc.
// so the Rails backend can pick them up via params[:student][...].
export function buildFormDataFromEnrollmentFormData(
  data: EnrollmentFormData,
): FormData {
  const formData = new FormData();
  const payload = mapEnrollmentFormDataToPayload(data);

  Object.entries(payload).forEach(([key, value]) => {
    formData.append(`student[${key}]`, String(value));
  });

  // Attach each uploaded file to its respective slot
  // (backend expects keys like profile_photo, yellow_card, etc.)
  data.documents.forEach((file, index) => {
    formData.append(`student[document_${index}]`, file);
  });

  return formData;
}

// POST the simplified EnrollmentFormData to /api/v1/students.
export async function submitEnrollmentFormData(
  data: EnrollmentFormData,
): Promise<ApiResponse> {
  const formData = buildFormDataFromEnrollmentFormData(data);
  return createStudent(formData);
}

// GET /api/v1/students — returns the full student list.
export async function getStudents(): Promise<ApiResponse<Student[]>> {
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
    if (!response.ok) return { success: false, error: json.error?.message || json.error || "Student not found" };
    return { success: true, data: json.data ?? json };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

// GET /api/v1/batches — returns all enrolment batches (used for dropdowns / filtering).
export async function getBatches(): Promise<ApiResponse<Batch[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/batches`, { headers: authHeaders() });
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error?.message || json.error || "Failed to fetch batches" };
    return { success: true, data: json.data?.batches ?? json.data ?? json };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

// ─── Auth API ────────────────────────────────────────────────────────────────

export type User = {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  phone_number: string | null;
  is_qualified_instructor: boolean;
  created_at: string;
};

export async function login(
  email: string,
  password: string,
): Promise<ApiResponse<{ user: User; token: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auth: { email, password } }),
    });
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error?.message || json.error || "Login failed" };
    return { success: true, data: json.data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export async function register(
  data: {
    email: string;
    password: string;
    password_confirmation: string;
    full_name: string;
    phone_number?: string;
  },
): Promise<ApiResponse<{ user: User; token: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auth: data }),
    });
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error?.message || json.error || "Registration failed", errors: json.errors };
    return { success: true, data: json.data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export async function logout(): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error?.message || json.error || "Logout failed" };
    return { success: true, data: json.data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export async function getMe(): Promise<ApiResponse<{ user: User }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, { headers: authHeaders() });
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error?.message || json.error || "Not authenticated" };
    return { success: true, data: json.data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

// GET /api/v1/course_categories — returns enrollment course categories/pricing.
export async function getCourseCategories(): Promise<ApiResponse<CourseCategory[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/course_categories`, { headers: authHeaders() });
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error || "Failed to fetch course categories" };
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
    if (!response.ok) return { success: false, error: json.error?.message || json.error || "Failed to update student", errors: json.errors };
    return { success: true, data: json };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

// POST /api/v1/auth/login
export async function login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auth: { email, password } }),
    });
    const json = await response.json();
    if (!response.ok) {
      return { success: false, error: json.error?.message || json.error || "Invalid email or password" };
    }
    const token = json.data?.token;
    if (token) setToken(token);
    return { success: true, data: json.data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

// DELETE /api/v1/auth/logout
export async function logout(): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    clearToken();
    const json = await response.json();
    return { success: true, data: json };
  } catch {
    clearToken();
    return { success: true };
  }
}

// POST /api/v1/auth/refresh — issues a new token with a fresh 1-hour expiry.
// Call this before the current token expires to keep the session alive.
export async function refreshToken(): Promise<ApiResponse<{ user: User; token: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: authHeaders(),
    });
    const json = await response.json();
    if (!response.ok) {
      clearToken();
      return { success: false, error: json.error || "Token refresh failed" };
    }
    if (json.data?.token) setToken(json.data.token);
    return { success: true, data: json.data };
  } catch (err) {
    clearToken();
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

// Decodes the payload of a JWT without verifying the signature.
// Returns null if the token is malformed.
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

/** Returns the number of seconds until the JWT expires, or 0 if unreadable. */
export function getJwtExpiresIn(token: string): number {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return 0;
  return Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
}

// GET /api/v1/auth/me
export async function getMe(): Promise<ApiResponse<{ user: User }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, { headers: authHeaders() });
    const json = await response.json();
    if (!response.ok) {
      clearToken();
      return { success: false, error: json.error || "Session expired" };
    }
    return { success: true, data: json.data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export type User = {
  id: number;
  email: string;
  full_name: string;
  role: "admin" | "instructor" | "clerk" | "student";
  phone_number: string | null;
  is_qualified_instructor: boolean;
  created_at: string;
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
  license_category: string | null;
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

<<<<<<< HEAD
// ─── Invoice API ─────────────────────────────────────────────────────────────

export type InvoiceStatus = "paid" | "unpaid" | "overdue";

export type Invoice = {
  id: number;
  invoice_number: string;
  student_name: string;
  student_id: number;
  type: string;
  amount: number;
  status: InvoiceStatus;
  due_date: string;
  payment_date?: string;
  payment_method?: string;
  payment_reference?: string;
  description?: string;
  created_at: string;
};

type RawInvoice = {
  id: number;
  invoice_number: string;
  student_id: number;
  student_name?: string;
  invoice_type?: string;
  type?: string;
  amount: number;
  status: string;
  due_date: string;
  paid_at?: string;
  payment_date?: string;
  payment_method?: string;
  payment_reference?: string;
  description?: string;
  created_at: string;
};

export function normalizeInvoice(raw: RawInvoice): Invoice {
  const status =
    raw.status === "pending"
      ? "unpaid"
      : raw.status === "paid" || raw.status === "overdue"
        ? raw.status
        : "unpaid";

  return {
    id: raw.id,
    invoice_number: raw.invoice_number,
    student_name: raw.student_name ?? "Unknown Student",
    student_id: raw.student_id,
    type: raw.invoice_type ?? raw.type ?? "unknown",
    amount: Number(raw.amount),
    status,
    due_date: raw.due_date,
    payment_date: raw.paid_at ?? raw.payment_date,
    payment_method: raw.payment_method,
    payment_reference: raw.payment_reference,
    description: raw.description,
    created_at: raw.created_at,
  };
}

function parseInvoiceList(json: { data?: unknown }): Invoice[] {
  const raw = json.data;
  const list = Array.isArray(raw) ? raw : (raw as { invoices?: RawInvoice[] })?.invoices ?? [];
  return (list as RawInvoice[]).map(normalizeInvoice);
}

export async function getInvoices(params?: {
  status?: string;
  invoice_type?: string;
  student_id?: number;
}): Promise<ApiResponse<Invoice[]>> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.set("status", params.status);
    if (params?.invoice_type) queryParams.set("invoice_type", params.invoice_type);
    if (params?.student_id) queryParams.set("student_id", params.student_id.toString());

    const response = await fetch(
      `${API_BASE_URL}/api/v1/invoices?${queryParams.toString()}`,
      { headers: authHeaders() }
    );
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error?.message || json.error || "Failed to fetch invoices" };
    return { success: true, data: parseInvoiceList(json) };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export async function getInvoice(id: number): Promise<ApiResponse<Invoice>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/invoices/${id}`, {
      headers: authHeaders(),
    });
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error?.message || json.error || "Failed to fetch invoice" };
    const raw = json.data?.invoice ?? json.data ?? json;
    return { success: true, data: normalizeInvoice(raw as RawInvoice) };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export async function markInvoicePaid(id: number, paymentDetails?: {
  amount?: number;
  payment_method?: string;
  payment_date?: string;
  notes?: string;
}): Promise<ApiResponse<Invoice>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/invoices/${id}/mark_paid`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(paymentDetails || {}),
    });
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error?.message || json.error || "Failed to mark invoice as paid" };
    const raw = json.data?.invoice ?? json.data ?? json;
    return { success: true, data: normalizeInvoice(raw as RawInvoice) };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

// ─── Financial Reports API ───────────────────────────────────────────────────

export type FinancialSummary = {
  total_revenue: number;
  invoice_count: number;
  average_invoice: number;
  student_count: number;
  collections: {
    total_issued: number;
    total_collected: number;
    collection_rate: number;
    pending_amount: number;
    overdue_amount: number;
  };
  outstanding: {
    total_outstanding: number;
    pending_count: number;
    overdue_count: number;
  };
};

export type RevenueTrend = { date: string; amount: number };

export type MonthlyComparison = {
  month: string;
  total_issued: number;
  total_collected: number;
  collection_rate: number;
};

export type CollectionsReport = {
  collection_summary: FinancialSummary["collections"];
  outstanding_summary: FinancialSummary["outstanding"];
};

export type LMSProgress = {
  status: string;
  theory: { days_completed: number; days_required: number; percentage: number; complete: boolean };
  practical: { days_completed: number; days_required: number; percentage: number; complete: boolean };
  mock_test: { score: number; required: number; passed: boolean };
  next_milestone: string;
  exam_eligible: boolean;
};

export type AttendanceLog = {
  id: number;
  phase: string;
  attendance_date: string;
  present: boolean;
  instructor_name?: string;
  notes?: string | null;
};

export type ActivityItem = {
  id: string;
  type: "student_registered" | "invoice_paid" | "invoice_created";
  title: string;
  description: string;
  timestamp: string;
};

function normalizeFinancialSummary(raw: Record<string, unknown>): FinancialSummary {
  const revenue = (raw.revenue ?? {}) as Record<string, number>;
  const collections = (raw.collections ?? {}) as FinancialSummary["collections"];
  const outstanding = (raw.outstanding ?? {}) as FinancialSummary["outstanding"];

  return {
    total_revenue: revenue.total_revenue ?? 0,
    invoice_count: revenue.invoice_count ?? 0,
    average_invoice: revenue.average_invoice ?? 0,
    student_count: revenue.student_count ?? 0,
    collections: {
      total_issued: collections.total_issued ?? 0,
      total_collected: collections.total_collected ?? 0,
      collection_rate: collections.collection_rate ?? 0,
      pending_amount: collections.pending_amount ?? 0,
      overdue_amount: collections.overdue_amount ?? 0,
    },
    outstanding: {
      total_outstanding: outstanding.total_outstanding ?? 0,
      pending_count: outstanding.pending_count ?? 0,
      overdue_count: outstanding.overdue_count ?? 0,
    },
  };
}

export function buildActivityFeed(students: Student[], invoices: Invoice[]): ActivityItem[] {
  const items: ActivityItem[] = [];

  students.slice(0, 10).forEach((s) => {
    items.push({
      id: `student-${s.id}`,
      type: "student_registered",
      title: "New student registered",
      description: `${s.first_name} ${s.last_name} (${s.student_id})`,
      timestamp: s.created_at,
    });
  });

  invoices.slice(0, 10).forEach((inv) => {
    items.push({
      id: `invoice-${inv.id}`,
      type: inv.status === "paid" ? "invoice_paid" : "invoice_created",
      title: inv.status === "paid" ? "Payment received" : "Invoice issued",
      description: `${inv.invoice_number} — ${inv.student_name} — ETB ${inv.amount.toLocaleString()}`,
      timestamp: inv.payment_date ?? inv.created_at,
    });
  });

  return items
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);
}

export async function getFinancialSummary(startDate?: string, endDate?: string): Promise<ApiResponse<FinancialSummary>> {
  try {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.set("start_date", startDate);
    if (endDate) queryParams.set("end_date", endDate);

    const response = await fetch(
      `${API_BASE_URL}/api/v1/financial_reports/summary?${queryParams.toString()}`,
      { headers: authHeaders() }
    );
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error?.message || json.error || "Failed to fetch financial summary" };
    return { success: true, data: normalizeFinancialSummary(json.data ?? json) };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export async function getFinancialRevenue(startDate?: string, endDate?: string): Promise<ApiResponse<{ trends: RevenueTrend[] }>> {
  try {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.set("start_date", startDate);
    if (endDate) queryParams.set("end_date", endDate);

    const response = await fetch(
      `${API_BASE_URL}/api/v1/financial_reports/revenue?${queryParams.toString()}`,
      { headers: authHeaders() }
    );
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error?.message || json.error || "Failed to fetch revenue data" };
    const data = json.data ?? json;
    const trends = (data.trends ?? data.revenue_summary?.trends ?? []) as RevenueTrend[];
    return { success: true, data: { trends } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export async function getFinancialCollections(startDate?: string, endDate?: string): Promise<ApiResponse<CollectionsReport>> {
  try {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.set("start_date", startDate);
    if (endDate) queryParams.set("end_date", endDate);

    const response = await fetch(
      `${API_BASE_URL}/api/v1/financial_reports/collections?${queryParams.toString()}`,
      { headers: authHeaders() }
    );
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error?.message || json.error || "Failed to fetch collections data" };
    const data = json.data ?? json;
    return {
      success: true,
      data: {
        collection_summary: {
          total_issued: data.collection_summary?.total_issued ?? 0,
          total_collected: data.collection_summary?.total_collected ?? 0,
          collection_rate: data.collection_summary?.collection_rate ?? 0,
          pending_amount: data.collection_summary?.pending_amount ?? 0,
          overdue_amount: data.collection_summary?.overdue_amount ?? 0,
        },
        outstanding_summary: {
          total_outstanding: data.outstanding_summary?.total_outstanding ?? 0,
          pending_count: data.outstanding_summary?.pending_count ?? 0,
          overdue_count: data.outstanding_summary?.overdue_count ?? 0,
        },
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export async function getMonthlyComparison(startDate?: string, endDate?: string): Promise<ApiResponse<MonthlyComparison[]>> {
  try {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.set("start_date", startDate);
    if (endDate) queryParams.set("end_date", endDate);

    const response = await fetch(
      `${API_BASE_URL}/api/v1/financial_reports/monthly_comparison?${queryParams.toString()}`,
      { headers: authHeaders() }
    );
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error?.message || json.error || "Failed to fetch monthly comparison" };
    const data = json.data ?? json;
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export async function exportFinancialReport(startDate?: string, endDate?: string): Promise<ApiResponse<Blob>> {
  try {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.set("start_date", startDate);
    if (endDate) queryParams.set("end_date", endDate);

    const response = await fetch(
      `${API_BASE_URL}/api/v1/financial_reports/export?${queryParams.toString()}`,
      { headers: authHeaders() }
    );
    if (!response.ok) return { success: false, error: "Failed to export report" };
    const blob = await response.blob();
    return { success: true, data: blob };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export async function reconcilePayments(): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/financial_reports/reconcile`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
    });
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error?.message || json.error || "Failed to reconcile payments" };
    return { success: true, data: json.data ?? json };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

// ─── Student Nested Endpoints ─────────────────────────────────────────────────

export async function getStudentInvoices(studentId: number): Promise<ApiResponse<Invoice[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/students/${studentId}/invoices`, {
      headers: authHeaders(),
    });
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error?.message || json.error || "Failed to fetch student invoices" };
    return { success: true, data: parseInvoiceList(json) };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export async function getStudentAttendanceLogs(studentId: number): Promise<ApiResponse<AttendanceLog[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/students/${studentId}/attendance_logs`, {
      headers: authHeaders(),
    });
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error?.message || json.error || "Failed to fetch attendance logs" };
    const data = json.data ?? json;
    return { success: true, data: Array.isArray(data) ? data : data?.attendance_logs ?? [] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export async function getStudentLMSProgress(studentId: number): Promise<ApiResponse<LMSProgress>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/students/${studentId}/lms_progress`, {
      headers: authHeaders(),
    });
    const json = await response.json();
    if (!response.ok) return { success: false, error: json.error?.message || json.error || "Failed to fetch LMS progress" };
    return { success: true, data: json.data ?? json };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}
=======
// Type shape returned by GET /api/v1/course_categories.
// Mirrors the structure in backend/config/course_categories.yml.
export type CourseCategory = {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  duration_days: number;
  registration_fee: number;
  requirements: { text: string; icon: string }[];
};
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
