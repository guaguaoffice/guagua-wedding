"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActiveNav } from "@/components/nav-items";
import { NavIcon } from "@/components/NavIcon";
import { daysUntil } from "@/lib/decision-state";

export function AppShell({
  children,
  weddingName,
  weddingDate,
}: {
  children: React.ReactNode;
  weddingName: string;
  weddingDate: Date | null;
}) {
  const pathname = usePathname();
  const days = weddingDate ? daysUntil(weddingDate) : null;

  return (
    <div className="max-w-[1180px] mx-auto md:grid md:grid-cols-[236px_1fr] md:min-h-screen">
      <aside className="hidden md:flex md:flex-col md:gap-1 md:p-[20px_14px] md:row-span-2 md:border-r md:border-border md:bg-bg md:sticky md:top-0 md:h-screen">
        <div className="flex items-center gap-2.5 px-2.5 pb-[18px]">
          <div className="w-[34px] h-[34px] rounded-[10px] bg-gradient-to-br from-accent to-accent-hover grid place-items-center text-white font-display font-semibold text-lg">
            呱
          </div>
          <div>
            <b className="text-[16px]">呱呱婚禮</b>
            <small className="block text-text-faint text-[11px] tracking-wider">
              WEDDING PLANNER
            </small>
          </div>
        </div>
        {NAV_ITEMS.map((item) => {
          const active = isActiveNav(pathname, item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 px-[13px] py-[11px] rounded-[11px] font-medium text-[14.5px] w-full ${
                active
                  ? "bg-card text-accent-hover shadow-[var(--shadow)] font-bold"
                  : "text-text-soft hover:bg-card-hover hover:text-text"
              }`}
            >
              <NavIcon name={item.key} className="w-[21px] h-[21px] flex-none" />
              {item.label}
            </Link>
          );
        })}
      </aside>

      <header className="md:col-start-2 sticky top-0 z-30 bg-bg/86 backdrop-blur-sm border-b border-border flex items-center justify-between px-[18px] py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-[30px] h-[30px] rounded-[9px] bg-gradient-to-br from-accent to-accent-hover grid place-items-center text-white font-display font-semibold text-[16px] shadow-[0_4px_10px_rgba(79,146,116,0.3)]">
            呱
          </div>
          <div>
            <b className="text-[15px]">{weddingName}</b>
            {weddingDate && (
              <small className="block text-text-faint text-[11px] tracking-wider font-normal">
                {weddingDate.toLocaleDateString("zh-Hant", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </small>
            )}
          </div>
        </div>
        {days !== null && (
          <div className="flex items-baseline gap-1.5 bg-card border border-border rounded-full px-[13px] py-1.5 shadow-[var(--shadow)]">
            <span className="font-display font-semibold text-lg text-accent-hover leading-none">
              {days}
            </span>
            <span className="text-[11px] text-text-soft">天後結婚</span>
          </div>
        )}
      </header>

      <main className="md:col-start-2 px-4 py-5 pb-10 md:px-9 md:py-7 md:pb-14 min-w-0">
        {children}
      </main>

      <nav className="md:hidden fixed left-0 right-0 bottom-0 z-40 bg-card/92 backdrop-blur-md border-t border-border flex pt-[7px] pb-[10px] px-1.5">
        {NAV_ITEMS.map((item) => {
          const active = isActiveNav(pathname, item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-[3px] text-[10.5px] font-semibold py-1 ${
                active ? "text-accent-hover" : "text-text-faint"
              }`}
            >
              <NavIcon name={item.key} className="w-[23px] h-[23px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
