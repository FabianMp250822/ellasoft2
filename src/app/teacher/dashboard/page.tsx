import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Book, GraduationCap, Users } from "lucide-react";

const academicLoad = [
  {
    subject: "Calculus",
    grade: "11th Grade - A",
    studentCount: 32,
  },
  {
    subject: "Physics",
    grade: "11th Grade - A",
    studentCount: 32,
  },
  {
    subject: "Art History",
    grade: "9th Grade - B",
    studentCount: 28,
  },
  {
    subject: "Linear Algebra",
    grade: "University - Year 2",
    studentCount: 45,
  },
];

export default function TeacherDashboard() {
  return (
    <>
      <PageHeader
        title="Teacher Dashboard"
        description="Here is a summary of your academic workload for the current period."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {academicLoad.map((item, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="font-headline text-xl">{item.subject}</CardTitle>
              <CardDescription>{item.grade}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center space-x-4 rounded-md border p-4">
                <Users />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Students
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.studentCount} assigned
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
