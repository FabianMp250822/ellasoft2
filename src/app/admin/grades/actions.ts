"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addGrade, deleteGrade, updateGrade } from "@/lib/data";
import { auth } from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { cookies } from "next/headers";


async function getOrganizationId(): Promise<string> {
    const sessionCookie = cookies().get("session")?.value || "";
    if (!sessionCookie) {
        throw new Error("User not authenticated");
    }
    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
    if (!decodedClaims.organizationId) {
        throw new Error("Organization ID not found in claims");
    }
    return decodedClaims.organizationId;
}

const FormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  groupName: z.string().min(1, "Group Name is required"),
});

const CreateGrade = FormSchema.omit({ id: true });
const UpdateGrade = FormSchema;

export async function createGradeAction(prevState: any, formData: FormData) {
  try {
    const orgId = await getOrganizationId();

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

    await addGrade(orgId, validatedFields.data);
    revalidatePath("/admin/grades");
    return { message: "Grade created successfully." };

  } catch (e: any) {
    return { message: e.message, errors: {} };
  }
}

export async function updateGradeAction(prevState: any, formData: FormData) {
  try {
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
  } catch (e: any) {
    return { message: e.message, errors: {} };
  }
}

export async function deleteGradeAction(gradeId: string) {
    if (!gradeId) {
        return { message: "Grade ID is required." };
    }
  await deleteGrade(gradeId);
  revalidatePath("/admin/grades");
  return { message: "Grade deleted successfully." };
}
