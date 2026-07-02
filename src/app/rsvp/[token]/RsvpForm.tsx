"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitRsvp } from "@/lib/actions/rsvp";
import { getCardBg, getCardAccent } from "@/lib/cardColors";

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
})
 {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [side, setSide] = useState<"GROOM" | "BRIDE">("GROOM");
  const [attending, setAttending] = useState<"yes" | "no" | "">("");
  const [error, setError] = useState<string | null>(null);

  const bgColor = getCardBg(cardColor);
  const accentColor = getCardAccent(cardColor);
  const displayTitle = cardTitle || weddingName;
  const displaySubtitle = cardSubtitle || (weddingDate
    ? new Date(weddingDate).toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" })
    : null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitRsvp(token, formData);
      if (result.ok) {
        router.push(`/checkin/${result.checkinToken}`);
      } else {
        setError(result.error);
      }
    });
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
            <p className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: accentColor + "99" }}>Wedding Invitation</p>
            <h1 className="text-[22px] font-bold tracking-wide leading-tight">{displayTitle}</h1>
            {displaySubtitle && (
              <p className="text-sm mt-1.5 whitespace-pre-line" style={{ color: accentColor + "bb" }}>{displaySubtitle}</p>
            )}
          </div>
        </div>

        {/* 表單區 */}
        <form action={handleSubmit} className="flex flex-col gap-4 px-6 py-5" style={{ backgroundColor: bgColor }}>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold" style={{ color: accentColor }}>姓名</span>
            <input
              name="name"
              required
              disabled={pending}
              className="w-full rounded-[9px] px-3 py-2 text-sm"
              style={{ backgroundColor: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.1)" }}
            />
          </label>

          <div>
            <div className="text-[11px] font-semibold mb-1.5" style={{ color: accentColor }}>您是哪一方的賓客</div>
            <input type="hidden" name="side" value={side} />
            <div className="flex gap-1.5">
              {(["GROOM", "BRIDE"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSide(s)}
                  className="flex-1 text-sm font-semibold py-2 rounded-[9px] transition-colors"
                  style={side === s
                    ? { backgroundColor: accentColor, color: "#fff" }
                    : { backgroundColor: "rgba(255,255,255,0.5)", color: accentColor }
                  }
                >
                  {s === "GROOM" ? "新郎方" : "新娘方"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold mb-1.5" style={{ color: accentColor }}>是否出席</div>
            <input type="hidden" name="attending" value={attending} />
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setAttending("yes")}
                className="flex-1 text-sm font-semibold py-2 rounded-[9px] transition-colors"
                style={attending === "yes"
                  ? { backgroundColor: accentColor, color: "#fff" }
                  : { backgroundColor: "rgba(255,255,255,0.5)", color: accentColor }
                }
              >
                出席
              </button>
              <button
                type="button"
                onClick={() => setAttending("no")}
                className="flex-1 text-sm font-semibold py-2 rounded-[9px] transition-colors"
                style={attending === "no"
                  ? { backgroundColor: "#c0504d", color: "#fff" }
                  : { backgroundColor: "rgba(255,255,255,0.5)", color: accentColor }
                }
              >
                無法出席
              </button>
            </div>
          </div>

          {attending === "yes" && (
            <div className="flex flex-col gap-3.5 animate-slide-up">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold" style={{ color: accentColor }}>出席人數</span>
                <input
                  name="attendeeCount"
                  type="number"
                  min={1}
                  defaultValue={1}
                  disabled={pending}
                  className="w-full rounded-[9px] px-3 py-2 text-sm"
                  style={{ backgroundColor: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.1)" }}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold" style={{ color: accentColor }}>其中幾位吃素？</span>
                <input
                  name="vegetarianCount"
                  type="number"
                  min={0}
                  defaultValue={0}
                  disabled={pending}
                  className="w-full rounded-[9px] px-3 py-2 text-sm"
                  style={{ backgroundColor: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.1)" }}
                />
                <span className="text-[11px] text-text-faint">填 0 表示全員葷食</span>
              </label>
            </div>
          )}

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold" style={{ color: accentColor }}>想說的話（選填）</span>
            <textarea
              name="note"
              disabled={pending}
              rows={3}
              className="w-full rounded-[9px] px-3 py-2 text-sm resize-none"
              style={{ backgroundColor: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.1)" }}
            />
          </label>

          {error && <p className="text-coral text-sm">{error}</p>}

          <button
            type="submit"
            disabled={pending || attending === ""}
            className="w-full text-sm py-2.5 rounded-[9px] font-semibold text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: accentColor }}
          >
            送出回覆
          </button>
        </form>
      </div>
    </div>
  );
}
