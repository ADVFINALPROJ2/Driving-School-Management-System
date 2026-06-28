
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

export const MOCK_INVOICES = [
  {
    id: 1,
    invoice_number: "INV-001",
    student_name: "Abebe Kebede",
    student_id: 1,
    invoice_type: "registration",
    amount: 4000,
    status: "paid",
    milestone_type: "registration",
    paid_at: "2024-01-10",
    due_date: "2024-01-15",
    description: "Registration fee",
    created_at: "2024-01-05",
  },
  {
    id: 2,
    invoice_number: "INV-002",
    student_name: "Tirunesh Dibaba",
    student_id: 2,
    invoice_type: "milestone_2",
    amount: 4000,
    status: "unpaid",
    milestone_type: "milestone_2",
    paid_at: null,
    due_date: "2024-02-15",
    description: "Milestone 2 payment",
    created_at: "2024-02-01",
  },
  {
    id: 3,
    invoice_number: "INV-003",
    student_name: "Haile Gebrselassie",
    student_id: 3,
    invoice_type: "milestone_1",
    amount: 3000,
    status: "overdue",
    milestone_type: "milestone_1",
    paid_at: null,
    due_date: "2024-01-20",
    description: "Milestone 1 payment",
    created_at: "2024-01-15",
  },
];

export const MOCK_FINANCIAL_SUMMARY: FinancialSummary = {
  total_revenue: 450000,
  invoice_count: 75,
  average_invoice: 6000,
  student_count: 45,
  collections: {
    total_issued: 500000,
    total_collected: 450000,
    collection_rate: 90,
    pending_amount: 30000,
    overdue_amount: 20000,
  },
  outstanding: {
    total_outstanding: 50000,
    pending_count: 15,
    overdue_count: 5,
  },
};

export const MOCK_REVENUE_TRENDS = [
  { date: "2024-01-01", amount: 12000 },
  { date: "2024-01-08", amount: 18000 },
  { date: "2024-01-15", amount: 15000 },
  { date: "2024-01-22", amount: 22000 },
  { date: "2024-01-29", amount: 19000 },
];

export const MOCK_MONTHLY_COMPARISON = [
  { month: "April 2024", total_issued: 120000, total_collected: 108000, collection_rate: 90 },
  { month: "May 2024", total_issued: 135000, total_collected: 121500, collection_rate: 90 },
  { month: "June 2024", total_issued: 145000, total_collected: 130500, collection_rate: 90 },
];

export const MOCK_COLLECTIONS = {
  collection_summary: {
    total_issued: 500000,
    total_collected: 450000,
    collection_rate: 90,
    pending_amount: 30000,
    overdue_amount: 20000,
  },
  outstanding_summary: {
    total_outstanding: 50000,
    pending_count: 15,
    overdue_count: 5,
  },
};

export const MOCK_ATTENDANCE_LOGS = [
  {
    id: 1,
    phase: "theory",
    attendance_date: "2024-06-01",
    present: true,
    instructor_name: "John Instructor",
    notes: null,
  },
  {
    id: 2,
    phase: "theory",
    attendance_date: "2024-06-02",
    present: true,
    instructor_name: "John Instructor",
    notes: null,
  },
  {
    id: 3,
    phase: "practical",
    attendance_date: "2024-06-03",
    present: false,
    instructor_name: "Sarah Instructor",
    notes: "Absent — rescheduled",
  },
];

export const MOCK_LMS_PROGRESS = {
  status: "theory_in_progress",
  theory: { days_completed: 12, days_required: 35, percentage: 34.3, complete: false },
  practical: { days_completed: 0, days_required: 52, percentage: 0, complete: false },
  mock_test: { score: 28, required: 37, passed: false },
  next_milestone: "Complete 35 theory days and score > 37 on mock test",
  exam_eligible: false,
};
