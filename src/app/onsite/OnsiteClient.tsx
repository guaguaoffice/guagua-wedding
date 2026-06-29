"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  addWeddingDayEvent,
  cycleWeddingDayEventStatus,
  deleteWeddingDayEvent,
} from "@/lib/actions/onsite";

const TABS = [
  { key: "table", label: "桌位" },
  { key: "checkin", label: "報到" },
  { key: "run", label: "當天流程" },
] as const;

type EventStatus = "PENDING" | "IN_PROGRESS" | "DONE";

export type OnsiteEvent = {
  id: string;
  time: Date;
  title: string;
  location: string | null;
  ownerName: string | null;
  status: EventStatus;
};

export type OnsiteGuest = {
  id: string;
  name: string;
  tableNumber: string | null;
  plusOneCount: number;
};

function EmptyState({
  icon,
  title,
  description,
  cta,
  ctaHref,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta?: string;
  ctaHref?: string;
}) {
  return (
    <div className="panel">
      <div className="text-center py-8 px-2 text-text-soft">
        <div className="empty-icon">{icon}</div>
        <h3 className="text-text text-[17px] mb-1">{title}</h3>
        <p className="text-[13.5px] max-w-[330px] mx-auto mb-4">{description}</p>
        {cta && ctaHref && (
          <Link href={ctaHref} className="btn btn-primary">
            {cta}
          </Link>
        )}
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<EventStatus, string> = {
  PENDING: "未開始",
  IN_PROGRESS: "進行中",
  DONE: "已完成",
};
const STATUS_CLASS: Record<EventStatus, string> = {
  PENDING: "status-idle",
  IN_PROGRESS: "status-due",
  DONE: "status-done",
};

function formatTime(d: Date) {
  return new Date(d).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
}

export function OnsiteClient({
  weddingId,
  events,
  guests,
}: {
  weddingId: string;
  events: OnsiteEvent[];
  guests: OnsiteGuest[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "table";
  const [pending, startTransition] = useTransition();

  function setTab(next: string) {
    router.replace(`/onsite?tab=${next}`, { scroll: false });
  }

  function handleAddEvent(formData: FormData) {
    startTransition(async () => {
      await addWeddingDayEvent(weddingId, formData);
      router.refresh();
    });
  }

  function handleCycleStatus(eventId: string, status: EventStatus) {
    startTransition(async () => {
      await cycleWeddingDayEventStatus(eventId, status);
      router.refresh();
    });
  }

  function handleDeleteEvent(eventId: string) {
    if (!window.confirm("刪除這個流程項目？")) return;
    startTransition(async () => {
      await deleteWeddingDayEvent(eventId);
      router.refresh();
    });
  }

  const tableGroups = new Map<string, OnsiteGuest[]>();
  const unassigned: OnsiteGuest[] = [];
  for (const g of guests) {
    if (g.tableNumber) {
      if (!tableGroups.has(g.tableNumber)) tableGroups.set(g.tableNumber, []);
      tableGroups.get(g.tableNumber)!.push(g);
    } else {
      unassigned.push(g);
    }
  }
  const sortedTables = [...tableGroups.entries()].sort((a, b) =>
    a[0].localeCompare(b[0], "zh-Hant")
  );

  return (
    <div className="animate-fade-in">
      <div className="text-[11px] tracking-[0.16em] uppercase text-accent-hover font-bold">
        現場
      </div>
      <h1 className="text-[25px] md:text-[30px] font-bold tracking-tight mt-0.5 mb-3">
        婚禮當天
      </h1>

      <div className="tabs mb-4">
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

      {tab === "table" && (
        <div>
          {guests.length === 0 ? (
            <EmptyState
              icon={
                <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 stroke-accent-hover fill-none" strokeWidth={1.6}>
                  <circle cx="12" cy="12" r="8" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              }
              title="還沒有賓客"
              description="先到「賓客」頁新增名冊，再回來這裡安排桌位。"
              cta="前往賓客名冊"
              ctaHref="/guest"
            />
          ) : sortedTables.length === 0 ? (
            <EmptyState
              icon={
                <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 stroke-accent-hover fill-none" strokeWidth={1.6}>
                  <circle cx="12" cy="12" r="8" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              }
              title="還沒有人安排桌號"
              description="到「賓客」名冊幫每位賓客填上桌號，這裡就會自動依桌次分組顯示。"
              cta="前往賓客名冊"
              ctaHref="/guest"
            />
          ) : (
            <div className="flex flex-col gap-3">
              {sortedTables.map(([table, members]) => {
                const seats = members.reduce((s, g) => s + 1 + g.plusOneCount, 0);
                return (
                  <div key={table} className="panel">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-[15px]">第 {table} 桌</div>
                      <div className="text-xs text-text-soft">{seats} 位</div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {members.map((g) => (
                        <span
                          key={g.id}
                          className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-card-hover text-text"
                        >
                          {g.name}
                          {g.plusOneCount > 0 && ` +${g.plusOneCount}`}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
              {unassigned.length > 0 && (
                <div className="panel">
                  <div className="font-bold text-[15px] mb-2 text-text-soft">尚未安排桌位</div>
                  <div className="flex flex-wrap gap-1.5">
                    {unassigned.map((g) => (
                      <span
                        key={g.id}
                        className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-card-hover text-text-soft"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "checkin" && (
        <div className="panel">
          <div className="bg-card-hover rounded-xl px-4 py-4 text-[13.5px] text-text-soft flex gap-2.5 items-start">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 stroke-accent-hover fill-none flex-none"
              strokeWidth={1.7}
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            <div>
              報到在婚禮當天前開放。屆時每位賓客有專屬報到
              QR，現場掃碼即報到、自動對到桌次，這裡會即時顯示已報到統計。
            </div>
          </div>
        </div>
      )}

      {tab === "run" && (
        <div>
          {events.length === 0 ? (
            <EmptyState
              icon={
                <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 stroke-accent-hover fill-none" strokeWidth={1.6}>
                  <path d="M12 7v5l3 2" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              }
              title="還沒排當天流程"
              description="把進場、敬酒、送客等時間排成流程表，可指派負責人並分享給協作者與廠商。"
            />
          ) : (
            <div className="panel flex flex-col gap-2">
              {events.map((e) => (
                <div key={e.id} className="lrow flex-wrap gap-y-1.5">
                  <span className="font-display font-semibold text-sm flex-none w-12">
                    {formatTime(e.time)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{e.title}</div>
                    {(e.location || e.ownerName) && (
                      <div className="text-xs text-text-soft mt-0.5">
                        {[e.location, e.ownerName && `負責人：${e.ownerName}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    )}
                  </div>
                  <button
                    disabled={pending}
                    onClick={() => handleCycleStatus(e.id, e.status)}
                    className={`status ${STATUS_CLASS[e.status]} flex-none`}
                  >
                    {STATUS_LABEL[e.status]}
                  </button>
                  <button
                    disabled={pending}
                    onClick={() => handleDeleteEvent(e.id)}
                    aria-label="刪除流程項目"
                    className="text-text-faint hover:text-coral p-1 flex-none"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <form action={handleAddEvent} className="flex flex-wrap gap-2 mt-3.5">
            <input
              type="time"
              name="time"
              required
              disabled={pending}
              className="border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
            />
            <input
              name="title"
              placeholder="流程項目，例如：新人進場"
              required
              disabled={pending}
              className="flex-1 min-w-0 border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
            />
            <input
              name="ownerName"
              placeholder="負責人（選填）"
              disabled={pending}
              className="flex-1 min-w-0 border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
            />
            <button disabled={pending} className="btn btn-primary text-sm px-4">
              新增
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
