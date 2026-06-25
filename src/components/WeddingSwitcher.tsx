"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { setActiveWedding } from "@/lib/actions/wedding";

const ROLE_LABEL: Record<string, string> = {
  OWNER: "主辦人",
  COLLABORATOR: "協作者",
  VIEWER: "檢視者",
};

export type SwitcherMembership = {
  weddingId: string;
  name: string;
  role: string;
};

export function WeddingSwitcher({
  weddingName,
  weddingDate,
  activeWeddingId,
  memberships,
}: {
  weddingName: string;
  weddingDate: Date | null;
  activeWeddingId: string;
  memberships: SwitcherMembership[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const canSwitch = memberships.length > 1;

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleSwitch(weddingId: string) {
    if (weddingId === activeWeddingId) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      await setActiveWedding(weddingId);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => canSwitch && setOpen((v) => !v)}
        className="flex items-center gap-2.5"
      >
        <div className="w-[30px] h-[30px] rounded-[9px] bg-gradient-to-br from-accent to-accent-hover grid place-items-center text-white font-display font-semibold text-[16px] shadow-[0_4px_10px_rgba(79,146,116,0.3)] flex-none">
          呱
        </div>
        <div className="text-left">
          <span className="flex items-center gap-1">
            <b className="text-[15px]">{weddingName}</b>
            {canSwitch && (
              <svg
                viewBox="0 0 24 24"
                className={`w-3.5 h-3.5 stroke-text-faint fill-none transition-transform ${open ? "rotate-180" : ""}`}
                strokeWidth={2}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            )}
          </span>
          {weddingDate && (
            <small className="block text-text-faint text-[11px] tracking-wider font-normal">
              {weddingDate.toLocaleDateString("zh-Hant", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </small>
          )}
        </div>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-64 bg-card border border-border rounded-[12px] shadow-[var(--shadow-lg)] py-1.5 z-40">
          {memberships.map((m) => (
            <button
              key={m.weddingId}
              onClick={() => handleSwitch(m.weddingId)}
              disabled={pending}
              className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left hover:bg-card-hover ${
                m.weddingId === activeWeddingId ? "text-accent-hover font-bold" : "text-text"
              }`}
            >
              <span className="text-sm truncate">{m.name}</span>
              <span className="status status-idle flex-none">{ROLE_LABEL[m.role]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
