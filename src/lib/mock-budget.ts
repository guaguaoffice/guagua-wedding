import type { CategoryState } from "@/lib/mock-decisions";

export type BudgetLine = {
  id: string;
  name: string;
  note: string;
  amount: number;
  state: CategoryState;
  decisionSlug?: string;
};

export const mockBudgetSummary = {
  totalBudget: 650000,
  decidedSpend: 184000,
  paid: 60000,
};

export const mockBudgetLines: BudgetLine[] = [
  {
    id: "b-venue",
    name: "婚宴場地 · 晶華酒店",
    note: "1,280 / 桌 × 12 桌 · 已付訂金 60,000",
    amount: 184000,
    state: "done",
    decisionSlug: "venue",
  },
  {
    id: "b-planner",
    name: "婚禮顧問",
    note: "預估",
    amount: 60000,
    state: "overdue",
    decisionSlug: "planner",
  },
  {
    id: "b-dress",
    name: "婚紗禮服",
    note: "預估",
    amount: 45000,
    state: "due",
    decisionSlug: "dress",
  },
  {
    id: "b-photo",
    name: "婚紗攝影",
    note: "預估",
    amount: 65000,
    state: "due",
    decisionSlug: "photo",
  },
  {
    id: "b-other",
    name: "新祕 · 婚錄 · 婚戒 · 其他",
    note: "尚未估列",
    amount: 0,
    state: "idle",
  },
];

export const STATUS_LABEL: Record<CategoryState, string> = {
  done: "已定",
  due: "比較中",
  overdue: "比較中",
  idle: "未開始",
};

export const STATUS_CLASS: Record<CategoryState, string> = {
  done: "status-done",
  due: "status-due",
  overdue: "status-overdue",
  idle: "status-idle",
};
