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
import { PageHeader } from "@/components/page-header"
import { generateIndicatorsAction } from "./actions"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { List, Loader2, Sparkles } from "lucide-react"

const initialState = {
  message: null,
  errors: null,
  data: null,
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

export default function PerformanceIndicatorsPage() {
  const [state, formAction] = useActionState(generateIndicatorsAction, initialState)

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Performance Indicator Generator"
        description="Use AI to generate learning indicators for any subject and grade level."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <form action={formAction}>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Define Scope</CardTitle>
                <CardDescription>
                  Enter the details below to generate indicators.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" placeholder="e.g., Mathematics, History" />
                  {state.errors?.subject && (
                    <p className="text-sm font-medium text-destructive">
                      {state.errors.subject[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradeLevel">Grade Level</Label>
                  <Input id="gradeLevel" name="gradeLevel" placeholder="e.g., 9th Grade, 3rd Semester" />
                  {state.errors?.gradeLevel && (
                    <p className="text-sm font-medium text-destructive">
                      {state.errors.gradeLevel[0]}
                    </p>
                  )}
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
              <CardTitle className="font-headline">Generated Indicators</CardTitle>
              <CardDescription>
                The AI-generated indicators will appear below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {state.data?.indicators ? (
                <Accordion type="multiple" defaultValue={['superior', 'alto']} className="w-full">
                  {Object.entries(state.data.indicators).map(([level, indicators]) => (
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
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
                  <Sparkles className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-4 text-sm font-medium text-muted-foreground">
                    Results will be displayed here once generated.
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
