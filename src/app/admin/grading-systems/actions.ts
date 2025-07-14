"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addGradingSystem, deleteGradingSystem, updateGradingSystem } from "@/lib/data";

const FormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  scale: z.string().min(1, "Scale is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
});

const CreateGradingSystem = FormSchema.omit({ id: true });
const UpdateGradingSystem = FormSchema.omit({ organizationId: true });


export async function createGradingSystemAction(prevState: any, formData: FormData) {
  try {
    const validatedFields = CreateGradingSystem.safeParse({
        name: formData.get("name"),
        description: formData.get("description"),
        scale: formData.get("scale"),
        organizationId: formData.get("organizationId"),
    });

    if (!validatedFields.success) {
        return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Validation failed. Could not create grading system.",
        };
    }

    const { organizationId, ...systemData } = validatedFields.data;
    await addGradingSystem(organizationId, systemData);

    revalidatePath("/admin/grading-systems");
    return { message: "Grading system created successfully." };
  } catch (e: any) {
    return { message: e.message, errors: {} };
  }
}


export async function updateGradingSystemAction(prevState: any, formData: FormData) {
    try {
        const validatedFields = UpdateGradingSystem.safeParse({
            id: formData.get("id"),
            name: formData.get("name"),
            description: formData.get("description"),
            scale: formData.get("scale"),
        });

        if (!validatedFields.success) {
            return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed. Could not update grading system.",
            };
        }
        
        await updateGradingSystem(validatedFields.data.id, validatedFields.data);
        revalidatePath("/admin/grading-systems");
        return { message: "Grading system updated successfully." };
    } catch (e: any) {
        return { message: e.message, errors: {} };
    }
}

export async function deleteGradingSystemAction(systemId: string) {
    if (!systemId) {
        return { message: "System ID is required." };
    }
    await deleteGradingSystem(systemId);
    revalidatePath("/admin/grading-systems");
    return { message: "Grading system deleted successfully." };
}