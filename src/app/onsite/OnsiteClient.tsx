"use client";

import { useRouter, useSearchParams } from "next/navigation";

const TABS = [
  { key: "table", label: "桌位" },
  { key: "checkin", label: "報到" },
  { key: "run", label: "當天流程" },
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

export function OnsiteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "table";

  function setTab(next: string) {
    router.replace(`/onsite?tab=${next}`, { scroll: false });
  }

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
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 stroke-accent-hover fill-none" strokeWidth={1.6}>
              <circle cx="12" cy="12" r="8" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          }
          title="還沒有桌位"
          description="賓客名單確定後在這裡開桌、分配座位；現場用 QR 報到也會對到桌次。"
          cta="＋ 新增桌位"
        />
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
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 stroke-accent-hover fill-none" strokeWidth={1.6}>
              <path d="M12 7v5l3 2" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          }
          title="還沒排當天流程"
          description="把進場、敬酒、送客等時間排成流程表，可指派負責人並分享給協作者與廠商。"
          cta="＋ 新增流程項目"
        />
      )}
    </div>
  );
}
