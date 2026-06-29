"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function extractToken(input: string) {
  const trimmed = input.trim();
  const match = trimmed.match(/\/invite\/([^/?#]+)/);
  if (match) return match[1];
  return trimmed;
}

export function JoinByLinkForm() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = extractToken(value);
    if (!token) return;
    router.push(`/invite/${token}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="貼上邀請連結"
        className="flex-1 min-w-0 border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
      />
      <button type="submit" className="btn btn-secondary text-sm px-4">
        前往
      </button>
    </form>
  );
}
