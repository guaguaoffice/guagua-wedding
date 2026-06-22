export const mockWedding = {
  name: "Allen & Mia 的婚禮",
  weddingDate: new Date("2026-12-25"),
  overallProgress: 32,
};

export const mockWeeklyTasks = [
  { id: "1", title: "確認婚攝", done: false },
  { id: "2", title: "預約婚紗試穿", done: false },
];

export const mockPendingDecisions = [
  { id: "1", title: "婚宴場地", candidateCount: 3 },
  { id: "2", title: "婚紗店", candidateCount: 4 },
];

export const mockPendingPayments = [
  { id: "1", name: "婚攝訂金", amount: 10000, dueDate: "2026-07-10" },
];

export const mockActivities = [
  { id: "1", actor: "媽媽", action: "新增 5 位親戚", time: "2 小時前" },
  { id: "2", actor: "另一半", action: "新增 2 個婚紗候選", time: "5 小時前" },
];

export const mockMembers = [
  { id: "1", name: "新娘", avatarColor: "#69ac90" },
  { id: "2", name: "新郎", avatarColor: "#7a9e8e" },
  { id: "3", name: "媽媽", avatarColor: "#c4d8ce" },
];

export const mockReminders = [
  { id: "1", text: "喜帖印製需於 2 週前確認設計稿" },
];

export function daysUntil(date: Date) {
  const ms = date.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
