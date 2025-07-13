"use server"

import { generateRemedialPlan } from "@/ai/flows/generate-remedial-plan"
import { z } from "zod"

const FormSchema = z.object({
  studentName: z.string().min(1, { message: "Please select a student." }),
  subject: z.string().min(2, { message: "Subject is required." }),
  teacherObservations: z.string().min(10, { message: "Observations must be at least 10 characters." }),
  lowPerformanceIndicators: z.string().min(10, { message: "Indicators must be at least 10 characters." }),
})

export async function generatePlanAction(prevState: any, formData: FormData) {
  const validatedFields = FormSchema.safeParse({
    studentName: formData.get("studentName"),
    subject: formData.get("subject"),
    teacherObservations: formData.get("teacherObservations"),
    lowPerformanceIndicators: formData.get("lowPerformanceIndicators"),
  })

  if (!validatedFields.success) {
    return {
      message: "Invalid form data",
      errors: validatedFields.error.flatten().fieldErrors,
      data: null,
    }
  }

  try {
    const result = await generateRemedialPlan(validatedFields.data)
    return {
      message: "Remedial plan generated successfully.",
      errors: null,
      data: result,
    }
  } catch (error) {
    console.error(error);
    return {
      message: "Failed to generate plan. Please try again.",
      errors: null,
      data: null,
    }
  }
}
