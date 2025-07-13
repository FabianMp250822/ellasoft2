import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Scaling } from "lucide-react";

export default function GradingSystemsPage() {
  return (
    <>
      <PageHeader
        title="Grading Systems"
        description="Create and manage score scales for your institution."
      />
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This section will allow for managing grading systems.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
            <Scaling className="h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              Grading system management interface will be here.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
