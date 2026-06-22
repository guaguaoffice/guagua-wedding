export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";

export type BudgetItem = {
  id: string;
  name: string;
  category: string;
  totalAmount: number;
  depositAmount?: number;
  finalAmount?: number;
  paidAmount: number;
  status: PaymentStatus;
  dueDate?: string;
  decisionSlug?: string;
};

export const mockTotalBudget = 900000;

export const mockBudgetItems: BudgetItem[] = [
  {
    id: "b1",
    name: "La Belle 婚紗",
    category: "婚紗",
    totalAmount: 88000,
    depositAmount: 20000,
    finalAmount: 68000,
    paidAmount: 20000,
    status: "PARTIAL",
    dueDate: "2026-09-01",
    decisionSlug: "dress",
  },
  {
    id: "b2",
    name: "光影紀錄工作室 婚攝訂金",
    category: "婚攝",
    totalAmount: 38000,
    depositAmount: 10000,
    paidAmount: 0,
    status: "UNPAID",
    dueDate: "2026-07-10",
    decisionSlug: "photographer",
  },
  {
    id: "b3",
    name: "喜餅訂購",
    category: "喜餅",
    totalAmount: 45000,
    paidAmount: 45000,
    status: "PAID",
  },
];

export const STATUS_LABEL: Record<PaymentStatus, string> = {
  UNPAID: "未付款",
  PARTIAL: "部分付款",
  PAID: "已付清",
};

export const STATUS_STYLE: Record<PaymentStatus, string> = {
  UNPAID: "bg-card-hover text-muted",
  PARTIAL: "bg-accent-soft text-accent",
  PAID: "bg-accent text-white",
};
