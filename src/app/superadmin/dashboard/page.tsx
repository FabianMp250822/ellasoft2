
import { PageHeader } from "@/components/page-header";
import { SuperadminDashboardClient } from "./client";

export default function SuperadminDashboard() {
  return (
    <>
      <PageHeader
        title="Superadmin Dashboard"
        description="Global overview and management of the entire platform."
      />
      <SuperadminDashboardClient />
    </>
  );
}
