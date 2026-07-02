"use client";

import { useState, useTransition } from "react";
import { submitRsvp } from "@/lib/actions/rsvp";
import { QrCode } from "@/components/QrCode";

export function RsvpForm({
  token,
  weddingName,
  weddingDate,
  cardTitle,
  cardSubtitle,
  cardImageUrl,
  cardColor,
}: {
  token: string;
  weddingName: string;
  weddingDate: Date | null;
  cardTitle: string | null;
  cardSubtitle: string | null;
  cardImageUrl: string | null;
  cardColor: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [attending, setAttending] = useState<"yes" | "no" | "">("");
  const [checkinToken, setCheckinToken] = useState<string | null>(null);
  const [attendingResult, setAttendingResult] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const bgColor = cardColor || "#e4f0ea";
  const displayTitle = cardTitle || weddingName;
  const displaySubtitle = cardSubtitle || (weddingDate
    ? new Date(weddingDate).toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" })
    : null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitRsvp(token, formData);
      if (result.ok) {
        setCheckinToken(result.checkinToken);
        setAttendingResult(result.attending);
      } else {
        setError(result.error);
      }
    });
  }

  if (checkinToken !== null) {
    const checkinUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/checkin/${checkinToken}`;
    return (
      <div className="w-full max-w-lg">
        <div className="rounded-2xl overflow-hidden shadow-md" style={{ backgroundColor: bgColor }}>
          {cardImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cardImageUrl} alt="婚禮照片" className="w-full h-auto" />
          )}
          <div className="px-6 py-5 text-center">
            <p className="text-[10px] tracking-[0.25em] text-text-soft/70 uppercase mb-1">Wedding Invitation</p>
            <h1 className="text-[22px] font-bold tracking-wide leading-tight">{displayTitle}</h1>
            {displaySubtitle && (
              <p className="text-sm text-text-soft mt-1.5 whitespace-pre-line">{displaySubtitle}</p>
            )}
          </div>
        </div>

        <div className="panel mt-4 text-center flex flex-col items-center gap-4">
          <div className="empty-icon mx-auto">
            <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 stroke-accent-hover fill-none" strokeWidth={1.6}>
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">已收到你的回覆！</h2>
            <p className="text-text-soft mt-1 text-sm">
              {attendingResult
                ? "謝謝你花時間回覆，期待婚禮當天見到你！"
                : "謝謝你花時間回覆，祝你一切順心。"}
            </p>
          </div>
          {attendingResult && (
            <>
              <div className="w-full border-t border-border pt-4 flex flex-col items-center gap-3">
                <p className="text-sm font-semibold text-text">你的專屬報到頁面</p>
                <div className="bg-white p-3 rounded-2xl shadow-sm">
                  <QrCode url={checkinUrl} size={160} />
                </div>
                <a href={checkinUrl} className="btn btn-primary w-full text-sm text-center">
                  開啟我的報到頁面
                </a>
                <p className="text-xs text-text-faint text-center">
                  將頁面加入書籤，婚禮當天直接開啟給工作人員掃描即可報到
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      {/* 喜帖卡片 + 表單合為一個容器 */}
      <div className="rounded-2xl overflow-hidden shadow-md">
        {/* 喜帖區 */}
        <div style={{ backgroundColor: bgColor }}>
          {cardImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cardImageUrl} alt="婚禮照片" className="w-full h-auto" />
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-accent-soft to-[#e8e0d8] flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-12 h-12 opacity-30" fill="none">
                <path d="M20 8c0 0-8 6-8 13a8 8 0 0016 0c0-7-8-13-8-13z" stroke="#5a7a5a" strokeWidth="1.5" />
              </svg>
            </div>
          )}
          <div className="px-6 py-5 text-center">
            <p className="text-[10px] tracking-[0.25em] text-text-soft/70 uppercase mb-1">Wedding Invitation</p>
            <h1 className="text-[22px] font-bold tracking-wide leading-tight">{displayTitle}</h1>
            {displaySubtitle && (
              <p className="text-sm text-text-soft mt-1.5 whitespace-pre-line">{displaySubtitle}</p>
            )}
          </div>
        </div>

        {/* 表單區 */}
        <form action={handleSubmit} className="flex flex-col gap-4 px-6 py-5" style={{ backgroundColor: bgColor }}>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-text-soft font-semibold">姓名</span>
            <input
              name="name"
              required
              disabled={pending}
              className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-bg"
            />
          </label>

          <div>
            <div className="text-[11px] text-text-soft font-semibold mb-1.5">您是哪一方的賓客</div>
            <div className="flex gap-1.5">
              <label className="flex-1">
                <input type="radio" name="side" value="GROOM" defaultChecked className="hidden peer" />
                <div className="peer-checked:bg-accent peer-checked:text-white text-center text-sm font-semibold py-2 rounded-[9px] bg-card-hover text-text-soft cursor-pointer transition-colors">
                  新郎方
                </div>
              </label>
              <label className="flex-1">
                <input type="radio" name="side" value="BRIDE" className="hidden peer" />
                <div className="peer-checked:bg-accent peer-checked:text-white text-center text-sm font-semibold py-2 rounded-[9px] bg-card-hover text-text-soft cursor-pointer transition-colors">
                  新娘方
                </div>
              </label>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-text-soft font-semibold mb-1.5">是否出席</div>
            <input type="hidden" name="attending" value={attending} />
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setAttending("yes")}
                className={`flex-1 text-sm font-semibold py-2 rounded-[9px] transition-colors ${
                  attending === "yes" ? "bg-accent text-white" : "bg-card-hover text-text-soft"
                }`}
              >
                出席
              </button>
              <button
                type="button"
                onClick={() => setAttending("no")}
                className={`flex-1 text-sm font-semibold py-2 rounded-[9px] transition-colors ${
                  attending === "no" ? "bg-coral text-white" : "bg-card-hover text-text-soft"
                }`}
              >
                無法出席
              </button>
            </div>
          </div>

          {attending === "yes" && (
            <div className="flex flex-col gap-3.5 animate-slide-up">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-text-soft font-semibold">出席人數</span>
                <input
                  name="attendeeCount"
                  type="number"
                  min={1}
                  defaultValue={1}
                  disabled={pending}
                  className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-bg"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-text-soft font-semibold">其中幾位吃素？</span>
                <input
                  name="vegetarianCount"
                  type="number"
                  min={0}
                  defaultValue={0}
                  disabled={pending}
                  className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-bg"
                />
                <span className="text-[11px] text-text-faint">填 0 表示全員葷食</span>
              </label>
            </div>
          )}

          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-text-soft font-semibold">想說的話（選填）</span>
            <textarea
              name="note"
              disabled={pending}
              rows={3}
              className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-bg resize-none"
            />
          </label>

          {error && <p className="text-coral text-sm">{error}</p>}

          <button
            type="submit"
            disabled={pending || attending === ""}
            className="btn btn-primary w-full text-sm py-2.5"
          >
            送出回覆
          </button>
        </form>
      </div>
    </div>
  );
}
