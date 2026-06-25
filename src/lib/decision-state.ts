export type CategoryState = "done" | "due" | "overdue" | "idle";

const DUE_SOON_DAYS = 75;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function computeDecisionState(
  suggestedDecideBy: Date | null,
  decided: boolean
): CategoryState {
  if (decided) return "done";
  if (!suggestedDecideBy) return "idle";
  const days = (suggestedDecideBy.getTime() - Date.now()) / MS_PER_DAY;
  if (days < 0) return "overdue";
  if (days <= DUE_SOON_DAYS) return "due";
  return "idle";
}

export function formatDecideByDate(date: Date | null) {
  if (!date) return "未排定日期";
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString("zh-Hant", {
    year: sameYear ? undefined : "numeric",
    month: "long",
    day: "numeric",
  });
}

export const STATUS_TEXT: Record<CategoryState, string> = {
  done: "已定",
  due: "本月該定",
  overdue: "逾期 · 比較中",
  idle: "未開始",
};

export function daysUntil(date: Date) {
  const ms = date.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / MS_PER_DAY));
}
