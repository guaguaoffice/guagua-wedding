"use client";

import { useEffect, useState, useTransition } from "react";
import { checkInGuest } from "@/lib/actions/checkin";

type Result =
  | { ok: false; error: string }
  | { ok: true; alreadyCheckedIn: boolean; name: string; checkedInAt: Date };

export function CheckinClient({ token }: { token: string }) {
  const [result, setResult] = useState<Result | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const r = await checkInGuest(token);
      setResult(r);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-text-soft text-sm">報到中…</div>
      </div>
    );
  }

  if (!result.ok) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-6 text-center">
        <div className="empty-icon mx-auto">
          <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 stroke-coral fill-none" strokeWidth={1.6}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <h1 className="text-xl font-bold mt-3">無效的報到連結</h1>
        <p className="text-text-soft mt-2 text-sm">{result.error}</p>
      </div>
    );
  }

  const timeStr = new Date(result.checkedInAt).toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (result.alreadyCheckedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center mx-auto">
          <svg viewBox="0 0 24 24" className="w-8 h-8 stroke-accent-hover fill-none" strokeWidth={2}>
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold mt-4">{result.name}</h1>
        <p className="text-text-soft mt-2 text-sm">已於 {timeStr} 完成報到</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto">
        <svg viewBox="0 0 24 24" className="w-10 h-10 stroke-white fill-none" strokeWidth={2.5}>
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold mt-5">報到成功！</h1>
      <p className="text-lg font-semibold mt-1">{result.name}</p>
      <p className="text-text-soft mt-2 text-sm">{timeStr} 報到</p>
    </div>
  );
}
