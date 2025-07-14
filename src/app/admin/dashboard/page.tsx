import { PageHeader } from "@/components/page-header";
import { AdminDashboardClient } from "./client";

export default function AdminDashboard() {
  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Welcome! Let's get your institution set up."
      />
      <AdminDashboardClient />
    </>
  );
}
