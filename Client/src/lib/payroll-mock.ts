// Mock data for Payroll feature.
// TODO: Replace with real API calls to GET /api/v1/payroll when the endpoint is available.
// TODO: Replace POST /api/v1/payroll/:id/mark-as-paid when available.
// TODO: Replace GET /api/v1/payroll/:id/payslip when available.

export type PayrollStatus = "paid" | "pending";

export type PaymentRecord = {
  id: number;
  date: string;
  amount: number;
  method: string;
  status: string;
};

export type PayrollStaff = {
  id: number;
  name: string;
  role: "instructor" | "receptionist" | "admin";
  phone: string;
  email: string;
  base_salary: number;
  hours_this_month: number;
  hourly_rate: number;
  deductions: number;
  calculated_pay: number;
  status: PayrollStatus;
  payment_history: PaymentRecord[];
};

export const mockPayrollStaff: PayrollStaff[] = [
  {
    id: 1,
    name: "Abebe Kebede",
    role: "instructor",
    phone: "+251-911-123456",
    email: "abebe.kebede@drivingschool.et",
    base_salary: 15000,
    hours_this_month: 160,
    hourly_rate: 93.75,
    deductions: 1500,
    calculated_pay: 13500,
    status: "paid",
    payment_history: [
      { id: 1, date: "2026-05-28", amount: 13500, method: "Bank Transfer", status: "completed" },
      { id: 2, date: "2026-04-28", amount: 13000, method: "Bank Transfer", status: "completed" },
    ],
  },
  {
    id: 2,
    name: "Sara Hailu",
    role: "instructor",
    phone: "+251-922-654321",
    email: "sara.hailu@drivingschool.et",
    base_salary: 18000,
    hours_this_month: 172,
    hourly_rate: 104.65,
    deductions: 2000,
    calculated_pay: 16000,
    status: "pending",
    payment_history: [
      { id: 3, date: "2026-05-28", amount: 16000, method: "Bank Transfer", status: "pending" },
    ],
  },
  {
    id: 3,
    name: "Mekdes Tadesse",
    role: "receptionist",
    phone: "+251-933-789012",
    email: "mekdes.tadesse@drivingschool.et",
    base_salary: 10000,
    hours_this_month: 150,
    hourly_rate: 66.67,
    deductions: 1000,
    calculated_pay: 9000,
    status: "pending",
    payment_history: [
      { id: 4, date: "2026-05-28", amount: 9000, method: "Mobile Money", status: "pending" },
    ],
  },
  {
    id: 4,
    name: "Yonas Desta",
    role: "admin",
    phone: "+251-944-345678",
    email: "yonas.desta@drivingschool.et",
    base_salary: 25000,
    hours_this_month: 160,
    hourly_rate: 156.25,
    deductions: 3000,
    calculated_pay: 22000,
    status: "paid",
    payment_history: [
      { id: 5, date: "2026-05-28", amount: 22000, method: "Bank Transfer", status: "completed" },
      { id: 6, date: "2026-04-28", amount: 21500, method: "Bank Transfer", status: "completed" },
      { id: 7, date: "2026-03-28", amount: 21500, method: "Bank Transfer", status: "completed" },
    ],
  },
  {
    id: 5,
    name: "Hanna Wondimu",
    role: "instructor",
    phone: "+251-955-567890",
    email: "hanna.wondimu@drivingschool.et",
    base_salary: 16000,
    hours_this_month: 148,
    hourly_rate: 108.11,
    deductions: 1800,
    calculated_pay: 14200,
    status: "pending",
    payment_history: [],
  },
  {
    id: 6,
    name: "Biruk Alemu",
    role: "receptionist",
    phone: "+251-966-789012",
    email: "biruk.alemu@drivingschool.et",
    base_salary: 11000,
    hours_this_month: 165,
    hourly_rate: 66.67,
    deductions: 1200,
    calculated_pay: 9800,
    status: "paid",
    payment_history: [
      { id: 8, date: "2026-05-28", amount: 9800, method: "Mobile Money", status: "completed" },
    ],
  },
];
