
import { getCurrentUserFull } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardPageClient from "./DashboardPageClient";

export default async function Page() {
  const user = await getCurrentUserFull();
  if (!user) {
    redirect("/sign-in");
  }
  return <DashboardPageClient />;
}