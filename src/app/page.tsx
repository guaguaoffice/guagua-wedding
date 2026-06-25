import Link from "next/link";
import {
  daysUntil,
  mockKeyStats,
  mockUpcomingPayments,
  mockWedding,
} from "@/lib/mock-data";
import { mockDecisionItems } from "@/lib/mock-decisions";
import { mockTasks } from "@/lib/mock-tasks";
import { mockBudgetSummary } from "@/lib/mock-budget";

const STATE_LABEL = { overdue: "逾期", due: "本月該定" } as const;
const STATE_CLASS = { overdue: "status-overdue", due: "status-due" } as const;

export default function HomePage() {
  const days = daysUntil(mockWedding.weddingDate);
  const focusItems = mockDecisionItems.filter(
    (d) => d.state === "overdue" || d.state === "due"
  );
  const overdueCount = focusItems.filter((d) => d.state === "overdue").length;
  const remaining =
    mockBudgetSummary.totalBudget - mockBudgetSummary.decidedSpend;
  const openTasks = mockTasks.filter((t) => !t.done).slice(0, 3);

  return (
    <div className="animate-fade-in">
      <div className="text-[11px] tracking-[0.16em] uppercase text-accent-hover font-bold">
        總覽
      </div>
      <h1 className="text-[25px] md:text-[30px] font-bold tracking-tight mt-0.5 mb-0.5">
        嗨，準備得不錯
      </h1>
      <p className="text-text-soft text-sm">
        這個月最重要的事：把婚紗和婚攝定下來，並補上逾期的婚顧。
      </p>

      <div className="hero flex items-center gap-5 flex-wrap p-5 mt-4">
        <div className="font-display font-semibold text-[46px] text-accent-hover leading-[0.95]">
          {days}
          <small className="font-sans text-sm text-text-soft font-medium block mt-0.5">
            天後 ·{" "}
            {mockWedding.weddingDate.toLocaleDateString("zh-Hant", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
            （
            {mockWedding.weddingDate.toLocaleDateString("zh-Hant", {
              weekday: "narrow",
            })}
            ）
          </small>
        </div>
        <div className="flex-1 min-w-[180px]">
          <div className="font-bold text-[15px]">{mockWedding.venueName}</div>
          <div className="text-text-soft text-[13px] mt-0.5">
            {mockWedding.venueDetail}
          </div>
        </div>
      </div>

      {focusItems.length > 0 && (
        <div className="card mt-3.5 overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-2 font-bold text-sm">
            需要你決定
            {overdueCount > 0 && (
              <span className="bg-coral text-white text-[11px] font-bold px-2 py-0.5 rounded-full ml-auto">
                {overdueCount} 項逾期
              </span>
            )}
          </div>
          {focusItems.map((item) => (
            <Link
              key={item.id}
              href={`/plan?open=${item.slug}`}
              className="flex items-center gap-3 px-4 py-3 border-t border-border hover:bg-card-hover"
            >
              <span className={`status ${STATE_CLASS[item.state as "overdue" | "due"]}`}>
                {STATE_LABEL[item.state as "overdue" | "due"]}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14.5px]">{item.title}</div>
                <div className="text-xs text-text-soft mt-0.5">
                  {item.metaText}
                </div>
              </div>
              <svg
                viewBox="0 0 24 24"
                className="w-[17px] h-[17px] stroke-text-faint fill-none"
                strokeWidth={2}
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-[22px] mb-2.5 mx-0.5">
        <span className="text-[12.5px] font-bold text-text-soft">
          關鍵概況
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/plan?tab=tl" className="panel block animate-slide-up">
          <div className="text-xs text-text-soft tracking-wide">決策進度</div>
          <div className="font-display font-semibold text-[26px] mt-1 leading-none">
            {mockKeyStats.decisionsDecided}
            <small className="font-sans text-xs text-text-soft font-normal">
              {" "}
              / {mockKeyStats.decisionsTotal}
            </small>
          </div>
          <div className="h-[7px] rounded-full bg-card-hover mt-[11px] overflow-hidden">
            <div
              className="h-full rounded-full bg-accent"
              style={{
                width: `${
                  (mockKeyStats.decisionsDecided / mockKeyStats.decisionsTotal) * 100
                }%`,
              }}
            />
          </div>
        </Link>
        <Link href="/plan?tab=budget" className="panel block animate-slide-up">
          <div className="text-xs text-text-soft tracking-wide">預算剩餘</div>
          <div className="font-display font-semibold text-[26px] mt-1 leading-none">
            {Math.round(remaining / 10000)}
            <small className="font-sans text-xs text-text-soft font-normal">
              {" "}
              萬
            </small>
          </div>
          <div className="h-[7px] rounded-full bg-card-hover mt-[11px] overflow-hidden">
            <div
              className="h-full rounded-full bg-accent"
              style={{
                width: `${(remaining / mockBudgetSummary.totalBudget) * 100}%`,
              }}
            />
          </div>
        </Link>
        <Link href="/plan?tab=budget" className="panel block animate-slide-up">
          <div className="text-xs text-text-soft tracking-wide">下一筆付款</div>
          <div className="font-display font-semibold text-[19px] mt-1 leading-none">
            婚顧訂金
          </div>
          <div className="text-xs text-text-soft mt-1">NT$ 20,000 · 待付</div>
        </Link>
        <Link href="/guest" className="panel block animate-slide-up">
          <div className="text-xs text-text-soft tracking-wide">賓客 RSVP</div>
          <div className="font-display font-semibold text-[26px] mt-1 leading-none">
            {mockKeyStats.guestConfirmed}
            <small className="font-sans text-xs text-text-soft font-normal">
              {" "}
              / {mockKeyStats.guestTotal}
            </small>
          </div>
          <div className="text-xs text-text-soft mt-1">尚未開放調查</div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-3.5">
        <div className="panel">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12.5px] font-bold text-text-soft">
              近期待辦
            </span>
            <Link
              href="/plan?tab=task"
              className="text-accent-hover font-semibold text-[12.5px]"
            >
              前往待辦
            </Link>
          </div>
          {openTasks.map((task) => (
            <div key={task.id} className="lrow">
              {task.state ? (
                <span className={`status ${task.state === "overdue" ? "status-overdue" : "status-due"}`}>
                  {task.state === "overdue" ? "逾期" : "本週"}
                </span>
              ) : (
                <span className="status status-idle">待辦</span>
              )}
              <div className="flex-1 min-w-0 font-medium text-sm">
                {task.title}
              </div>
              {task.daysBefore !== undefined && (
                <div className="text-xs text-text-soft whitespace-nowrap">
                  婚禮前 <b className="font-display text-[15px] text-text">{task.daysBefore}</b> 天
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12.5px] font-bold text-text-soft">
              即將到期付款
            </span>
            <Link
              href="/plan?tab=budget"
              className="text-accent-hover font-semibold text-[12.5px]"
            >
              前往預算
            </Link>
          </div>
          {mockUpcomingPayments.map((p) => (
            <div key={p.id} className="lrow">
              <span
                className={`status ${
                  p.state === "overdue"
                    ? "status-overdue"
                    : p.state === "due"
                      ? "status-due"
                      : "status-idle"
                }`}
              >
                {p.state === "overdue" ? "待付" : p.state === "due" ? "30 天內" : "已付"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{p.name}</div>
                <div className="text-xs text-text-soft mt-0.5">{p.note}</div>
              </div>
              <div className="text-[12.5px] text-text-soft whitespace-nowrap">
                <b className="font-display text-[15px] text-text font-semibold">
                  {p.amount.toLocaleString()}
                </b>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2.5 mt-4 flex-wrap">
        <Link href="/plan?tab=tl" className="btn btn-secondary flex-1 min-w-[130px]">
          ＋ 新增備選廠商
        </Link>
        <Link href="/plan?tab=task" className="btn btn-secondary flex-1 min-w-[130px]">
          ＋ 新增待辦
        </Link>
        <Link href="/guest" className="btn btn-secondary flex-1 min-w-[130px]">
          ＋ 新增賓客
        </Link>
      </div>
    </div>
  );
}
