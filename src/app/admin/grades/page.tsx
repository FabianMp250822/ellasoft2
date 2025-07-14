
import { PageHeader } from "@/components/page-header";
import { GradesClient } from "./client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GradesPage() {
  return (
    <>
      <PageHeader
        title="Grades & Groups"
        description="Manage the educational levels and their respective groups within your institution."
      />
      <Card>
        <CardHeader>
            <CardTitle>Registered Grades and Groups</CardTitle>
            <CardDescription>View and manage all grades and groups. These will be used in other sections like Subjects and Teacher assignments.</CardDescription>
        </CardHeader>
        <CardContent>
            <GradesClient />
        </CardContent>
      </Card>
    </>
  );
}
