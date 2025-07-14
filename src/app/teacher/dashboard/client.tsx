"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getTeacherAcademicLoads, getSubjects, getGrades, getStudentsByGrade } from "@/lib/data";
import type { AcademicLoad, Subject, Grade } from "@/lib/data";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";

type EnrichedLoad = AcademicLoad & {
  subjectName: string;
  gradeName: string;
  studentCount: number;
};

export function TeacherDashboardClient() {
  const [loads, setLoads] = React.useState<EnrichedLoad[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user, claims } = useAuth();
  const { toast } = useToast();

  const fetchData = React.useCallback(async (orgId: string) => {
    setLoading(true);
    try {
      // Use the new, secure function to get only the current teacher's loads
      const [teacherLoads, allSubjects, allGrades] = await Promise.all([
        getTeacherAcademicLoads(),
        getSubjects(orgId),
        getGrades(orgId),
      ]);
      
      const enrichedLoadsPromises = teacherLoads.map(async (load) => {
        const subject = allSubjects.find(s => s.id === load.subjectId);
        const grade = allGrades.find(g => g.id === load.gradeId);
        
        const students = await getStudentsByGrade(load.gradeId);

        return {
          ...load,
          subjectName: subject?.name || "Unknown Subject",
          gradeName: grade ? `${grade.name} - ${grade.groupName}` : "Unknown Grade",
          studentCount: students.length,
        };
      });

      const enriched = await Promise.all(enrichedLoadsPromises);

      setLoads(enriched);

    } catch (error) {
      console.error("Failed to fetch teacher dashboard data:", error);
      toast({ title: "Error", description: "Could not fetch your academic data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (user && claims?.organizationId) {
      fetchData(claims.organizationId);
    }
  }, [user, claims, fetchData]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {loads.length > 0 ? (
        loads.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="font-headline text-xl">{item.subjectName}</CardTitle>
              <CardDescription>{item.gradeName}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
               <Link href={`/teacher/class/${item.id}`} className="block hover:bg-muted/50 rounded-md transition-colors">
                <div className="flex items-center space-x-4 rounded-md border p-4">
                    <Users />
                    <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                        Students
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {item.studentCount} students
                    </p>
                    </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="md:col-span-2 lg:col-span-4 text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
            You do not have any academic load assigned for this period.
        </div>
      )}
    </div>
  );
}
