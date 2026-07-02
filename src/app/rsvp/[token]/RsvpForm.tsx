"use client";

import { useState, useTransition } from "react";
import { submitRsvp } from "@/lib/actions/rsvp";
import { QrCode } from "@/components/QrCode";

function InvitationCard({
  title,
  subtitle,
  imageUrl,
  weddingName,
  weddingDate,
}: {
  title: string | null;
  subtitle: string | null;
  imageUrl: string | null;
  weddingName: string;
  weddingDate: Date | null;
}) {
  const displayTitle = title || weddingName;
  const displaySubtitle = subtitle || (weddingDate
    ? new Date(weddingDate).toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" })
    : null);

  return (
    <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-md bg-[#f5f0eb] mb-6">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="婚禮照片" className="w-full h-auto" />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-accent-soft to-[#e8e0d8] flex items-center justify-center">
          <svg viewBox="0 0 40 40" className="w-12 h-12 opacity-30" fill="none">
            <path d="M20 8c0 0-8 6-8 13a8 8 0 0016 0c0-7-8-13-8-13z" stroke="#5a7a5a" strokeWidth="1.5" />
          </svg>
        </div>
      )}
      <div className="px-6 py-4 text-center">
        <p className="text-[10px] tracking-[0.25em] text-text-soft/70 uppercase mb-1.5">Wedding Invitation</p>
        <h1 className="text-[22px] font-bold tracking-wide leading-tight">{displayTitle}</h1>
        {displaySubtitle && (
          <p className="text-sm text-text-soft mt-1.5 whitespace-pre-line">{displaySubtitle}</p>
        )}
      </div>
    </div>
  );
}

export function RsvpForm({
  token,
  weddingName,
  weddingDate,
  cardTitle,
  cardSubtitle,
  cardImageUrl,
}: {
  token: string;
  weddingName: string;
  weddingDate: Date | null;
  cardTitle: string | null;
  cardSubtitle: string | null;
  cardImageUrl: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [attending, setAttending] = useState<"yes" | "no" | "">("");
  const [checkinToken, setCheckinToken] = useState<string | null>(null);
  const [attendingResult, setAttendingResult] = useState<boolean | null>(null);

  const [error, setError] = useState<string | null>(null);

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
      <div className="w-full max-w-sm flex flex-col items-center">
        <InvitationCard
          title={cardTitle}
          subtitle={cardSubtitle}
          imageUrl={cardImageUrl}
          weddingName={weddingName}
          weddingDate={weddingDate}
        />
        <div className="text-center">
          <div className="empty-icon mx-auto">
            <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 stroke-accent-hover fill-none" strokeWidth={1.6}>
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mt-3">已收到你的回覆！</h2>
          <p className="text-text-soft mt-2 text-sm">
            {attendingResult
              ? "謝謝你花時間回覆，期待婚禮當天見到你！"
              : "謝謝你花時間回覆，祝你一切順心。"}
          </p>
          {attendingResult && (
            <div className="mt-6 flex flex-col items-center gap-3">
              <p className="text-sm font-semibold text-text">婚禮當天掃描 QR Code 即可快速報到</p>
              <div className="bg-white p-3 rounded-2xl shadow-sm">
                <QrCode url={checkinUrl} size={180} />
              </div>
              <p className="text-xs text-text-faint">請截圖或儲存此 QR Code</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <InvitationCard
        title={cardTitle}
        subtitle={cardSubtitle}
        imageUrl={cardImageUrl}
        weddingName={weddingName}
        weddingDate={weddingDate}
      />

      <form action={handleSubmit} className="candidate-card flex flex-col gap-3.5">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-text-soft font-semibold">姓名</span>
          <input
            name="name"
            required
            disabled={pending}
            className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
          />
        </label>

        <div>
          <div className="text-[11px] text-text-soft font-semibold mb-1.5">您是哪一方的賓客</div>
          <div className="flex gap-1.5">
            <label className="flex-1">
              <input type="radio" name="side" value="GROOM" defaultChecked className="hidden peer" />
              <div className="peer-checked:bg-accent-soft peer-checked:text-accent-hover text-center text-sm font-semibold py-2 rounded-[9px] bg-card-hover text-text-soft cursor-pointer">
                新郎方
              </div>
            </label>
            <label className="flex-1">
              <input type="radio" name="side" value="BRIDE" className="hidden peer" />
              <div className="peer-checked:bg-accent-soft peer-checked:text-accent-hover text-center text-sm font-semibold py-2 rounded-[9px] bg-card-hover text-text-soft cursor-pointer">
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
              className={`flex-1 text-sm font-semibold py-2 rounded-[9px] ${
                attending === "yes" ? "bg-accent text-white" : "bg-card-hover text-text-soft"
              }`}
            >
              出席
            </button>
            <button
              type="button"
              onClick={() => setAttending("no")}
              className={`flex-1 text-sm font-semibold py-2 rounded-[9px] ${
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
              <span className="text-[11px] text-text-soft font-semibold">攜伴人數（不含自己）</span>
              <input
                name="plusOneCount"
                type="number"
                min={0}
                defaultValue={0}
                disabled={pending}
                className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="vegetarian" />
              我（或同行親友）吃素
            </label>
          </div>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-text-soft font-semibold">聯絡電話（選填）</span>
          <input
            name="phone"
            disabled={pending}
            className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-text-soft font-semibold">想說的話（選填）</span>
          <input
            name="note"
            disabled={pending}
            className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
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
  );
}
