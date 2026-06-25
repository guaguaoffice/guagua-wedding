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
    <div className="panel">
      <div className="font-bold text-[15px] mb-2">我參加的婚禮</div>
      <div className="flex flex-col gap-1">
        {memberships.map((m) => (
          <button
            key={m.weddingId}
            onClick={() => handleSwitch(m.weddingId)}
            disabled={pending}
            className="lrow w-full text-left"
          >
            <div className="flex-1 min-w-0 font-medium text-sm">{m.name}</div>
            <span className="status status-idle">{ROLE_LABEL[m.role]}</span>
            {m.weddingId === activeWeddingId && (
              <span className="status status-done">目前顯示</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
