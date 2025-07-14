"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deleteAcademicPeriod, updateAcademicPeriod } from "@/lib/data";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";


const FormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date",
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid end date",
  }),
  organizationId: z.string().min(1, "Organization ID is required"),
});

const CreatePeriod = FormSchema.omit({ id: true });
const UpdatePeriod = FormSchema.omit({ organizationId: true });

export type ActionState = {
  message?: string | null;
  errors?: {
    name?: string[];
    startDate?: string[];
    endDate?: string[];
    organizationId?: string[];
  } | null;
  success?: boolean;
};


export async function createPeriodAction(prevState: ActionState, formData: FormData) {
  const validatedFields = CreatePeriod.safeParse({
      name: formData.get("name"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      organizationId: formData.get("organizationId"),
  });

  if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Validation failed. Could not create period.",
      };
  }

  try {
    const createAcademicPeriodFn = httpsCallable(functions, 'createAcademicPeriod');
    
    // The callable function is invoked by the Next.js server, but the context
    // (like auth) from the original client request needs to be passed implicitly if using App Check,
    // or handled via the callable function's security rules which check request.auth.
    const result = await createAcademicPeriodFn(validatedFields.data);
    const resultData = result.data as { success: boolean; message: string; };

    if (!resultData.success) {
      throw new Error(resultData.message || "Cloud function returned failure.");
    }
    
    revalidatePath("/admin/periods");
    return { success: true, message: "Period created successfully." };

  } catch (e: any) {
    console.error("Error calling createAcademicPeriod function:", e);
    return { success: false, message: e.message || "An unexpected error occurred." };
  }
}

export async function updatePeriodAction(prevState: any, formData: FormData) {
    const validatedFields = UpdatePeriod.safeParse({
        id: formData.get("id"),
        name: formData.get("name"),
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
    });

    if (!validatedFields.success) {
        return {
          success: false,
          errors: validatedFields.error.flatten().fieldErrors,
          message: "Validation failed. Could not update period.",
        };
    }
    
    try {
      await updateAcademicPeriod(validatedFields.data.id, {
          ...validatedFields.data,
          startDate: new Date(validatedFields.data.startDate),
          endDate: new Date(validatedFields.data.endDate),
      });

      revalidatePath("/admin/periods");
      return { success: true, message: "Period updated successfully." };
    } catch (e: any) {
        if (e.code === 'permission-denied') {
            return { success: false, message: "Permission Denied: You do not have the required permissions to update a period." };
        }
        return { success: false, message: `An error occurred: ${e.message}` };
    }
}

export async function deletePeriodAction(periodId: string, organizationId: string) {
    if (!periodId || !organizationId) {
        return { success: false, message: "Period ID and Organization ID are required." };
    }
    try {
        await deleteAcademicPeriod(periodId);
        revalidatePath("/admin/periods");
        return { success: true, message: "Period deleted successfully." };
    } catch (e: any) {
         if (e.code === 'permission-denied') {
            return { success: false, message: "Permission Denied: You do not have the required permissions to delete a period." };
        }
        return { success: false, message: `An error occurred: ${e.message}` };
    }
}
