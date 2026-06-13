import { requirePasswordChanged } from "@/lib/auth/session";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const user = await requirePasswordChanged();

  return <DashboardClient user={user} />;
}
