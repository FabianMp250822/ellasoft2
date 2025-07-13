import { getOrganizations } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, Database, AlertCircle, Sparkles } from "lucide-react";
import { OrganizationsChart } from "./chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generatePlatformSummary } from "@/ai/flows/generate-platform-summary";

export default async function SuperadminDashboard() {
  const organizations = await getOrganizations();

  const totalOrganizations = organizations.length;
  const totalUsers = organizations.reduce((acc, org) => acc + (org.userCount || 0), 0);
  const totalDataConsumption = organizations.reduce((acc, org) => acc + (org.dataConsumption || 0), 0);
  const suspendedOrgs = organizations.filter(org => org.status !== 'Active').length;

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
    {
        title: "Suspended Orgs",
        value: suspendedOrgs,
        icon: <AlertCircle className="h-6 w-6 text-muted-foreground" />,
      },
  ];

  const summary = await generatePlatformSummary({organizations});

  return (
    <>
      <PageHeader
        title="Superadmin Dashboard"
        description="Global overview and management of the entire platform."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
            <CardHeader>
                <CardTitle>User Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <OrganizationsChart data={organizations} />
            </CardContent>
        </Card>
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI-Powered Platform Summary
                </CardTitle>
                 <CardDescription>
                    An executive summary of the platform's current state.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Alert>
                    <AlertTitle className="font-semibold">Key Insights</AlertTitle>
                    <AlertDescription className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {summary.analysis}
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
