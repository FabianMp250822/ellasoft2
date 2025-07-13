import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookUser } from "lucide-react";

export default function TeachersPage() {
  return (
    <>
      <PageHeader
        title="Teachers"
        description="Register and manage teaching staff."
      />
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This section will allow for managing teachers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
            <BookUser className="h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              Teacher management interface will be here.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
