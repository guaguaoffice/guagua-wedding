"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { regenerateInviteLink } from "@/lib/actions/invites";

const ROLE_LABEL = { COLLABORATOR: "協作者", VIEWER: "檢視者" } as const;

function InviteLinkRow({
  weddingId,
  role,
  token,
}: {
  weddingId: string;
  role: "COLLABORATOR" | "VIEWER";
  token: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [origin] = useState(() =>
    typeof window !== "undefined" ? window.location.origin : ""
  );

  const link = origin ? `${origin}/invite/${token}` : "";

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
    if (!window.confirm(`重新產生「${ROLE_LABEL[role]}連結」？舊連結會立刻失效。`)) return;
    startTransition(async () => {
      await regenerateInviteLink(weddingId, role);
      setShowQr(false);
      router.refresh();
    });
  }

  return (
    <div className="panel">
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-[15px]">{ROLE_LABEL[role]}連結</div>
        <button
          onClick={handleRegenerate}
          disabled={pending}
          className="text-xs text-text-soft hover:text-coral"
        >
          重新產生
        </button>
      </div>
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
      <button
        onClick={() => setShowQr((v) => !v)}
        className="text-accent-hover text-xs font-semibold"
      >
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

export function InviteLinks({
  weddingId,
  invites,
}: {
  weddingId: string;
  invites: { role: "COLLABORATOR" | "VIEWER"; token: string }[];
}) {
  return (
    <div className="flex flex-col gap-3.5">
      {invites.map((invite) => (
        <InviteLinkRow
          key={invite.role}
          weddingId={weddingId}
          role={invite.role}
          token={invite.token}
        />
      ))}
      <p className="text-xs text-text-soft">
        分享連結或讓對方掃 QR Code，登入 Google 後就會自動加入這場婚禮。
      </p>
    </div>
  );
}
