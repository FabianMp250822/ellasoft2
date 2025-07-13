
import { PageHeader } from "@/components/page-header";
import { getGrades } from "@/lib/data";
import { GradesClient } from "./client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function GradesPage() {

  const grades = await getGrades('org_1');

  return (
    <>
      <PageHeader
        title="Grades & Groups"
        description="Manage the educational levels and groups within your institution."
      />
      <Card>
        <CardHeader>
            <CardTitle>Registered Grades</CardTitle>
            <CardDescription>View and manage all grades and groups.</CardDescription>
        </CardHeader>
        <CardContent>
            <GradesClient data={grades} />
        </CardContent>
      </Card>
    </>
  );
}
