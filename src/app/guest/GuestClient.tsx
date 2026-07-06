"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useRef, useCallback, useEffect } from "react";
import { QrCode } from "@/components/QrCode";
import {
  addGuest,
  deleteGuest,
  setGuestAttending,
  setGuestGift,
} from "@/lib/actions/guests";
import {
  addTable,
  assignGuestTable,
  deleteTable,
  updateTable,
  updateTablePosition,
} from "@/lib/actions/tables";
import { RsvpLinkCard } from "@/app/guest/RsvpLinkCard";

const TABS = [
  { key: "list", label: "名冊" },
  { key: "table", label: "桌位" },
  { key: "rsvp", label: "邀請與出席回覆" },
  { key: "gift", label: "禮金簿" },
] as const;

const SIDE_TAG: Record<string, string> = {
  GROOM: "bg-[#e2eaf0] text-[#5b7a92]",
  BRIDE: "bg-coral-tint text-coral",
};

export type GuestRow = {
  id: string;
  name: string;
  side: "GROOM" | "BRIDE";
  relation: string | null;
  phone: string | null;
  attending: boolean | null;
  plusOneCount: number;
  tableId: string | null;
  giftAmount: number | null;
  checkinToken: string | null;
};

export type TableRow = { id: string; name: string; capacity: number | null; x: number; y: number };

function EmptyState({
  icon,
  title,
  description,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <div className="panel">
      <div className="text-center py-8 px-2 text-text-soft">
        <div className="empty-icon">{icon}</div>
        <h3 className="text-text text-[17px] mb-1">{title}</h3>
        <p className="text-[13.5px] max-w-[330px] mx-auto mb-4">{description}</p>
        <button className="btn btn-primary">{cta}</button>
      </div>
    </div>
  );
}

function AttendingSelect({
  attending,
  pending,
  onChange,
}: {
  attending: boolean | null;
  pending: boolean;
  onChange: (value: boolean | null) => void;
}) {
  const value = attending === true ? "yes" : attending === false ? "no" : "";
  const colorClass =
    attending === true
      ? "bg-accent text-white"
      : attending === false
      ? "bg-coral text-white"
      : "bg-card-hover text-text-soft";
  return (
    <select
      disabled={pending}
      value={value}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "yes" ? true : v === "no" ? false : null);
      }}
      className={`text-xs font-semibold px-2 py-1 rounded-[7px] flex-none cursor-pointer border-none outline-none appearance-none pr-5 ${colorClass}`}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath stroke='currentColor' stroke-width='1.5' fill='none' d='M4 6l4 4 4-4'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 4px center", backgroundSize: "12px" }}
    >
      <option value="">未回覆</option>
      <option value="yes">出席</option>
      <option value="no">不出席</option>
    </select>
  );
}

