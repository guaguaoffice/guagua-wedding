"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteWedding, leaveWedding, transferOwnership } from "@/lib/actions/wedding";
import { ConfirmDialog } from "@/components/ConfirmDialog";

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
  const [confirmTransfer, setConfirmTransfer] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  function handleTransfer() {
    setConfirmTransfer(true);
  }

  function doTransfer() {
    setConfirmTransfer(false);
    startTransition(async () => {
      const result = await transferOwnership(weddingId, selectedUserId);
      setMessage({ ok: result.ok, text: result.message });
      if (result.ok) router.refresh();
    });
  }

  function handleLeave() {
    setConfirmLeave(true);
  }

  function doLeave() {
    setConfirmLeave(false);
    startTransition(async () => {
      const result = await leaveWedding(weddingId);
      if (result) setMessage({ ok: result.ok, text: result.message });
    });
  }

  function handleDelete() {
    setDeleteInput("");
    setConfirmDelete(true);
  }

  function doDelete() {
    if (deleteInput !== weddingName) return;
    setConfirmDelete(false);
    startTransition(async () => {
      const result = await deleteWedding(weddingId);
      if (result) setMessage({ ok: result.ok, text: result.message });
    });
  }

  const transferTarget = otherMembers.find((m) => m.userId === selectedUserId);

  return (
    <div className="flex flex-col gap-3.5">
      {confirmTransfer && transferTarget && (
        <ConfirmDialog
          title="轉移主辦權"
          message={`確定要把主辦人轉移給「${transferTarget.name ?? transferTarget.email}」嗎？你會變成協作者。`}
          confirmLabel="確定轉移"
          danger={false}
          onConfirm={doTransfer}
          onCancel={() => setConfirmTransfer(false)}
        />
      )}
      {confirmLeave && (
        <ConfirmDialog
          title={`離開「${weddingName}」`}
          message="離開後就不會再看到這場婚禮，主辦人可以再重新邀請你加入。"
          confirmLabel="確定離開"
          onConfirm={doLeave}
          onCancel={() => setConfirmLeave(false)}
        />
      )}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="bg-card rounded-2xl shadow-2xl p-6 w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[17px] font-bold mb-1">刪除婚禮</div>
            <p className="text-sm text-text-soft mb-4">
              此操作無法復原，所有決策、預算、賓客資料都會一併刪除。<br />
              請輸入婚禮名稱「<strong>{weddingName}</strong>」以確認刪除：
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder={weddingName}
              className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-bg mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 btn border border-border text-text-soft hover:bg-card-hover">取消</button>
              <button
                onClick={doDelete}
                disabled={deleteInput !== weddingName || pending}
                className="flex-1 btn bg-coral text-white hover:opacity-90 disabled:opacity-40"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      )}

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
              className="flex-1 min-w-0 border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
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
