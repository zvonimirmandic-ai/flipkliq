import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { LoginForm } from "@/components/admin/login-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getPollsWithVoteCounts } from "@/lib/polls";
import type { PollWithVotes } from "@/lib/types";

export const metadata = {
  title: "Admin | FLIPKLIQ",
};

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return <LoginForm />;
  }

  let polls: PollWithVotes[] = [];

  try {
    polls = await getPollsWithVoteCounts();
  } catch (error) {
    console.error("Failed to load polls:", error);
  }

  return <AdminDashboard polls={polls} />;
}
