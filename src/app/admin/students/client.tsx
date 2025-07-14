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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import type { Student, Grade } from "@/lib/data";
import Image from "next/image";
import { getStudents, getGrades } from "@/lib/data";
import { useAuth } from "@/context/auth-context";
import { LoadingSpinner } from "@/components/loading-spinner";
import { CreateStudentForm } from "./form";
import { BulkUpload } from "./bulk-upload";

export function StudentsClient() {
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const { toast } = useToast();
  const { user, claims, loading: authLoading } = useAuth();

  const [students, setStudents] = React.useState<Student[]>([]);
  const [grades, setGrades] = React.useState<Grade[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchData = React.useCallback(async (orgId: string) => {
    setLoading(true);
    try {
      const [studentsData, gradesData] = await Promise.all([
        getStudents(orgId),
        getGrades(orgId),
      ]);
      setStudents(studentsData);
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
  
  const getGradeName = (gradeId: string): string => {
    const grade = grades.find(g => g.id === gradeId);
    return grade ? `${grade.name} - ${grade.groupName}` : 'N/A';
  }

  if (loading || authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Tabs defaultValue="list">
        <div className="flex justify-between items-center mb-4">
            <TabsList>
                <TabsTrigger value="list">All Students</TabsTrigger>
                <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
            </TabsList>
            <Button size="sm" className="gap-1" onClick={() => setDialogOpen(true)}>
              <PlusCircle className="h-4 w-4" />
              Create Student
            </Button>
        </div>
        <TabsContent value="list">
            <Card>
                <CardHeader>
                    <CardTitle>Registered Students</CardTitle>
                    <CardDescription>
                        List of all students currently enrolled.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>
                                <span className="sr-only">Actions</span>
                            </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student) => (
                            <TableRow key={student.uid}>
                                <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <Image
                                    src={student.photoUrl || 'https://placehold.co/40x40.png'}
                                    alt={`${student.firstName} ${student.lastName}`}
                                    width={40}
                                    height={40}
                                    className="rounded-full object-cover"
                                    data-ai-hint="student avatar"
                                    />
                                    <div className="flex flex-col">
                                    <span className="font-semibold">{`${student.firstName} ${student.lastName}`}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {student.email}
                                    </span>
                                    </div>
                                </div>
                                </TableCell>
                                <TableCell>{getGradeName(student.gradeId)}</TableCell>
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
        </TabsContent>
        <TabsContent value="bulk">
            <BulkUpload />
        </TabsContent>
      </Tabs>


      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Create New Student</DialogTitle>
            <DialogDescription>
              Fill out the form to register a new student and assign them to a grade.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-hidden">
            <CreateStudentForm
              organizationId={claims?.organizationId || ""}
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
