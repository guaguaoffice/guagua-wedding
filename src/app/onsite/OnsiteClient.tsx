"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useRef, useEffect } from "react";
import { QrCode } from "@/components/QrCode";
import { QrScanner } from "@/components/QrScanner";
import { checkInGuest } from "@/lib/actions/checkin";
import {
  addWeddingDayEvent,
  cycleWeddingDayEventStatus,
  deleteWeddingDayEvent,
} from "@/lib/actions/onsite";
import { toggleManualCheckin } from "@/lib/actions/checkin";
const TABS = [
  { key: "seating", label: "座位表" },
  { key: "checkin", label: "報到" },
  { key: "run", label: "當天流程" },
] as const;

type EventStatus = "PENDING" | "IN_PROGRESS" | "DONE";

export type OnsiteEvent = {
  id: string;
  time: string;
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
  x: number;
  y: number;
};

function CheckinTab({ guests }: { guests: OnsiteGuest[] }) {
  const router = useRouter();
  const guestOnly = guests.filter((g) => g.kind === "guest");
  const checkedIn = guestOnly.filter((g) => g.checkedInAt);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [checkinSearch, setCheckinSearch] = useState("");
  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);

  async function handleToggle(g: OnsiteGuest) {
    setToggling(g.id);
    await toggleManualCheckin(g.id, !g.checkedInAt);
    router.refresh();
    setToggling(null);
  }

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
        <div className="panel flex flex-col">
          <div className="pb-2.5 border-b border-border mb-0.5">
            <input
              type="text"
              placeholder="搜尋賓客姓名"
              value={checkinSearch}
              onChange={(e) => { setCheckinSearch(e.target.value); setExpandedId(null); }}
              className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-bg"
            />
          </div>
          {guestOnly.filter((g) => g.name.includes(checkinSearch)).map((g, i) => {
            const isExpanded = expandedId === g.id;
            const checkinUrl = g.checkinToken ? `${origin}/checkin/${g.checkinToken}` : null;
            const timeStr = g.checkedInAt
              ? new Date(g.checkedInAt).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })
              : null;
            return (
              <div key={g.id} className={i > 0 ? "border-t border-border" : ""}>
                <div className="lrow flex-wrap gap-y-1.5 py-2.5" style={isExpanded ? { borderBottom: "none" } : {}}>
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
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : g.id)}
                    className="w-6 h-6 rounded-full bg-card-hover text-text-soft hover:text-accent-hover flex-none flex items-center justify-center text-lg leading-none transition-transform duration-200"
                    style={{ transform: isExpanded ? "rotate(45deg)" : "none" }}
                  >
                    ＋
                  </button>
                </div>
                {isExpanded && (
                  <div className="pb-3 pl-1 flex flex-col gap-3">
                    <button
                      disabled={toggling === g.id}
                      onClick={() => handleToggle(g)}
                      className={`self-start text-[12px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                        g.checkedInAt
                          ? "border-border text-text-soft hover:border-rose-300 hover:text-rose-500"
                          : "border-accent text-accent hover:bg-accent hover:text-white"
                      }`}
                    >
                      {toggling === g.id ? "處理中…" : g.checkedInAt ? "取消報到" : "手動報到"}
                    </button>
                    {checkinUrl && (
                      <div className="flex flex-col items-start gap-1.5">
                        <div className="bg-white p-2 rounded-xl shadow-sm">
                          <QrCode url={checkinUrl} size={130} />
                        </div>
                        <p className="text-[11px] text-text-faint">掃碼即可完成報到</p>
                      </div>
                    )}
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

function formatTime(d: Date | string) {
  return new Date(d).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
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
    const timeVal = String(formData.get("time") || "").trim();
    const titleVal = String(formData.get("title") || "").trim();
    if (!timeVal || !titleVal) return;
    setNewEventTime(timeVal);
    startTransition(async () => {
      await addWeddingDayEvent(weddingId, formData);
      router.refresh();
      setTimeout(() => setNewEventTime(null), 1800);
    });
  }

  function handleCycleStatus(eventId: string, status: EventStatus) {
    startTransition(async () => {
      await cycleWeddingDayEventStatus(eventId, status);
      router.refresh();
    });
  }

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function handleDeleteEvent(eventId: string) {
    setConfirmDeleteId(eventId);
  }

  function confirmDelete() {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    startTransition(async () => {
      await deleteWeddingDayEvent(id);
      router.refresh();
    });
  }

  const unassigned = guests.filter((g) => !g.tableId && g.attending !== false);

  // 當天流程：自動 / 手動模式
  const [runMode, setRunMode] = useState<"auto" | "manual">(() => {
    if (typeof window === "undefined") return "manual";
    return (localStorage.getItem("runMode") as "auto" | "manual") ?? "manual";
  });
  const [newEventTime, setNewEventTime] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (runMode !== "auto") return;
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, [runMode]);

  function getAutoStatus(event: OnsiteEvent, sortedEvents: OnsiteEvent[]): EventStatus {
    const firstUpcoming = sortedEvents.find((e) => new Date(e.time) > now);
    if (!firstUpcoming) return "DONE";
    if (event.id === firstUpcoming.id) return "IN_PROGRESS";
    return new Date(event.time) < new Date(firstUpcoming.time) ? "DONE" : "PENDING";
  }

  // 座位表 state
  const [seatingSearch, setSeatingSearch] = useState("");
  const [seatingView, setSeatingView] = useState<"list" | "plan">("list");
  const [focusedTableId, setFocusedTableId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const panDragRef = useRef<{ startClientX: number; startClientY: number; startPanX: number; startPanY: number } | null>(null);
  const pinchRef = useRef<{ dist: number; midX: number; midY: number; startZoom: number; startPanX: number; startPanY: number } | null>(null);
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  zoomRef.current = zoom;
  panRef.current = pan;
  const WORLD_W = 800; const WORLD_H = 600; const TABLE_D = 80;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const stageLeft = WORLD_W / 2 - 100, stageRight = WORLD_W / 2 + 100, stageTop = 20, stageBottom = 64;
    const pts = tables.map((t) => ({ x: t.x * WORLD_W, y: t.y * WORLD_H }));
    const allX = [stageLeft, stageRight, ...pts.map((p) => p.x - TABLE_D / 2), ...pts.map((p) => p.x + TABLE_D / 2)];
    const allY = [stageTop, stageBottom, ...pts.map((p) => p.y - TABLE_D / 2), ...pts.map((p) => p.y + TABLE_D / 2)];
    const pad = 40;
    const bx1 = Math.min(...allX) - pad, by1 = Math.min(...allY) - pad;
    const bw = Math.max(...allX) + pad - bx1, bh = Math.max(...allY) + pad - by1;
    const fitZoom = Math.min(rect.width / bw, rect.height / bh, 2);
    setZoom(fitZoom);
    setPan({ x: (rect.width - bw * fitZoom) / 2 - bx1 * fitZoom, y: (rect.height - bh * fitZoom) / 2 - by1 * fitZoom });
  }, [seatingView, tables]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
      const z = zoomRef.current, p = panRef.current;
      const newZoom = Math.max(0.3, Math.min(4, z * (e.deltaY < 0 ? 1.1 : 0.9)));
      const wx = (cx - p.x) / z, wy = (cy - p.y) / z;
      setZoom(newZoom);
      setPan({ x: cx - wx * newZoom, y: cy - wy * newZoom });
    };
    canvas.addEventListener("wheel", handler, { passive: false });
    return () => canvas.removeEventListener("wheel", handler);
  }, [seatingView]);

  function handleCanvasPointerDown(e: React.PointerEvent) {
    if (e.isPrimary) {
      panDragRef.current = { startClientX: e.clientX, startClientY: e.clientY, startPanX: panRef.current.x, startPanY: panRef.current.y };
    }
    const touches = (e.currentTarget as HTMLDivElement).querySelectorAll ? null : null;
    void touches;
  }

  function handleCanvasPointerMove(e: React.PointerEvent) {
    if (pinchRef.current) return;
    if (panDragRef.current) {
      setPan({ x: panDragRef.current.startPanX + e.clientX - panDragRef.current.startClientX, y: panDragRef.current.startPanY + e.clientY - panDragRef.current.startClientY });
    }
  }

  function handleCanvasPointerUp() {
    panDragRef.current = null;
    pinchRef.current = null;
  }

  return (
    <div className="animate-fade-in">
      {/* 刪除確認彈窗 */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-card rounded-2xl shadow-2xl p-6 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <div className="text-[17px] font-bold mb-1">刪除流程項目</div>
            <p className="text-sm text-text-soft mb-5">這個動作無法復原，確定要刪除嗎？</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 btn border border-border text-text-soft hover:bg-card-hover">取消</button>
              <button onClick={confirmDelete} disabled={pending} className="flex-1 btn bg-coral text-white hover:opacity-90">刪除</button>
            </div>
          </div>
        </div>
      )}
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
            <>
              {/* 搜尋 */}
              <div className="pb-2.5 border-b border-border mb-3">
                <input
                  type="text"
                  placeholder="搜尋賓客姓名"
                  value={seatingSearch}
                  onChange={(e) => setSeatingSearch(e.target.value)}
                  className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-bg"
                />
              </div>

              {/* 清單 / 平面圖 toggle */}
              <div className="inline-flex bg-card-hover rounded-[var(--radius-sm)] p-0.5 gap-0.5 mb-4">
                {(["list", "plan"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => { setSeatingView(v); setFocusedTableId(null); }}
                    className={`px-3 py-1 text-[13px] font-medium rounded-[calc(var(--radius-sm)-2px)] transition-colors ${seatingView === v ? "bg-card shadow-sm text-text" : "text-text-soft hover:text-text"}`}
                  >
                    {v === "plan" ? "平面圖" : "清單"}
                  </button>
                ))}
              </div>

              {seatingView === "list" && (
                <div className="flex flex-col gap-3">
                  {tables.filter((t) => {
                    if (!seatingSearch) return true;
                    return guests.some((g) => g.tableId === t.id && g.name.includes(seatingSearch));
                  }).map((t) => {
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

              {seatingView === "plan" && (
                <div className="relative rounded-[var(--radius-sm)] overflow-hidden" style={(() => {
                  const niceGrids = [25, 50, 100, 200, 400];
                  const worldGrid = niceGrids.find((g) => g * zoom >= 40) ?? 400;
                  const s = worldGrid * zoom;
                  const ox = pan.x % s, oy = pan.y % s;
                  return {
                    width: "100%", height: 360, cursor: "grab", touchAction: "none", backgroundColor: "#f8f9fa",
                    backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent ${s - 1}px,#c4d8ce ${s - 1}px,#c4d8ce ${s}px),repeating-linear-gradient(90deg,transparent,transparent ${s - 1}px,#c4d8ce ${s - 1}px,#c4d8ce ${s}px)`,
                    backgroundSize: `${s}px ${s}px`, backgroundPosition: `${ox}px ${oy}px`,
                  };
                })()}
                  ref={canvasRef}
                  onPointerDown={handleCanvasPointerDown}
                  onPointerMove={handleCanvasPointerMove}
                  onPointerUp={handleCanvasPointerUp}
                  onPointerLeave={handleCanvasPointerUp}
                  onClick={() => setFocusedTableId(null)}
                >
                  <div style={{ position: "absolute", width: WORLD_W, height: WORLD_H, transformOrigin: "0 0", transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})` }}>
                    {/* 舞台 */}
                    <div style={{ position: "absolute", left: "50%", top: 20, transform: "translateX(-50%)", width: 200, height: 44, borderRadius: 10, background: "var(--color-accent)", opacity: 0.85, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "white", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em" }}>舞　台</span>
                    </div>
                    {/* 桌子 */}
                    {tables.map((t) => {
                      const wx = t.x * WORLD_W, wy = t.y * WORLD_H;
                      const seated = guests.filter((g) => g.tableId === t.id);
                      const checkedCount = seated.filter((g) => g.checkedInAt).length;
                      const isFocused = focusedTableId === t.id;
                      return (
                        <div key={t.id} onClick={(e) => { e.stopPropagation(); setFocusedTableId(isFocused ? null : t.id); }}
                          style={{ position: "absolute", left: wx, top: wy, width: TABLE_D, height: TABLE_D, transform: "translate(-50%,-50%)", cursor: "pointer", userSelect: "none" }}>
                          <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "white", border: "2px solid var(--color-accent)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: isFocused ? "0 0 0 3px var(--color-accent)" : "0 1px 4px rgba(0,0,0,0.10)" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text)", whiteSpace: "nowrap", maxWidth: 64, overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</span>
                            <span style={{ fontSize: 10, color: "var(--color-text-soft)" }}>{seated.length} 位</span>
                            {checkedCount > 0 && <span style={{ fontSize: 9, color: "var(--color-accent)" }}>✓{checkedCount}</span>}
                          </div>
                          {/* popover */}
                          {isFocused && (
                            <div style={{ position: "absolute", left: "50%", bottom: TABLE_D / 2 + 8, transform: "translateX(-50%)", background: "white", border: "1px solid var(--color-border)", borderRadius: 10, padding: "10px 14px", minWidth: 140, maxWidth: 220, boxShadow: "0 4px 16px rgba(0,0,0,0.13)", zIndex: 50 }}>
                              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{t.name}</div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                {seated.length === 0 ? <span style={{ fontSize: 11, color: "var(--color-text-faint)" }}>尚無賓客</span> : seated.map((g) => (
                                  <span key={g.id} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "var(--color-card-hover)", display: "flex", alignItems: "center", gap: 3 }}>
                                    {tagLabel(g) && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 4px", borderRadius: 999 }} className={tagClass(g)}>{tagLabel(g)}</span>}
                                    {g.name}
                                    {g.checkedInAt && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-accent)", display: "inline-block" }} />}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* 縮放按鈕 */}
                  <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-30" onPointerDown={(e) => e.stopPropagation()}>
                    {[["＋", 1.2], ["－", 1 / 1.2]].map(([label, factor]) => (
                      <button key={label as string} onClick={() => {
                        const canvas = canvasRef.current; if (!canvas) return;
                        const rect = canvas.getBoundingClientRect();
                        const cx = rect.width / 2, cy = rect.height / 2;
                        const z = zoomRef.current, p = panRef.current;
                        const newZoom = Math.max(0.3, Math.min(4, z * (factor as number)));
                        const wx = (cx - p.x) / z, wy = (cy - p.y) / z;
                        setZoom(newZoom); setPan({ x: cx - wx * newZoom, y: cy - wy * newZoom });
                      }} style={{ width: 32, height: 32, borderRadius: 8, background: "white", border: "1px solid var(--color-border)", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.10)", cursor: "pointer" }}>{label}</button>
                    ))}
                  </div>
                </div>
              )}
            </>
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
          {/* 新增表單 */}
          <form action={handleAddEvent} className="flex flex-wrap gap-2 mb-3.5">
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
            <>
              {/* 自動 / 手動切換 */}
              <div className="flex items-center justify-end gap-2 mb-2">
                <span className="text-xs text-text-soft">自動更新狀態</span>
                <button
                  onClick={() => { const next = runMode === "auto" ? "manual" : "auto"; setRunMode(next); localStorage.setItem("runMode", next); }}
                  style={{ position: "relative", width: 40, height: 22, borderRadius: 999, background: runMode === "auto" ? "var(--color-accent)" : "var(--color-border)", transition: "background 0.2s", flexShrink: 0 }}
                >
                  <span style={{ position: "absolute", top: 2, left: runMode === "auto" ? 20 : 2, width: 18, height: 18, background: "white", borderRadius: "50%", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
                </button>
              </div>
              <div className="panel flex flex-col gap-2">
                {(() => {
                  const sorted = [...events].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
                  return sorted.map((e) => {
                    const status = runMode === "auto" ? getAutoStatus(e, sorted) : e.status;
                    const eTimeStr = new Date(e.time).toISOString().slice(11, 16);
                    const isNew = newEventTime !== null && eTimeStr === newEventTime;
                    return (
                      <div key={e.id} className={`lrow flex-wrap gap-y-1.5 ${isNew ? "animate-insert" : ""}`}>
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
                          disabled={pending || runMode === "auto"}
                          onClick={() => handleCycleStatus(e.id, e.status)}
                          className={`status ${STATUS_CLASS[status]} flex-none ${runMode === "auto" ? "cursor-default" : ""}`}
                        >
                          {STATUS_LABEL[status]}
                        </button>
                        {runMode === "manual" && (
                          <button
                            disabled={pending}
                            onClick={() => handleDeleteEvent(e.id)}
                            aria-label="刪除流程項目"
                            className="text-text-faint hover:text-coral p-1 flex-none"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
