import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getGradingSystems } from "@/lib/data";
import { GradingSystemsClient } from "./client";

export default async function GradingSystemsPage() {

  const gradingSystems = await getGradingSystems('org_1');

  return (
    <>
      <PageHeader
        title="Grading Systems"
        description="Create and manage score scales for your institution."
      />
      <Card>
        <CardHeader>
          <CardTitle>Available Grading Systems</CardTitle>
          <CardDescription>
            These are the grading systems available for your institution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GradingSystemsClient data={gradingSystems} />
        </CardContent>
      </Card>
    </>
  );
}
