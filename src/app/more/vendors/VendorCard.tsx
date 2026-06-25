"use client";

import { useState, useTransition } from "react";
import { addVendorToCandidates } from "@/lib/actions/decisions";
import type { Vendor } from "@/lib/vendor-directory";

export function VendorCard({ weddingId, vendor }: { weddingId: string; vendor: Vendor }) {
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    startTransition(async () => {
      await addVendorToCandidates(weddingId, vendor);
      setAdded(true);
    });
  }

  return (
    <div className="panel">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="font-bold text-[15px]">{vendor.name}</div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-soft text-accent-hover">
          {vendor.category}
        </span>
      </div>
      <div className="text-[12.5px] text-text-soft mb-1">
        {vendor.type} · {vendor.priceLabel}
      </div>
      <p className="text-[13px] text-text-soft mb-3">{vendor.description}</p>
      <button
        onClick={handleAdd}
        disabled={pending || added}
        className={`btn w-full ${added ? "btn-secondary" : "btn-primary"}`}
      >
        {added ? "已加入備選 ✓" : `＋ 加入「${vendor.decisionTitle}」備選`}
      </button>
    </div>
  );
}
