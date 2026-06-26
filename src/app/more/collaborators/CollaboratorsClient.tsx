"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { removeMember, updateMemberRole } from "@/lib/actions/members";

const ROLE_LABEL: Record<string, string> = {
  OWNER: "主辦人",
  COLLABORATOR: "協作者",
  VIEWER: "檢視者",
};

export type Member = {
  id: string;
  role: "OWNER" | "COLLABORATOR" | "VIEWER";
  user: { id: string; name: string | null; email: string; image: string | null };
};

export function CollaboratorsClient({
  members,
  isOwner,
}: {
  members: Member[];
  isOwner: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function handleRoleChange(memberId: string, role: "COLLABORATOR" | "VIEWER") {
    startTransition(async () => {
      const result = await updateMemberRole(memberId, role);
      setMessage({ ok: result.ok, text: result.message });
      router.refresh();
    });
  }

  function handleRemove(memberId: string, name: string) {
    if (!window.confirm(`確定要移除「${name}」嗎？`)) return;
    startTransition(async () => {
      const result = await removeMember(memberId);
      setMessage({ ok: result.ok, text: result.message });
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="panel">
        {members.map((m) => (
          <div key={m.id} className="lrow">
            <div className="w-9 h-9 rounded-full bg-accent-soft text-accent-hover flex-none flex items-center justify-center font-semibold text-sm overflow-hidden">
              {m.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                (m.user.name ?? m.user.email).slice(0, 1)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{m.user.name ?? m.user.email}</div>
              <div className="text-xs text-text-soft mt-0.5">{m.user.email}</div>
            </div>
            {isOwner && m.role !== "OWNER" ? (
              <div className="flex items-center gap-2">
                <select
                  value={m.role}
                  disabled={pending}
                  onChange={(e) =>
                    handleRoleChange(m.id, e.target.value as "COLLABORATOR" | "VIEWER")
                  }
                  className="text-xs border border-border rounded-md px-2 py-1 bg-card"
                >
                  <option value="COLLABORATOR">協作者</option>
                  <option value="VIEWER">檢視者</option>
                </select>
                <button
                  onClick={() => handleRemove(m.id, m.user.name ?? m.user.email)}
                  disabled={pending}
                  aria-label="移除協作者"
                  className="text-text-faint hover:text-coral p-1.5 rounded-md hover:bg-coral-tint"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth={2}>
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            ) : (
              <span className="status status-idle">{ROLE_LABEL[m.role]}</span>
            )}
          </div>
        ))}
      </div>

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
