import { PageHeader } from "@/components/page-header";
import { TeacherDashboardClient } from "./client";

export default function TeacherDashboard() {
  return (
    <>
      <PageHeader
        title="Teacher Dashboard"
        description="Here is a summary of your academic workload for the current period."
      />
      <TeacherDashboardClient />
    </>
  );
}
