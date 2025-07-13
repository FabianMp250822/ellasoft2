"use server"

import { generatePerformanceIndicators } from "@/ai/flows/generate-performance-indicators"
import { z } from "zod"

const FormSchema = z.object({
  subject: z.string().min(2, {
    message: "Subject must be at least 2 characters.",
  }),
  gradeLevel: z.string().min(1, {
    message: "Grade Level is required.",
  }),
})

export async function generateIndicatorsAction(prevState: any, formData: FormData) {
  const validatedFields = FormSchema.safeParse({
    subject: formData.get("subject"),
    gradeLevel: formData.get("gradeLevel"),
  })

  if (!validatedFields.success) {
    return {
      message: "Invalid form data",
      errors: validatedFields.error.flatten().fieldErrors,
      data: null,
    }
  }

  try {
    const result = await generatePerformanceIndicators(validatedFields.data)
    return {
      message: "Performance indicators generated successfully.",
      errors: null,
      data: result,
    }
  } catch (error) {
    console.error(error);
    return {
      message: "Failed to generate indicators. Please try again.",
      errors: null,
      data: null,
    }
  }
}
