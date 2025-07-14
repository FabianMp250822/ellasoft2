"use client"

import React, { useActionState, useEffect, useState, useRef } from "react"
import { useFormStatus } from "react-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/page-header"
import { generateIndicatorsAction } from "./actions"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { List, Loader2, Sparkles, BookOpen } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"
import { getSubjects, getGrades, getPerformanceIndicatorsBySubject, PerformanceIndicator } from "@/lib/data"
import type { Subject, Grade } from "@/lib/data"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { httpsCallable } from "firebase/functions"
import { functions } from "@/lib/firebase"


const initialState = {
  message: null,
  errors: null,
  data: null,
  success: false,
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" /> Generate with AI
        </>
      )}
    </Button>
  )
}

function GeneratorForm({subjects, grades, organizationId, onGenerationSuccess}: {subjects: Subject[], grades: Grade[], organizationId: string, onGenerationSuccess: () => void}) {
  const [state, formAction] = useActionState(generateIndicatorsAction, initialState)
  const { toast } = useToast()
  
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);

  // Ref to track if save has been triggered for the current state.data
  const saveTriggeredRef = useRef(false);

  useEffect(() => {
    // Show toast message from server action
    if (state.message) {
      toast({
        title: state.success ? "In Progress" : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
    }

    // If generation was successful, trigger the save from the client
    if (state.success && state.data && !saveTriggeredRef.current) {
      saveTriggeredRef.current = true; // Mark as triggered to prevent re-runs
      const saveData = async () => {
        try {
          const saveIndicatorsFn = httpsCallable(functions, 'savePerformanceIndicators');
          await saveIndicatorsFn({
            organizationId: state.data.organizationId,
            subjectId: state.data.subjectId,
            gradeId: state.data.gradeId,
            indicators: state.data.indicators,
          });
          toast({
            title: "Success",
            description: "Indicators saved successfully.",
            variant: "default",
          });
          onGenerationSuccess(); // Callback to refetch saved indicators
        } catch (error: any) {
          console.error("Error saving indicators:", error);
          toast({
            title: "Save Failed",
            description: error.message || "Could not save indicators to the database.",
            variant: "destructive",
          });
        }
      };
      saveData();
    }

     // Reset the save trigger ref when the form state is reset (e.g., new submission)
    if (!state.success && !state.errors) {
       saveTriggeredRef.current = false;
    }

  }, [state, toast, onGenerationSuccess]);

  const handleSubjectChange = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId) || null;
    setSelectedSubject(subject);
  }

  const handleGradeChange = (gradeId: string) => {
    const grade = grades.find(g => g.id === gradeId) || null;
    setSelectedGrade(grade);
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="organizationId" value={organizationId} />
      {selectedSubject && <input type="hidden" name="subjectName" value={selectedSubject.name} />}
      {selectedGrade && <input type="hidden" name="gradeName" value={selectedGrade.name} />}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Define Scope</CardTitle>
          <CardDescription>
            Select a subject and grade to generate indicators.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subjectId">Subject</Label>
            <Select name="subjectId" onValueChange={handleSubjectChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            {state.errors?.subjectId && (
              <p className="text-sm font-medium text-destructive">
                {state.errors.subjectId[0]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="gradeId">Grade Level</Label>
             <Select name="gradeId" onValueChange={handleGradeChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            {state.errors?.gradeId && (
              <p className="text-sm font-medium text-destructive">
                {state.errors.gradeId[0]}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  )
}

function SavedIndicators({ subjectId, refreshKey }: { subjectId: string, refreshKey: number }) {
    const [indicators, setIndicators] = useState<PerformanceIndicator[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!subjectId) {
            setIndicators([]);
            setLoading(false);
            return;
        };

        async function fetchIndicators() {
            setLoading(true);
            setError(null);
            try {
                const data = await getPerformanceIndicatorsBySubject(subjectId);
                setIndicators(data);
            } catch (err) {
                console.error("Failed to fetch indicators", err);
                setError("Could not load existing indicators.");
            } finally {
                setLoading(false);
            }
        }
        fetchIndicators();
    }, [subjectId, refreshKey]);

    if (!subjectId) {
        return (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">
                    Select a subject to see saved indicators.
                </p>
            </div>
        )
    }

    if (loading) return <div className="flex justify-center p-12"><LoadingSpinner/></div>
    if (error) return <p className="text-destructive text-center p-12">{error}</p>
    if (indicators.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">
                    No indicators saved for this subject yet.
                </p>
            </div>
        )
    }

    return (
        <Accordion type="multiple" className="w-full">
            {indicators.map((indicatorSet) => (
                <AccordionItem key={indicatorSet.id} value={indicatorSet.id}>
                    <AccordionTrigger>Indicators created on {new Date(indicatorSet.createdAt.seconds * 1000).toLocaleDateString()}</AccordionTrigger>
                    <AccordionContent>
                         <Accordion type="multiple" defaultValue={['superior', 'alto']} className="w-full">
                            {Object.entries(indicatorSet.indicators).map(([level, indicators]) => (
                                <AccordionItem key={level} value={level}>
                                    <AccordionTrigger className="text-base font-semibold capitalize">
                                        {level} Level
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <ul className="space-y-2">
                                            {(indicators as string[]).map((indicator, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <List className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                                                    <span className="text-sm text-muted-foreground">{indicator}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}


export default function PerformanceIndicatorsPage() {
    const { user, claims } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        async function fetchData() {
            if (user && claims?.organizationId) {
                try {
                    const [subjectsData, gradesData] = await Promise.all([
                        getSubjects(claims.organizationId),
                        getGrades(claims.organizationId)
                    ]);
                    setSubjects(subjectsData);
                    setGrades(gradesData);
                } catch (error) {
                    console.error("Failed to fetch initial data", error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchData();
    }, [user, claims]);

    if (loading || !claims?.organizationId) {
        return <LoadingSpinner fullScreen />;
    }

    const handleGenerationSuccess = () => {
        setRefreshKey(oldKey => oldKey + 1);
    }

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Performance Indicator Generator"
        description="Use AI to generate and save learning indicators for any subject and grade level."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
            <GeneratorForm
              subjects={subjects}
              grades={grades}
              organizationId={claims.organizationId}
              onGenerationSuccess={handleGenerationSuccess}
            />
        </div>

        <div className="lg:col-span-2">
          <Card className="min-h-full">
            <CardHeader>
              <CardTitle className="font-headline">Saved Indicators</CardTitle>
              <CardDescription>
                Indicators already saved for the selected subject will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 mb-6">
                    <Label>Filter by Subject</Label>
                    <Select onValueChange={setSelectedSubjectId} value={selectedSubjectId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a subject to view indicators" />
                        </SelectTrigger>
                        <SelectContent>
                            {subjects.map((subject) => (
                                <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <SavedIndicators subjectId={selectedSubjectId} refreshKey={refreshKey} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
