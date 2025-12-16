import { Suspense } from "react";
import ProfileViews from "@/modules/auth/ui/views/profile-views";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProfileViews />
    </Suspense>
  );
}
