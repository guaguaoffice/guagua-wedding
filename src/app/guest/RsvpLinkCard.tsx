"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { regenerateRsvpToken } from "@/lib/actions/rsvp";

export function RsvpLinkCard({ weddingId, token }: { weddingId: string; token: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [origin] = useState(() => (typeof window !== "undefined" ? window.location.origin : ""));

  const link = origin ? `${origin}/rsvp/${token}` : "";

  useEffect(() => {
    if (showQr && link && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, link, { width: 180, margin: 1 });
    }
  }, [showQr, link]);

  function handleCopy() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function handleRegenerate() {
    if (!window.confirm("重新產生出席回覆連結？舊連結會立刻失效。")) return;
    startTransition(async () => {
      await regenerateRsvpToken(weddingId);
      setShowQr(false);
      router.refresh();
    });
  }

  return (
    <div className="panel">
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-[15px]">出席回覆連結</div>
        <button
          onClick={handleRegenerate}
          disabled={pending}
          className="text-xs text-text-soft hover:text-coral"
        >
          重新產生
        </button>
      </div>
      <p className="text-[12.5px] text-text-soft mb-3">
        分享連結或讓賓客掃 QR Code，填寫的回覆會自動加進賓客名冊。
      </p>
      <div className="flex gap-2 mb-2">
        <input
          readOnly
          value={link}
          className="flex-1 min-w-0 border border-border rounded-[9px] px-3 py-2 text-xs bg-card-hover text-text-soft"
        />
        <button onClick={handleCopy} className="btn btn-secondary text-sm">
          {copied ? "已複製 ✓" : "複製連結"}
        </button>
      </div>
      <button onClick={() => setShowQr((v) => !v)} className="text-accent-hover text-xs font-semibold">
        {showQr ? "收起 QR Code" : "顯示 QR Code"}
      </button>
      {showQr && (
        <div className="mt-3 flex justify-center">
          <canvas ref={canvasRef} />
        </div>
      )}
    </div>
  );
}
