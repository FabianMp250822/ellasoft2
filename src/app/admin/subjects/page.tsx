import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SubjectsClient } from "./client";


export default function SubjectsPage() {
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
          <SubjectsClient />
        </CardContent>
      </Card>
    </>
  );
}
