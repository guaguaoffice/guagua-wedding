"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  addCandidate,
  lockCandidate,
  rejectCandidate,
  restoreCandidate,
  unlockCandidate,
  updateCandidate,
} from "@/lib/actions/decisions";
import { computeDecisionState, STATUS_TEXT } from "@/lib/decision-state";

type Availability = "OK" | "WAIT" | "CONFLICT" | null;
type CandidateStatus = "CANDIDATE" | "REJECTED" | "DECIDED";

const TAG_PRESETS = ["最喜歡", "備選中", "觀察中"];

export type SheetCandidate = {
  id: string;
  name: string;
  type: string | null;
  price: number | null;
  url: string | null;
  socialUrl: string | null;
  contact: string | null;
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

function CandidateForm({
  initial,
  pending,
  onCancel,
  onSubmit,
  submitLabel,
}: {
  initial?: Partial<SheetCandidate>;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (formData: FormData) => void;
  submitLabel: string;
}) {
  const hasAdvancedValues = Boolean(
    initial?.note || initial?.availability || initial?.tag || initial?.pros || initial?.cons
  );
  const [showMore, setShowMore] = useState(hasAdvancedValues);
  const [availability, setAvailability] = useState<Availability>(initial?.availability ?? null);
  const [tag, setTag] = useState(initial?.tag ?? "");
  const [showCustomTag, setShowCustomTag] = useState(
    Boolean(initial?.tag) && !TAG_PRESETS.includes(initial?.tag ?? "")
  );

  const AVAILABILITY_OPTIONS: { value: Availability; label: string; cls: string }[] = [
    { value: "OK", label: "檔期可", cls: "status-done" },
    { value: "WAIT", label: "待確認", cls: "status-due" },
    { value: "CONFLICT", label: "衝突", cls: "status-overdue" },
  ];

  return (
    <form action={onSubmit} className="candidate-card flex flex-col gap-3">
      <input
        name="name"
        placeholder="廠商名稱"
        defaultValue={initial?.name ?? ""}
        required
        className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
      />
      <div className="flex gap-2">
        <input
          name="type"
          placeholder="風格 / 類型"
          defaultValue={initial?.type ?? ""}
          className="flex-1 min-w-0 border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
        />
        <input
          name="price"
          placeholder="報價（數字）"
          defaultValue={initial?.price ?? ""}
          className="flex-1 min-w-0 border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
        />
      </div>
      <div className="flex gap-2">
        <input
          name="url"
          type="url"
          placeholder="網站 / 作品集連結"
          defaultValue={initial?.url ?? ""}
          className="flex-1 min-w-0 border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
        />
        <input
          name="socialUrl"
          type="url"
          placeholder="IG / FB 連結"
          defaultValue={initial?.socialUrl ?? ""}
          className="flex-1 min-w-0 border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
        />
      </div>
      <input
        name="contact"
        placeholder="聯絡方式（電話 / LINE / Email）"
        defaultValue={initial?.contact ?? ""}
        className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
      />

      {showMore ? (
        <div className="flex flex-col gap-3 animate-slide-up">
          <input
            name="note"
            placeholder="報價說明（例如：套組 38,000 / 面議，會取代上面的數字顯示）"
            defaultValue={initial?.note ?? ""}
            className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
          />

          <div>
            <div className="text-[11px] text-text-soft font-semibold mb-1.5">檔期</div>
            <input type="hidden" name="availability" value={availability ?? ""} />
            <div className="flex gap-1.5">
              {AVAILABILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAvailability(availability === opt.value ? null : opt.value)}
                  className={`status ${
                    availability === opt.value ? opt.cls : "status-idle opacity-60"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-text-soft font-semibold mb-1.5">標籤</div>
            <input type="hidden" name="tag" value={tag} />
            <div className="flex gap-1.5 flex-wrap">
              {TAG_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setShowCustomTag(false);
                    setTag(tag === preset ? "" : preset);
                  }}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    tag === preset
                      ? "bg-accent-soft text-accent-hover"
                      : "bg-card-hover text-text-soft"
                  }`}
                >
                  {preset}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setShowCustomTag(true);
                  setTag("");
                }}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  showCustomTag ? "bg-accent-soft text-accent-hover" : "bg-card-hover text-text-soft"
                }`}
              >
                其他…
              </button>
            </div>
            {showCustomTag && (
              <input
                placeholder="自訂標籤"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-card mt-1.5"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-accent-hover">👍 優點</span>
              <input
                name="pros"
                defaultValue={initial?.pros ?? ""}
                className="border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-coral">👎 缺點</span>
              <input
                name="cons"
                defaultValue={initial?.cons ?? ""}
                className="border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => setShowMore(false)}
            className="text-text-soft text-xs font-semibold self-start"
          >
            收起欄位
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowMore(true)}
          className="text-accent-hover text-xs font-semibold self-start"
        >
          ＋ 顯示更多欄位（檔期、標籤、優缺點）
        </button>
      )}

      <div className="flex gap-2 mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary flex-1 text-[12.5px] py-2"
        >
          取消
        </button>
        <button type="submit" disabled={pending} className="btn btn-primary flex-1 text-[12.5px] py-2">
          {submitLabel}
        </button>
      </div>
    </form>
  );
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!item) return null;

  const state = computeDecisionState(item.suggestedDecideBy, !!item.decisionRecord);
  const locked = item.candidates.filter((c) => c.status === "DECIDED");
  const visible = [...item.candidates].sort(
    (a, b) => (a.status === "REJECTED" ? 1 : 0) - (b.status === "REJECTED" ? 1 : 0)
  );
  const showCompareNote = segment === "cmp";

  function handleLock(candidateId: string) {
    startTransition(async () => {
      await lockCandidate(item!.id, candidateId);
      router.refresh();
    });
  }

  function handleUnlock(candidateId: string) {
    startTransition(async () => {
      await unlockCandidate(item!.id, candidateId);
      router.refresh();
    });
  }

  function handleRestore(candidateId: string) {
    startTransition(async () => {
      await restoreCandidate(candidateId);
      router.refresh();
    });
  }

  function handleConfirmReject(candidateId: string, reason: string) {
    startTransition(async () => {
      await rejectCandidate(candidateId, reason || undefined);
      router.refresh();
      setRejectingId(null);
    });
  }

  function handleAddCandidate(formData: FormData) {
    startTransition(async () => {
      await addCandidate(item!.id, formData);
      router.refresh();
      setShowAddForm(false);
    });
  }

  function handleUpdateCandidate(candidateId: string, formData: FormData) {
    startTransition(async () => {
      await updateCandidate(candidateId, formData);
      router.refresh();
      setEditingId(null);
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
            {(segment === "done" ? locked : visible).map((c) => {
              if (editingId === c.id) {
                return (
                  <CandidateForm
                    key={c.id}
                    initial={c}
                    pending={pending}
                    submitLabel="儲存"
                    onCancel={() => setEditingId(null)}
                    onSubmit={(formData) => handleUpdateCandidate(c.id, formData)}
                  />
                );
              }

              return (
                <div
                  key={c.id}
                  className={`candidate-card ${c.status === "DECIDED" ? "locked" : ""} ${
                    c.status === "REJECTED" ? "opacity-55" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2.5 mb-2">
                    <div className="font-bold text-[15px] flex items-center gap-2 flex-wrap">
                      <span className={c.status === "REJECTED" ? "line-through" : ""}>
                        {c.name}
                      </span>
                      {c.status === "DECIDED" && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-accent text-white inline-flex items-center gap-1">
                          ✓ 已選定
                        </span>
                      )}
                      {c.status === "CANDIDATE" && c.tag && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-soft text-accent-hover">
                          {c.tag}
                        </span>
                      )}
                      {c.status === "REJECTED" && (
                        <span className="status status-idle">已淘汰</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="font-display font-semibold text-[16px]">
                        {priceText(c)}
                      </div>
                      {segment !== "done" && (
                        <button
                          onClick={() => setEditingId(c.id)}
                          aria-label="編輯這個候選方案"
                          className="text-text-faint hover:text-accent-hover p-1 flex-none"
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth={2}>
                            <path d="M16.5 3.5l4 4L7 21l-4 1 1-4z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-[12.5px] text-text-soft mb-2.5">
                    {c.availability && <span>檔期 {availabilityLabel(c.availability)}</span>}
                    {c.type && (
                      <span>
                        風格 <b className="text-text font-semibold">{c.type}</b>
                      </span>
                    )}
                    {c.contact && <span>聯絡 {c.contact}</span>}
                  </div>
                  {(c.url || c.socialUrl) && (
                    <div className="flex flex-wrap gap-3 text-[12.5px] mb-2.5">
                      {c.url && (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-hover font-semibold underline underline-offset-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          🔗 網站
                        </a>
                      )}
                      {c.socialUrl && (
                        <a
                          href={c.socialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-hover font-semibold underline underline-offset-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          🔗 IG / FB
                        </a>
                      )}
                    </div>
                  )}
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
                  {c.status === "CANDIDATE" && rejectingId === c.id && (
                    <form
                      action={(formData) =>
                        handleConfirmReject(c.id, String(formData.get("reason") || ""))
                      }
                      className="flex flex-col gap-2 mb-2"
                    >
                      <input
                        name="reason"
                        placeholder="淘汰原因（可留白）"
                        autoFocus
                        className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setRejectingId(null)}
                          className="btn btn-secondary flex-1 text-[12.5px] py-2"
                        >
                          取消
                        </button>
                        <button
                          type="submit"
                          disabled={pending}
                          className="btn btn-primary flex-1 text-[12.5px] py-2"
                        >
                          確認淘汰
                        </button>
                      </div>
                    </form>
                  )}
                  {c.status === "CANDIDATE" && rejectingId !== c.id && (
                    <div className="flex items-center gap-2">
                      <button
                        disabled={pending}
                        onClick={() => setRejectingId(c.id)}
                        className="btn btn-secondary flex-1 text-[12.5px] py-2"
                      >
                        淘汰
                      </button>
                      <button
                        disabled={pending}
                        onClick={() => handleLock(c.id)}
                        className={`btn flex-1 text-[12.5px] py-2 ${
                          locked.length > 0
                            ? "bg-card-hover text-text-soft hover:bg-accent-soft hover:text-accent-hover"
                            : "btn-primary"
                        }`}
                      >
                        標記已定
                      </button>
                    </div>
                  )}
                  {c.status === "DECIDED" && segment !== "done" && (
                    <button
                      disabled={pending}
                      onClick={() => handleUnlock(c.id)}
                      className="btn btn-primary flex-1 text-[12.5px] py-2"
                    >
                      ✓ 已選定 · 點此取消
                    </button>
                  )}
                  {c.status === "REJECTED" && (
                    <button
                      disabled={pending}
                      onClick={() => handleRestore(c.id)}
                      className="btn btn-secondary text-[12.5px] py-2 px-4"
                    >
                      ↺ 復活
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {segment !== "done" && (
            <>
              {showAddForm ? (
                <div className="mt-2.5">
                  <CandidateForm
                    pending={pending}
                    submitLabel="新增"
                    onCancel={() => setShowAddForm(false)}
                    onSubmit={handleAddCandidate}
                  />
                </div>
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
