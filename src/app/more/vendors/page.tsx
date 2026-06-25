import { redirect } from "next/navigation";
import { getCurrentWedding } from "@/lib/wedding";
import { BackToMore } from "@/components/BackToMore";
import { VENDOR_DIRECTORY } from "@/lib/vendor-directory";
import { VendorCard } from "@/app/more/vendors/VendorCard";

export default async function VendorsPage() {
  const current = await getCurrentWedding();
  if (!current) redirect("/login");

  return (
    <div className="animate-fade-in">
      <BackToMore />
      <div className="text-[11px] tracking-[0.16em] uppercase text-accent-hover font-bold">
        更多
      </div>
      <h1 className="text-[25px] md:text-[30px] font-bold tracking-tight mt-0.5 mb-3">
        廠商目錄
      </h1>
      <p className="text-text-soft text-sm mb-4">
        瀏覽配合廠商，點一下就能加入對應決策類別的備選名單。
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {VENDOR_DIRECTORY.map((vendor) => (
          <VendorCard key={vendor.id} weddingId={current.wedding.id} vendor={vendor} />
        ))}
      </div>
    </div>
  );
}
