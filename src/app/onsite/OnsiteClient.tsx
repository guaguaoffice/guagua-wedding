"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { QrCode } from "@/components/QrCode";
import { QrScanner } from "@/components/QrScanner";
import { checkInGuest } from "@/lib/actions/checkin";
import {
  addWeddingDayEvent,
  cycleWeddingDayEventStatus,
  deleteWeddingDayEvent,
} from "@/lib/actions/onsite";
const TABS = [
  { key: "seating", label: "座位表" },
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
  kind: "guest" | "member";
  side: "GROOM" | "BRIDE" | null;
  identity: "GROOM" | "BRIDE" | "PARTNER" | "OTHER" | null;
  checkinToken: string | null;
  checkedInAt: Date | null;
  attending: boolean | null;
};

const SIDE_LABEL: Record<string, string> = {
  GROOM: "男方",
  BRIDE: "女方",
};

const IDENTITY_LABEL: Record<string, string> = {
  GROOM: "新郎",
  BRIDE: "新娘",
  PARTNER: "新人",
  OTHER: "其他協助者",
};

const SIDE_TAG_CLASS: Record<string, string> = {
  GROOM: "bg-[#e2eaf0] text-[#5b7a92]",
  BRIDE: "bg-coral-tint text-coral",
};

const IDENTITY_TAG_CLASS: Record<string, string> = {
  GROOM: "bg-[#c5d6e0] text-[#3a5b73]",
  BRIDE: "bg-[#f0cfc9] text-[#a14a3d]",
  PARTNER: "bg-[#e3dde6] text-[#7d6b8a]",
  OTHER: "bg-[#e8e5e0] text-[#8a8478]",
};

function tagLabel(g: OnsiteGuest) {
  if (g.kind === "member") return g.identity ? IDENTITY_LABEL[g.identity] : "其他協助者";
  return g.side ? SIDE_LABEL[g.side] : null;
}

function tagClass(g: OnsiteGuest) {
  if (g.kind === "member") return IDENTITY_TAG_CLASS[g.identity ?? "OTHER"];
  return g.side ? SIDE_TAG_CLASS[g.side] : "";
}

export type OnsiteTable = {
  id: string;
  name: string;
  capacity: number | null;
};

function CheckinTab({ guests }: { guests: OnsiteGuest[] }) {
  const guestOnly = guests.filter((g) => g.kind === "guest");
  const checkedIn = guestOnly.filter((g) => g.checkedInAt);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div>
      {scanning && (
        <QrScanner
          onCheckin={checkInGuest}
          onClose={() => setScanning(false)}
        />
      )}

      <div className="grid grid-cols-3 gap-3 mb-3.5">
        <div className="panel">
          <div className="text-xs text-text-soft">總賓客數</div>
          <div className="font-display font-semibold text-[26px] mt-1">{guestOnly.length}</div>
        </div>
        <div className="panel">
          <div className="text-xs text-text-soft">已報到</div>
          <div className="font-display font-semibold text-[26px] mt-1 text-accent">{checkedIn.length}</div>
        </div>
        <div className="panel">
          <div className="text-xs text-text-soft">未報到</div>
          <div className="font-display font-semibold text-[26px] mt-1">{guestOnly.length - checkedIn.length}</div>
        </div>
      </div>

      <button
        onClick={() => setScanning(true)}
        className="btn btn-primary w-full mb-3.5 flex items-center justify-center gap-2"
      >
        <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 stroke-current fill-none" strokeWidth={2}>
          <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
          <rect x="7" y="7" width="10" height="10" rx="1" />
        </svg>
        開始掃描報到
      </button>

      {guestOnly.length === 0 ? (
        <div className="panel text-center py-6 text-text-soft text-sm">還沒有賓客</div>
      ) : (
        <div className="panel flex flex-col gap-2">
          {guestOnly.map((g) => {
            const isExpanded = expandedId === g.id;
            const checkinUrl = g.checkinToken ? `${origin}/checkin/${g.checkinToken}` : null;
            const timeStr = g.checkedInAt
              ? new Date(g.checkedInAt).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })
              : null;
            return (
              <div key={g.id}>
                <div className="lrow flex-wrap gap-y-1.5">
                  {g.side && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-none ${SIDE_TAG_CLASS[g.side]}`}>
                      {SIDE_LABEL[g.side]}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{g.name}{g.plusOneCount > 0 && ` +${g.plusOneCount}`}</div>
                  </div>
                  {g.checkedInAt ? (
                    <span className="status status-done text-[11px]">已報到 {timeStr}</span>
                  ) : (
                    <span className="status status-idle text-[11px]">未報到</span>
                  )}
                  {checkinUrl && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : g.id)}
                      className="text-[11px] font-semibold px-2 py-1 rounded-full bg-card-hover text-text-soft hover:text-accent-hover flex-none"
                    >
                      QR
                    </button>
                  )}
                </div>
                {isExpanded && checkinUrl && (
                  <div className="mt-2 ml-2 flex flex-col items-start gap-2">
                    <div className="bg-white p-2 rounded-xl shadow-sm">
                      <QrCode url={checkinUrl} size={140} />
                    </div>
                    <p className="text-[11px] text-text-faint">掃碼即可完成報到</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
  const tab = searchParams.get("tab") ?? "seating";
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

  const unassigned = guests.filter((g) => !g.tableId && g.attending !== false);

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

      {tab === "seating" && (
        <div>
          {tables.length === 0 ? (
            <EmptyState
              icon={
                <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 stroke-accent-hover fill-none" strokeWidth={1.6}>
                  <circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" />
                </svg>
              }
              title="還沒有桌次"
              description="請先在『賓客』頁面建立桌次並安排座位。"
            />
          ) : (
            <div className="flex flex-col gap-3">
              {tables.map((t) => {
                const seated = guests.filter((g) => g.tableId === t.id);
                const seats = seated.reduce((s, g) => s + 1 + g.plusOneCount, 0);
                return (
                  <div key={t.id} className="panel">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-[15px]">{t.name}</span>
                      <span className="text-xs text-text-soft">
                        {seats}{t.capacity ? ` / ${t.capacity}` : ""} 位
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {seated.length === 0 ? (
                        <span className="text-[12.5px] text-text-faint">還沒有人坐這桌</span>
                      ) : seated.map((g) => (
                        <span key={g.id}
                          className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-card-hover text-text flex items-center gap-1">
                          {tagLabel(g) && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tagClass(g)}`}>
                              {tagLabel(g)}
                            </span>
                          )}
                          {g.name}{g.plusOneCount > 0 && ` +${g.plusOneCount}`}
                          {g.checkedInAt && (
                            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block ml-0.5" title="已報到" />
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {unassigned.length > 0 && (
            <div className="rounded-[var(--radius-sm)] bg-accent-tint p-4 mt-3.5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-accent text-white grid place-items-center flex-none">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none" strokeWidth={2.2}>
                    <circle cx="12" cy="8" r="3.2" /><path d="M5 19a7 7 0 0114 0" />
                  </svg>
                </div>
                <span className="font-bold text-[15px] text-accent-hover">
                  尚未安排桌位（{unassigned.length}）
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {unassigned.map((g) => (
                  <span key={g.id}
                    className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-card text-text-soft">
                    {tagLabel(g) && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full mr-1 ${tagClass(g)}`}>
                        {tagLabel(g)}
                      </span>
                    )}
                    {g.name}{g.plusOneCount > 0 && ` +${g.plusOneCount}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "checkin" && (
        <CheckinTab guests={guests} />
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
