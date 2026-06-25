"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DecisionSheet } from "@/components/DecisionSheet";
import {
  TODAY_AFTER_SLUG,
  mockDecisionItems,
  type CategoryState,
} from "@/lib/mock-decisions";
import {
  STATUS_CLASS,
  STATUS_LABEL,
  mockBudgetLines,
  mockBudgetSummary,
} from "@/lib/mock-budget";
import { mockTasks } from "@/lib/mock-tasks";

const NODE_TEXT_CLASS: Record<CategoryState, string> = {
  done: "text-accent",
  due: "text-amber",
  overdue: "text-coral",
  idle: "text-text-faint",
};

const STATUS_CLASS_BY_STATE: Record<CategoryState, string> = {
  done: "status-done",
  due: "status-due",
  overdue: "status-overdue",
  idle: "status-idle",
};

const TABS = [
  { key: "tl", label: "時間軸" },
  { key: "budget", label: "預算" },
  { key: "task", label: "待辦" },
] as const;

export function PlanClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "tl";
  const openSlug = searchParams.get("open");

  function setTab(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    params.delete("open");
    router.replace(`/plan?${params.toString()}`, { scroll: false });
  }

  function openSheet(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("open", slug);
    router.replace(`/plan?${params.toString()}`, { scroll: false });
  }

  function closeSheet() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("open");
    router.replace(`/plan?${params.toString()}`, { scroll: false });
  }

  const remaining = mockBudgetSummary.totalBudget - mockBudgetSummary.decidedSpend;
  const decidedPct = Math.round(
    (mockBudgetSummary.decidedSpend / mockBudgetSummary.totalBudget) * 100
  );

  const openTasks = mockTasks.filter((t) => !t.done);
  const doneTasks = mockTasks.filter((t) => t.done);

  return (
    <div className="animate-fade-in">
      <div className="text-[11px] tracking-[0.16em] uppercase text-accent-hover font-bold">
        規劃
      </div>
      <h1 className="text-[25px] md:text-[30px] font-bold tracking-tight mt-0.5 mb-0.5">
        {tab === "budget" ? "預算" : tab === "task" ? "待辦" : "決策時間軸"}
      </h1>
      <p className="text-text-soft text-sm">
        {tab === "budget"
          ? "標記「已定」的廠商會自動把金額帶進這裡，預算不用重新輸入。"
          : tab === "task"
            ? "把婚禮準備拆成一件一件可以打勾的事。"
            : "從今天到婚禮當天，每一類要決定的事都在這條路上。點開任何一站，比較備選、留下決定的那一家。"}
      </p>

      <div className="tabs my-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "tl" && (
        <div>
          <div className="flex gap-3.5 flex-wrap mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-text-soft">
              <i className="dot dot-done" />
              已定
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-text-soft">
              <i className="dot dot-due" />
              本月該定
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-text-soft">
              <i className="dot dot-overdue" />
              逾期
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-text-soft">
              <i className="dot dot-idle" />
              未開始
            </span>
          </div>

          <div className="relative mt-2 pl-[54px] md:pl-24">
            <div className="absolute left-[26px] md:left-12 top-2 bottom-2 w-0.5 bg-gradient-to-b from-border-2 via-accent to-border-2 rounded-full" />
            {mockDecisionItems.map((item) => (
              <div key={item.id}>
                <div className={`relative mb-3.5 animate-slide-up ${NODE_TEXT_CLASS[item.state]}`}>
                  <span className="absolute -left-[33px] md:-left-[51px] top-[22px] w-3 h-3 rounded-full bg-card border-[2.5px] border-current" />
                  <div className="absolute -left-[54px] md:-left-24 top-0 w-12 md:w-[70px] text-right font-display text-[13px] md:text-[15px] text-text-faint">
                    {item.month}
                  </div>
                  <button
                    onClick={() => openSheet(item.slug)}
                    className="card card-interactive w-full p-4 flex items-center gap-3.5 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-text font-bold text-[15.5px] flex items-center gap-2 flex-wrap">
                        {item.title}
                        <span className={`status ${STATUS_CLASS_BY_STATE[item.state]}`}>
                          {item.statusText}
                        </span>
                      </div>
                      <div className="text-[12.5px] text-text-soft mt-0.5">
                        {item.metaText}
                      </div>
                    </div>
                    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-text-faint fill-none flex-none" strokeWidth={2}>
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </button>
                </div>
                {item.slug === TODAY_AFTER_SLUG && (
                  <div className="relative -ml-[54px] md:-ml-24 pl-[54px] md:pl-24 mb-[22px] flex items-center gap-2.5">
                    <span className="relative z-[2] bg-accent text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-[0_6px_16px_rgba(105,172,144,0.4)]">
                      今天
                    </span>
                    <span className="absolute left-[18px] md:left-10 w-[18px] h-[18px] rounded-full bg-accent animate-dot-pulse" />
                    <span className="flex-1 h-px opacity-50 bg-[repeating-linear-gradient(90deg,var(--color-accent)_0_6px,transparent_6px_12px)]" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="-ml-[54px] md:-ml-24 pl-[54px] md:pl-24 mt-1">
            <button className="w-full border-[1.5px] border-dashed border-border-2 text-text-soft rounded-2xl py-3.5 font-semibold text-[13.5px]">
              ＋ 新增決策類別
            </button>
          </div>
        </div>
      )}

      {tab === "budget" && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="panel">
              <div className="text-xs text-text-soft">總預算</div>
              <div className="font-display font-semibold text-[26px] mt-1">
                {mockBudgetSummary.totalBudget / 10000}
                <small className="font-sans text-xs text-text-soft"> 萬</small>
              </div>
            </div>
            <div className="panel">
              <div className="text-xs text-text-soft">已定支出</div>
              <div className="font-display font-semibold text-[26px] mt-1">
                {(mockBudgetSummary.decidedSpend / 10000).toFixed(1)}
                <small className="font-sans text-xs text-text-soft"> 萬</small>
              </div>
            </div>
            <div className="panel">
              <div className="text-xs text-text-soft">已付</div>
              <div className="font-display font-semibold text-[26px] mt-1">
                {mockBudgetSummary.paid / 10000}
                <small className="font-sans text-xs text-text-soft"> 萬</small>
              </div>
            </div>
            <div className="panel">
              <div className="text-xs text-text-soft">剩餘</div>
              <div className="font-display font-semibold text-[26px] mt-1 text-accent">
                {Math.round(remaining / 10000)}
                <small className="font-sans text-xs text-text-soft"> 萬</small>
              </div>
            </div>
          </div>

          <div className="panel mt-3.5">
            <div className="h-[7px] rounded-full bg-card-hover overflow-hidden">
              <div className="h-full rounded-full bg-accent" style={{ width: `${decidedPct}%` }} />
            </div>
            <div className="text-xs text-text-soft mt-2">
              已定 {(mockBudgetSummary.decidedSpend / 10000).toFixed(1)} 萬（占總預算 {decidedPct}%）· 其餘為各類預估
            </div>
          </div>

          <div className="flex items-center justify-between mt-[22px] mb-2.5 mx-0.5">
            <span className="text-[12.5px] font-bold text-text-soft">預算項目</span>
            <button className="text-accent-hover font-semibold text-[12.5px]">＋ 新增</button>
          </div>
          <div className="panel">
            {mockBudgetLines.map((line) => {
              const content = (
                <>
                  <span className={`status ${STATUS_CLASS[line.state]}`}>
                    {STATUS_LABEL[line.state]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{line.name}</div>
                    <div className="text-xs text-text-soft mt-0.5">{line.note}</div>
                  </div>
                  <div className="text-[12.5px] text-text-soft whitespace-nowrap">
                    {line.amount > 0 ? (
                      <b className="font-display text-[15px] text-text font-semibold">
                        {line.amount.toLocaleString()}
                      </b>
                    ) : (
                      "—"
                    )}
                  </div>
                </>
              );
              return line.decisionSlug ? (
                <button
                  key={line.id}
                  onClick={() => openSheet(line.decisionSlug!)}
                  className="lrow w-full text-left"
                >
                  {content}
                </button>
              ) : (
                <div key={line.id} className="lrow">
                  {content}
                </div>
              );
            })}
          </div>
          <div className="text-[13.5px] text-text-soft bg-card-hover rounded-xl px-3.5 py-3 mt-3.5">
            標記「已定」的廠商會自動把金額帶進這裡——預算不用重新輸入。
          </div>
        </div>
      )}

      {tab === "task" && (
        <div>
          <div className="text-[12.5px] font-bold text-text-soft my-2.5 mx-0.5">
            進行中 · {openTasks.length}
          </div>
          <div className="panel">
            {openTasks.map((task) => (
              <div key={task.id} className="lrow">
                <span className="check" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{task.title}</div>
                  {task.note && (
                    <div className="text-xs text-text-soft mt-0.5">{task.note}</div>
                  )}
                </div>
                <div className="text-[12.5px] text-text-soft text-right whitespace-nowrap">
                  {task.state && (
                    <>
                      <span
                        className={`status ${
                          task.state === "overdue" ? "status-overdue" : "status-due"
                        }`}
                      >
                        {task.state === "overdue" ? "逾期" : "本週"}
                      </span>
                      <br />
                    </>
                  )}
                  {task.daysBefore !== undefined && `婚禮前 ${task.daysBefore} 天`}
                </div>
              </div>
            ))}
          </div>
          <div className="text-[12.5px] font-bold text-text-soft my-2.5 mx-0.5">
            已完成 · {doneTasks.length}
          </div>
          <div className="panel">
            {doneTasks.map((task) => (
              <div key={task.id} className="lrow">
                <span className="check check-done" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-text-faint line-through">
                    {task.title}
                  </div>
                </div>
                <div className="text-[12.5px] text-text-soft">已完成</div>
              </div>
            ))}
          </div>
          <button className="w-full border-[1.5px] border-dashed border-border-2 text-text-soft rounded-2xl py-3.5 font-semibold text-[13.5px] mt-3.5">
            ＋ 新增待辦
          </button>
        </div>
      )}

      <DecisionSheet slug={openSlug} onClose={closeSheet} />
    </div>
  );
}
