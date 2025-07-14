"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays, Scaling, GraduationCap, Book, ClipboardList, BookUser, Users, FileClock, CheckCircle2 } from "lucide-react";
import { getSetupStatus } from "@/lib/data";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";

const setupStepsConfig = [
    {
      key: "periods",
      title: "Academic Periods",
      description: "Define semesters or trimesters.",
      icon: <CalendarDays className="h-6 w-6" />,
      href: "/admin/periods",
    },
    {
      key: "gradingSystems",
      title: "Grading Systems",
      description: "Create score scales.",
      icon: <Scaling className="h-6 w-6" />,
      href: "/admin/grading-systems",
    },
    {
      key: "grades",
      title: "Grades & Groups",
      description: "Register educational levels.",
      icon: <GraduationCap className="h-6 w-6" />,
      href: "/admin/grades",
    },
    {
      key: "subjects",
      title: "Subjects",
      description: "Add courses to be taught.",
      icon: <Book className="h-6 w-6" />,
      href: "/admin/subjects",
    },
    {
      key: "indicators",
      title: "Performance Indicators (AI)",
      description: "Generate learning indicators.",
      icon: <ClipboardList className="h-6 w-6" />,
      href: "/admin/performance-indicators",
    },
    {
      key: "teachers",
      title: "Teachers",
      description: "Register teaching staff.",
      icon: <BookUser className="h-6 w-6" />,
      href: "/admin/teachers",
    },
    {
      key: "students",
      title: "Students",
      description: "Enroll students.",
      icon: <Users className="h-6 w-6" />,
      href: "/admin/students",
    },
    {
      key: "academicLoad",
      title: "Assign Academic Load",
      description: "Link teachers to subjects.",
      icon: <FileClock className="h-6 w-6" />,
      href: "/admin/academic-load",
    },
];

type SetupStatus = Awaited<ReturnType<typeof getSetupStatus>>;

export function AdminDashboardClient() {
  const { user, claims } = useAuth();
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      if (user && claims?.organizationId) {
        try {
          const status = await getSetupStatus(claims.organizationId);
          setSetupStatus(status);
        } catch (error) {
          console.error("Failed to fetch setup status:", error);
          // Handle error appropriately, maybe show a toast
        } finally {
          setLoading(false);
        }
      }
    }
    fetchStatus();
  }, [user, claims]);

  if (loading || !setupStatus) {
    return <LoadingSpinner />;
  }
  
  const setupSteps = setupStepsConfig.map(step => ({
    ...step,
    completed: setupStatus[step.key as keyof SetupStatus] || false,
  }));

  return (
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
  );
}
