import {
  daysUntil,
  mockActivities,
  mockMembers,
  mockPendingDecisions,
  mockPendingPayments,
  mockReminders,
  mockWeeklyTasks,
  mockWedding,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const days = daysUntil(mockWedding.weddingDate);

  return (
    <main className="flex-1 px-4 sm:px-6 py-8 max-w-6xl w-full mx-auto animate-fade-in">
      <h1 className="text-2xl font-semibold mb-1">{mockWedding.name}</h1>
      <p className="text-muted mb-6">婚禮戰情中心</p>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="card p-6 animate-slide-up">
          <p className="text-muted text-sm mb-1">距離婚禮</p>
          <p className="text-4xl font-semibold text-accent">{days} 天</p>
        </div>
        <div className="card p-6 animate-slide-up">
          <p className="text-muted text-sm mb-2">整體進度</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 rounded-full bg-card-hover overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${mockWedding.overallProgress}%` }}
              />
            </div>
            <span className="font-semibold">{mockWedding.overallProgress}%</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ListCard title="本週建議完成">
          {mockWeeklyTasks.map((task) => (
            <li key={task.id} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              {task.title}
            </li>
          ))}
        </ListCard>

        <ListCard title="待決策">
          {mockPendingDecisions.map((d) => (
            <li key={d.id} className="flex items-center justify-between">
              <span>{d.title}</span>
              <span className="text-muted text-xs">{d.candidateCount} 個候選</span>
            </li>
          ))}
        </ListCard>

        <ListCard title="待付款">
          {mockPendingPayments.map((p) => (
            <li key={p.id} className="flex items-center justify-between">
              <span>{p.name}</span>
              <span className="text-muted text-xs">
                NT$ {p.amount.toLocaleString()}
              </span>
            </li>
          ))}
        </ListCard>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card p-5 animate-slide-up">
          <h2 className="font-medium mb-3">最新動態</h2>
          <ul className="flex flex-col gap-3 text-sm">
            {mockActivities.map((a) => (
              <li key={a.id} className="flex items-center justify-between">
                <span>
                  <span className="font-medium">{a.actor}</span> {a.action}
                </span>
                <span className="text-muted text-xs whitespace-nowrap ml-2">
                  {a.time}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5 animate-slide-up">
          <h2 className="font-medium mb-3">成員動態</h2>
          <div className="flex gap-3">
            {mockMembers.map((m) => (
              <div key={m.id} className="flex flex-col items-center gap-1">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: m.avatarColor }}
                >
                  {m.name.slice(0, 1)}
                </div>
                <span className="text-xs text-muted">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {mockReminders.length > 0 && (
        <section className="card p-5 border-accent/40 bg-accent-soft animate-slide-up">
          <h2 className="font-medium mb-2">重要提醒</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {mockReminders.map((r) => (
              <li key={r.id}>🐸 {r.text}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function ListCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-5 animate-slide-up">
      <h2 className="font-medium mb-3">{title}</h2>
      <ul className="flex flex-col gap-2 text-sm">{children}</ul>
    </div>
  );
}
