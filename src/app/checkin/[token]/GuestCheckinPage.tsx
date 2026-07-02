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
    <main className="min-h-screen flex flex-col items-center pb-10" style={{ backgroundColor: bgColor, "--color-accent": accentColor } as React.CSSProperties}>
      {/* 喜帖卡片 */}
      <div className="w-full max-w-sm">
        <div className="overflow-hidden" style={{ backgroundColor: bgColor }}>
          {cardImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cardImageUrl} alt="婚禮照片" className="w-full h-auto" />
          ) : (
            <div className="w-full h-36 flex items-center justify-center" style={{ backgroundColor: accentColor + "22" }}>
              <svg viewBox="0 0 40 40" className="w-10 h-10 opacity-40" fill="none">
                <path d="M20 8c0 0-8 6-8 13a8 8 0 0016 0c0-7-8-13-8-13z" stroke={accentColor} strokeWidth="1.5" />
              </svg>
            </div>
          )}
          <div className="px-5 py-4 text-center">
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

        {/* 賓客資訊 */}
        <div className="px-4 mt-4 flex flex-col gap-3">
          <div className="rounded-[14px] p-4" style={{ backgroundColor: "rgba(255,255,255,0.6)", border: `1px solid ${accentColor}33` }}>
            <div className="flex items-center justify-between">
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
            {tableName && (
              <div className="mt-2 pt-2 flex items-center gap-2" style={{ borderTop: `1px solid ${accentColor}33` }}>
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none flex-none" style={{ stroke: accentColor }} strokeWidth={1.8}>
                  <circle cx="12" cy="12" r="8" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span className="text-sm" style={{ color: accentColor + "99" }}>座位：<span className="font-semibold" style={{ color: accentColor }}>{tableName}</span></span>
              </div>
            )}
          </div>

          {/* QR Code */}
          <div className="rounded-[14px] p-4 flex flex-col items-center gap-3 py-5" style={{ backgroundColor: "rgba(255,255,255,0.6)", border: `1px solid ${accentColor}33` }}>
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
    </main>
  );
}
