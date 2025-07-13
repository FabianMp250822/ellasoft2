import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileClock } from "lucide-react";

export default function AcademicLoadPage() {
  return (
    <>
      <PageHeader
        title="Assign Academic Load"
        description="Link teachers to subjects and grades for an academic period."
      />
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This section will allow for assigning academic load.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
            <FileClock className="h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              Academic load assignment interface will be here.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
