import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Book } from "lucide-react";

export default function SubjectsPage() {
  return (
    <>
      <PageHeader
        title="Subjects"
        description="Add and manage the courses to be taught."
      />
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This section will allow for managing subjects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
            <Book className="h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              Subject management interface will be here.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
