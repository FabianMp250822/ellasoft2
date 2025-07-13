"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addGrade, deleteGrade, updateGrade } from "@/lib/data";

const FormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  groupName: z.string().min(1, "Group Name is required"),
});

const CreateGrade = FormSchema.omit({ id: true });
const UpdateGrade = FormSchema;

export async function createGradeAction(formData: FormData) {
  const validatedFields = CreateGrade.safeParse({
    name: formData.get("name"),
    groupName: formData.get("groupName"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Could not create grade.",
    };
  }

  await addGrade('org_1', validatedFields.data);
  revalidatePath("/admin/grades");
  return { message: "Grade created successfully." };
}

export async function updateGradeAction(formData: FormData) {
  const validatedFields = UpdateGrade.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    groupName: formData.get("groupName"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Could not update grade.",
    };
  }

  await updateGrade(validatedFields.data.id, validatedFields.data);
  revalidatePath("/admin/grades");
  return { message: "Grade updated successfully." };
}

export async function deleteGradeAction(gradeId: string) {
    if (!gradeId) {
        return { message: "Grade ID is required." };
    }
  await deleteGrade(gradeId);
  revalidatePath("/admin/grades");
  return { message: "Grade deleted successfully." };
}
