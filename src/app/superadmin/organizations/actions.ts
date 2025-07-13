"use server";

import { revalidatePath } from "next/cache";

// This URL will need to be configured based on your Firebase project and region
const CREATE_ORGANIZATION_URL = 'https://us-central1-academia-facil-7e9a7.cloudfunctions.net/createOrganization';

// In a real app, this would also be a cloud function
const SUSPEND_ORGANIZATION_URL = 'https://us-central1-academia-facil-7e9a7.cloudfunctions.net/setOrganizationStatus';

export async function createOrganizationAction(formData: FormData) {
  try {
    // In a real app, you'd get the token from the logged-in superadmin
    const superadminToken = "superadmin-dummy-token";

    const response = await fetch(CREATE_ORGANIZATION_URL, {
      method: "POST",
      headers: {
        // 'Authorization': `Bearer ${superadminToken}`,
        // FormData sets the Content-Type header automatically with the correct boundary
      },
      body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to create organization');
    }

    const data = await response.json();
    revalidatePath("/superadmin/dashboard");
    revalidatePath("/superadmin/organizations");
    return { success: true, message: data.message };
  } catch (error: any) {
    return { success: false, message: error.message || "An unknown error occurred." };
  }
}


export async function suspendOrganizationAction(orgId: string, status: 'Active' | 'Suspended' | 'In Arrears') {
    // This is a mock implementation. In a real app, this would be a secured Cloud Function.
    console.log(`Setting organization ${orgId} to ${status}`);
    
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 500));

    revalidatePath("/superadmin/dashboard");
    revalidatePath("/superadmin/organizations");
    
    return { success: true, message: `Organization status changed to ${status}` };
}
