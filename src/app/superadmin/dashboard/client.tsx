"use client";

import * as React from "react";
import { getOrganizations } from "@/lib/data";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import type { Organization } from "@/lib/data";
import { LoadingSpinner } from "@/components/loading-spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrganizationsChart } from "./chart";
import { OrganizationsClient as OrganizationsTable } from "./client-table";
import { generatePlatformSummary } from "@/ai/flows/generate-platform-summary";

export function SuperadminDashboardClient() {
  const { user, loading: authLoading } = useAuth();
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [summary, setSummary] = React.useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = React.useState(false);
  const { toast } = useToast();

  const fetchOrgs = React.useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const orgs = await getOrganizations();
      setOrganizations(orgs);
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      toast({
        title: "Error",
        description: "Could not fetch organizations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  React.useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);
  
  React.useEffect(() => {
    if (organizations.length > 0) {
      setSummaryLoading(true);
      generatePlatformSummary({ organizations })
        .then(result => setSummary(result.analysis))
        .catch(error => {
            console.error("Failed to generate summary:", error);
            toast({ title: "AI Summary Error", description: "Could not generate platform summary.", variant: "destructive" });
        })
        .finally(() => setSummaryLoading(false));
    }
  }, [organizations, toast]);

  if (loading || authLoading) {
    return <LoadingSpinner />;
  }
  
  const totalUsers = organizations.reduce((acc, org) => acc + (org.userCount || 0), 0);
  const totalData = organizations.reduce((acc, org) => acc + (org.dataConsumption || 0), 0);
  const activeOrgs = organizations.filter(org => org.status === 'Active').length;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeOrgs} active institutions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Across all institutions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalData.toFixed(2)} GB</div>
            <p className="text-xs text-muted-foreground">
              Total platform storage usage
            </p>
          </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle className="font-headline">Platform Usage</CardTitle>
                <CardDescription>User distribution across institutions.</CardDescription>
            </CardHeader>
            <CardContent>
                <OrganizationsChart data={organizations}/>
            </CardContent>
        </Card>
        <Card className="lg:col-span-2">
             <CardHeader>
                <CardTitle className="font-headline">AI-Powered Analysis</CardTitle>
                <CardDescription>An intelligent summary of the platform's state.</CardDescription>
            </CardHeader>
            <CardContent>
                {summaryLoading ? (
                    <div className="flex items-center justify-center h-48">
                        <LoadingSpinner />
                    </div>
                ) : summary ? (
                    <div className="text-sm text-muted-foreground space-y-2">
                        {summary.split('\n').map((line, index) => (
                           <p key={index}>{line}</p>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No summary available.</p>
                )}
            </CardContent>
        </Card>
      </div>
      
      <OrganizationsTable data={organizations} />
    </div>
  );
}
