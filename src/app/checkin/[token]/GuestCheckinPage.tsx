"use client";

import { QrCode } from "@/components/QrCode";
import { getCardBg, getCardAccent } from "@/lib/cardColors";

export function GuestCheckinPage({
  token,
  guestName,
  tableName,
  checkedInAt,
  weddingName,
  weddingDate,
  venueName,
  cardTitle,
  cardSubtitle,
  cardImageUrl,
  cardColor,
}: {
  token: string;
  guestName: string;
  tableName: string | null;
  checkedInAt: Date | null;
  weddingName: string;
  weddingDate: Date | null;
  venueName: string | null;
  cardTitle: string | null;
  cardSubtitle: string | null;
  cardImageUrl: string | null;
  cardColor: string | null;
}) {
  const bgColor = getCardBg(cardColor);
  const accentColor = getCardAccent(cardColor);
  const checkinUrl = typeof window !== "undefined"
    ? `${window.location.origin}/checkin/${token}`
    : `https://yourdomain.com/checkin/${token}`;

  const displayTitle = cardTitle || weddingName;
  const displaySubtitle = cardSubtitle || (weddingDate
    ? new Date(weddingDate).toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" })
    : null);

  const checkinTime = checkedInAt
    ? new Date(checkedInAt).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-16" style={{ backgroundColor: bgColor, "--color-accent": accentColor } as React.CSSProperties}>
      <div className="w-full max-w-lg">
        <div className="rounded-2xl overflow-hidden shadow-md">
          {/* 喜帖區 */}
          <div style={{ backgroundColor: bgColor }}>
            {cardImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cardImageUrl} alt="婚禮照片" className="w-full h-auto" />
            ) : (
              <div className="w-full h-40 flex items-center justify-center" style={{ backgroundColor: accentColor + "22" }}>
                <svg viewBox="0 0 40 40" className="w-12 h-12 opacity-40" fill="none">
                  <path d="M20 8c0 0-8 6-8 13a8 8 0 0016 0c0-7-8-13-8-13z" stroke={accentColor} strokeWidth="1.5" />
                </svg>
              </div>
            )}
            <div className="px-6 py-5 text-center">
              <p className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: accentColor + "99" }}>Wedding Invitation</p>
              <h1 className="text-[22px] font-bold tracking-wide leading-tight">{displayTitle}</h1>
              {displaySubtitle && (
                <p className="text-sm mt-1.5 whitespace-pre-line" style={{ color: accentColor + "bb" }}>{displaySubtitle}</p>
              )}
              {(weddingDate || venueName) && (
                <div className="mt-3 pt-3 flex flex-col gap-1" style={{ borderTop: `1px solid ${accentColor}33` }}>
                  {weddingDate && (
                    <p className="text-xs" style={{ color: accentColor }}>
                      📅 {new Date(weddingDate).toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
                    </p>
                  )}
                  {venueName && (
                    <p className="text-xs" style={{ color: accentColor }}>
                      📍 {venueName}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 賓客資訊 + QR */}
          <div className="flex flex-col gap-4 px-6 py-5" style={{ backgroundColor: bgColor }}>
            {/* 賓客姓名與狀態 */}
            <div className="rounded-[12px] px-4 py-3 flex items-center justify-between" style={{ backgroundColor: "rgba(255,255,255,0.5)" }}>
              <div>
                <div className="text-xs mb-0.5" style={{ color: accentColor + "99" }}>賓客姓名</div>
                <div className="font-bold text-lg">{guestName}</div>
              </div>
              {checkedInAt ? (
                <div className="flex flex-col items-end gap-1">
                  <span className="status status-done text-xs">已報到</span>
                  <span className="text-[11px]" style={{ color: accentColor + "88" }}>{checkinTime}</span>
                </div>
              ) : (
                <span className="status status-idle text-xs">未報到</span>
              )}
            </div>

            {/* 座位 */}
            {tableName && (
              <div className="rounded-[12px] px-4 py-3 flex items-center gap-2" style={{ backgroundColor: "rgba(255,255,255,0.5)" }}>
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none flex-none" style={{ stroke: accentColor }} strokeWidth={1.8}>
                  <circle cx="12" cy="12" r="8" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span className="text-sm" style={{ color: accentColor + "99" }}>座位：<span className="font-semibold" style={{ color: accentColor }}>{tableName}</span></span>
              </div>
            )}

            {/* QR Code */}
            <div className="flex flex-col items-center gap-3 pt-1">
              <p className="text-xs" style={{ color: accentColor + "99" }}>婚禮當天出示此 QR Code 完成報到</p>
              <div className="bg-white p-3 rounded-2xl shadow-sm">
                <QrCode url={checkinUrl} size={180} />
              </div>
              <p className="text-[11px] text-center" style={{ color: accentColor + "88" }}>
                請將此頁面加入書籤或截圖保存<br />以便婚禮當天快速取用
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
