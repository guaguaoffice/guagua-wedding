"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions/profile";

type Identity = "GROOM" | "BRIDE" | "PARTNER" | "OTHER" | null;

const IDENTITY_OPTIONS: { value: Identity; label: string }[] = [
  { value: "GROOM", label: "新郎" },
  { value: "BRIDE", label: "新娘" },
  { value: "PARTNER", label: "新人" },
  { value: "OTHER", label: "協作者" },
];

export function ProfileForm({
  weddingId,
  initialName,
  initialIdentity,
}: {
  weddingId: string;
  initialName: string | null;
  initialIdentity: Identity;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [identity, setIdentity] = useState<Identity>(initialIdentity);
  const [saved, setSaved] = useState(false);

  function handleSubmit(formData: FormData) {
    setSaved(false);
    startTransition(async () => {
      await updateProfile(weddingId, formData);
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3.5">
      <label className="flex flex-col gap-1">
        <span className="text-[11px] text-text-soft font-semibold">姓名</span>
        <input
          name="name"
          defaultValue={initialName ?? ""}
          placeholder="顯示用的姓名"
          className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
        />
      </label>

      <div>
        <div className="text-[11px] text-text-soft font-semibold mb-1.5">身份</div>
        <input type="hidden" name="identity" value={identity ?? ""} />
        <div className="flex gap-1.5 flex-wrap">
          {IDENTITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setIdentity(identity === opt.value ? null : opt.value)}
              className={`text-[12px] font-semibold px-2.5 py-1.5 rounded-full ${
                identity === opt.value
                  ? "bg-accent-soft text-accent-hover"
                  : "bg-card-hover text-text-soft"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary text-sm px-4">
          儲存
        </button>
        {saved && <span className="text-accent-hover text-xs font-semibold">已儲存 ✓</span>}
      </div>
    </form>
  );
}
