"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setActiveWedding } from "@/lib/actions/wedding";

const ROLE_LABEL: Record<string, string> = {
  OWNER: "主辦人",
  COLLABORATOR: "協作者",
  VIEWER: "檢視者",
};

type ListMembership = {
  weddingId: string;
  name: string;
  role: string;
  weddingDate: string | null;
  guestCount: number;
  tableCount: number;
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function WeddingListSwitcher({
  activeWeddingId,
  memberships,
}: {
  activeWeddingId: string;
  memberships: ListMembership[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSwitch(weddingId: string) {
    if (weddingId === activeWeddingId) return;
    startTransition(async () => {
      await setActiveWedding(weddingId);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {memberships.map((m) => {
        const active = m.weddingId === activeWeddingId;
        const dateStr = formatDate(m.weddingDate);
        return (
          <button
            key={m.weddingId}
            onClick={() => handleSwitch(m.weddingId)}
            disabled={pending}
            className={`w-full text-left rounded-[14px] px-4 py-4 border-2 transition-colors ${
              active
                ? "border-accent bg-accent-soft"
                : "border-transparent bg-card hover:bg-card-hover"
            }`}
            style={{ boxShadow: "var(--shadow)" }}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-full grid place-items-center flex-none mt-0.5 ${
                  active ? "bg-accent text-white" : "bg-card-hover text-text-faint"
                }`}
              >
                {active ? (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none" strokeWidth={2.2}>
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-[15px] font-display font-semibold">
                    {m.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-bold text-[15px] ${active ? "text-accent-hover" : "text-text"}`}>
                    {m.name}
                  </span>
                  <span className="status status-idle">{ROLE_LABEL[m.role]}</span>
                  {active && <span className="status status-done">使用中</span>}
                </div>
                {dateStr && (
                  <div className="text-[12px] text-text-soft mt-1">📅 {dateStr}</div>
                )}
                <div className="flex gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-text-faint fill-none flex-none" strokeWidth={2}>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span className="text-[12px] text-text-soft">{m.guestCount} 位賓客</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-text-faint fill-none flex-none" strokeWidth={2}>
                      <rect x="3" y="10" width="18" height="11" rx="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                    <span className="text-[12px] text-text-soft">{m.tableCount} 桌</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
