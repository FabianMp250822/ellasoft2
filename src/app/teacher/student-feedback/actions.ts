
"use server"

import { generateStudentFeedback } from "@/ai/flows/generate-student-feedback"
import { z } from "zod"

const FormSchema = z.object({
  performanceIndicators: z.string().min(10, { message: "Please provide some performance indicators." }),
  formatInstructions: z.string().min(10, { message: "Instructions must be at least 10 characters." }),
})

export async function generateFeedbackAction(prevState: any, formData: FormData) {
  const validatedFields = FormSchema.safeParse({
    performanceIndicators: formData.get("performanceIndicators"),
    formatInstructions: formData.get("formatInstructions"),
  })

  if (!validatedFields.success) {
    return {
      message: "Invalid form data",
      errors: validatedFields.error.flatten().fieldErrors,
      data: null,
      success: false,
    }
  }
  
  const indicatorsArray = validatedFields.data.performanceIndicators.split('\n').filter(line => line.trim() !== '');

  try {
    const result = await generateStudentFeedback({
        performanceIndicators: indicatorsArray,
        formatInstructions: validatedFields.data.formatInstructions,
    })
    return {
      message: "Student feedback generated successfully.",
      errors: null,
      data: result,
      success: true,
    }
  } catch (error) {
    console.error(error);
    return {
      message: "Failed to generate feedback. Please try again.",
      errors: null,
      data: null,
      success: false,
    }
  }
}
