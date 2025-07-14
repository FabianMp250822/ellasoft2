"use server"

import { generatePerformanceIndicators } from "@/ai/flows/generate-performance-indicators"
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
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
    
    // Save the result to Firestore via a secure Cloud Function
    const saveIndicatorsFn = httpsCallable(functions, 'savePerformanceIndicators');
    await saveIndicatorsFn({
      organizationId,
      subjectId,
      gradeId,
      indicators: result.indicators,
    });


    return {
      message: "Performance indicators generated and saved successfully.",
      errors: null,
      data: result,
      success: true,
    }
  } catch (error: any) {
    console.error(error);
    const errorMessage = error.message || "Failed to generate or save indicators. Please try again.";
    return {
      message: errorMessage,
      errors: null,
      data: null,
      success: false,
    }
  }
}
