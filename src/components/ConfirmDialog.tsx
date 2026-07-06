"use client";

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "確定",
  danger = true,
  onConfirm,
  onCancel,
}: {
  title: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onCancel}
    >
      <div
        className="bg-card rounded-2xl shadow-2xl p-6 w-full max-w-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[17px] font-bold mb-1">{title}</div>
        {message && <p className="text-sm text-text-soft mb-5">{message}</p>}
        {!message && <div className="mb-5" />}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 btn border border-border text-text-soft hover:bg-card-hover"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 btn text-white hover:opacity-90 ${danger ? "bg-coral" : "bg-accent"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
