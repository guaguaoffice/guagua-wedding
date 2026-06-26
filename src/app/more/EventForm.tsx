"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateWeddingInfo } from "@/lib/actions/wedding";

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function EventForm({
  weddingId,
  initial,
}: {
  weddingId: string;
  initial: {
    name: string;
    weddingDate: Date | null;
    venueName: string | null;
    venueDetail: string | null;
    totalBudget: number | null;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateWeddingInfo(weddingId, formData);
      setMessage({ ok: result.ok, text: result.message });
      if (result.ok) router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="panel flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-text-soft">婚禮名稱</span>
        <input
          name="name"
          defaultValue={initial.name}
          required
          disabled={pending}
          className="border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-text-soft">婚禮日期</span>
        <input
          type="date"
          name="weddingDate"
          defaultValue={toDateInputValue(initial.weddingDate)}
          disabled={pending}
          className="border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-text-soft">場地名稱</span>
        <input
          name="venueName"
          defaultValue={initial.venueName ?? ""}
          placeholder="例如：晶華酒店 · 宴會廳"
          disabled={pending}
          className="border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-text-soft">場地補充說明</span>
        <input
          name="venueDetail"
          defaultValue={initial.venueDetail ?? ""}
          placeholder="例如：12:00 午宴 · 預估 12 桌 / 120 人"
          disabled={pending}
          className="border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-text-soft">總預算（NT$）</span>
        <input
          name="totalBudget"
          defaultValue={initial.totalBudget ?? ""}
          placeholder="例如：650000"
          disabled={pending}
          className="border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
        />
      </label>

      {message && (
        <div
          className={`text-sm px-3 py-2 rounded-[9px] ${
            message.ok ? "bg-accent-tint text-accent-hover" : "bg-coral-tint text-coral"
          }`}
        >
          {message.text}
        </div>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary self-start">
        儲存
      </button>
    </form>
  );
}
