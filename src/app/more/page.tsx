import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentWedding } from "@/lib/wedding";
import { auth, signOut } from "@/lib/auth";

const ITEMS = [
  { title: "活動資訊", desc: "名稱 · 日期 · 場地 · 預算", href: "/more/event" },
  { title: "協作者管理", desc: "邀請家人或婚顧一起規劃", href: "/more/collaborators" },
  { title: "廠商目錄", desc: "瀏覽配合廠商，加入備選", href: "/more/vendors" },
];

export default async function MorePage() {
  const current = await getCurrentWedding();
  if (!current) redirect("/login");
  const session = await auth();

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
          <Link key={item.title} href={item.href} className="panel text-left card-interactive">
            <div className="font-bold text-[15px]">{item.title}</div>
            <div className="text-text-soft text-sm mt-0.5">{item.desc}</div>
          </Link>
        ))}
        <div className="panel">
          <div className="font-bold text-[15px]">帳號</div>
          <div className="text-text-soft text-sm mt-0.5 mb-3">
            {session?.user?.email ?? "目前帳號"}
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
