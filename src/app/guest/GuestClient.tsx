"use client";

import { useRouter, useSearchParams } from "next/navigation";

const TABS = [
  { key: "list", label: "名冊" },
  { key: "rsvp", label: "邀請與 RSVP" },
  { key: "gift", label: "禮金簿" },
] as const;

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

export function GuestClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "list";

  function setTab(next: string) {
    router.replace(`/guest?tab=${next}`, { scroll: false });
  }

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
      )}

      {tab === "rsvp" && (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 stroke-accent-hover fill-none" strokeWidth={1.6}>
              <path d="M4 6h16v12H4z" />
              <path d="M4 8l8 5 8-5" />
            </svg>
          }
          title="還沒建立出席調查"
          description="做一份 RSVP 表單，產生公開連結傳給賓客；回覆會自動匯入名冊與桌位。"
          cta="建立表單"
        />
      )}

      {tab === "gift" && (
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
      )}
    </div>
  );
}
