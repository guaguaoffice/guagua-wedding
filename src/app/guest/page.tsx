import { Suspense } from "react";
import { redirect } from "next/navigation";
import { GuestClient } from "@/app/guest/GuestClient";
import { getCurrentWedding } from "@/lib/wedding";

export default async function GuestPage() {
  const current = await getCurrentWedding();
  if (!current) redirect("/login");

  return (
    <Suspense>
      <GuestClient />
    </Suspense>
  );
}
