"use server"

import { generatePerformanceIndicators } from "@/ai/flows/generate-performance-indicators"
import { addPerformanceIndicator } from "@/lib/data"
import { z } from "zod"

const FormSchema = z.object({
  subjectId: z.string().min(1, { message: "Subject is required." }),
  gradeId: z.string().min(1, { message: "Grade Level is required." }),
  subjectName: z.string(),
  gradeName: z.string(),
  organizationId: z.string().min(1, { message: "Organization ID is required." }),
})

export async function generateIndicatorsAction(prevState: any, formData: FormData) {
  const validatedFields = FormSchema.safeParse({
    subjectId: formData.get("subjectId"),
    gradeId: formData.get("gradeId"),
    subjectName: formData.get("subjectName"),
    gradeName: formData.get("gradeName"),
    organizationId: formData.get("organizationId"),
  })

  if (!validatedFields.success) {
    return {
      message: "Invalid form data",
      errors: validatedFields.error.flatten().fieldErrors,
      data: null,
      success: false,
    }
  }

  const { subjectId, gradeId, subjectName, gradeName, organizationId } = validatedFields.data

  try {
    const result = await generatePerformanceIndicators({
      subject: subjectName,
      gradeLevel: gradeName,
    })
    
    // Save the result to Firestore
    await addPerformanceIndicator(organizationId, {
      subjectId,
      gradeId,
      indicators: result.indicators,
    })

    return {
      message: "Performance indicators generated and saved successfully.",
      errors: null,
      data: result,
      success: true,
    }
  } catch (error) {
    console.error(error);
    return {
      message: "Failed to generate or save indicators. Please try again.",
      errors: null,
      data: null,
      success: false,
    }
  }
}
