"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addAcademicPeriod, deleteAcademicPeriod, updateAcademicPeriod } from "@/lib/data";
import { getOrganizationIdFromSession } from "@/lib/server-utils";


const FormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date",
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid end date",
  }),
});

const CreatePeriod = FormSchema.omit({ id: true });
const UpdatePeriod = FormSchema;

export async function createPeriodAction(prevState: any, formData: FormData) {
  try {
    const orgId = await getOrganizationIdFromSession();
    const validatedFields = CreatePeriod.safeParse({
        name: formData.get("name"),
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
    });

    if (!validatedFields.success) {
        return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Validation failed. Could not create period.",
        };
    }

    await addAcademicPeriod(orgId, {
        ...validatedFields.data,
        startDate: new Date(validatedFields.data.startDate),
        endDate: new Date(validatedFields.data.endDate),
    });

    revalidatePath("/admin/periods");
    return { message: "Period created successfully." };
  } catch (e: any) {
    return { message: e.message, errors: {} };
  }
}

export async function updatePeriodAction(prevState: any, formData: FormData) {
    try {
        const validatedFields = UpdatePeriod.safeParse({
            id: formData.get("id"),
            name: formData.get("name"),
            startDate: formData.get("startDate"),
            endDate: formData.get("endDate"),
        });

        if (!validatedFields.success) {
            return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed. Could not update period.",
            };
        }
        
        await updateAcademicPeriod(validatedFields.data.id, {
            ...validatedFields.data,
            startDate: new Date(validatedFields.data.startDate),
            endDate: new Date(validatedFields.data.endDate),
        });

        revalidatePath("/admin/periods");
        return { message: "Period updated successfully." };
    } catch (e: any) {
        return { message: e.message, errors: {} };
    }
}

export async function deletePeriodAction(periodId: string) {
    if (!periodId) {
        return { message: "Period ID is required." };
    }
  await deleteAcademicPeriod(periodId);
  revalidatePath("/admin/periods");
  return { message: "Period deleted successfully." };
}
