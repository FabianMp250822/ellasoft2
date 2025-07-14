"use server";

import { revalidatePath } from "next/cache";
import { functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import { FormValues } from "./client";

export async function createOrganizationAction(data: FormValues & { logoBase64: string; adminPhotoBase64: string; }) {
  try {
    const createOrganizationFunction = httpsCallable(functions, 'createOrganization');
    await createOrganizationFunction(data);
    
    revalidatePath("/superadmin/dashboard");
    revalidatePath("/superadmin/organizations");
    
    return { success: true, message: "Organization created successfully." };
  } catch (error: any) {
    console.error("Error calling createOrganization function:", error);
    return { success: false, message: error.details?.message || error.message || "An unknown error occurred." };
  }
}

export async function setOrganizationStatusAction(orgId: string, status: 'Active' | 'Suspended' | 'In Arrears') {
  try {
    const setStatusFunction = httpsCallable(functions, 'setOrganizationStatus');
    await setStatusFunction({ organizationId: orgId, status: status });
    
    revalidatePath("/superadmin/dashboard");
    revalidatePath("/superadmin/organizations");
    
    return { success: true, message: `Organization status changed to ${status}` };
  } catch(error: any) {
    console.error("Error calling setOrganizationStatus function:", error);
    return { success: false, message: error.details?.message || error.message || "An unknown error occurred." };
  }
}
