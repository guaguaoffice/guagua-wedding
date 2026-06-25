import { redirect } from "next/navigation";
import { getCurrentWedding } from "@/lib/wedding";
import { toNumOrNull } from "@/lib/decimal";
import { BackToMore } from "@/components/BackToMore";
import { EventForm } from "@/app/more/event/EventForm";

export default async function EventInfoPage() {
  const current = await getCurrentWedding();
  if (!current) redirect("/login");

  const wedding = current.wedding;

  return (
    <div className="animate-fade-in">
      <BackToMore />
      <div className="text-[11px] tracking-[0.16em] uppercase text-accent-hover font-bold">
        更多
      </div>
      <h1 className="text-[25px] md:text-[30px] font-bold tracking-tight mt-0.5 mb-3">
        活動資訊
      </h1>
      <p className="text-text-soft text-sm mb-4">
        這些資訊會顯示在總覽頁面的倒數卡片，也會用來計算預算進度。
      </p>

      <EventForm
        weddingId={wedding.id}
        initial={{
          name: wedding.name,
          weddingDate: wedding.weddingDate,
          venueName: wedding.venueName,
          venueDetail: wedding.venueDetail,
          totalBudget: toNumOrNull(wedding.totalBudget),
        }}
      />
    </div>
  );
}
