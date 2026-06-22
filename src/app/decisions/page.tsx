import Link from "next/link";
import { mockDecisionItems } from "@/lib/mock-decisions";

export default function DecisionsPage() {
  return (
    <main className="flex-1 px-4 sm:px-6 py-8 max-w-4xl w-full mx-auto animate-fade-in">
      <h1 className="text-2xl font-semibold mb-1">決策中心</h1>
      <p className="text-muted mb-8">
        每個重要婚禮項目都是一個可以比較、討論、決策的 Workspace。
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mockDecisionItems.map((item) => {
          const decided = item.candidates.find((c) => c.status === "DECIDED");
          const activeCount = item.candidates.filter(
            (c) => c.status === "CANDIDATE"
          ).length;
          return (
            <Link
              key={item.id}
              href={`/decisions/${item.slug}`}
              className="card p-5 animate-slide-up"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-medium">{item.title}</h2>
                <span className="text-xs text-muted">{item.category}</span>
              </div>
              {decided ? (
                <p className="text-sm text-accent">已決定：{decided.name}</p>
              ) : (
                <p className="text-sm text-muted">{activeCount} 個候選方案</p>
              )}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
