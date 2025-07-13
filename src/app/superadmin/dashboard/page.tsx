import { getOrganizations } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { OrganizationsClient } from "./client";

export default async function SuperadminDashboard() {
  const organizations = await getOrganizations();

  return (
    <>
      <PageHeader
        title="Organizations Management"
        description="Oversee all institutions on the platform."
      />
      <OrganizationsClient data={organizations} />
    </>
  );
}
