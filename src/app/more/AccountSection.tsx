"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteWedding, leaveWedding, transferOwnership } from "@/lib/actions/wedding";

export type OtherMember = {
  userId: string;
  name: string | null;
  email: string;
};

export function AccountSection({
  weddingId,
  weddingName,
  isOwner,
  otherMembers,
}: {
  weddingId: string;
  weddingName: string;
  isOwner: boolean;
  otherMembers: OtherMember[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedUserId, setSelectedUserId] = useState(otherMembers[0]?.userId ?? "");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function handleTransfer() {
    const target = otherMembers.find((m) => m.userId === selectedUserId);
    if (!target) return;
    if (
      !window.confirm(
        `確定要把主辦人轉移給「${target.name ?? target.email}」嗎？你會變成協作者。`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await transferOwnership(weddingId, selectedUserId);
      setMessage({ ok: result.ok, text: result.message });
      if (result.ok) router.refresh();
    });
  }

  function handleLeave() {
    if (!window.confirm(`確定要離開「${weddingName}」嗎？`)) return;
    startTransition(async () => {
      const result = await leaveWedding(weddingId);
      if (result) setMessage({ ok: result.ok, text: result.message });
    });
  }

  function handleDelete() {
    const typed = window.prompt(
      `此操作無法復原，所有決策、預算、賓客資料都會一併刪除。\n請輸入婚禮名稱「${weddingName}」以確認刪除：`
    );
    if (typed === null) return;
    if (typed !== weddingName) {
      window.alert("名稱不符，已取消刪除。");
      return;
    }
    startTransition(async () => {
      const result = await deleteWedding(weddingId);
      if (result) setMessage({ ok: result.ok, text: result.message });
    });
  }

  return (
    <div className="flex flex-col gap-3.5">
      {isOwner && otherMembers.length > 0 && (
        <div className="panel">
          <div className="font-bold text-[15px] mb-1">轉移主辦權</div>
          <p className="text-text-soft text-sm mb-3">
            轉移後對方會成為主辦人，你會變成協作者。
          </p>
          <div className="flex gap-2">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={pending}
              className="flex-1 border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
            >
              {otherMembers.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.name ?? m.email}
                </option>
              ))}
            </select>
            <button onClick={handleTransfer} disabled={pending} className="btn btn-secondary">
              轉移
            </button>
          </div>
        </div>
      )}

      {!isOwner && (
        <div className="panel">
          <div className="font-bold text-[15px] mb-1">離開這場婚禮</div>
          <p className="text-text-soft text-sm mb-3">
            離開後就不會再看到這場婚禮，主辦人可以再重新邀請你加入。
          </p>
          <button onClick={handleLeave} disabled={pending} className="btn btn-secondary">
            離開「{weddingName}」
          </button>
        </div>
      )}

      {isOwner && (
        <div className="panel border-coral/40">
          <div className="font-bold text-[15px] mb-1 text-coral">刪除這場婚禮</div>
          <p className="text-text-soft text-sm mb-3">
            刪除後無法復原，所有決策、預算、賓客資料都會一併刪除。
          </p>
          <button
            onClick={handleDelete}
            disabled={pending}
            className="btn btn-secondary text-coral"
          >
            刪除「{weddingName}」
          </button>
        </div>
      )}

      {message && (
        <div
          className={`text-sm px-3 py-2 rounded-[9px] ${
            message.ok ? "bg-accent-tint text-accent-hover" : "bg-coral-tint text-coral"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
