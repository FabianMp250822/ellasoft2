"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { getGradebookData, getTeacherAcademicLoads, getSubjects, getGrades } from '@/lib/data';
import type { GradebookData, Activity, Student, StudentGrade, AcademicLoad, Subject, Grade } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import { PlusCircle, Save, Trash2, Pencil } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";

type EditableActivity = Activity & { isEditing?: boolean };
type EditableStudentGrades = { [activityId: string]: { score: number | string, id?: string } };

export default function GradebookPage() {
  const params = useParams();
  const loadId = params.loadId as string;
  const { user, claims } = useAuth();
  const { toast } = useToast();

  const [data, setData] = useState<GradebookData | null>(null);
  const [loadInfo, setLoadInfo] = useState<{ subjectName: string; gradeName: string } | null>(null);
  const [activities, setActivities] = useState<EditableActivity[]>([]);
  const [studentGrades, setStudentGrades] = useState<{ [studentId: string]: EditableStudentGrades }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Function to calculate final grade
  const calculateFinalGrade = useCallback((studentId: string) => {
    let finalGrade = 0;
    let totalPercentage = 0;
    const grades = studentGrades[studentId] || {};
    
    activities.forEach(activity => {
        if (grades[activity.id] && typeof grades[activity.id].score === 'number') {
            const score = grades[activity.id].score as number;
            const percentage = activity.percentage / 100;
            finalGrade += score * percentage;
            totalPercentage += activity.percentage;
        }
    });

    // Normalize if total percentage is not 100
    // if (totalPercentage > 0 && totalPercentage !== 100) {
    //     return (finalGrade / totalPercentage) * 100;
    // }
    
    return finalGrade;
  }, [activities, studentGrades]);


  const fetchData = useCallback(async () => {
    if (!user || !claims?.organizationId) return;
    setLoading(true);
    try {
      // Fetch load details to display header info
      const [allLoads, allSubjects, allGrades, gradebookData] = await Promise.all([
        getTeacherAcademicLoads(),
        getSubjects(claims.organizationId),
        getGrades(claims.organizationId),
        getGradebookData(loadId),
      ]);

      const currentLoad = allLoads.find(l => l.id === loadId);
      if(currentLoad) {
        const subject = allSubjects.find(s => s.id === currentLoad.subjectId);
        const grade = allGrades.find(g => g.id === currentLoad.gradeId);
        setLoadInfo({
            subjectName: subject?.name || 'Unknown Subject',
            gradeName: grade ? `${grade.name} - ${grade.groupName}` : 'Unknown Grade'
        });
      }

      setData(gradebookData);
      setActivities(gradebookData.activities.sort((a,b) => a.name.localeCompare(b.name)));
      
      const gradesMap: { [studentId: string]: EditableStudentGrades } = {};
      gradebookData.students.forEach(student => {
        gradesMap[student.id] = {};
        gradebookData.grades.forEach(grade => {
          if (grade.studentId === student.id) {
            gradesMap[student.id][grade.activityId] = { score: grade.score, id: grade.id };
          }
        });
      });
      setStudentGrades(gradesMap);

    } catch (error) {
      console.error("Failed to fetch gradebook data", error);
      toast({ title: "Error", description: "Could not load gradebook data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [loadId, user, claims, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGradeChange = (studentId: string, activityId: string, score: string) => {
    const numericScore = score === '' ? '' : parseFloat(score);
    if (score !== '' && (isNaN(numericScore) || numericScore < 0 || numericScore > 5)) {
        toast({ title: "Invalid Score", description: "Score must be a number between 0 and 5.", variant: "destructive"});
        return;
    }

    setStudentGrades(prev => ({
        ...prev,
        [studentId]: {
            ...prev[studentId],
            [activityId]: {
                ...prev[studentId]?.[activityId],
                score: numericScore,
            },
        },
    }));
  };

  const handleActivityChange = (activityId: string, field: 'name' | 'percentage', value: string) => {
    setActivities(prev => prev.map(act => {
        if (act.id === activityId) {
            const newValue = field === 'percentage' ? parseInt(value, 10) : value;
            if (field === 'percentage' && (isNaN(newValue as number) || newValue < 0 || newValue > 100)) {
                 toast({ title: "Invalid Percentage", description: "Percentage must be between 0 and 100.", variant: "destructive"});
                 return act;
            }
            return { ...act, [field]: newValue };
        }
        return act;
    }));
  };

  const addNewActivity = () => {
    const newActivity: EditableActivity = {
        id: `new-${Date.now()}`,
        loadId,
        name: 'New Activity',
        percentage: 0,
        isEditing: true
    };
    setActivities(prev => [...prev, newActivity]);
  }

  const handleSave = async () => {
    setSaving(true);
    toast({ title: "Saving...", description: "Your changes are being saved." });
    try {
        const createOrUpdateActivityFn = httpsCallable(functions, 'createOrUpdateActivity');
        const createOrUpdateStudentGradeFn = httpsCallable(functions, 'createOrUpdateStudentGrade');

        const activityPromises = activities.map(activity => {
            const isNew = activity.id.startsWith('new-');
            return createOrUpdateActivityFn({
                loadId,
                activityId: isNew ? null : activity.id,
                name: activity.name,
                percentage: activity.percentage,
            })
        });

        const gradePromises: Promise<any>[] = [];
        Object.entries(studentGrades).forEach(([studentId, grades]) => {
            Object.entries(grades).forEach(([activityId, grade]) => {
                if (typeof grade.score === 'number') {
                    gradePromises.push(createOrUpdateStudentGradeFn({
                        loadId,
                        activityId,
                        studentId,
                        score: grade.score
                    }));
                }
            });
        });
        
        await Promise.all([...activityPromises, ...gradePromises]);

        toast({ title: "Success!", description: "Gradebook saved successfully." });
        fetchData(); // Refetch data to get new IDs and confirm state
    } catch (error) {
        console.error("Failed to save gradebook:", error);
        toast({ title: "Error", description: "Could not save changes.", variant: "destructive"});
    } finally {
        setSaving(false);
    }
  }

  const handleDeleteActivity = async (activityId: string) => {
    try {
        const deleteActivityFn = httpsCallable(functions, 'deleteActivity');
        await deleteActivityFn({ loadId, activityId });
        toast({ title: "Success", description: "Activity deleted."});
        fetchData(); // Refetch data
    } catch(error) {
        console.error("Failed to delete activity", error);
        toast({ title: "Error", description: "Could not delete activity.", variant: "destructive"});
    }
  }


  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!data) {
    return <PageHeader title="Gradebook" description="Could not load data." />;
  }

  const totalPercentage = activities.reduce((sum, act) => sum + (act.percentage || 0), 0);

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Gradebook: ${loadInfo?.subjectName || ''}`}
        description={`Manage grades for ${loadInfo?.gradeName || ''}`}
      />

       <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Class Roster & Grades</CardTitle>
                <CardDescription>
                    Enter scores for each activity. The final grade is calculated automatically.
                    Total weight of all activities: <span className={totalPercentage !== 100 ? 'text-destructive font-bold' : 'text-green-600 font-bold'}>{totalPercentage}%</span>
                </CardDescription>
            </div>
            <div className="flex gap-2">
                <Button onClick={addNewActivity} variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Activity</Button>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <LoadingSpinner /> : <Save className="mr-2 h-4 w-4" />} Save All Changes
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[250px] sticky left-0 bg-background z-10">Student</TableHead>
                    {activities.map(activity => (
                        <TableHead key={activity.id} className="text-center">
                            {activity.isEditing ? (
                                <Input 
                                    value={activity.name}
                                    onChange={(e) => handleActivityChange(activity.id, 'name', e.target.value)}
                                    className="min-w-[150px] text-center"
                                />
                            ) : (
                                <div className='flex items-center gap-2'>
                                    {activity.name}
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActivities(acts => acts.map(a => a.id === activity.id ? {...a, isEditing: true} : a))}>
                                        <Pencil className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}
                            <div className='flex items-center gap-2 mt-1'>
                               <Input 
                                    type="number"
                                    value={activity.percentage}
                                    onChange={(e) => handleActivityChange(activity.id, 'percentage', e.target.value)}
                                    className="w-20 h-8 text-center"
                                />
                               <span>%</span>
                               <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive">
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete {activity.name}?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete the activity and all associated grades. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteActivity(activity.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                               </AlertDialog>
                            </div>
                        </TableHead>
                    ))}
                    <TableHead className="text-center">Final Grade</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.students.map(student => (
                    <TableRow key={student.id}>
                        <TableCell className="font-medium sticky left-0 bg-background z-10">{student.firstName} {student.lastName}</TableCell>
                        {activities.map(activity => (
                        <TableCell key={activity.id}>
                            <Input
                                type="number"
                                placeholder="-"
                                value={studentGrades[student.id]?.[activity.id]?.score ?? ''}
                                onChange={(e) => handleGradeChange(student.id, activity.id, e.target.value)}
                                className="w-24 text-center"
                                min="0"
                                max="5"
                                step="0.1"
                            />
                        </TableCell>
                        ))}
                        <TableCell className="text-center font-bold text-lg">
                            {calculateFinalGrade(student.id).toFixed(2)}
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

    