export function GuestClient({
  weddingId,
  guests,
  rsvpToken,
  tables,
  rsvpCardTitle,
  rsvpCardSubtitle,
  rsvpCardImageUrl,
  rsvpCardColor,
}: {
  weddingId: string;
  guests: GuestRow[];
  rsvpToken: string;
  tables: TableRow[];
  rsvpCardTitle: string | null;
  rsvpCardSubtitle: string | null;
  rsvpCardImageUrl: string | null;
  rsvpCardColor: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "list";
  const [pending, startTransition] = useTransition();
  const [expandedQrId, setExpandedQrId] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  function setTab(next: string) {
    router.replace(`/guest?tab=${next}`, { scroll: false });
  }

  function handleAddGuest(formData: FormData) {
    startTransition(async () => {
      await addGuest(weddingId, formData);
      router.refresh();
    });
  }

  function handleDelete(guestId: string) {
    if (!window.confirm("刪除這位賓客？")) return;
    startTransition(async () => {
      await deleteGuest(guestId);
      router.refresh();
    });
  }

  function changeAttending(guest: GuestRow, value: boolean | null) {
    startTransition(async () => {
      await setGuestAttending(guest.id, value);
      router.refresh();
    });
  }

  function handleGiftBlur(guestId: string, value: string) {
    startTransition(async () => {
      await setGuestGift(guestId, value);
      router.refresh();
    });
  }

  const [giftSearch, setGiftSearch] = useState("");
  const [giftSort, setGiftSort] = useState<"default" | "asc" | "desc">("default");
  const [listSearch, setListSearch] = useState("");
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [unassignedSearch, setUnassignedSearch] = useState("");
  const [tableView, setTableView] = useState<"plan" | "list">("plan");
  const [tablePositions, setTablePositions] = useState<Record<string, { x: number; y: number }>>(
    () => Object.fromEntries(tables.map((t) => [t.id, { x: t.x, y: t.y }]))
  );
  const [focusedTableId, setFocusedTableId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{ id: string; startClientX: number; startClientY: number; origWorldX: number; origWorldY: number } | null>(null);
  const panDragRef = useRef<{ startClientX: number; startClientY: number; startPanX: number; startPanY: number } | null>(null);
  const pinchRef = useRef<{ dist: number; midX: number; midY: number; startZoom: number; startPanX: number; startPanY: number } | null>(null);
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  zoomRef.current = zoom;
  panRef.current = pan;

  const WORLD_W = 800;
  const WORLD_H = 600;
  const TABLE_D = 80;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    // 計算所有桌子 + 舞台的 bounding box
    const stageLeft = WORLD_W / 2 - 100, stageRight = WORLD_W / 2 + 100, stageTop = 20, stageBottom = 64;
    const pts = Object.values(tablePositions).map((p) => ({
      x: p.x * WORLD_W, y: p.y * WORLD_H,
    }));
    const allX = [stageLeft, stageRight, ...pts.map((p) => p.x - TABLE_D / 2), ...pts.map((p) => p.x + TABLE_D / 2)];
    const allY = [stageTop, stageBottom, ...pts.map((p) => p.y - TABLE_D / 2), ...pts.map((p) => p.y + TABLE_D / 2)];
    const pad = 40;
    const bx1 = Math.min(...allX) - pad, by1 = Math.min(...allY) - pad;
    const bx2 = Math.max(...allX) + pad, by2 = Math.max(...allY) + pad;
    const bw = bx2 - bx1, bh = by2 - by1;

    const fitZoom = Math.min(rect.width / bw, rect.height / bh, 2);
    setZoom(fitZoom);
    setPan({ x: (rect.width - bw * fitZoom) / 2 - bx1 * fitZoom, y: (rect.height - bh * fitZoom) / 2 - by1 * fitZoom });
  }, [tableView]);

  // 桌子拖拉
  const handleTablePointerDown = useCallback((e: React.PointerEvent, tableId: string) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const pos = tablePositions[tableId] ?? { x: 0.5, y: 0.5 };
    draggingRef.current = {
      id: tableId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origWorldX: pos.x * WORLD_W,
      origWorldY: pos.y * WORLD_H,
    };
    setFocusedTableId(null);
  }, [tablePositions]);

  const handleTablePointerMove = useCallback((e: React.PointerEvent) => {
    const d = draggingRef.current;
    if (!d) return;
    const z = zoomRef.current;
    const dxWorld = (e.clientX - d.startClientX) / z;
    const dyWorld = (e.clientY - d.startClientY) / z;
    const nx = Math.max(TABLE_D / 2, Math.min(WORLD_W - TABLE_D / 2, d.origWorldX + dxWorld));
    const ny = Math.max(TABLE_D / 2, Math.min(WORLD_H - TABLE_D / 2, d.origWorldY + dyWorld));
    setTablePositions((prev) => ({ ...prev, [d.id]: { x: nx / WORLD_W, y: ny / WORLD_H } }));
  }, []);

  const handleTablePointerUp = useCallback((e: React.PointerEvent, tableId: string) => {
    const d = draggingRef.current;
    if (!d) return;
    const moved = Math.hypot(e.clientX - d.startClientX, e.clientY - d.startClientY);
    draggingRef.current = null;
    if (moved < 5) {
      setFocusedTableId((prev) => prev === tableId ? null : tableId);
      return;
    }
    const pos = tablePositions[tableId];
    if (pos) updateTablePosition(tableId, pos.x, pos.y);
  }, [tablePositions]);

  // 畫布平移
  const handleCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    panDragRef.current = { startClientX: e.clientX, startClientY: e.clientY, startPanX: panRef.current.x, startPanY: panRef.current.y };
    setFocusedTableId(null);
  }, []);

  const handleCanvasPointerMove = useCallback((e: React.PointerEvent) => {
    const d = panDragRef.current;
    if (!d) return;
    setPan({ x: d.startPanX + e.clientX - d.startClientX, y: d.startPanY + e.clientY - d.startClientY });
  }, []);

  const handleCanvasPointerUp = useCallback(() => { panDragRef.current = null; }, []);

  // 滾輪縮放（需 non-passive 才能 preventDefault）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const z = zoomRef.current;
      const p = panRef.current;
      const newZoom = Math.max(0.3, Math.min(4, z * (e.deltaY < 0 ? 1.1 : 0.9)));
      const wx = (cx - p.x) / z;
      const wy = (cy - p.y) / z;
      setZoom(newZoom);
      setPan({ x: cx - wx * newZoom, y: cy - wy * newZoom });
    };
    canvas.addEventListener("wheel", handler, { passive: false });
    return () => canvas.removeEventListener("wheel", handler);
  }, [tableView]);

  // 捏合縮放
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2) return;
    const t1 = e.touches[0], t2 = e.touches[1];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    const midX = (t1.clientX + t2.clientX) / 2 - rect.left;
    const midY = (t1.clientY + t2.clientY) / 2 - rect.top;
    pinchRef.current = { dist, midX, midY, startZoom: zoomRef.current, startPanX: panRef.current.x, startPanY: panRef.current.y };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2 || !pinchRef.current) return;
    e.preventDefault();
    const t1 = e.touches[0], t2 = e.touches[1];
    const p = pinchRef.current;
    const newDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    const newZoom = Math.max(0.3, Math.min(4, p.startZoom * (newDist / p.dist)));
    const wx = (p.midX - p.startPanX) / p.startZoom;
    const wy = (p.midY - p.startPanY) / p.startZoom;
    setZoom(newZoom);
    setPan({ x: p.midX - wx * newZoom, y: p.midY - wy * newZoom });
  }, []);

  const handleTouchEnd = useCallback(() => { pinchRef.current = null; }, []);

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

  const attendingCount = guests.filter((g) => g.attending === true).length;
  const plusOneTotal = guests
    .filter((g) => g.attending === true)
    .reduce((s, g) => s + g.plusOneCount, 0);
  const totalGift = guests.reduce((s, g) => s + (g.giftAmount ?? 0), 0);

  return (
    <div className="animate-fade-in">
      <div className="text-[11px] tracking-[0.16em] uppercase text-accent-hover font-bold">
        賓客
      </div>
      <h1 className="text-[25px] md:text-[30px] font-bold tracking-tight mt-0.5 mb-3">
        賓客
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

      {tab === "list" && (
        <div>
          <div className="grid grid-cols-3 gap-3 mb-3.5">
            <div className="panel">
              <div className="text-xs text-text-soft">總賓客數</div>
              <div className="font-display font-semibold text-[26px] mt-1">{guests.length}</div>
            </div>
            <div className="panel">
              <div className="text-xs text-text-soft">確定出席</div>
              <div className="font-display font-semibold text-[26px] mt-1 text-accent">
                {attendingCount}
              </div>
            </div>
            <div className="panel">
              <div className="text-xs text-text-soft">攜伴人數</div>
              <div className="font-display font-semibold text-[26px] mt-1">{plusOneTotal}</div>
            </div>
          </div>

          <form action={handleAddGuest} className="flex gap-2 mb-3.5">
            <input
              name="name"
              placeholder="賓客姓名"
              required
              disabled={pending}
              className="flex-1 min-w-0 border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
            />
            <select
              name="side"
              disabled={pending}
              className="border border-border rounded-[9px] px-2 py-2 text-sm bg-card"
            >
              <option value="GROOM">男方</option>
              <option value="BRIDE">女方</option>
            </select>
            <input
              name="relation"
              placeholder="關係（選填）"
              disabled={pending}
              className="flex-1 min-w-0 border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
            />
            <button disabled={pending} className="btn btn-primary text-sm px-4">
              新增
            </button>
          </form>

          {guests.length === 0 ? (
            <EmptyState
              icon={
                <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 stroke-accent-hover fill-none" strokeWidth={1.6}>
                  <circle cx="9" cy="8" r="3.2" />
                  <path d="M3.5 20a5.5 5.5 0 0111 0" />
                </svg>
              }
              title="還沒有賓客"
              description="從草擬名單開始，或匯入 Excel／CSV；之後出席回覆也會自動進到這裡。"
              cta="＋ 新增賓客"
            />
          ) : (
            <div className="panel">
              <div className="pb-2.5 border-b border-border mb-0.5">
                <input
                  type="text"
                  placeholder="搜尋賓客姓名"
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                  className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-bg"
                />
              </div>
              {guests.filter((g) => g.name.includes(listSearch)).map((g) => {
                const isExpanded = expandedQrId === g.id;
                const checkinUrl = g.checkinToken ? `${origin}/checkin/${g.checkinToken}` : null;
                return (
                <div key={g.id} className="py-2.5 border-b border-border last:border-0">
                  {/* 第一行：姓名 + 出席按鈕 + 刪除 */}
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-sm flex-1 min-w-0 truncate">{g.name}</div>
                    <AttendingSelect
                      attending={g.attending}
                      pending={pending}
                      onChange={(value) => changeAttending(g, value)}
                    />
                    <button
                      disabled={pending}
                      onClick={() => handleDelete(g.id)}
                      aria-label="刪除賓客"
                      className="text-text-faint hover:text-coral flex-none p-1"
                    >
                      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth={1.6}>
                        <line x1="3" y1="3" x2="13" y2="13" /><line x1="13" y1="3" x2="3" y2="13" />
                      </svg>
                    </button>
                  </div>
                  {/* 第二行：男女方、桌位、QR */}
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      g.side === "GROOM" ? "bg-[#e2eaf0] text-[#5b7a92]" : "bg-coral-tint text-coral"
                    }`}>
                      {g.side === "GROOM" ? "男方" : "女方"}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      g.tableId ? "bg-accent-soft text-accent-hover" : "bg-card-hover text-text-faint"
                    }`}>
                      {g.tableId ? tables.find((t) => t.id === g.tableId)?.name ?? "已安排" : "未安排桌位"}
                    </span>
                    {checkinUrl && (
                      <button
                        onClick={() => setExpandedQrId(isExpanded ? null : g.id)}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                          isExpanded ? "bg-accent-soft text-accent-hover" : "bg-card-hover text-text-soft hover:text-accent-hover"
                        }`}
                      >
                        QR Code
                      </button>
                    )}
                    {(g.relation || g.phone) && (
                      <span className="text-[11px] text-text-faint">
                        {[g.relation, g.phone].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </div>
                  {isExpanded && checkinUrl && (
                    <div className="mt-2 flex flex-col items-start gap-1.5">
                      <div className="bg-white p-2 rounded-xl shadow-sm">
                        <QrCode url={checkinUrl} size={140} />
                      </div>
                      <p className="text-[11px] text-text-faint">截圖後傳給賓客，婚禮當天掃碼報到</p>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {tab === "table" && (() => {
        const unassigned = guests.filter((g) => !g.tableId && g.attending !== false);
        return (
          <div>
            {/* 視圖切換 */}
            <div className="flex gap-1 mb-3.5 bg-card-hover rounded-[10px] p-1 w-fit">
              {(["list", "plan"] as const).map((v) => (
                <button key={v} onClick={() => setTableView(v)}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-[8px] transition-colors ${
                    tableView === v ? "bg-card shadow-sm text-text" : "text-text-soft hover:text-text"
                  }`}>
                  {v === "plan" ? "平面圖" : "清單"}
                </button>
              ))}
            </div>

            {/* 平面圖 */}
            {tableView === "plan" && (
              <div className="mb-4">
                {tables.length === 0 ? (
                  <div className="panel text-center py-10 text-text-soft text-sm">
                    先用「清單」模式新增桌次，再回來排列位置。
                  </div>
                ) : (
                  <div
                    ref={canvasRef}
                    className="relative rounded-[14px] border border-border overflow-hidden select-none"
                    style={(() => {
                      // 讓格線在畫面上永遠保持約 50px 間距
                      const niceGrids = [25, 50, 100, 200, 400];
                      const worldGrid = niceGrids.find((g) => g * zoom >= 40) ?? 400;
                      const s = worldGrid * zoom;
                      const ox = pan.x % s;
                      const oy = pan.y % s;
                      return { width: "100%", height: 360, cursor: "grab", backgroundColor: "#f8f9fa", backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent ${s - 1}px,#c4d8ce ${s - 1}px,#c4d8ce ${s}px),repeating-linear-gradient(90deg,transparent,transparent ${s - 1}px,#c4d8ce ${s - 1}px,#c4d8ce ${s}px)`, backgroundSize: `${s}px ${s}px`, backgroundPosition: `${ox}px ${oy}px` };
                    })()}
                    onPointerDown={handleCanvasPointerDown}
                    onPointerMove={handleCanvasPointerMove}
                    onPointerUp={handleCanvasPointerUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onClick={() => setFocusedTableId(null)}
                  >
                    {/* 縮放按鈕 */}
                    <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-30" onPointerDown={(e) => e.stopPropagation()}>
                      <button onClick={(e) => { e.stopPropagation(); const z = Math.min(4, zoomRef.current * 1.25); const rect = canvasRef.current!.getBoundingClientRect(); const cx = rect.width/2, cy = rect.height/2; const wx=(cx-panRef.current.x)/zoomRef.current, wy=(cy-panRef.current.y)/zoomRef.current; setZoom(z); setPan({x:cx-wx*z,y:cy-wy*z}); }}
                        className="w-8 h-8 bg-card border border-border rounded-lg shadow text-lg font-bold flex items-center justify-center hover:bg-card-hover">＋</button>
                      <button onClick={(e) => { e.stopPropagation(); const z = Math.max(0.3, zoomRef.current * 0.8); const rect = canvasRef.current!.getBoundingClientRect(); const cx = rect.width/2, cy = rect.height/2; const wx=(cx-panRef.current.x)/zoomRef.current, wy=(cy-panRef.current.y)/zoomRef.current; setZoom(z); setPan({x:cx-wx*z,y:cy-wy*z}); }}
                        className="w-8 h-8 bg-card border border-border rounded-lg shadow text-lg font-bold flex items-center justify-center hover:bg-card-hover">－</button>
                    </div>
                    {/* 世界座標層 */}
                    <div style={{ position: "absolute", width: WORLD_W, height: WORLD_H, transformOrigin: "0 0", transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})` }}>
                      {/* 舞台 */}
                      <div style={{ position: "absolute", left: "50%", top: 20, transform: "translateX(-50%)", width: 200, height: 44, borderRadius: 10, background: "var(--color-accent)", opacity: 0.85, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "white", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em" }}>舞　台</span>
                      </div>
                      {tables.map((t) => {
                        const pos = tablePositions[t.id] ?? { x: 0.5, y: 0.5 };
                        const wx = pos.x * WORLD_W;
                        const wy = pos.y * WORLD_H;
                        const seated = guests.filter((g) => g.tableId === t.id);
                        const seats = seated.reduce((s, g) => s + 1 + g.plusOneCount, 0);
                        const isFocused = focusedTableId === t.id;
                        return (
                          <div key={t.id} onClick={(e) => e.stopPropagation()} style={{ position: "absolute", left: wx, top: wy, width: TABLE_D, height: TABLE_D, transform: "translate(-50%,-50%)", zIndex: isFocused ? 20 : 10 }}>
                            <div
                              onPointerDown={(e) => { e.stopPropagation(); handleTablePointerDown(e, t.id); }}
                              onPointerMove={handleTablePointerMove}
                              onPointerUp={(e) => handleTablePointerUp(e, t.id)}
                              className={`w-full h-full rounded-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing shadow-md ${isFocused ? "ring-2 ring-accent" : ""}`}
                              style={{ backgroundColor: isFocused ? "var(--color-accent)" : "var(--color-card)", border: "2px solid var(--color-border)" }}
                            >
                              <span className={`text-[13px] font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[64px] text-center ${isFocused ? "text-white" : "text-text"}`}>{t.name}</span>
                              <span className={`text-[11px] whitespace-nowrap ${isFocused ? "text-white/80" : "text-text-faint"}`}>{seats}{t.capacity ? `/${t.capacity}` : ""} 人</span>
                            </div>
                            {isFocused && (
                              <div className="absolute left-1/2 bg-card border border-border rounded-[12px] shadow-[var(--shadow-lg)] p-3 min-w-[140px] z-30" style={{ top: TABLE_D + 8, transform: "translateX(-50%)" }} onClick={(e) => e.stopPropagation()}>
                                {seated.length === 0 ? (
                                  <p className="text-xs text-text-faint text-center">還沒有人坐這桌</p>
                                ) : (
                                  <ul className="flex flex-col gap-1">
                                    {seated.map((g) => (
                                      <li key={g.id} className="text-xs flex items-center gap-1.5 whitespace-nowrap">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-none ${SIDE_TAG[g.side]}`}>{g.side === "GROOM" ? "男" : "女"}</span>
                                        {g.name}{g.plusOneCount > 0 && ` +${g.plusOneCount}`}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-text-faint mt-2">拖動桌子調整位置，點擊查看賓客名單・捏合或滾輪縮放</p>
              </div>
            )}

            {/* 清單模式 */}
            {tableView === "list" && <>
            <form action={handleAddTable} className="flex gap-2 mb-3.5">
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

            {tables.length === 0 ? (
              <EmptyState
                icon={
                  <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 stroke-accent-hover fill-none" strokeWidth={1.6}>
                    <circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" />
                  </svg>
                }
                title="還沒有桌次"
                description="建立桌次後，再把賓客分配進去。"
                cta="＋ 新增桌次"
              />
            ) : (
              <div className="flex flex-col gap-3">
                {tables.map((t) => {
                  const seated = guests.filter((g) => g.tableId === t.id);
                  const seats = seated.reduce((s, g) => s + 1 + g.plusOneCount, 0);
                  return (
                    <div key={t.id} className="panel">
                      {editingTableId === t.id ? (
                        <form
                          action={(formData) => handleUpdateTable(t.id, formData)}
                          className="flex items-center gap-2 mb-2"
                        >
                          <input name="name" defaultValue={t.name} required autoFocus disabled={pending}
                            className="flex-1 min-w-0 border border-border rounded-[9px] px-2.5 py-1.5 text-sm bg-card" />
                          <input name="capacity" type="number" min={1} defaultValue={t.capacity ?? ""} placeholder="人數" disabled={pending}
                            className="w-16 border border-border rounded-[9px] px-2.5 py-1.5 text-sm bg-card" />
                          <button type="button" onClick={() => setEditingTableId(null)} disabled={pending}
                            className="text-text-faint hover:text-coral text-xs font-semibold px-2">取消</button>
                          <button type="submit" disabled={pending} className="btn btn-primary text-xs px-3 py-1.5">儲存</button>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between mb-2">
                          <button onClick={() => setEditingTableId(t.id)}
                            className="font-bold text-[15px] flex items-center gap-1.5 hover:text-accent-hover">
                            {t.name}
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-text-faint fill-none" strokeWidth={2}>
                              <path d="M16.5 3.5l4 4L7 21l-4 1 1-4z" />
                            </svg>
                          </button>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-text-soft">
                              {seats}{t.capacity ? ` / ${t.capacity}` : ""} 位
                            </div>
                            <button onClick={() => handleDeleteTable(t.id)} aria-label="刪除桌次"
                              className="text-text-faint hover:text-coral p-1">✕</button>
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {seated.length === 0 ? (
                          <span className="text-[12.5px] text-text-faint">還沒有人坐這桌</span>
                        ) : seated.map((g) => (
                          <span key={g.id}
                            className="text-[12px] font-medium pl-2.5 pr-1 py-1 rounded-full bg-card-hover text-text flex items-center gap-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${SIDE_TAG[g.side]}`}>
                              {g.side === "GROOM" ? "男方" : "女方"}
                            </span>
                            {g.name}{g.plusOneCount > 0 && ` +${g.plusOneCount}`}
                            <button onClick={() => handleAssignTable(g.id, "")} aria-label="移出這桌"
                              className="text-text-faint hover:text-coral">✕</button>
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
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-6 h-6 rounded-full bg-accent text-white grid place-items-center flex-none">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none" strokeWidth={2.2}>
                      <circle cx="12" cy="8" r="3.2" /><path d="M5 19a7 7 0 0114 0" />
                    </svg>
                  </div>
                  <span className="font-bold text-[15px] text-accent-hover">
                    尚未安排桌位（{unassigned.length}）
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="搜尋賓客姓名"
                  value={unassignedSearch}
                  onChange={(e) => setUnassignedSearch(e.target.value)}
                  className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-card mb-2.5"
                />
                <div className="flex flex-col gap-1.5">
                  {unassigned.filter((g) => g.name.includes(unassignedSearch)).map((g) => (
                    <div key={g.id}
                      className="flex items-center gap-3 bg-card shadow-[var(--shadow)] rounded-[10px] px-3 py-2.5">
                      <div className="flex-1 min-w-0 text-sm">
                        <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full mr-1.5 ${SIDE_TAG[g.side]}`}>
                          {g.side === "GROOM" ? "男方" : "女方"}
                        </span>
                        {g.name}{g.plusOneCount > 0 && ` +${g.plusOneCount}`}
                      </div>
                      <select
                        defaultValue=""
                        disabled={pending || tables.length === 0}
                        onChange={(e) => handleAssignTable(g.id, e.target.value)}
                        className="text-xs border border-border rounded-md px-2 py-1.5 bg-card"
                      >
                        <option value="" disabled>選擇桌次</option>
                        {tables.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </>}
          </div>
        );
      })()}

      {tab === "rsvp" && (
        <RsvpLinkCard
          weddingId={weddingId}
          token={rsvpToken}
          cardTitle={rsvpCardTitle}
          cardSubtitle={rsvpCardSubtitle}
          cardImageUrl={rsvpCardImageUrl}
          cardColor={rsvpCardColor}
        />
      )}

      {tab === "gift" && (
        <div>
          <div className="panel mb-3.5">
            <div className="text-xs text-text-soft">禮金總額</div>
            <div className="font-display font-semibold text-[26px] mt-1 text-accent">
              NT$ {totalGift.toLocaleString()}
            </div>
          </div>

          {guests.length === 0 ? (
            <EmptyState
              icon={
                <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 stroke-accent-hover fill-none" strokeWidth={1.6}>
                  <rect x="3" y="8" width="18" height="13" rx="1" />
                  <path d="M3 12h18M12 8v13" />
                </svg>
              }
              title="尚未記錄禮金"
              description="現場收禮可在這裡逐筆登記，並對應到賓客；事後統計、回禮都方便。"
              cta="＋ 新增紀錄"
            />
          ) : (() => {
            const filtered = guests
              .filter((g) => g.name.includes(giftSearch))
              .sort((a, b) => {
                if (giftSort === "desc") return (b.giftAmount ?? 0) - (a.giftAmount ?? 0);
                if (giftSort === "asc") return (a.giftAmount ?? 0) - (b.giftAmount ?? 0);
                return 0;
              });
            return (
              <>
                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    placeholder="搜尋賓客姓名"
                    value={giftSearch}
                    onChange={(e) => setGiftSearch(e.target.value)}
                    className="flex-1 min-w-0 border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
                  />
                  <select
                    value={giftSort}
                    onChange={(e) => setGiftSort(e.target.value as typeof giftSort)}
                    className="border border-border rounded-[9px] px-2 py-2 text-sm bg-card"
                  >
                    <option value="default">預設</option>
                    <option value="desc">高至低</option>
                    <option value="asc">低至高</option>
                  </select>
                </div>
                <div className="panel flex flex-col gap-2">
                  {filtered.length === 0 ? (
                    <p className="text-sm text-text-faint text-center py-4">找不到「{giftSearch}」</p>
                  ) : filtered.map((g) => (
                    <div key={g.id} className="lrow">
                      <div className="flex-1 min-w-0 flex items-center gap-1.5">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-none ${
                          g.side === "GROOM" ? "bg-[#e2eaf0] text-[#5b7a92]" : "bg-coral-tint text-coral"
                        }`}>
                          {g.side === "GROOM" ? "男方" : "女方"}
                        </span>
                        <div className="font-semibold text-sm truncate">{g.name}</div>
                      </div>
                      <div className="flex items-center gap-1 flex-none">
                        <span className="text-xs text-text-soft">NT$</span>
                        <input
                          type="text"
                          defaultValue={g.giftAmount ?? ""}
                          placeholder="0"
                          onBlur={(e) => handleGiftBlur(g.id, e.target.value)}
                          className="w-24 border border-border rounded-[9px] px-2 py-1 text-sm bg-card text-right"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
