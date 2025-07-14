"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addSubject, deleteSubject, updateSubject } from "@/lib/data";

const FormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
});

const CreateSubject = FormSchema.omit({ id: true });
const UpdateSubject = FormSchema.omit({ organizationId: true });

export async function createSubjectAction(prevState: any, formData: FormData) {
  try {
    const validatedFields = CreateSubject.safeParse({
        name: formData.get("name"),
        description: formData.get("description"),
        organizationId: formData.get("organizationId"),
    });

    if (!validatedFields.success) {
        return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Validation failed. Could not create subject.",
        };
    }
    
    const { organizationId, ...subjectData } = validatedFields.data;
    await addSubject(organizationId, subjectData);
    revalidatePath("/admin/subjects");
    return { message: "Subject created successfully." };
  } catch (e: any) {
    return { message: e.message, errors: {} };
  }
}

export async function updateSubjectAction(prevState: any, formData: FormData) {
  try {
    const validatedFields = UpdateSubject.safeParse({
        id: formData.get("id"),
        name: formData.get("name"),
        description: formData.get("description"),
    });

    if (!validatedFields.success) {
        return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Validation failed. Could not update subject.",
        };
    }

    await updateSubject(validatedFields.data.id, validatedFields.data);
    revalidatePath("/admin/subjects");
    return { message: "Subject updated successfully." };
  } catch (e: any) {
    return { message: e.message, errors: {} };
  }
}

export async function deleteSubjectAction(subjectId: string) {
    if (!subjectId) {
        return { message: "Subject ID is required." };
    }
  await deleteSubject(subjectId);
  revalidatePath("/admin/subjects");
  return { message: "Subject deleted successfully." };
}