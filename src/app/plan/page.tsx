import { Suspense } from "react";
import { PlanClient } from "@/app/plan/PlanClient";

export default function PlanPage() {
  return (
    <Suspense>
      <PlanClient />
    </Suspense>
  );
}
