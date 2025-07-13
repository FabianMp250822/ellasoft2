import { getOrganizations } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { OrganizationsClient } from "./client";

export default async function OrganizationsPage() {
  const organizations = await getOrganizations();

  return (
    <>
      <PageHeader
        title="Organizations Management"
        description="Oversee all institutions on the platform. You can create, view, edit, and manage all tenant organizations."
      />
      <OrganizationsClient data={organizations} />
    </>
  );
}
