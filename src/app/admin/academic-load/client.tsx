"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { getAcademicLoads, getTeachers, getSubjects, getGrades, getAcademicPeriods, deleteAcademicLoad } from "@/lib/data";
import type { AcademicLoad, Teacher, Subject, Grade, AcademicPeriod } from "@/lib/data";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PlusCircle, Trash2 } from "lucide-react";
import { AcademicLoadForm } from "./form";
import Image from "next/image";

type EnrichedLoad = AcademicLoad & {
    teacherName: string;
    subjectName: string;
    gradeName: string;
    periodName: string;
}

export function AcademicLoadClient() {
  const [loads, setLoads] = React.useState<AcademicLoad[]>([]);
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [grades, setGrades] = React.useState<Grade[]>([]);
  const [periods, setPeriods] = React.useState<AcademicPeriod[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const { user, claims } = useAuth();
  const { toast } = useToast();

  const fetchData = React.useCallback(async (orgId: string) => {
    setLoading(true);
    try {
      const [loadsData, teachersData, subjectsData, gradesData, periodsData] = await Promise.all([
        getAcademicLoads(orgId),
        getTeachers(orgId),
        getSubjects(orgId),
        getGrades(orgId),
        getAcademicPeriods(orgId),
      ]);
      setLoads(loadsData);
      setTeachers(teachersData);
      setSubjects(subjectsData);
      setGrades(gradesData);
      setPeriods(periodsData);
    } catch (error) {
      console.error("Failed to fetch academic load data:", error);
      toast({ title: "Error", description: "Could not fetch data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (user && claims?.organizationId) {
      fetchData(claims.organizationId);
    }
  }, [user, claims, fetchData]);
  
  const handleFormSuccess = () => {
    setDialogOpen(false);
    if(claims?.organizationId) {
        fetchData(claims.organizationId);
    }
  }

  const handleDelete = async (loadId: string) => {
    try {
        await deleteAcademicLoad(loadId);
        toast({ title: "Success", description: "Assignment deleted successfully." });
        if(claims?.organizationId) {
            fetchData(claims.organizationId);
        }
    } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to delete assignment.", variant: "destructive" });
    }
  }

  const enrichedLoads = React.useMemo(() => {
    const groupedByTeacher = loads.reduce((acc, load) => {
        const teacher = teachers.find(t => t.uid === load.teacherId);
        if(!teacher) return acc;
        
        if (!acc[teacher.uid]) {
            acc[teacher.uid] = {
              teacher,
              assignments: [],
            };
        }
        
        const subject = subjects.find(s => s.id === load.subjectId);
        const grade = grades.find(g => g.id === load.gradeId);
        const period = periods.find(p => p.id === load.academicPeriodId);

        acc[teacher.uid].assignments.push({
            ...load,
            subjectName: subject?.name || 'N/A',
            gradeName: grade ? `${grade.name} - ${grade.groupName}` : 'N/A',
            periodName: period?.name || 'N/A',
        });
        
        return acc;

    }, {} as Record<string, {teacher: Teacher, assignments: any[]}>);

    return Object.values(groupedByTeacher);

  }, [loads, teachers, subjects, grades, periods]);


  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Assignment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Academic Load</CardTitle>
          <CardDescription>
            List of all teachers and their assigned subjects and grades.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {enrichedLoads.length === 0 ? (
                <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                    No academic assignments have been created yet.
                </div>
            ) : (
                <Accordion type="multiple" className="w-full">
                    {enrichedLoads.map(({teacher, assignments}) => (
                        <AccordionItem value={teacher.uid} key={teacher.uid}>
                            <AccordionTrigger>
                                 <div className="flex items-center gap-3">
                                    <Image
                                    src={teacher.photoUrl || 'https://placehold.co/40x40.png'}
                                    alt={`${teacher.firstName} ${teacher.lastName}`}
                                    width={40}
                                    height={40}
                                    className="rounded-full object-cover"
                                    data-ai-hint="teacher avatar"
                                    />
                                    <div className="flex flex-col text-left">
                                        <span className="font-semibold">{`${teacher.firstName} ${teacher.lastName}`}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {assignments.length} assignment(s)
                                        </span>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <ul className="space-y-2 pl-4">
                                    {assignments.map(load => (
                                        <li key={load.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                                            <div>
                                                <p className="font-medium">{load.subjectName}</p>
                                                <p className="text-sm text-muted-foreground">{load.gradeName} &bull; {load.periodName}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(load.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Academic Assignment</DialogTitle>
          </DialogHeader>
          <AcademicLoadForm
            organizationId={claims?.organizationId || ""}
            teachers={teachers}
            subjects={subjects}
            grades={grades}
            periods={periods}
            onSuccess={handleFormSuccess}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
