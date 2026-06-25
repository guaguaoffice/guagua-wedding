import { Suspense } from "react";
import { OnsiteClient } from "@/app/onsite/OnsiteClient";

export default function OnsitePage() {
  return (
    <Suspense>
      <OnsiteClient />
    </Suspense>
  );
}
