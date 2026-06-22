import Link from "next/link";
import {
  mockBudgetItems,
  mockTotalBudget,
  STATUS_LABEL,
  STATUS_STYLE,
} from "@/lib/mock-budget";

export default function BudgetPage() {
  const totalSpent = mockBudgetItems.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPaid = mockBudgetItems.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalUnpaid = totalSpent - totalPaid;
  const remaining = mockTotalBudget - totalSpent;

  const byCategory = mockBudgetItems.reduce<Record<string, number>>((acc, i) => {
    acc[i.category] = (acc[i.category] ?? 0) + i.totalAmount;
    return acc;
  }, {});

  return (
    <main className="flex-1 px-4 sm:px-6 py-8 max-w-4xl w-full mx-auto animate-fade-in">
      <h1 className="text-2xl font-semibold mb-1">預算與付款</h1>
      <p className="text-muted mb-8">與決策中心連動，掌握每一筆婚禮支出。</p>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="總預算" value={mockTotalBudget} />
        <SummaryCard label="已付款" value={totalPaid} highlight />
        <SummaryCard label="未付款" value={totalUnpaid} />
        <SummaryCard
          label="剩餘預算"
          value={remaining}
          warn={remaining < 0}
        />
      </section>

      <section className="card p-5 mb-8 animate-slide-up">
        <h2 className="font-medium mb-3">類別支出比例</h2>
        <div className="flex flex-col gap-2">
          {Object.entries(byCategory).map(([category, amount]) => (
            <div key={category} className="flex items-center gap-3 text-sm">
              <span className="w-16 text-muted">{category}</span>
              <div className="flex-1 h-2 rounded-full bg-card-hover overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full"
                  style={{ width: `${(amount / totalSpent) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted whitespace-nowrap">
                NT$ {amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </section>

      <h2 className="font-medium mb-3">支出項目</h2>
      <div className="flex flex-col gap-3">
        {mockBudgetItems.map((item) => (
          <div key={item.id} className="card p-5 animate-slide-up">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-xs text-muted">{item.category}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLE[item.status]}`}
              >
                {STATUS_LABEL[item.status]}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mb-2">
              <p>總金額：NT$ {item.totalAmount.toLocaleString()}</p>
              {item.depositAmount !== undefined && (
                <p>訂金：NT$ {item.depositAmount.toLocaleString()}</p>
              )}
              {item.finalAmount !== undefined && (
                <p>尾款：NT$ {item.finalAmount.toLocaleString()}</p>
              )}
              <p>已付：NT$ {item.paidAmount.toLocaleString()}</p>
            </div>

            {item.dueDate && (
              <p className="text-xs text-muted mb-2">付款提醒：{item.dueDate}</p>
            )}

            {item.decisionSlug && (
              <Link
                href={`/decisions/${item.decisionSlug}`}
                className="text-accent text-xs"
              >
                查看決策紀錄 →
              </Link>
            )}
          </div>
        ))}
      </div>

      <button className="btn btn-ghost mt-6">+ 新增支出項目</button>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  highlight,
  warn,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="card p-4 animate-slide-up">
      <p className="text-muted text-xs mb-1">{label}</p>
      <p
        className={`text-lg font-semibold ${
          warn ? "text-red-500" : highlight ? "text-accent" : ""
        }`}
      >
        NT$ {value.toLocaleString()}
      </p>
    </div>
  );
}
