"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setActiveWedding } from "@/lib/actions/wedding";
import type { SwitcherMembership } from "@/components/WeddingSwitcher";

const ROLE_LABEL: Record<string, string> = {
  OWNER: "主辦人",
  COLLABORATOR: "協作者",
  VIEWER: "檢視者",
};

export function WeddingListSwitcher({
  activeWeddingId,
  memberships,
}: {
  activeWeddingId: string;
  memberships: SwitcherMembership[];
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
        return (
          <button
            key={m.weddingId}
            onClick={() => handleSwitch(m.weddingId)}
            disabled={pending}
            className={`w-full text-left rounded-[12px] px-4 py-3.5 flex items-center gap-3 border-2 transition-colors ${
              active
                ? "border-accent bg-accent-soft"
                : "border-transparent bg-card-hover hover:bg-border"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full grid place-items-center flex-none ${
                active ? "bg-accent text-white" : "bg-card text-text-faint"
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
              <div className={`font-bold text-[15px] ${active ? "text-accent-hover" : "text-text"}`}>
                {m.name}
              </div>
              <div className="text-[12px] text-text-soft mt-0.5">
                {active ? "目前使用中" : `點擊切換 · ${ROLE_LABEL[m.role]}`}
              </div>
            </div>
            <span className="status status-idle flex-none">{ROLE_LABEL[m.role]}</span>
          </button>
        );
      })}
    </div>
  );
}
