import { notFound } from "next/navigation";
import { findDecisionItem, type Candidate } from "@/lib/mock-decisions";

const STATUS_LABEL: Record<Candidate["status"], string> = {
  CANDIDATE: "候選中",
  REJECTED: "已淘汰",
  DECIDED: "已決定",
};

const STATUS_STYLE: Record<Candidate["status"], string> = {
  CANDIDATE: "bg-accent-soft text-accent",
  REJECTED: "bg-card-hover text-muted",
  DECIDED: "bg-accent text-white",
};

export default async function DecisionWorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = findDecisionItem(slug);
  if (!item) notFound();

  const avgScore = (c: Candidate) =>
    c.ratings.length
      ? (c.ratings.reduce((sum, r) => sum + r.score, 0) / c.ratings.length).toFixed(1)
      : null;

  const decided = item.candidates.find((c) => c.status === "DECIDED");

  return (
    <main className="flex-1 px-4 sm:px-6 py-8 max-w-3xl w-full mx-auto animate-fade-in">
      <p className="text-muted text-sm mb-1">{item.category}</p>
      <h1 className="text-2xl font-semibold mb-8">{item.title}</h1>

      {decided && item.decisionRecord && (
        <section className="card p-5 mb-8 border-accent/40 bg-accent-soft animate-slide-up">
          <h2 className="font-medium mb-2">🐸 最終決定：{decided.name}</h2>
          <p className="text-sm">
            決定者：{item.decisionRecord.decidedBy} ・ 決定時間：
            {item.decisionRecord.decidedAt}
          </p>
          <p className="text-sm mt-1">決定原因：{item.decisionRecord.reason}</p>
        </section>
      )}

      <div className="flex flex-col gap-4">
        {item.candidates.map((c) => (
          <div key={c.id} className="card p-5 animate-slide-up">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-medium">{c.name}</h3>
                {c.type && <p className="text-xs text-muted">{c.type}</p>}
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLE[c.status]}`}
              >
                {STATUS_LABEL[c.status]}
              </span>
            </div>

            {c.price !== undefined && (
              <p className="text-sm mb-2">價格：NT$ {c.price.toLocaleString()}</p>
            )}

            {(c.pros || c.cons) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-2">
                {c.pros && (
                  <p>
                    <span className="text-accent">優點：</span>
                    {c.pros}
                  </p>
                )}
                {c.cons && (
                  <p>
                    <span className="text-muted">缺點：</span>
                    {c.cons}
                  </p>
                )}
              </div>
            )}

            {c.status === "REJECTED" && c.rejectedReason && (
              <p className="text-sm text-muted mb-2">
                淘汰原因：{c.rejectedReason}
              </p>
            )}

            {c.ratings.length > 0 && (
              <div className="flex items-center gap-3 text-sm mb-2">
                <span className="text-muted">評分</span>
                {c.ratings.map((r) => (
                  <span key={r.member}>
                    {r.member} {r.score} 分
                  </span>
                ))}
                <span className="text-xs text-muted">(平均 {avgScore(c)})</span>
              </div>
            )}

            {c.comments.length > 0 && (
              <ul className="flex flex-col gap-1 text-sm border-t border-border pt-2 mt-2">
                {c.comments.map((cm, i) => (
                  <li key={i}>
                    <span className="font-medium">{cm.member}：</span>
                    {cm.content}
                  </li>
                ))}
              </ul>
            )}

            {c.status === "CANDIDATE" && (
              <div className="flex gap-2 mt-3">
                <button className="btn btn-primary">決定採用</button>
                <button className="btn btn-secondary">淘汰</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="btn btn-ghost mt-6">+ 新增候選方案</button>
    </main>
  );
}
