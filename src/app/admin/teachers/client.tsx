"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Teacher, Subject, Grade } from "@/lib/data";
import Image from "next/image";
import { getTeachers, getSubjects, getGrades } from "@/lib/data";
import { useAuth } from "@/context/auth-context";
import { LoadingSpinner } from "@/components/loading-spinner";
import { CreateTeacherForm } from "./form";
import { Badge } from "@/components/ui/badge";

export function TeachersClient() {
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const { toast } = useToast();
  const { user, claims, loading: authLoading } = useAuth();

  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [grades, setGrades] = React.useState<Grade[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchData = React.useCallback(async (orgId: string) => {
    setLoading(true);
    try {
      const [teachersData, subjectsData, gradesData] = await Promise.all([
        getTeachers(orgId),
        getSubjects(orgId),
        getGrades(orgId),
      ]);
      setTeachers(teachersData);
      setSubjects(subjectsData);
      setGrades(gradesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        title: "Error",
        description: "Could not fetch required data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (claims?.organizationId) {
      fetchData(claims.organizationId);
    }
  }, [claims, fetchData]);

  const handleFormSuccess = () => {
    setDialogOpen(false);
    if (claims?.organizationId) {
      fetchData(claims.organizationId);
    }
  };

  const getSubjectDetails = (subjectId: string): string => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return "Unknown Subject";
    const grade = grades.find(g => g.id === subject.gradeId);
    return `${subject.name} (${grade?.name || 'N/A'})`;
  }

  if (loading || authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Registered Teachers</CardTitle>
              <CardDescription>
                List of all teachers in the institution.
              </CardDescription>
            </div>
            <Button size="sm" className="gap-1" onClick={() => setDialogOpen(true)}>
              <PlusCircle className="h-4 w-4" />
              Create Teacher
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Assigned Subjects</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.uid}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Image
                          src={teacher.photoUrl || 'https://placehold.co/40x40.png'}
                          alt={`${teacher.firstName} ${teacher.lastName}`}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                          data-ai-hint="teacher avatar"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold">{`${teacher.firstName} ${teacher.lastName}`}</span>
                          <span className="text-xs text-muted-foreground">
                            {teacher.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {teacher.assignedSubjects.map(subjectId => (
                            <Badge key={subjectId} variant="secondary">
                                {getSubjectDetails(subjectId)}
                            </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Create New Teacher</DialogTitle>
            <DialogDescription>
              Fill out the form to register a new teacher and assign them subjects.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-hidden">
            <CreateTeacherForm
              organizationId={claims?.organizationId || ""}
              subjects={subjects}
              grades={grades}
              onSuccess={handleFormSuccess}
              onCancel={() => setDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
