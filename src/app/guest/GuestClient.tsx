"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { QrCode } from "@/components/QrCode";
import {
  addGuest,
  deleteGuest,
  setGuestAttending,
  setGuestGift,
} from "@/lib/actions/guests";
import { RsvpLinkCard } from "@/app/guest/RsvpLinkCard";

const TABS = [
  { key: "list", label: "名冊" },
  { key: "rsvp", label: "邀請與出席回覆" },
  { key: "gift", label: "禮金簿" },
] as const;

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

export type TableRow = { id: string; name: string };

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

          <form action={handleAddGuest} className="flex gap-2 mt-3.5">
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
        </div>
      )}

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
