import Link from "next/link";
import { mockTimelinePhases } from "@/lib/mock-timeline";

export default function TimelinePage() {
  return (
    <main className="flex-1 px-4 sm:px-6 py-8 max-w-3xl w-full mx-auto animate-fade-in">
      <h1 className="text-2xl font-semibold mb-1">婚禮流程時間軸</h1>
      <p className="text-muted mb-8">依時間推進，逐步完成每個階段的任務。</p>

      <ol className="relative border-l-2 border-border pl-6 flex flex-col gap-8">
        {mockTimelinePhases.map((phase) => (
          <li key={phase.id} className="relative animate-slide-up">
            <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-accent border-2 border-bg" />
            <h2 className="font-medium mb-3">{phase.title}</h2>
            <div className="flex flex-col gap-2">
              {phase.tasks.map((task) => {
                const content = (
                  <div className="card p-3 flex items-center justify-between text-sm">
                    <span
                      className={
                        task.completed ? "line-through text-muted" : undefined
                      }
                    >
                      {task.title}
                    </span>
                    {task.decisionSlug && (
                      <span className="text-accent text-xs">進入決策 →</span>
                    )}
                  </div>
                );
                return task.decisionSlug ? (
                  <Link key={task.id} href={`/decisions/${task.decisionSlug}`}>
                    {content}
                  </Link>
                ) : (
                  <div key={task.id}>{content}</div>
                );
              })}
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
