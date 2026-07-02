"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { regenerateRsvpToken, updateRsvpCard } from "@/lib/actions/rsvp";
import { uploadRsvpCardImage, removeRsvpCardImage } from "@/lib/actions/upload";

export function RsvpLinkCard({
  weddingId,
  token,
  cardTitle,
  cardSubtitle,
  cardImageUrl,
}: {
  weddingId: string;
  token: string;
  cardTitle: string | null;
  cardSubtitle: string | null;
  cardImageUrl: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const result = await uploadRsvpCardImage(weddingId, fd);
      if (!result.ok) setUploadError(result.error);
      else router.refresh();
    } catch {
      setUploadError("上傳失敗，請再試一次");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemoveImage() {
    startTransition(async () => {
      await removeRsvpCardImage(weddingId);
      router.refresh();
    });
  }

  function handleSaveCard(formData: FormData) {
    startTransition(async () => {
      await updateRsvpCard(weddingId, formData);
      setEditing(false);
      router.refresh();
    });
  }

  const displayTitle = cardTitle || "敬邀出席";
  const displaySubtitle = cardSubtitle || "期待與您共度這份喜悅";

  return (
    <div className="flex flex-col gap-3.5">

      {/* 卡片預覽 */}
      <div className="panel overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold text-[15px]">出席回覆卡片</div>
          <button
            onClick={() => setEditing((v) => !v)}
            className="text-xs font-semibold text-accent-hover hover:underline"
          >
            {editing ? "取消" : "編輯邀請內容"}
          </button>
        </div>

        {/* 預覽 */}
        <div className="rounded-xl overflow-hidden bg-[#f5f0eb] relative">
          {cardImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cardImageUrl}
              alt="卡片照片"
              className="w-full h-auto"
            />
          )}
          {!cardImageUrl && (
            <div className="w-full h-36 bg-gradient-to-br from-accent-soft to-[#e8e0d8] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-10 h-10 stroke-accent-hover/40 fill-none" strokeWidth={1.2}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
          <div className="px-5 py-4 text-center">
            <p className="text-[11px] tracking-[0.2em] text-text-soft uppercase mb-1">Wedding Invitation</p>
            <h2 className="text-xl font-bold tracking-wide">{displayTitle}</h2>
            <p className="text-sm text-text-soft mt-1 whitespace-pre-line">{displaySubtitle}</p>
          </div>
        </div>

        {/* 編輯區 */}
        {editing && (
          <form action={handleSaveCard} className="mt-3 flex flex-col gap-2.5">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-text-soft font-semibold">主標題</span>
              <input
                name="title"
                defaultValue={cardTitle ?? ""}
                placeholder="敬邀出席"
                disabled={pending}
                className="border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-text-soft font-semibold">副標題</span>
              <textarea
                name="subtitle"
                defaultValue={cardSubtitle ?? ""}
                placeholder="期待與您共度這份喜悅"
                disabled={pending}
                rows={3}
                className="border border-border rounded-[9px] px-3 py-2 text-sm bg-card resize-none"
              />
            </label>
            <button type="submit" disabled={pending} className="btn btn-primary text-sm">
              儲存
            </button>
          </form>
        )}

        {/* 照片上傳 */}
        {editing && (
          <div className="mt-2 flex flex-col gap-2">
            <span className="text-[11px] text-text-soft font-semibold">封面照片</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <div className="flex gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary text-sm flex-1"
              >
                {uploading ? "上傳中…" : cardImageUrl ? "更換照片" : "上傳照片"}
              </button>
              {cardImageUrl && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={handleRemoveImage}
                  className="text-xs text-coral hover:underline px-2"
                >
                  移除
                </button>
              )}
            </div>
            {uploadError && <p className="text-xs text-coral">{uploadError}</p>}
            <p className="text-[11px] text-text-faint">支援 JPG、PNG，最大 5MB</p>
          </div>
        )}
      </div>

      {/* 分享連結 */}
      <div className="panel">
        <div className="mb-2">
          <div className="font-bold text-[15px]">分享連結</div>
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
    </div>
  );
}
