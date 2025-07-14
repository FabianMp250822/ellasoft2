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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/page-header"
import { generateFeedbackAction } from "./actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Sparkles, MessageSquareQuote, ClipboardCopy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
          <Sparkles className="mr-2 h-4 w-4" /> Generate Feedback
        </>
      )}
    </Button>
  )
}

export default function StudentFeedbackPage() {
  const [state, formAction] = useActionState(generateFeedbackAction, initialState)
  const { toast } = useToast()

  const handleCopy = () => {
    if (state.data?.feedback) {
      navigator.clipboard.writeText(state.data.feedback);
      toast({
        title: "Copied to clipboard!",
        description: "The generated feedback has been copied.",
      })
    }
  }

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Student Feedback Generator"
        description="Generate constructive feedback for students based on performance indicators."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <form action={formAction}>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Feedback Parameters</CardTitle>
                <CardDescription>
                  Enter the indicators and desired format for the feedback.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="performanceIndicators">Performance Indicators</Label>
                  <Textarea
                    id="performanceIndicators"
                    name="performanceIndicators"
                    placeholder="Enter one indicator per line. e.g., 'Correctly applies the Pythagorean theorem.'"
                    rows={6}
                  />
                  {state.errors?.performanceIndicators && (
                    <p className="text-sm font-medium text-destructive">{state.errors.performanceIndicators[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formatInstructions">Format Instructions</Label>
                  <Textarea
                    id="formatInstructions"
                    name="formatInstructions"
                    placeholder="e.g., 'Write a short, encouraging paragraph. Focus on areas for improvement.'"
                    rows={4}
                  />
                   {state.errors?.formatInstructions && <p className="text-sm font-medium text-destructive">{state.errors.formatInstructions[0]}</p>}
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
              <CardTitle className="font-headline">Generated Feedback</CardTitle>
              <CardDescription>
                The AI-generated feedback will appear below. You can edit it before using.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {state.data?.feedback ? (
                <div className="relative space-y-4">
                   <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-[-0.5rem] right-[-0.5rem] h-7 w-7"
                    onClick={handleCopy}
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    <span className="sr-only">Copy</span>
                  </Button>
                  <div className="rounded-md border bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {state.data.feedback}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
                  <MessageSquareQuote className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-4 text-sm font-medium text-muted-foreground">
                    Generated feedback will be displayed here.
                  </p>
                </div>
              )}
              {state.message && !state.success && (
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
