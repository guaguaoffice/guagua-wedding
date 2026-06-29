"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import {
  addWeddingDayEvent,
  cycleWeddingDayEventStatus,
  deleteWeddingDayEvent,
} from "@/lib/actions/onsite";
import { addTable, assignGuestTable, deleteTable, updateTable } from "@/lib/actions/tables";

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
  tableId: string | null;
  plusOneCount: number;
};

export type OnsiteTable = {
  id: string;
  name: string;
  capacity: number | null;
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
  tables,
}: {
  weddingId: string;
  events: OnsiteEvent[];
  guests: OnsiteGuest[];
  tables: OnsiteTable[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "table";
  const [pending, startTransition] = useTransition();
  const [editingTableId, setEditingTableId] = useState<string | null>(null);

  function setTab(next: string) {
    router.replace(`/onsite?tab=${next}`, { scroll: false });
  }

  function handleAddTable(formData: FormData) {
    startTransition(async () => {
      await addTable(weddingId, formData);
      router.refresh();
    });
  }

  function handleUpdateTable(tableId: string, formData: FormData) {
    startTransition(async () => {
      await updateTable(tableId, formData);
      setEditingTableId(null);
      router.refresh();
    });
  }

  function handleDeleteTable(tableId: string) {
    if (!window.confirm("刪除這個桌次？桌上的賓客會變成尚未安排桌位。")) return;
    startTransition(async () => {
      await deleteTable(tableId);
      router.refresh();
    });
  }

  function handleAssignTable(guestId: string, tableId: string) {
    startTransition(async () => {
      await assignGuestTable(guestId, tableId);
      router.refresh();
    });
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

  const unassigned = guests.filter((g) => !g.tableId);

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
          {tables.length === 0 ? (
            <EmptyState
              icon={
                <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 stroke-accent-hover fill-none" strokeWidth={1.6}>
                  <circle cx="12" cy="12" r="8" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              }
              title="還沒有桌次"
              description="先在下面建立桌次（例如第 1 桌、新人桌），再把賓客分配進去。"
            />
          ) : (
            <div className="flex flex-col gap-3">
              {tables.map((t) => {
                const members = guests.filter((g) => g.tableId === t.id);
                const seats = members.reduce((s, g) => s + 1 + g.plusOneCount, 0);
                return (
                  <div key={t.id} className="panel">
                    {editingTableId === t.id ? (
                      <form
                        action={(formData) => handleUpdateTable(t.id, formData)}
                        className="flex items-center gap-2 mb-2"
                      >
                        <input
                          name="name"
                          defaultValue={t.name}
                          required
                          autoFocus
                          disabled={pending}
                          className="flex-1 min-w-0 border border-border rounded-[9px] px-2.5 py-1.5 text-sm bg-card"
                        />
                        <input
                          name="capacity"
                          type="number"
                          min={1}
                          defaultValue={t.capacity ?? ""}
                          placeholder="人數"
                          disabled={pending}
                          className="w-16 border border-border rounded-[9px] px-2.5 py-1.5 text-sm bg-card"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingTableId(null)}
                          disabled={pending}
                          className="text-text-faint hover:text-coral text-xs font-semibold px-2"
                        >
                          取消
                        </button>
                        <button
                          type="submit"
                          disabled={pending}
                          className="btn btn-primary text-xs px-3 py-1.5"
                        >
                          儲存
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={() => setEditingTableId(t.id)}
                          className="font-bold text-[15px] flex items-center gap-1.5 hover:text-accent-hover"
                        >
                          {t.name}
                          <svg
                            viewBox="0 0 24 24"
                            className="w-3.5 h-3.5 stroke-text-faint fill-none"
                            strokeWidth={2}
                          >
                            <path d="M16.5 3.5l4 4L7 21l-4 1 1-4z" />
                          </svg>
                        </button>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-text-soft">
                            {seats}
                            {t.capacity ? ` / ${t.capacity}` : ""} 位
                          </div>
                          <button
                            onClick={() => handleDeleteTable(t.id)}
                            aria-label="刪除桌次"
                            className="text-text-faint hover:text-coral p-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {members.length === 0 ? (
                        <span className="text-[12.5px] text-text-faint">還沒有人坐這桌</span>
                      ) : (
                        members.map((g) => (
                          <span
                            key={g.id}
                            className="text-[12px] font-medium pl-2.5 pr-1 py-1 rounded-full bg-card-hover text-text flex items-center gap-1"
                          >
                            {g.name}
                            {g.plusOneCount > 0 && ` +${g.plusOneCount}`}
                            <button
                              onClick={() => handleAssignTable(g.id, "")}
                              aria-label="移出這桌"
                              className="text-text-faint hover:text-coral"
                            >
                              ✕
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <form action={handleAddTable} className="flex gap-2 mt-3.5">
            <input
              name="name"
              placeholder="桌次名稱，例如：第 1 桌"
              required
              disabled={pending}
              className="flex-1 min-w-0 border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
            />
            <input
              name="capacity"
              type="number"
              min={1}
              placeholder="人數"
              disabled={pending}
              className="w-20 border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
            />
            <button disabled={pending} className="btn btn-primary text-sm px-4">
              新增桌次
            </button>
          </form>

          {unassigned.length > 0 && (
            <div className="rounded-[var(--radius-sm)] bg-accent-tint p-4 mt-3.5">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-6 h-6 rounded-full bg-accent text-white grid place-items-center flex-none">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none" strokeWidth={2.2}>
                    <circle cx="12" cy="8" r="3.2" />
                    <path d="M5 19a7 7 0 0114 0" />
                  </svg>
                </div>
                <span className="font-bold text-[15px] text-accent-hover">
                  尚未安排桌位（{unassigned.length}）
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {unassigned.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center gap-3 bg-[#f3f9f6] border-l-[3px] border-l-accent rounded-[10px] px-3 py-2.5"
                  >
                    <div className="flex-1 min-w-0 font-medium text-sm">
                      {g.name}
                      {g.plusOneCount > 0 && ` +${g.plusOneCount}`}
                    </div>
                    <select
                      defaultValue=""
                      disabled={pending || tables.length === 0}
                      onChange={(e) => handleAssignTable(g.id, e.target.value)}
                      className="text-xs border border-border rounded-md px-2 py-1.5 bg-card"
                    >
                      <option value="" disabled>
                        選擇桌次
                      </option>
                      {tables.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
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
