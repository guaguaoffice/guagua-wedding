"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  addGuest,
  deleteGuest,
  setGuestAttending,
  setGuestGift,
  setGuestTableNumber,
} from "@/lib/actions/guests";
import { RsvpLinkCard } from "@/app/guest/RsvpLinkCard";
import { CollaboratorsPreview, type CollaboratorRow } from "@/app/guest/CollaboratorsPreview";

const TABS = [
  { key: "list", label: "名冊" },
  { key: "rsvp", label: "邀請與 RSVP" },
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
  tableNumber: string | null;
  giftAmount: number | null;
};

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

function AttendingBadge({
  attending,
  pending,
  onClick,
}: {
  attending: boolean | null;
  pending: boolean;
  onClick: () => void;
}) {
  const label = attending === true ? "出席" : attending === false ? "不出席" : "未回覆";
  const cls = attending === true ? "status-done" : attending === false ? "status-overdue" : "status-idle";
  return (
    <button disabled={pending} onClick={onClick} className={`status ${cls}`}>
      {label}
    </button>
  );
}

export function GuestClient({
  weddingId,
  guests,
  rsvpToken,
  collaborators,
}: {
  weddingId: string;
  guests: GuestRow[];
  rsvpToken: string;
  collaborators: CollaboratorRow[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "list";
  const [pending, startTransition] = useTransition();

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

  function cycleAttending(guest: GuestRow) {
    const next = guest.attending === null ? true : guest.attending === true ? false : null;
    startTransition(async () => {
      await setGuestAttending(guest.id, next);
      router.refresh();
    });
  }

  function handleTableBlur(guestId: string, value: string) {
    startTransition(async () => {
      await setGuestTableNumber(guestId, value);
      router.refresh();
    });
  }

  function handleGiftBlur(guestId: string, value: string) {
    startTransition(async () => {
      await setGuestGift(guestId, value);
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
          <CollaboratorsPreview collaborators={collaborators} />

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
              description="從草擬名單開始，或匯入 Excel／CSV；之後 RSVP 回覆也會自動進到這裡。"
              cta="＋ 新增賓客"
            />
          ) : (
            <div className="panel flex flex-col gap-2">
              {guests.map((g) => (
                <div key={g.id} className="lrow flex-wrap gap-y-1.5">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-none ${
                      g.side === "GROOM" ? "bg-accent-soft text-accent-hover" : "bg-coral-tint text-coral"
                    }`}
                  >
                    {g.side === "GROOM" ? "男方" : "女方"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{g.name}</div>
                    {(g.relation || g.phone) && (
                      <div className="text-xs text-text-soft mt-0.5">
                        {[g.relation, g.phone].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </div>
                  <input
                    defaultValue={g.tableNumber ?? ""}
                    placeholder="桌號"
                    onBlur={(e) => handleTableBlur(g.id, e.target.value)}
                    className="w-16 border border-border rounded-[9px] px-2 py-1 text-xs bg-card flex-none"
                  />
                  <AttendingBadge
                    attending={g.attending}
                    pending={pending}
                    onClick={() => cycleAttending(g)}
                  />
                  <button
                    disabled={pending}
                    onClick={() => handleDelete(g.id)}
                    aria-label="刪除賓客"
                    className="text-text-faint hover:text-coral p-1 flex-none"
                  >
                    ✕
                  </button>
                </div>
              ))}
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

      {tab === "rsvp" && <RsvpLinkCard weddingId={weddingId} token={rsvpToken} />}

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
          ) : (
            <div className="panel flex flex-col gap-2">
              {guests.map((g) => (
                <div key={g.id} className="lrow">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{g.name}</div>
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
          )}
        </div>
      )}
    </div>
  );
}
