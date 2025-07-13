import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSubjects } from "@/lib/data";
import { SubjectsClient } from "./client";


export default async function SubjectsPage() {
  const subjects = await getSubjects('org_1');

  return (
    <>
      <PageHeader
        title="Subjects"
        description="Add and manage the courses to be taught."
      />
      <Card>
        <CardHeader>
          <CardTitle>Registered Subjects</CardTitle>
          <CardDescription>
            View and manage all subjects for your institution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubjectsClient data={subjects} />
        </CardContent>
      </Card>
    </>
  );
}
