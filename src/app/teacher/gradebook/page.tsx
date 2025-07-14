"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/loading-spinner';
import { PageHeader } from '@/components/page-header';
import { getTeacherAcademicLoads, getSubjects, getGrades } from '@/lib/data';
import type { AcademicLoad, Subject, Grade } from '@/lib/data';
import Link from 'next/link';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';

type EnrichedLoad = AcademicLoad & {
    subjectName: string;
    gradeName: string;
};

export default function GradebookLandingPage() {
    const { user, claims } = useAuth();
    const { toast } = useToast();
    const [loads, setLoads] = useState<EnrichedLoad[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async (orgId: string) => {
        setLoading(true);
        try {
            const [teacherLoads, allSubjects, allGrades] = await Promise.all([
                getTeacherAcademicLoads(),
                getSubjects(orgId),
                getGrades(orgId),
            ]);
            
            const enriched = teacherLoads.map(load => {
                const subject = allSubjects.find(s => s.id === load.subjectId);
                const grade = allGrades.find(g => g.id === load.gradeId);
                return {
                    ...load,
                    subjectName: subject?.name || "Unknown Subject",
                    gradeName: grade ? `${grade.name} - ${grade.groupName}` : "Unknown Grade",
                };
            });
            setLoads(enriched);
        } catch (error) {
            console.error("Failed to fetch academic loads:", error);
            toast({ title: "Error", description: "Could not fetch your classes.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (user && claims?.organizationId) {
            fetchData(claims.organizationId);
        }
    }, [user, claims, fetchData]);

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="space-y-4">
            <PageHeader
                title="Gradebook"
                description="Select a class to manage its activities and grades."
            />

            <Card>
                <CardHeader>
                    <CardTitle>My Classes</CardTitle>
                    <CardDescription>
                        Choose a class from the list below to open its gradebook.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loads.length > 0 ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {loads.map(load => (
                                <Card key={load.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <GraduationCap className="h-5 w-5 text-primary"/>
                                            {load.subjectName}
                                        </CardTitle>
                                        <CardDescription>{load.gradeName}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button asChild className="w-full">
                                            <Link href={`/teacher/gradebook/${load.id}`}>
                                                Open Gradebook
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">You have no classes assigned.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

    