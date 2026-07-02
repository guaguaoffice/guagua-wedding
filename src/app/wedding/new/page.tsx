"use client";

import { useTransition, useState } from "react";
import { createWedding } from "@/lib/actions/wedding";

export default function NewWeddingPage() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createWedding(formData);
      if (result && !result.ok) setError(result.message);
    });
  }

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">新增活動</h1>
          <p className="text-text-soft text-sm mt-1">建立一個新的婚禮或活動</p>
        </div>
        <form action={handleSubmit} className="panel flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-text-soft font-semibold">活動名稱</span>
            <input
              name="name"
              required
              autoFocus
              disabled={pending}
              placeholder="例：Allen & Lily 婚禮"
              className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-bg"
            />
          </label>
          {error && <p className="text-coral text-sm">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary w-full text-sm py-2.5"
          >
            {pending ? "建立中…" : "建立活動"}
          </button>
        </form>
        <a href="/" className="block text-center text-sm text-text-faint mt-4 hover:text-text-soft">
          取消
        </a>
      </div>
    </main>
  );
}
