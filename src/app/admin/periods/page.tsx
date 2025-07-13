
import { PageHeader } from "@/components/page-header";
import { getAcademicPeriods } from "@/lib/data";
import { PeriodsClient } from "./client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export default async function AcademicPeriodsPage() {
  const periods = await getAcademicPeriods('org_1');

  return (
    <>
      <PageHeader
        title="Academic Periods"
        description="Define semesters, trimesters, or other academic cycles."
      />
      <Card>
        <CardHeader>
            <CardTitle>Registered Periods</CardTitle>
            <CardDescription>View and manage all academic periods.</CardDescription>
        </CardHeader>
        <CardContent>
          <PeriodsClient data={periods} />
        </CardContent>
      </Card>
    </>
  );
}
