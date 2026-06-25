"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  addCandidate,
  lockCandidate,
  rejectCandidate,
} from "@/lib/actions/decisions";
import { computeDecisionState, STATUS_TEXT } from "@/lib/decision-state";

type Availability = "OK" | "WAIT" | "CONFLICT" | null;
type CandidateStatus = "CANDIDATE" | "REJECTED" | "DECIDED";

export type SheetCandidate = {
  id: string;
  name: string;
  type: string | null;
  price: number | null;
  note: string | null;
  pros: string | null;
  cons: string | null;
  tag: string | null;
  availability: Availability;
  status: CandidateStatus;
  rejectedReason: string | null;
};

export type SheetDecisionItem = {
  id: string;
  title: string;
  suggestedDecideBy: Date | null;
  decisionRecord: { id: string } | null;
  candidates: SheetCandidate[];
};

function availabilityLabel(a: Availability) {
  if (a === "OK") return <span className="text-accent-hover font-bold">可</span>;
  if (a === "CONFLICT") return <span className="text-coral font-bold">衝突</span>;
  if (a === "WAIT") return <span className="text-amber font-bold">待確認</span>;
  return null;
}

function priceText(c: SheetCandidate) {
  if (c.note) return c.note;
  if (c.price !== null) return `NT$ ${c.price.toLocaleString()}`;
  return "尚未報價";
}

