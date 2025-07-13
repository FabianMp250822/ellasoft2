import { PageHeader } from "@/components/page-header";
import { StudentDashboardClient } from "./client";

export default function StudentDashboard() {
  return (
    <>
      <PageHeader
        title="Student Dashboard"
        description="Here is a summary of your current academic performance."
      />
      <StudentDashboardClient />
    </>
  );
}
