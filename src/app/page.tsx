import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentWedding } from "@/lib/wedding";
import { getBudgetItems, getDecisionItems, getTasks } from "@/lib/queries";
import { toNum, toNumOrNull } from "@/lib/decimal";
import {
  computeDecisionState,
  daysUntil,
  STATUS_TEXT,
  type CategoryState,
} from "@/lib/decision-state";

const STATE_CLASS: Record<CategoryState, string> = {
  done: "status-done",
  due: "status-due",
  overdue: "status-overdue",
  idle: "status-idle",
};

export default async function HomePage() {
  const current = await getCurrentWedding();
  if (!current) redirect("/login");

  const wedding = current.wedding;
  const [decisionItems, budgetItems, tasks] = await Promise.all([
    getDecisionItems(wedding.id),
    getBudgetItems(wedding.id),
    getTasks(wedding.id),
  ]);

  const days = wedding.weddingDate ? daysUntil(wedding.weddingDate) : null;
  const totalBudget = toNumOrNull(wedding.totalBudget) ?? 0;

  const itemsWithState = decisionItems.map((item) => ({
    item,
    state: computeDecisionState(item.suggestedDecideBy, !!item.decisionRecord),
  }));
  const focusItems = itemsWithState.filter(
    ({ state }) => state === "overdue" || state === "due"
  );
  const overdueCount = focusItems.filter(({ state }) => state === "overdue").length;
  const decidedCount = decisionItems.filter((d) => d.decisionRecord).length;

  const decidedSpend = budgetItems
    .filter((b) => b.decisionItem?.decisionRecord)
    .reduce((s, b) => s + toNum(b.totalAmount), 0);
  const remaining = totalBudget - decidedSpend;

  const unpaidItems = budgetItems
    .filter((b) => b.status !== "PAID")
    .map((b) => ({
      id: b.id,
      name: b.name,
      note: b.note,
      outstanding: toNum(b.totalAmount) - toNum(b.paidAmount),
      dueDate: b.dueDate,
    }))
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    })
    .slice(0, 3);

  const openTasks = tasks.filter((t) => !t.completed).slice(0, 3);

  return (
    <div className="animate-fade-in">
      <div className="text-[11px] tracking-[0.16em] uppercase text-accent-hover font-bold">
        總覽
      </div>
      <h1 className="text-[25px] md:text-[30px] font-bold tracking-tight mt-0.5 mb-0.5">
        嗨，準備得不錯
      </h1>
      <p className="text-text-soft text-sm">
        這個月最重要的事：把進度落後的決策定下來。
      </p>

      {days !== null && (
        <div className="hero flex items-center gap-5 flex-wrap p-5 mt-4">
          <div className="font-display font-semibold text-[46px] text-accent-hover leading-[0.95]">
            {days}
            <small className="font-sans text-sm text-text-soft font-medium block mt-0.5">
              天後 ·{" "}
              {wedding.weddingDate?.toLocaleDateString("zh-Hant", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </small>
          </div>
          {wedding.venueName && (
            <div className="flex-1 min-w-[180px]">
              <div className="font-bold text-[15px]">{wedding.venueName}</div>
              {wedding.venueDetail && (
                <div className="text-text-soft text-[13px] mt-0.5">{wedding.venueDetail}</div>
              )}
            </div>
          )}
        </div>
      )}

      {focusItems.length > 0 && (
        <div className="panel mt-3.5 overflow-hidden p-0">
          <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-2 font-bold text-sm">
            需要你決定
            {overdueCount > 0 && (
              <span className="bg-coral text-white text-[11px] font-bold px-2 py-0.5 rounded-full ml-auto">
                {overdueCount} 項逾期
              </span>
            )}
          </div>
          {focusItems.map(({ item, state }) => {
            const activeCount = item.candidates.filter((c) => c.status === "CANDIDATE").length;
            return (
              <Link
                key={item.id}
                href={`/plan?open=${item.id}`}
                className="flex items-center gap-3 px-4 py-3 border-t border-border hover:bg-card-hover"
              >
                <span className={`status ${STATE_CLASS[state]}`}>{STATUS_TEXT[state]}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[14.5px]">{item.title}</div>
                  <div className="text-xs text-text-soft mt-0.5">
                    備選 {activeCount} 家
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
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between mt-[22px] mb-2.5 mx-0.5">
        <span className="text-[12.5px] font-bold text-text-soft">關鍵概況</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/plan?tab=tl" className="panel block animate-slide-up">
          <div className="text-xs text-text-soft tracking-wide">決策進度</div>
          <div className="font-display font-semibold text-[26px] mt-1 leading-none">
            {decidedCount}
            <small className="font-sans text-xs text-text-soft font-normal">
              {" "}
              / {decisionItems.length}
            </small>
          </div>
          <div className="h-[7px] rounded-full bg-card-hover mt-[11px] overflow-hidden">
            <div
              className="h-full rounded-full bg-accent"
              style={{
                width: `${decisionItems.length ? (decidedCount / decisionItems.length) * 100 : 0}%`,
              }}
            />
          </div>
        </Link>
        <Link href="/plan?tab=budget" className="panel block animate-slide-up">
          <div className="text-xs text-text-soft tracking-wide">預算剩餘</div>
          <div className="font-display font-semibold text-[26px] mt-1 leading-none">
            {Math.round(remaining / 10000)}
            <small className="font-sans text-xs text-text-soft font-normal"> 萬</small>
          </div>
          <div className="h-[7px] rounded-full bg-card-hover mt-[11px] overflow-hidden">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${totalBudget ? (remaining / totalBudget) * 100 : 0}%` }}
            />
          </div>
        </Link>
        <Link href="/plan?tab=budget" className="panel block animate-slide-up">
          <div className="text-xs text-text-soft tracking-wide">下一筆付款</div>
          {unpaidItems[0] ? (
            <>
              <div className="font-display font-semibold text-[19px] mt-1 leading-none">
                {unpaidItems[0].name}
              </div>
              <div className="text-xs text-text-soft mt-1">
                NT$ {unpaidItems[0].outstanding.toLocaleString()} · 待付
              </div>
            </>
          ) : (
            <div className="text-sm text-text-soft mt-2">目前沒有待付款項</div>
          )}
        </Link>
        <Link href="/guest" className="panel block animate-slide-up">
          <div className="text-xs text-text-soft tracking-wide">賓客 RSVP</div>
          <div className="font-display font-semibold text-[26px] mt-1 leading-none">
            0<small className="font-sans text-xs text-text-soft font-normal"> / 0</small>
          </div>
          <div className="text-xs text-text-soft mt-1">尚未開放調查</div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-3.5">
        <div className="panel">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12.5px] font-bold text-text-soft">近期待辦</span>
            <Link href="/plan?tab=task" className="text-accent-hover font-semibold text-[12.5px]">
              前往待辦
            </Link>
          </div>
          {openTasks.length === 0 && (
            <div className="text-sm text-text-soft py-2">目前沒有待辦事項。</div>
          )}
          {openTasks.map((task) => (
            <div key={task.id} className="lrow">
              <span className="status status-idle">待辦</span>
              <div className="flex-1 min-w-0 font-medium text-sm">{task.title}</div>
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12.5px] font-bold text-text-soft">即將到期付款</span>
            <Link href="/plan?tab=budget" className="text-accent-hover font-semibold text-[12.5px]">
              前往預算
            </Link>
          </div>
          {unpaidItems.length === 0 && (
            <div className="text-sm text-text-soft py-2">目前沒有待付款項。</div>
          )}
          {unpaidItems.map((p) => {
            // eslint-disable-next-line react-hooks/purity -- server component, computed per request on purpose
            const overdue = p.dueDate && p.dueDate.getTime() < Date.now();
            return (
              <div key={p.id} className="lrow">
                <span className={`status ${overdue ? "status-overdue" : "status-due"}`}>
                  {overdue ? "待付" : "30 天內"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{p.name}</div>
                  {p.note && <div className="text-xs text-text-soft mt-0.5">{p.note}</div>}
                </div>
                <div className="text-[12.5px] text-text-soft whitespace-nowrap">
                  <b className="font-display text-[15px] text-text font-semibold">
                    {p.outstanding.toLocaleString()}
                  </b>
                </div>
              </div>
            );
          })}
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
