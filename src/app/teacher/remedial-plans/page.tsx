"use client"

import { useActionState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/page-header"
import { generatePlanAction } from "./actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ClipboardPen, Loader2, Sparkles, Target, Lightbulb, ListChecks, Heart } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const initialState = {
  message: null,
  errors: null,
  data: null,
}

const students = [
  { id: "1", name: "Alice Johnson" },
  { id: "2", name: "Bob Williams" },
  { id: "3", name: "Charlie Brown" },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Plan...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" /> Generate with AI
        </>
      )}
    </Button>
  )
}

export default function RemedialPlansPage() {
  const [state, formAction] = useActionState(generatePlanAction, initialState)

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Remedial Plan Generator"
        description="Create personalized remedial plans for students who need extra support."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <form action={formAction}>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Student Information</CardTitle>
                <CardDescription>
                  Provide details about the student and their challenges.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Student</Label>
                   <Select name="studentName">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.name}>{student.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {state.errors?.studentName && <p className="text-sm font-medium text-destructive">{state.errors.studentName[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" placeholder="e.g., Algebra" />
                   {state.errors?.subject && <p className="text-sm font-medium text-destructive">{state.errors.subject[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacherObservations">Teacher Observations</Label>
                  <Textarea id="teacherObservations" name="teacherObservations" placeholder="Describe student's behavior, participation, difficulties..." />
                  {state.errors?.teacherObservations && <p className="text-sm font-medium text-destructive">{state.errors.teacherObservations[0]}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="lowPerformanceIndicators">Low Performance Indicators</Label>
                  <Textarea id="lowPerformanceIndicators" name="lowPerformanceIndicators" placeholder="List the specific indicators the student is failing..." />
                  {state.errors?.lowPerformanceIndicators && <p className="text-sm font-medium text-destructive">{state.errors.lowPerformanceIndicators[0]}</p>}
                </div>
              </CardContent>
              <CardFooter>
                <SubmitButton />
              </CardFooter>
            </Card>
          </form>
        </div>

        <div className="lg:col-span-2">
          <Card className="min-h-full">
            <CardHeader>
              <CardTitle className="font-headline">Generated Remedial Plan</CardTitle>
              <CardDescription>
                The AI-generated plan will appear below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {state.data ? (
                <div className="space-y-6">
                  <h3 className="font-headline text-2xl font-semibold text-primary">{state.data.planTitle}</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Lightbulb className="h-6 w-6 text-accent" />
                        <h4 className="text-lg font-semibold">Diagnosis</h4>
                    </div>
                    <p className="text-muted-foreground text-sm">{state.data.diagnosis}</p>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <Target className="h-6 w-6 text-accent" />
                        <h4 className="text-lg font-semibold">Objectives</h4>
                    </div>
                    <p className="text-muted-foreground text-sm">{state.data.objectives}</p>
                  </div>

                   <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <ListChecks className="h-6 w-6 text-accent" />
                        <h4 className="text-lg font-semibold">Action Plan</h4>
                    </div>
                    <p className="text-muted-foreground text-sm whitespace-pre-wrap">{state.data.actionPlan}</p>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <h4 className="text-lg font-semibold">Recommended Resources</h4>
                    </div>
                    <p className="text-muted-foreground text-sm whitespace-pre-wrap">{state.data.recommendedResources}</p>
                  </div>

                   <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                     <div className="flex items-center gap-3">
                        <Heart className="h-6 w-6 text-primary" />
                        <h4 className="text-lg font-semibold text-primary">Motivational Message</h4>
                    </div>
                    <p className="text-primary/80 text-sm">{state.data.motivationalMessage}</p>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
                  <ClipboardPen className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-4 text-sm font-medium text-muted-foreground">
                    Your generated plan will be displayed here.
                  </p>
                </div>
              )}
              {state.message && !state.data && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{state.message}</AlertDescription>
                  </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
