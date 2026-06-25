export const mockWedding = {
  name: "我的婚禮",
  weddingDate: new Date("2027-04-24"),
  venueName: "晶華酒店 · 宴會廳",
  venueDetail: "12:00 午宴 · 預估 12 桌 / 120 人",
};

export const mockKeyStats = {
  decisionsDecided: 2,
  decisionsTotal: 10,
  guestConfirmed: 0,
  guestTotal: 120,
};

export const mockUpcomingPayments = [
  { id: "p1", name: "婚禮顧問 · 訂金", note: "簽約後支付", amount: 20000, state: "overdue" as const },
  { id: "p2", name: "婚宴場地 · 第二期", note: "晶華酒店", amount: 60000, state: "due" as const },
  { id: "p3", name: "婚宴場地 · 訂金", note: "已付清", amount: 60000, state: "idle" as const },
];

export function daysUntil(date: Date) {
  const ms = date.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
