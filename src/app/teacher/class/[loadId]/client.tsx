"use client";

import React, { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/context/auth-context";
import { getAcademicLoads, getStudentsByGrade, getSubjects, getGrades } from "@/lib/data";
import type { Student, AcademicLoad, Subject, Grade } from "@/lib/data";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";


interface EnrichedLoadData {
    load: AcademicLoad;
    subject: Subject;
    grade: Grade;
}

export function ClassRosterClient({ loadId }: { loadId: string }) {
    const { user, claims } = useAuth();
    const { toast } = useToast();
    const [students, setStudents] = useState<Student[]>([]);
    const [loadData, setLoadData] = useState<EnrichedLoadData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async (orgId: string) => {
        try {
            const [allLoads, allSubjects, allGrades] = await Promise.all([
                getAcademicLoads(orgId),
                getSubjects(orgId),
                getGrades(orgId),
            ]);

            const currentLoad = allLoads.find(l => l.id === loadId);

            if (!currentLoad) {
                toast({ title: "Error", description: "Could not find the specified class.", variant: "destructive" });
                return;
            }

            const subject = allSubjects.find(s => s.id === currentLoad.subjectId);
            const grade = allGrades.find(g => g.id === currentLoad.gradeId);

            if (!subject || !grade) {
                toast({ title: "Error", description: "Could not find subject or grade for this class.", variant: "destructive" });
                return;
            }
            
            setLoadData({ load: currentLoad, subject, grade });

            const classStudents = await getStudentsByGrade(currentLoad.gradeId);
            setStudents(classStudents);

        } catch (error) {
            console.error("Error fetching class data:", error);
            toast({ title: "Error", description: "Failed to load class information.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [loadId, toast]);

    useEffect(() => {
        if (user && claims?.organizationId) {
            fetchData(claims.organizationId);
        }
    }, [user, claims, fetchData]);

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!loadData) {
        return (
            <div className="text-center text-muted-foreground">
                Could not load class data. It might not exist or you may not have permission.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <PageHeader
                title={`${loadData.subject.name} - Roster`}
                description={`Managing students for ${loadData.grade.name} - ${loadData.grade.groupName}`}
            />
            <Card>
                <CardHeader>
                    <CardTitle>Student List</CardTitle>
                    <CardDescription>
                        All students enrolled in this grade.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
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
                                            <span className="font-semibold">{`${student.firstName} ${student.lastName}`}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{student.email}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" disabled>Grade (soon)</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
