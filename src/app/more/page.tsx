import { redirect } from "next/navigation";
import { getCurrentWedding } from "@/lib/wedding";
import { signOut } from "@/lib/auth";

const ITEMS = [
  { title: "活動資訊", desc: "名稱 · 日期 · 地點 · 餐飲 · 幣別" },
  { title: "協作者管理", desc: "邀請家人或婚顧一起規劃" },
  { title: "廠商目錄", desc: "瀏覽配合廠商，加入備選" },
];

export default async function MorePage() {
  const current = await getCurrentWedding();
  if (!current) redirect("/login");

  return (
    <div className="animate-fade-in">
      <div className="text-[11px] tracking-[0.16em] uppercase text-accent-hover font-bold">
        更多
      </div>
      <h1 className="text-[25px] md:text-[30px] font-bold tracking-tight mt-0.5 mb-3">
        更多功能
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
        {ITEMS.map((item) => (
          <button key={item.title} className="panel text-left card-interactive">
            <div className="font-bold text-[15px]">{item.title}</div>
            <div className="text-text-soft text-sm mt-0.5">{item.desc}</div>
          </button>
        ))}
        <div className="panel">
          <div className="font-bold text-[15px]">帳號與多活動</div>
          <div className="text-text-soft text-sm mt-0.5 mb-3">
            切換活動 · 轉移主辦權 · 登出
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button type="submit" className="btn btn-secondary">
              登出
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
