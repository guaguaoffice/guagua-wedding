import Link from "next/link";

export function BackToMore() {
  return (
    <Link
      href="/more"
      className="inline-flex items-center gap-1 text-text-soft text-sm mb-3 hover:text-accent-hover"
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth={2}>
        <path d="M15 6l-6 6 6 6" />
      </svg>
      返回更多
    </Link>
  );
}
