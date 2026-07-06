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
  fbUrl: string | null;
  igUrl: string | null;
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
      <label className="flex flex-col gap-1">
        <span className="text-[11px] text-text-soft font-semibold">廠商名稱</span>
        <input
          name="name"
          placeholder="例如：晶華酒店"
          defaultValue={initial?.name ?? ""}
          required
          className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
        />
      </label>
      <div className="flex gap-2">
        <label className="flex-1 min-w-0 flex flex-col gap-1">
          <span className="text-[11px] text-text-soft font-semibold">風格 / 類型</span>
          <input
            name="type"
            placeholder="例如：宴會廳、戶外庭園"
            defaultValue={initial?.type ?? ""}
            className="w-full min-w-0 border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
          />
        </label>
        <label className="flex-1 min-w-0 flex flex-col gap-1">
          <span className="text-[11px] text-text-soft font-semibold">報價</span>
          <input
            name="price"
            placeholder="數字，例如：38000"
            defaultValue={initial?.price ?? ""}
            className="w-full min-w-0 border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
          />
        </label>
      </div>
      <div>
        <div className="text-[11px] text-text-soft font-semibold mb-1.5">連結</div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-text-soft w-[52px] flex-none flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-3.5 h-3.5 flex-none"><path d="M0 0h256v256H0z" fill="none"/><path fill="#1877f2" d="M256 128C256 57.308 198.692 0 128 0S0 57.308 0 128c0 63.888 46.808 116.843 108 126.445V165H75.5v-37H108V99.8c0-32.08 19.11-49.8 48.348-49.8C170.352 50 185 52.5 185 52.5V84h-16.14C152.959 84 148 93.867 148 103.99V128h35.5l-5.675 37H148v89.445c61.192-9.602 108-62.556 108-126.445"/><path fill="#fff" d="m177.825 165 5.675-37H148v-24.01C148 93.866 152.959 84 168.86 84H185V52.5S170.352 50 156.347 50C127.11 50 108 67.72 108 99.8V128H75.5v37H108v89.445A129 129 0 0 0 128 256a129 129 0 0 0 20-1.555V165z"/></svg>
              FB
            </span>
            <input
              name="fbUrl"
              type="url"
              placeholder="https://facebook.com/..."
              defaultValue={initial?.fbUrl ?? ""}
              className="flex-1 min-w-0 border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-text-soft w-[52px] flex-none flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-3.5 h-3.5 flex-none"><path d="M0 0h256v256H0z" fill="none"/><g fill="none"><rect width="256" height="256" fill="url(#ig-a)" rx="60"/><rect width="256" height="256" fill="url(#ig-b)" rx="60"/><path fill="#fff" d="M128.009 28c-27.158 0-30.567.119-41.233.604c-10.646.488-17.913 2.173-24.271 4.646c-6.578 2.554-12.157 5.971-17.715 11.531c-5.563 5.559-8.98 11.138-11.542 17.713c-2.48 6.36-4.167 13.63-4.646 24.271c-.477 10.667-.602 14.077-.602 41.236s.12 30.557.604 41.223c.49 10.646 2.175 17.913 4.646 24.271c2.556 6.578 5.973 12.157 11.533 17.715c5.557 5.563 11.136 8.988 17.709 11.542c6.363 2.473 13.631 4.158 24.275 4.646c10.667.485 14.073.604 41.23.604c27.161 0 30.559-.119 41.225-.604c10.646-.488 17.921-2.173 24.284-4.646c6.575-2.554 12.146-5.979 17.702-11.542c5.563-5.558 8.979-11.137 11.542-17.712c2.458-6.361 4.146-13.63 4.646-24.272c.479-10.666.604-14.066.604-41.225s-.125-30.567-.604-41.234c-.5-10.646-2.188-17.912-4.646-24.27c-2.563-6.578-5.979-12.157-11.542-17.716c-5.562-5.562-11.125-8.979-17.708-11.53c-6.375-2.474-13.646-4.16-24.292-4.647c-10.667-.485-14.063-.604-41.23-.604zm-8.971 18.021c2.663-.004 5.634 0 8.971 0c26.701 0 29.865.096 40.409.575c9.75.446 15.042 2.075 18.567 3.444c4.667 1.812 7.994 3.979 11.492 7.48c3.5 3.5 5.666 6.833 7.483 11.5c1.369 3.52 3 8.812 3.444 18.562c.479 10.542.583 13.708.583 40.396s-.104 29.855-.583 40.396c-.446 9.75-2.075 15.042-3.444 18.563c-1.812 4.667-3.983 7.99-7.483 11.488c-3.5 3.5-6.823 5.666-11.492 7.479c-3.521 1.375-8.817 3-18.567 3.446c-10.542.479-13.708.583-40.409.583c-26.702 0-29.867-.104-40.408-.583c-9.75-.45-15.042-2.079-18.57-3.448c-4.666-1.813-8-3.979-11.5-7.479s-5.666-6.825-7.483-11.494c-1.369-3.521-3-8.813-3.444-18.563c-.479-10.542-.575-13.708-.575-40.413s.096-29.854.575-40.396c.446-9.75 2.075-15.042 3.444-18.567c1.813-4.667 3.983-8 7.484-11.5s6.833-5.667 11.5-7.483c3.525-1.375 8.819-3 18.569-3.448c9.225-.417 12.8-.542 31.437-.563zm62.351 16.604c-6.625 0-12 5.37-12 11.996c0 6.625 5.375 12 12 12s12-5.375 12-12s-5.375-12-12-12zm-53.38 14.021c-28.36 0-51.354 22.994-51.354 51.355s22.994 51.344 51.354 51.344c28.361 0 51.347-22.983 51.347-51.344c0-28.36-22.988-51.355-51.349-51.355zm0 18.021c18.409 0 33.334 14.923 33.334 33.334c0 18.409-14.925 33.334-33.334 33.334s-33.333-14.925-33.333-33.334c0-18.411 14.923-33.334 33.333-33.334"/><defs><radialGradient id="ig-a" cx="0" cy="0" r="1" gradientTransform="matrix(0 -253.715 235.975 0 68 275.717)" gradientUnits="userSpaceOnUse"><stop stop-color="#fd5"/><stop offset=".1" stop-color="#fd5"/><stop offset=".5" stop-color="#ff543e"/><stop offset="1" stop-color="#c837ab"/></radialGradient><radialGradient id="ig-b" cx="0" cy="0" r="1" gradientTransform="rotate(78.68 -32.69 -16.937)scale(113.412 467.488)" gradientUnits="userSpaceOnUse"><stop stop-color="#3771c8"/><stop offset=".128" stop-color="#3771c8"/><stop offset="1" stop-color="#60f" stop-opacity="0"/></radialGradient></defs></g></svg>
              IG
            </span>
            <input
              name="igUrl"
              type="url"
              placeholder="https://instagram.com/..."
              defaultValue={initial?.igUrl ?? ""}
              className="flex-1 min-w-0 border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-text-soft w-[52px] flex-none flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-3.5 h-3.5 flex-none"><path d="M0 0h48v48H0z" fill="none"/><g fill="none"><path fill="#a8d4bc" d="M24 1.5c-5.926 0-10.206.242-13.041.491c-3.3.29-5.765 2.887-5.993 6.152C4.74 11.408 4.5 16.597 4.5 24s.239 12.592.466 15.857s2.693 5.862 5.993 6.152c2.835.249 7.115.491 13.041.491s10.206-.242 13.041-.491c3.3-.29 5.765-2.887 5.993-6.152c.227-3.265.466-8.454.466-15.857s-.239-12.592-.466-15.857s-2.693-5.862-5.993-6.152C34.206 1.742 29.926 1.5 24 1.5"/><path fill="#4f9274" d="M43.5 24h-39c0 7.403.239 12.592.466 15.857s2.693 5.862 5.993 6.152c2.835.249 7.115.491 13.041.491s10.206-.242 13.041-.491c3.3-.29 5.765-2.887 5.993-6.152c.227-3.265.466-8.454.466-15.857"/><path fill="#a8d4bc" d="M42.655 41.68a112 112 0 0 0-2.123-2.18c-3.59-3.59-6.206-5.77-7.99-7.079c-1.855-1.361-4.177-1.155-5.919.35c-1.56 1.35-3.86 3.464-7.123 6.728c-2.966 2.967-4.983 5.136-6.34 6.678c2.702.18 6.285.323 10.84.323c5.926 0 10.206-.242 13.041-.491a6.51 6.51 0 0 0 5.614-4.33M13.75 29a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5"/><path fill="#4f9274" fill-rule="evenodd" d="M11.25 9.5c0-.966.784-1.75 1.75-1.75h12a1.75 1.75 0 1 1 0 3.5H13a1.75 1.75 0 0 1-1.75-1.75m0 7.5c0-.966.784-1.75 1.75-1.75h22a1.75 1.75 0 1 1 0 3.5H13A1.75 1.75 0 0 1 11.25 17" clip-rule="evenodd"/></g></svg>
              網站
            </span>
            <input
              name="url"
              type="url"
              placeholder="https://..."
              defaultValue={initial?.url ?? ""}
              className="flex-1 min-w-0 border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
            />
          </div>
        </div>
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-[11px] text-text-soft font-semibold">聯絡方式</span>
        <input
          name="contact"
          placeholder="電話 / LINE / Email"
          defaultValue={initial?.contact ?? ""}
          className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
        />
      </label>

      {showMore ? (
        <div className="flex flex-col gap-3 animate-slide-up">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-text-soft font-semibold">報價說明</span>
            <input
              name="note"
              placeholder="例如：套組 38,000 / 面議"
              defaultValue={initial?.note ?? ""}
              className="w-full border border-border rounded-[9px] px-3 py-2 text-sm bg-card"
            />
          </label>

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
                  {c.note && (
                    <p className="text-[12.5px] text-text-soft mb-2.5">報價說明：{c.note}</p>
                  )}
                  {(c.url || c.fbUrl || c.igUrl) && (
                    <div className="flex flex-wrap gap-3 text-[12.5px] mb-2.5">
                      {c.fbUrl && (
                        <a
                          href={c.fbUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-hover font-semibold underline underline-offset-2 flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-3.5 h-3.5 flex-none"><path d="M0 0h256v256H0z" fill="none"/><path fill="#1877f2" d="M256 128C256 57.308 198.692 0 128 0S0 57.308 0 128c0 63.888 46.808 116.843 108 126.445V165H75.5v-37H108V99.8c0-32.08 19.11-49.8 48.348-49.8C170.352 50 185 52.5 185 52.5V84h-16.14C152.959 84 148 93.867 148 103.99V128h35.5l-5.675 37H148v89.445c61.192-9.602 108-62.556 108-126.445"/><path fill="#fff" d="m177.825 165 5.675-37H148v-24.01C148 93.866 152.959 84 168.86 84H185V52.5S170.352 50 156.347 50C127.11 50 108 67.72 108 99.8V128H75.5v37H108v89.445A129 129 0 0 0 128 256a129 129 0 0 0 20-1.555V165z"/></svg>
                          Facebook
                        </a>
                      )}
                      {c.igUrl && (
                        <a
                          href={c.igUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-hover font-semibold underline underline-offset-2 flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-3.5 h-3.5 flex-none"><path d="M0 0h256v256H0z" fill="none"/><g fill="none"><rect width="256" height="256" fill="url(#ig-c)" rx="60"/><rect width="256" height="256" fill="url(#ig-d)" rx="60"/><path fill="#fff" d="M128.009 28c-27.158 0-30.567.119-41.233.604c-10.646.488-17.913 2.173-24.271 4.646c-6.578 2.554-12.157 5.971-17.715 11.531c-5.563 5.559-8.98 11.138-11.542 17.713c-2.48 6.36-4.167 13.63-4.646 24.271c-.477 10.667-.602 14.077-.602 41.236s.12 30.557.604 41.223c.49 10.646 2.175 17.913 4.646 24.271c2.556 6.578 5.973 12.157 11.533 17.715c5.557 5.563 11.136 8.988 17.709 11.542c6.363 2.473 13.631 4.158 24.275 4.646c10.667.485 14.073.604 41.23.604c27.161 0 30.559-.119 41.225-.604c10.646-.488 17.921-2.173 24.284-4.646c6.575-2.554 12.146-5.979 17.702-11.542c5.563-5.558 8.979-11.137 11.542-17.712c2.458-6.361 4.146-13.63 4.646-24.272c.479-10.666.604-14.066.604-41.225s-.125-30.567-.604-41.234c-.5-10.646-2.188-17.912-4.646-24.27c-2.563-6.578-5.979-12.157-11.542-17.716c-5.562-5.562-11.125-8.979-17.708-11.53c-6.375-2.474-13.646-4.16-24.292-4.647c-10.667-.485-14.063-.604-41.23-.604zm-8.971 18.021c2.663-.004 5.634 0 8.971 0c26.701 0 29.865.096 40.409.575c9.75.446 15.042 2.075 18.567 3.444c4.667 1.812 7.994 3.979 11.492 7.48c3.5 3.5 5.666 6.833 7.483 11.5c1.369 3.52 3 8.812 3.444 18.562c.479 10.542.583 13.708.583 40.396s-.104 29.855-.583 40.396c-.446 9.75-2.075 15.042-3.444 18.563c-1.812 4.667-3.983 7.99-7.483 11.488c-3.5 3.5-6.823 5.666-11.492 7.479c-3.521 1.375-8.817 3-18.567 3.446c-10.542.479-13.708.583-40.409.583c-26.702 0-29.867-.104-40.408-.583c-9.75-.45-15.042-2.079-18.57-3.448c-4.666-1.813-8-3.979-11.5-7.479s-5.666-6.825-7.483-11.494c-1.369-3.521-3-8.813-3.444-18.563c-.479-10.542-.575-13.708-.575-40.413s.096-29.854.575-40.396c.446-9.75 2.075-15.042 3.444-18.567c1.813-4.667 3.983-8 7.484-11.5s6.833-5.667 11.5-7.483c3.525-1.375 8.819-3 18.569-3.448c9.225-.417 12.8-.542 31.437-.563zm62.351 16.604c-6.625 0-12 5.37-12 11.996c0 6.625 5.375 12 12 12s12-5.375 12-12s-5.375-12-12-12zm-53.38 14.021c-28.36 0-51.354 22.994-51.354 51.355s22.994 51.344 51.354 51.344c28.361 0 51.347-22.983 51.347-51.344c0-28.36-22.988-51.355-51.349-51.355zm0 18.021c18.409 0 33.334 14.923 33.334 33.334c0 18.409-14.925 33.334-33.334 33.334s-33.333-14.925-33.333-33.334c0-18.411 14.923-33.334 33.333-33.334"/><defs><radialGradient id="ig-c" cx="0" cy="0" r="1" gradientTransform="matrix(0 -253.715 235.975 0 68 275.717)" gradientUnits="userSpaceOnUse"><stop stop-color="#fd5"/><stop offset=".1" stop-color="#fd5"/><stop offset=".5" stop-color="#ff543e"/><stop offset="1" stop-color="#c837ab"/></radialGradient><radialGradient id="ig-d" cx="0" cy="0" r="1" gradientTransform="rotate(78.68 -32.69 -16.937)scale(113.412 467.488)" gradientUnits="userSpaceOnUse"><stop stop-color="#3771c8"/><stop offset=".128" stop-color="#3771c8"/><stop offset="1" stop-color="#60f" stop-opacity="0"/></radialGradient></defs></g></svg>
                          Instagram
                        </a>
                      )}
                      {c.url && (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-hover font-semibold underline underline-offset-2 flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-3.5 h-3.5 flex-none"><path d="M0 0h48v48H0z" fill="none"/><g fill="none"><path fill="#a8d4bc" d="M24 1.5c-5.926 0-10.206.242-13.041.491c-3.3.29-5.765 2.887-5.993 6.152C4.74 11.408 4.5 16.597 4.5 24s.239 12.592.466 15.857s2.693 5.862 5.993 6.152c2.835.249 7.115.491 13.041.491s10.206-.242 13.041-.491c3.3-.29 5.765-2.887 5.993-6.152c.227-3.265.466-8.454.466-15.857s-.239-12.592-.466-15.857s-2.693-5.862-5.993-6.152C34.206 1.742 29.926 1.5 24 1.5"/><path fill="#4f9274" d="M43.5 24h-39c0 7.403.239 12.592.466 15.857s2.693 5.862 5.993 6.152c2.835.249 7.115.491 13.041.491s10.206-.242 13.041-.491c3.3-.29 5.765-2.887 5.993-6.152c.227-3.265.466-8.454.466-15.857"/><path fill="#a8d4bc" d="M42.655 41.68a112 112 0 0 0-2.123-2.18c-3.59-3.59-6.206-5.77-7.99-7.079c-1.855-1.361-4.177-1.155-5.919.35c-1.56 1.35-3.86 3.464-7.123 6.728c-2.966 2.967-4.983 5.136-6.34 6.678c2.702.18 6.285.323 10.84.323c5.926 0 10.206-.242 13.041-.491a6.51 6.51 0 0 0 5.614-4.33M13.75 29a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5"/><path fill="#4f9274" fill-rule="evenodd" d="M11.25 9.5c0-.966.784-1.75 1.75-1.75h12a1.75 1.75 0 1 1 0 3.5H13a1.75 1.75 0 0 1-1.75-1.75m0 7.5c0-.966.784-1.75 1.75-1.75h22a1.75 1.75 0 1 1 0 3.5H13A1.75 1.75 0 0 1 11.25 17" clip-rule="evenodd"/></g></svg>
                          網站
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
                        className={`btn flex-1 text-[12.5px] py-2 ${
                          locked.length > 0
                            ? "bg-card-hover text-text-soft hover:bg-accent-soft hover:text-accent-hover"
                            : "btn-primary"
                        }`}
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
                      ↺ 重新考慮
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
