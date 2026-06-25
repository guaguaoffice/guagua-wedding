import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PlanClient } from "@/app/plan/PlanClient";
import { getCurrentWedding } from "@/lib/wedding";
import { getBudgetItems, getDecisionItems, getTasks } from "@/lib/queries";
import { toNum, toNumOrNull } from "@/lib/decimal";

export default async function PlanPage() {
  const current = await getCurrentWedding();
  if (!current) redirect("/login");

  const [decisionItemsRaw, budgetItemsRaw, tasksRaw] = await Promise.all([
    getDecisionItems(current.wedding.id),
    getBudgetItems(current.wedding.id),
    getTasks(current.wedding.id),
  ]);

  const decisionItems = decisionItemsRaw.map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    suggestedDecideBy: item.suggestedDecideBy,
    decisionRecord: item.decisionRecord ? { id: item.decisionRecord.id } : null,
    candidates: item.candidates.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      price: toNumOrNull(c.price),
      note: c.note,
      pros: c.pros,
      cons: c.cons,
      tag: c.tag,
      availability: c.availability,
      status: c.status,
      rejectedReason: c.rejectedReason,
    })),
  }));

  const budgetItems = budgetItemsRaw.map((b) => ({
    id: b.id,
    name: b.name,
    note: b.note,
    totalAmount: toNum(b.totalAmount),
    paidAmount: toNum(b.paidAmount),
    decisionItemId: b.decisionItemId,
    decisionState: b.decisionItem
      ? { suggestedDecideBy: b.decisionItem.suggestedDecideBy, decided: !!b.decisionItem.decisionRecord }
      : null,
  }));

  const tasks = tasksRaw.map((t) => ({
    id: t.id,
    title: t.title,
    completed: t.completed,
    decisionTitle: t.decisionItem?.title ?? null,
  }));

  const totalBudget = toNumOrNull(current.wedding.totalBudget) ?? 0;

  return (
    <Suspense>
      <PlanClient
        weddingId={current.wedding.id}
        decisionItems={decisionItems}
        budgetItems={budgetItems}
        tasks={tasks}
        totalBudget={totalBudget}
      />
    </Suspense>
  );
}
