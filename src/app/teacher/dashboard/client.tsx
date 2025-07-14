
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getAcademicLoads, getSubjects, getGrades } from "@/lib/data";
import type { AcademicLoad, Subject, Grade } from "@/lib/data";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";

type EnrichedLoad = AcademicLoad & {
  subjectName: string;
  gradeName: string;
};

export function TeacherDashboardClient() {
  const [loads, setLoads] = React.useState<EnrichedLoad[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user, claims } = useAuth();
  const { toast } = useToast();

  const fetchData = React.useCallback(async (orgId: string, teacherId: string) => {
    setLoading(true);
    try {
      const [allLoads, allSubjects, allGrades] = await Promise.all([
        getAcademicLoads(orgId),
        getSubjects(orgId),
        getGrades(orgId),
      ]);

      const teacherLoads = allLoads.filter(load => load.teacherId === teacherId);
      
      const enriched = teacherLoads.map(load => {
        const subject = allSubjects.find(s => s.id === load.subjectId);
        const grade = allGrades.find(g => g.id === load.gradeId);
        return {
          ...load,
          subjectName: subject?.name || "Unknown Subject",
          gradeName: grade ? `${grade.name} - ${grade.groupName}` : "Unknown Grade",
        }
      });

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
      fetchData(claims.organizationId, user.uid);
    }
  }, [user, claims, fetchData]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {loads.length > 0 ? (
        loads.map((item, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="font-headline text-xl">{item.subjectName}</CardTitle>
              <CardDescription>{item.gradeName}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center space-x-4 rounded-md border p-4">
                <Users />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Students
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Management coming soon
                  </p>
                </div>
              </div>
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
