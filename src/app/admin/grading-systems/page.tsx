import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GradingSystemsClient } from "./client";

export default function GradingSystemsPage() {
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
          <GradingSystemsClient />
        </CardContent>
      </Card>
    </>
  );
}
