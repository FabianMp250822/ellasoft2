"use server";

import { revalidatePath } from "next/cache";
import { functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";

export async function createOrganizationAction(formData: FormData) {
  try {
    const createOrganizationFunction = httpsCallable(functions, 'createOrganization');
    // Note: The 'httpsCallable' doesn't directly support FormData.
    // The actual creation logic is handled in the client form using fetch to the HTTP function URL.
    // This server action is kept for potential non-JS fallbacks or different form handling strategies.
    console.log("Create organization server action called.");
    
    revalidatePath("/superadmin/dashboard");
    revalidatePath("/superadmin/organizations");
    return { success: true, message: "Organization creation process initiated." };
  } catch (error: any) {
    return { success: false, message: error.message || "An unknown error occurred." };
  }
}

export async function suspendOrganizationAction(orgId: string, status: 'Active' | 'Suspended') {
  try {
    const setStatusFunction = httpsCallable(functions, 'setOrganizationStatus');
    await setStatusFunction({ organizationId: orgId, status: status });
    
    revalidatePath("/superadmin/dashboard");
    revalidatePath("/superadmin/organizations");
    
    return { success: true, message: `Organization status changed to ${status}` };
  } catch(error: any) {
    return { success: false, message: error.message || "An unknown error occurred." };
  }
}
