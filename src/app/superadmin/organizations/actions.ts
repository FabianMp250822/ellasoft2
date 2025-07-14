"use server";

import { revalidatePath } from "next/cache";
import { addOrganization, setOrganizationStatus } from "@/lib/data";
import { z } from "zod";


const FormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email"),
  nit: z.string().min(1, "NIT is required"),
  dane: z.string().min(1, "DANE is required"),
  userLimit: z.number().min(1, "User limit must be at least 1"),
});

export async function createOrganizationAction(data: unknown) {
  const validatedFields = FormSchema.safeParse(data);

  if (!validatedFields.success) {
    return { 
      success: false,
      message: "Validation failed: " + validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await addOrganization(validatedFields.data);
    
    revalidatePath("/superadmin/dashboard");
    revalidatePath("/superadmin/organizations");
    
    return { success: true, message: "Organization created successfully." };
  } catch (error: any) {
    console.error("Error creating organization:", error);
    return { success: false, message: error.message || "An unknown error occurred." };
  }
}

export async function setOrganizationStatusAction(orgId: string, status: 'Active' | 'Suspended' | 'In Arrears') {
  try {
    await setOrganizationStatus(orgId, status);
    
    revalidatePath("/superadmin/dashboard");
    revalidatePath("/superadmin/organizations");
    
    return { success: true, message: `Organization status changed to ${status}` };
  } catch(error: any) {
    console.error("Error setting organization status:", error);
    return { success: false, message: error.message || "An unknown error occurred." };
  }
}