export function DecisionSheet({
  item,
  onClose,
}: {
  item: SheetDecisionItem | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [segment, setSegment] = useState<"list" | "cmp" | "done">("list");
  const [showAddForm, setShowAddForm] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!item) return null;

  const state = computeDecisionState(item.suggestedDecideBy, !!item.decisionRecord);
  const locked = item.candidates.filter((c) => c.status === "DECIDED");
  const visible = item.candidates;
  const showCompareNote = segment === "cmp";

  function handleLock(candidateId: string) {
    startTransition(async () => {
      await lockCandidate(item!.id, candidateId);
      router.refresh();
    });
  }

  function handleReject(candidateId: string) {
    startTransition(async () => {
      await rejectCandidate(candidateId);
      router.refresh();
    });
  }

  function handleAddCandidate(formData: FormData) {
    startTransition(async () => {
      await addCandidate(item!.id, formData);
      router.refresh();
      setShowAddForm(false);
    });
  }

  return createPortal(
    <>
      <div className="scrim show" onClick={onClose} />
      <div className="sheet show" role="dialog" aria-modal="true">
        <div className="w-[38px] h-1 rounded-full bg-border-2 mx-auto mt-2.5 md:hidden" />
        <div className="sticky top-0 bg-bg px-5 pt-4 pb-3 flex items-start justify-between gap-3 border-b border-border z-10">
          <div>
            <div className="text-[11px] tracking-[0.16em] uppercase text-accent-hover font-bold">
              {STATUS_TEXT[state]}
            </div>
            <div className="text-xl font-bold">{item.title}</div>
          </div>
          <button
            onClick={onClose}
            aria-label="關閉"
            className="bg-card-hover w-8 h-8 rounded-[9px] text-text-soft flex-none"
          >
            ✕
          </button>
        </div>

        <div className="px-5 pt-4 pb-8">
          <div className="tabs mb-4">
            <button
              className={`tab ${segment === "list" ? "active" : ""}`}
              onClick={() => setSegment("list")}
            >
              備選
            </button>
            <button
              className={`tab ${segment === "cmp" ? "active" : ""}`}
              onClick={() => setSegment("cmp")}
            >
              比較
            </button>
            <button
              className={`tab ${segment === "done" ? "active" : ""}`}
              onClick={() => setSegment("done")}
            >
              已定
            </button>
          </div>

          {showCompareNote && (
            <div className="text-[12.5px] text-text-soft bg-card-hover rounded-[10px] px-3.5 py-2.5 mb-3.5">
              並排比較同一類的備選。<b>檔期衝突</b>會標紅，方便先刷掉不能合作的。
            </div>
          )}

          {segment === "done" && locked.length === 0 && (
            <div className="text-center py-8 px-1.5 text-text-soft">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 stroke-accent-hover fill-none" strokeWidth={1.6}>
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-text text-[17px] mb-1">還沒拍板</h3>
              <p className="text-[13.5px] max-w-[330px] mx-auto">
                在「備選」裡選一家按「標記已定」，它就會固定在這裡，其餘自動歸檔。
              </p>
            </div>
          )}

          {segment !== "done" && visible.length === 0 && (
            <div className="text-center py-8 px-1.5 text-text-soft">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 stroke-accent-hover fill-none" strokeWidth={1.6}>
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <h3 className="text-text text-[17px] mb-1">還沒有備選</h3>
              <p className="text-[13.5px] max-w-[330px] mx-auto mb-4">
                把考慮中的廠商加進來——貼上 IG 或網站連結最快，報價、檔期、風格之後再補。
              </p>
              <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                ＋ 新增備選
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {(segment === "done" ? locked : visible).map((c) => (
              <div
                key={c.id}
                className={`candidate-card ${c.status === "DECIDED" ? "locked" : ""}`}
              >
                <div className="flex items-center justify-between gap-2.5 mb-2">
                  <div className="font-bold text-[15px] flex items-center gap-2 flex-wrap">
                    {c.name}
                    {c.status === "DECIDED" && (
                      <span className="status status-done">已定</span>
                    )}
                    {c.status !== "DECIDED" && c.tag && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-soft text-accent-hover">
                        {c.tag}
                      </span>
                    )}
                    {c.status === "REJECTED" && (
                      <span className="status status-idle">已淘汰</span>
                    )}
                  </div>
                  <div className="font-display font-semibold text-[16px]">
                    {priceText(c)}
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-[12.5px] text-text-soft mb-2.5">
                  {c.availability && <span>檔期 {availabilityLabel(c.availability)}</span>}
                  {c.type && (
                    <span>
                      風格 <b className="text-text font-semibold">{c.type}</b>
                    </span>
                  )}
                </div>
                {(c.pros || c.cons) && (
                  <div className="text-[12.5px] text-text-soft mb-2.5 flex flex-col gap-1">
                    {c.pros && (
                      <p>
                        <span className="text-accent-hover">優點：</span>
                        {c.pros}
                      </p>
                    )}
                    {c.cons && (
                      <p>
                        <span className="text-text-soft">缺點：</span>
                        {c.cons}
                      </p>
                    )}
                  </div>
                )}
                {c.status === "REJECTED" && c.rejectedReason && (
                  <p className="text-[12.5px] text-text-soft mb-2.5">
                    淘汰原因：{c.rejectedReason}
                  </p>
                )}
                {c.status === "CANDIDATE" && (
                  <div className="flex gap-2">
                    <button
                      disabled={pending}
                      onClick={() => handleReject(c.id)}
                      className="btn btn-secondary flex-1 text-[12.5px] py-2"
                    >
                      淘汰
                    </button>
                    <button
                      disabled={pending}
                      onClick={() => handleLock(c.id)}
                      className="btn btn-primary flex-1 text-[12.5px] py-2"
                    >
                      標記已定
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {segment !== "done" && (
            <>
              {showAddForm ? (
                <form
                  action={handleAddCandidate}
                  className="candidate-card mt-2.5 flex flex-col gap-2"
                >
                  <input
                    name="name"
                    placeholder="廠商名稱"
                    required
                    className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
                  />
                  <div className="flex gap-2">
                    <input
                      name="type"
                      placeholder="風格 / 類型"
                      className="flex-1 border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
                    />
                    <input
                      name="price"
                      placeholder="報價"
                      className="flex-1 border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="btn btn-secondary flex-1 text-[12.5px] py-2"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={pending}
                      className="btn btn-primary flex-1 text-[12.5px] py-2"
                    >
                      新增
                    </button>
                  </div>
                </form>
              ) : (
                visible.length > 0 && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="addcand w-full border-[1.5px] border-dashed border-border-2 text-text-soft rounded-[11px] py-3.5 font-semibold text-sm mt-2"
                  >
                    ＋ 新增備選
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
