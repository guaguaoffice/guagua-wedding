import { Suspense } from "react";
import { GuestClient } from "@/app/guest/GuestClient";

export default function GuestPage() {
  return (
    <Suspense>
      <GuestClient />
    </Suspense>
  );
}
