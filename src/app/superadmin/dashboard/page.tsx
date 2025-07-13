import { getOrganizations } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, Database } from "lucide-react";
import { OrganizationsClient } from "./client";

export default async function SuperadminDashboard() {
  const organizations = await getOrganizations();

  const totalOrganizations = organizations.length;
  const totalUsers = organizations.reduce((acc, org) => acc + (org.userCount || 0), 0);
  const totalDataConsumption = organizations.reduce((acc, org) => acc + (org.dataConsumption || 0), 0);

  const stats = [
    {
      title: "Total Organizations",
      value: totalOrganizations,
      icon: <Building className="h-6 w-6 text-muted-foreground" />,
    },
    {
      title: "Total Users",
      value: totalUsers,
      icon: <Users className="h-6 w-6 text-muted-foreground" />,
    },
    {
      title: "Data Consumption",
      value: `${totalDataConsumption.toFixed(2)} GB`,
      icon: <Database className="h-6 w-6 text-muted-foreground" />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Superadmin Dashboard"
        description="Global overview and management of the entire platform."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8">
        <OrganizationsClient data={organizations} />
      </div>
    </>
  );
}
