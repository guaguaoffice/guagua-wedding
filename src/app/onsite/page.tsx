import { Suspense } from "react";
import { redirect } from "next/navigation";
import { OnsiteClient } from "@/app/onsite/OnsiteClient";
import { getCurrentWedding } from "@/lib/wedding";

export default async function OnsitePage() {
  const current = await getCurrentWedding();
  if (!current) redirect("/login");

  return (
    <Suspense>
      <OnsiteClient />
    </Suspense>
  );
}
