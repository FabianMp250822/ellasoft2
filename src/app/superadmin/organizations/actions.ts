"use server";

import { revalidatePath } from "next/cache";
import { functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";

export async function setOrganizationStatusAction(orgId: string, status: 'Active' | 'Suspended' | 'In Arrears') {
  try {
    const setStatusFunction = httpsCallable(functions, 'setOrganizationStatus');
    await setStatusFunction({ organizationId: orgId, status: status });
    
    revalidatePath("/superadmin/dashboard");
    revalidatePath("/superadmin/organizations");
    
    return { success: true, message: `Organization status changed to ${status}` };
  } catch(error: any) {
    console.error("Error setting organization status:", error);
    return { success: false, message: error.message || "An unknown error occurred." };
  }
}
