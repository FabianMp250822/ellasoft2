import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { ArrowRight, CalendarDays, Scaling, GraduationCap, Book, ClipboardList, BookUser, Users, FileClock, CheckCircle2 } from "lucide-react";
import { getSetupStatus } from "@/lib/data";
import { auth } from "@/lib/firebase";


export default async function AdminDashboard() {
  // In a real app, organizationId would come from the user's custom claims
  const organizationId = 'org_1'; // Replace with dynamic organizationId
  const setupStatus = await getSetupStatus(organizationId);

  const setupSteps = [
    {
      title: "Academic Periods",
      description: "Define semesters or trimesters.",
      icon: <CalendarDays className="h-6 w-6" />,
      href: "/admin/periods",
      completed: setupStatus.periods,
    },
    {
      title: "Grading Systems",
      description: "Create score scales.",
      icon: <Scaling className="h-6 w-6" />,
      href: "/admin/grading-systems",
      completed: setupStatus.gradingSystems,
    },
    {
      title: "Grades & Groups",
      description: "Register educational levels.",
      icon: <GraduationCap className="h-6 w-6" />,
      href: "/admin/grades",
      completed: setupStatus.grades,
    },
    {
      title: "Subjects",
      description: "Add courses to be taught.",
      icon: <Book className="h-6 w-6" />,
      href: "/admin/subjects",
      completed: setupStatus.subjects,
    },
    {
      title: "Performance Indicators (AI)",
      description: "Generate learning indicators.",
      icon: <ClipboardList className="h-6 w-6" />,
      href: "/admin/performance-indicators",
      completed: setupStatus.indicators,
    },
    {
      title: "Teachers",
      description: "Register teaching staff.",
      icon: <BookUser className="h-6 w-6" />,
      href: "/admin/teachers",
      completed: setupStatus.teachers,
    },
    {
      title: "Students",
      description: "Enroll students.",
      icon: <Users className="h-6 w-6" />,
      href: "/admin/students",
      completed: setupStatus.students,
    },
    {
      title: "Assign Academic Load",
      description: "Link teachers to subjects.",
      icon: <FileClock className="h-6 w-6" />,
      href: "/admin/academic-load",
      completed: setupStatus.academicLoad,
    },
  ];


  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Welcome! Let's get your institution set up."
      />
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Initial Configuration Guide</CardTitle>
            <CardDescription>
              Complete these steps to make your institution operational on EduAI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {setupSteps.map((step, index) => {
                const isLocked = index > 0 && !setupSteps[index-1].completed;
                return (
                  <Card key={step.title} className={`flex flex-col ${isLocked ? 'bg-muted/50' : ''}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                       <CardTitle className="text-sm font-medium">{step.title}</CardTitle>
                       {step.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                       ) : (
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                       )}
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="flex items-start gap-4">
                        <div className="text-primary">{step.icon}</div>
                        <p className="text-xs text-muted-foreground flex-1">
                          {step.description}
                        </p>
                      </div>
                    </CardContent>
                    <div className="p-4 pt-0">
                      <Button asChild size="sm" className="w-full" disabled={isLocked}>
                        <Link href={step.href}>
                          {step.completed ? "Review" : "Configure"}
                        </Link>
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
